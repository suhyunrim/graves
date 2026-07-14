/**
 * 배포로 청크 파일명이 바뀌면, 옛 index를 띄워둔 브라우저는 죽은 청크를 요청해 404가 난다.
 * dynamic import 실패를 감지해 1회 한정으로 하드 리로드 → 조용히 새 버전으로 갱신한다.
 * (무한 리로드 방지를 위해 최근 리로드 이후 10초 내에는 재시도하지 않는다.)
 */
const KEY = 'chunkReloadTs';
const COOLDOWN_MS = 10000;
const CHUNK_ERROR = /dynamically imported module|Importing a module script failed|ChunkLoadError/i;

// FuseSuspense의 로딩 워치독과 쿨다운을 공유한다 — 어느 경로로든 자동 리로드는 10초에 1회.
export function canAutoReload() {
	return Date.now() - Number(sessionStorage.getItem(KEY) || 0) >= COOLDOWN_MS;
}

export function markAutoReload() {
	sessionStorage.setItem(KEY, String(Date.now()));
}

function tryReload() {
	if (!canAutoReload()) return;
	markAutoReload();
	window.location.reload();
}

export function installChunkReload() {
	// Vite가 청크 preload 실패 시 발생시키는 이벤트
	window.addEventListener('vite:preloadError', (e) => {
		// preventDefault 하면 Vite가 에러를 삼키고 dynamic import가 undefined로 resolve된다
		// (React.lazy에 "고장난 성공"이 박제돼 리로드 전까지 복구 불가).
		// 그래서 실제로 리로드할 수 있을 때만 preventDefault + 리로드하고,
		// 쿨다운 중이면 그대로 throw되게 둬서 RouteErrorBoundary의 청크 에러
		// fallback(다시 시도 = 하드 리로드)으로 흘려보낸다.
		if (!canAutoReload()) return;
		e.preventDefault();
		tryReload();
	});
	// 그 외 경로로 새어나온 dynamic import 실패
	window.addEventListener('unhandledrejection', (e) => {
		if (CHUNK_ERROR.test(e?.reason?.message || '')) tryReload();
	});
}
