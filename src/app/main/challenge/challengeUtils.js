export const gameTypeLabels = {
	soloRank: '솔로랭크',
	flexRank: '자유랭크',
	aram: '칼바람',
	arena: '아레나'
};

export const scoringTypeLabels = {
	games: '판수',
	wins: '승수',
	winRate: '승률',
	points: '포인트'
};

export const statusLabels = {
	scheduled: '예정',
	active: '진행 중',
	ended: '종료',
	canceled: '취소됨'
};

export const statusColors = {
	scheduled: '#4dabf7',
	active: '#51cf66',
	ended: '#868e96',
	canceled: '#ff6b6b'
};

export function formatDateRange(startAt, endAt) {
	const start = new Date(startAt);
	const end = new Date(endAt);
	const fmt = d => {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}.${m}.${day}`;
	};
	return `${fmt(start)} ~ ${fmt(end)}`;
}

export function getDday(endAt) {
	const now = new Date();
	const end = new Date(endAt);
	const diff = end - now;
	if (diff <= 0) return null;
	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	return `D-${days}`;
}

export function formatLastSync(lastSyncAt) {
	if (!lastSyncAt) return '없음';
	const d = new Date(lastSyncAt);
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	const h = String(d.getHours()).padStart(2, '0');
	const min = String(d.getMinutes()).padStart(2, '0');
	return `${m}.${day} ${h}:${min}`;
}
