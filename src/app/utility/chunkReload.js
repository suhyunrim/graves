/**
 * 배포로 청크 파일명이 바뀌면, 옛 index를 띄워둔 브라우저는 죽은 청크를 요청해 404가 난다.
 * dynamic import 실패를 감지해 1회 한정으로 하드 리로드 → 조용히 새 버전으로 갱신한다.
 * (무한 리로드 방지를 위해 최근 리로드 이후 10초 내에는 재시도하지 않는다.)
 */
const KEY = 'chunkReloadTs';
const CHUNK_ERROR = /dynamically imported module|Importing a module script failed|ChunkLoadError/i;

function tryReload() {
	const last = Number(sessionStorage.getItem(KEY) || 0);
	if (Date.now() - last < 10000) return; // 최근에 이미 리로드 → 루프 방지
	sessionStorage.setItem(KEY, String(Date.now()));
	window.location.reload();
}

export function installChunkReload() {
	// Vite가 청크 preload 실패 시 발생시키는 이벤트
	window.addEventListener('vite:preloadError', (e) => {
		e.preventDefault(); // Vite가 에러를 throw하지 않게 막고 우리가 리로드 처리
		tryReload();
	});
	// 그 외 경로로 새어나온 dynamic import 실패
	window.addEventListener('unhandledrejection', (e) => {
		if (CHUNK_ERROR.test(e?.reason?.message || '')) tryReload();
	});
}
