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
	match: { label: '첫걸음', icon: '🏆', description: '매치에서 첫 활동/승리를 기록하세요' },
	games: { label: '판수', icon: '📊', description: '누적 판수를 달성하세요' },
	weekend_games: { label: '솔로신가요?', icon: '🍺', description: '주말 시간대에 플레이하세요' },
	weekday_games: { label: '평일 근로자', icon: '💼', description: '평일에 플레이하세요' },
	games_per_day: { label: '하루 N판', icon: '🎯', description: '하루에 N판 이상 플레이하세요' },
	welcomer: { label: '환영위원회', icon: '🤝', description: '신규 멤버와 함께 플레이하세요' },
	streak: { label: '연승·연패', icon: '🔥', description: '연속 승리/패배를 기록하세요' },
	reverse_win: { label: '역전승', icon: '🔄', description: '2:1 역전승을 달성하세요' },
	reverse_lose: { label: '역전패', icon: '🔃', description: '1:2 역전패를 당하세요' },
	sweep_win: { label: '완승 스윕', icon: '🧹', description: '2:0 완승을 달성하세요' },
	sweep_lose: { label: '시련', icon: '💧', description: '0:2 완패를 당하세요' },
	underdog: { label: '언더독', icon: '💪', description: '낮은 승률 차이를 뒤집고 승리하세요' },
	tier: { label: '티어 달성', icon: '👑', description: 'LoL 티어를 달성하세요' },
	consecutive_days: { label: '출석', icon: '📅', description: '연속 출석 일수를 쌓으세요' },
	anniversary: { label: '기념일', icon: '🎂', description: '그룹 가입 기념일을 맞이하세요' },
	honor_received: { label: '명예왕', icon: '🎖️', description: '다른 유저에게 명예를 받으세요' },
	honor_voted_count: { label: '투표러', icon: '🗳️', description: '다른 유저에게 명예를 투표하세요' },
	match_mvp: { label: '매치 MVP', icon: '⭐', description: '매치 MVP(명예 3표 이상)로 선정되세요' },
	match_mvp_streak: { label: '팬 서비스', icon: '🌟', description: 'MVP(명예 3표 이상)를 연속으로 달성하세요' },
	voice: { label: '보이스 체류', icon: '🎙️', description: '보이스 채널 누적 체류 시간을 달성하세요' },
	night_owl: { label: '밤새기', icon: '🦉', description: '새벽 시간대에 플레이하세요' },
	channel_creator: { label: '채널 개척자', icon: '🔊', description: '디스코드 보이스 채널을 생성하세요' },
	late_night: { label: '야식', icon: '🌙', description: '늦은 밤 시간대에 플레이하세요' },
	challenge: { label: '챌린지 메달', icon: '🏅', description: '챌린지에서 메달을 획득하세요' }
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
