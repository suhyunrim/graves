export const TIER_COLORS = {
	BRONZE: '#CD7F32',
	SILVER: '#C0C0C0',
	GOLD: '#FFD700',
	PLATINUM: '#00CED1',
	EMERALD: '#50C878',
	DIAMOND: '#B9F2FF',
	MASTER: '#9B59B6',
	GRANDMASTER: '#E74C3C',
	CHALLENGER: '#F1C40F'
};

export const TIER_RANK = {
	CHALLENGER: 9,
	GRANDMASTER: 8,
	MASTER: 7,
	DIAMOND: 6,
	EMERALD: 5,
	PLATINUM: 4,
	GOLD: 3,
	SILVER: 2,
	BRONZE: 1
};

export const CATEGORY_LABELS = {
	match: { label: '첫걸음', icon: '🏆' },
	games: { label: '판수', icon: '📊' },
	weekend_games: { label: '솔로신가요?', icon: '🍺' },
	weekday_games: { label: '평일 근로자', icon: '💼' },
	games_per_day: { label: '하루 N판', icon: '🎯' },
	welcomer: { label: '환영위원회', icon: '🤝' },
	streak: { label: '연승·연패', icon: '🔥' },
	reverse_win: { label: '역전승', icon: '🔄' },
	reverse_lose: { label: '역전패', icon: '🔃' },
	sweep_win: { label: '완승 스윕', icon: '🧹' },
	sweep_lose: { label: '시련', icon: '💧' },
	underdog: { label: '언더독', icon: '💪' },
	tier: { label: '티어 달성', icon: '👑' },
	consecutive_days: { label: '출석', icon: '📅' },
	anniversary: { label: '기념일', icon: '🎂' },
	honor_received: { label: '명예왕', icon: '🎖️' },
	honor_voted_count: { label: '투표러', icon: '🗳️' },
	match_mvp: { label: '매치 MVP', icon: '⭐' },
	match_mvp_streak: { label: '팬 서비스', icon: '🌟' },
	voice: { label: '보이스 체류', icon: '🎙️' },
	night_owl: { label: '밤새기', icon: '🦉' },
	channel_creator: { label: '채널 개척자', icon: '🔊' },
	late_night: { label: '야식', icon: '🌙' },
	challenge: { label: '챌린지 메달', icon: '🏅' }
};

export const CATEGORY_ORDER = [
	'match',
	'games',
	'weekend_games',
	'weekday_games',
	'games_per_day',
	'welcomer',
	'streak',
	'reverse_win',
	'reverse_lose',
	'sweep_win',
	'sweep_lose',
	'underdog',
	'tier',
	'consecutive_days',
	'anniversary',
	'honor_received',
	'honor_voted_count',
	'match_mvp',
	'match_mvp_streak',
	'voice',
	'night_owl',
	'channel_creator',
	'late_night',
	'challenge'
];
