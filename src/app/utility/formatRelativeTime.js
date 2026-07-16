// 상대 시간 표시 (op.gg식).
// 5분 미만 '방금 전' → n분 전 → n시간 전 → n일 전, 30일 이상은 절대 날짜(yy-MM-dd)로 떨어뜨린다.
// ("n개월 전"은 특정 매치를 찾을 때 정보가 뭉개져서 사용하지 않음)
export function formatRelativeTime(utcDateString) {
	const date = new Date(utcDateString);
	const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);

	if (diffSec < 5 * 60) return '방금 전';
	if (diffSec < 60 * 60) return `${Math.floor(diffSec / 60)}분 전`;
	if (diffSec < 24 * 60 * 60) return `${Math.floor(diffSec / 3600)}시간 전`;
	if (diffSec < 30 * 24 * 60 * 60) return `${Math.floor(diffSec / 86400)}일 전`;

	const year = String(date.getFullYear()).slice(-2);
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

// hover title용 전체 날짜+시간 ('2026-06-14 20:25')
export function formatFullDateTime(utcDateString) {
	const date = new Date(utcDateString);
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}`;
}
