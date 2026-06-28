// URL 쿼리 파라미터 헬퍼.
// 각 화면에서 목록 상태(page/tab/sort/날짜 범위 등)를 URL에 보존할 때 쓰는 공통 로직.

// 여러 파라미터를 한 번에 갱신한다. 값이 null/undefined/'' 이면 키를 제거(기본값 = URL 비움 컨벤션).
// 페이지네이션/탭 전환마다 history 항목이 쌓이지 않도록 항상 replace로 반영한다.
export function patchSearchParams(setSearchParams, updates) {
	setSearchParams(
		prev => {
			const next = new URLSearchParams(prev);
			Object.entries(updates).forEach(([key, value]) => {
				if (value === null || value === undefined || value === '') next.delete(key);
				else next.set(key, String(value));
			});
			return next;
		},
		{ replace: true }
	);
}

// 정수 쿼리 파라미터를 읽고, 없거나 범위를 벗어나면 fallback. (page/tab 초기값 복원용)
export function getIntParam(searchParams, key, fallback, { min = -Infinity, max = Infinity } = {}) {
	const n = parseInt(searchParams.get(key), 10);
	return Number.isNaN(n) || n < min || n > max ? fallback : n;
}
