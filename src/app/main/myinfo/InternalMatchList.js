import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import TablePagination from '@mui/material/TablePagination';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	getChampionIcon,
	getItemIcon,
	getSpellIcon,
	getKeystoneIcon,
	getMultiKillBadge,
	loadChampionKeysById
} from 'app/main/challenge/ddragonUtils';
import { getTierShortName, getTierIconName, getTierColor } from '../components/MatchList';
import PositionIcon from '../tournament/PositionIcon';

// 탑 → 정글 → 미드 → 원딜 → 서폿 고정 순서 (MatchList와 동일)
const POSITIONS = [
	{ key: 'TOP', icon: 'top' },
	{ key: 'JUNGLE', icon: 'jungle' },
	{ key: 'MIDDLE', icon: 'mid' },
	{ key: 'BOTTOM', icon: 'adc' },
	{ key: 'UTILITY', icon: 'support' }
];
const POSITION_ORDER = POSITIONS.reduce((acc, pos, i) => {
	acc[pos.key] = i;
	return acc;
}, {});
const POSITION_ICON_KEY = POSITIONS.reduce((acc, pos) => {
	acc[pos.key] = pos.icon;
	return acc;
}, {});

// 팀 아이덴티티 컬러 (VS 비교의 A/B 컬러와 동일 계열)
const TEAM_COLORS = { 1: '#00d4ff', 2: '#ff6b9a' };

// 팀 오브젝트 표시 순서
const OBJECTIVE_DEFS = [
	['baronKills', '바론'],
	['dragonKills', '용'],
	['riftHeraldKills', '전령'],
	['hordeKills', '유충'],
	['towerKills', '타워'],
	['inhibitorKills', '억제기']
];

// 매치 데이터의 position이 없으면 수집 스탯의 position으로 폴백
const getPlayerPosition = player => player.position || (player.stat && player.stat.position) || null;

const sortPlayers = players =>
	[...players].sort((a, b) => {
		const ao = POSITION_ORDER[getPlayerPosition(a)];
		const bo = POSITION_ORDER[getPlayerPosition(b)];
		const aHas = ao !== undefined;
		const bHas = bo !== undefined;
		if (aHas && bHas) return ao - bo;
		if (aHas !== bHas) return aHas ? -1 : 1;
		return b.rating - a.rating;
	});

const formatDate = utcDateString => {
	const date = new Date(utcDateString);
	const year = String(date.getFullYear()).slice(-2);
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const formatDuration = sec => {
	if (sec == null) return null;
	const m = Math.floor(sec / 60);
	const s = sec % 60;
	return `${m}분 ${String(s).padStart(2, '0')}초`;
};

// KDA 배율 색상 (op.gg 관례: 높을수록 강조)
const kdaRatioColor = ratio => {
	if (ratio == null) return '#ffd700'; // Perfect
	if (ratio >= 4) return '#ffd700';
	if (ratio >= 3) return '#00d4ff';
	if (ratio >= 2) return 'rgba(255, 255, 255, 0.85)';
	return 'rgba(255, 255, 255, 0.5)';
};

const getKdaRatio = stat => (stat.deaths === 0 ? null : Math.round(((stat.kills + stat.assists) / stat.deaths) * 100) / 100);

const formatK = v => {
	if (v == null) return '-';
	return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);
};

// 팀 킬 합 대비 킬관여율 (%)
const getKillParticipation = (stat, teamPlayers) => {
	const teamKills = teamPlayers.reduce((sum, p) => sum + (p.stat ? p.stat.kills : 0), 0);
	if (teamKills <= 0) return null;
	return Math.round(((stat.kills + stat.assists) / teamKills) * 100);
};

// 맞라인 대비 골드 지분 (op.gg "라인전 48:52" 스타일). goldDiff = 본인 - 상대.
const getLaneShare = stat => {
	if (stat.goldDiff == null || stat.goldEarned == null) return null;
	const oppGold = stat.goldEarned - stat.goldDiff;
	if (oppGold <= 0 || stat.goldEarned + oppGold <= 0) return null;
	return Math.round((stat.goldEarned / (stat.goldEarned + oppGold)) * 100);
};

const useStyles = makeStyles()((theme) => ({
	wrapper: {
		display: 'flex',
		flexDirection: 'column',
		gap: 10
	},
	matchCard: {
		borderRadius: 12,
		overflow: 'hidden',
		cursor: 'pointer',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		transition: 'border-color 0.2s ease',
		'&:hover': {
			borderColor: 'rgba(0, 212, 255, 0.35)'
		}
	},
	matchWin: {
		background: 'rgba(0, 200, 83, 0.10)',
		borderLeft: '5px solid #00c853'
	},
	matchLose: {
		background: 'rgba(255, 82, 82, 0.09)',
		borderLeft: '5px solid #ff5252'
	},
	rowMain: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		padding: '12px 16px',
		[theme.breakpoints.down('sm')]: {
			gap: 12,
			padding: '10px 12px',
			flexWrap: 'wrap'
		}
	},
	resultCol: {
		display: 'flex',
		flexDirection: 'column',
		gap: 2,
		minWidth: 96,
		flexShrink: 0
	},
	resultWin: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: '#00e676'
	},
	resultLose: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: '#ff5252'
	},
	lpText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600
	},
	lpUp: { color: '#00e676' },
	lpDown: { color: '#ff5252' },
	lpNeutral: { color: 'rgba(255, 255, 255, 0.5)' },
	metaText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.45)',
		whiteSpace: 'nowrap'
	},
	champCol: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		flex: '1 1 auto',
		minWidth: 0
	},
	champImg: {
		width: 52,
		height: 52,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '2px solid rgba(255, 255, 255, 0.25)',
		flexShrink: 0,
		[theme.breakpoints.down('sm')]: {
			width: 42,
			height: 42
		}
	},
	champWrap: {
		position: 'relative',
		flexShrink: 0,
		display: 'inline-flex'
	},
	champLevel: {
		position: 'absolute',
		right: -3,
		bottom: -3,
		minWidth: 19,
		height: 19,
		borderRadius: 10,
		background: 'rgba(0, 0, 0, 0.85)',
		border: '1px solid rgba(255, 255, 255, 0.25)',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: '#fff',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '0 3px'
	},
	champColInner: {
		display: 'flex',
		flexDirection: 'column',
		gap: 7,
		minWidth: 0
	},
	champTopRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	champBottomRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		flexWrap: 'wrap'
	},
	spellRuneGrid: {
		display: 'grid',
		gridTemplateColumns: '20px 20px',
		gridAutoRows: 20,
		gap: 2,
		flexShrink: 0
	},
	spellRuneIcon: {
		width: 20,
		height: 20,
		borderRadius: 4,
		objectFit: 'cover',
		background: 'rgba(0, 0, 0, 0.4)'
	},
	spellRuneEmpty: {
		width: 20,
		height: 20,
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.06)'
	},
	itemsRow: {
		display: 'flex',
		gap: 3,
		alignItems: 'center'
	},
	itemImg: {
		width: 22,
		height: 22,
		borderRadius: 4,
		objectFit: 'cover',
		border: '1px solid rgba(255, 255, 255, 0.12)'
	},
	itemEmpty: {
		width: 22,
		height: 22,
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.06)',
		border: '1px solid rgba(255, 255, 255, 0.06)'
	},
	trinketGap: {
		marginLeft: 4
	},
	killBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: '#fff',
		background: 'linear-gradient(135deg, #ff5252 0%, #ff1744 100%)',
		borderRadius: 10,
		padding: '2px 9px',
		whiteSpace: 'nowrap'
	},
	fbBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: '#ffd700',
		border: '1px solid rgba(255, 215, 0, 0.5)',
		borderRadius: 10,
		padding: '1px 8px',
		whiteSpace: 'nowrap'
	},
	kdaBlock: {
		display: 'flex',
		flexDirection: 'column',
		gap: 1,
		flexShrink: 0
	},
	champNameSmall: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.55)',
		whiteSpace: 'nowrap'
	},
	kdaLine: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.9)',
		whiteSpace: 'nowrap'
	},
	kdaDeath: {
		color: '#ff5252'
	},
	kdaRatio: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700
	},
	// 킬관여/CS/라인전 미니 지표 (op.gg 가운데 블록)
	miniStats: {
		display: 'flex',
		flexDirection: 'column',
		gap: 2,
		paddingLeft: 14,
		borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
		flexShrink: 0
	},
	miniStatLine: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.02rem',
		color: 'rgba(255, 255, 255, 0.55)',
		whiteSpace: 'nowrap'
	},
	miniStatValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.8)'
	},
	laneWin: { color: '#00e676' },
	laneLose: { color: '#ff5252' },
	noDetail: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.3)'
	},
	// 접힌 행 우측 미니 로스터 (5+5)
	miniRosters: {
		display: 'flex',
		gap: 14,
		marginLeft: 'auto',
		flexShrink: 0,
		[theme.breakpoints.down('md')]: {
			display: 'none'
		}
	},
	miniRosterCol: {
		display: 'flex',
		flexDirection: 'column',
		gap: 2
	},
	miniPlayer: {
		display: 'flex',
		alignItems: 'center',
		gap: 5
	},
	miniChampImg: {
		width: 16,
		height: 16,
		borderRadius: 4,
		objectFit: 'cover',
		flexShrink: 0
	},
	miniChampSlot: {
		width: 16,
		height: 16,
		flexShrink: 0
	},
	miniName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.55)',
		maxWidth: 84,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	miniNameMe: {
		color: '#00d4ff',
		fontWeight: 700
	},
	posSlot: {
		width: 22,
		height: 22,
		flexShrink: 0,
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	posIcon: {
		width: 22,
		height: 22,
		objectFit: 'contain'
	},
	posFallback: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.55)'
	},
	expandIcon: {
		color: 'rgba(255, 255, 255, 0.35)',
		transition: 'transform 0.25s ease',
		flexShrink: 0
	},
	expandIconOpen: {
		transform: 'rotate(180deg)'
	},
	// ===== 펼침 상세 =====
	detailWrap: {
		borderTop: '1px solid rgba(255, 255, 255, 0.08)',
		background: 'rgba(0, 0, 0, 0.3)',
		cursor: 'default'
	},
	teamTableWrap: {
		overflowX: 'auto'
	},
	teamTable: {
		width: '100%',
		minWidth: 880,
		borderCollapse: 'collapse'
	},
	teamHeadRow: {
		'& th': {
			fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
			fontSize: '1.05rem',
			fontWeight: 700,
			color: 'rgba(255, 255, 255, 0.45)',
			textTransform: 'uppercase',
			letterSpacing: '0.05em',
			padding: '8px 10px',
			textAlign: 'center',
			whiteSpace: 'nowrap',
			borderBottom: '1px solid rgba(255, 255, 255, 0.07)'
		}
	},
	teamNameTh: {
		textAlign: 'left !important',
		fontSize: '1.2rem !important'
	},
	teamResultWin: { color: '#00e676' },
	teamResultLose: { color: '#ff5252' },
	td: {
		padding: '6px 10px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
		textAlign: 'center',
		whiteSpace: 'nowrap',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.75)'
	},
	playerCell: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		minWidth: 190
	},
	detailChampImg: {
		width: 30,
		height: 30,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		flexShrink: 0
	},
	tierIcon: {
		width: 22,
		height: 22,
		flexShrink: 0
	},
	tierBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.02rem',
		fontWeight: 700,
		minWidth: 30,
		flexShrink: 0,
		textAlign: 'center',
		padding: '1px 4px',
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.1)'
	},
	playerName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.18rem',
		color: '#fff',
		cursor: 'pointer',
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		textAlign: 'left'
	},
	playerNameHighlight: {
		fontWeight: 700,
		color: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.15)',
		padding: '1px 6px',
		borderRadius: 4
	},
	kdaCell: {
		display: 'flex',
		flexDirection: 'column',
		gap: 0,
		alignItems: 'center'
	},
	kdaCellMain: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.18rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.85)'
	},
	kdaCellSub: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.02rem',
		fontWeight: 700
	},
	kpText: {
		color: 'rgba(255, 255, 255, 0.45)',
		fontWeight: 600
	},
	dmgCell: {
		display: 'flex',
		flexDirection: 'column',
		gap: 3,
		minWidth: 110
	},
	dmgRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	dmgNum: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.02rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.6)',
		minWidth: 42,
		textAlign: 'right'
	},
	dmgBarTrack: {
		flex: 1,
		height: 5,
		borderRadius: 3,
		background: 'rgba(255, 255, 255, 0.08)',
		overflow: 'hidden'
	},
	dmgBarDealt: {
		height: '100%',
		borderRadius: 3,
		background: '#ff6b6b'
	},
	dmgBarTaken: {
		height: '100%',
		borderRadius: 3,
		background: 'rgba(255, 255, 255, 0.35)'
	},
	csCell: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center'
	},
	csSub: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.98rem',
		color: 'rgba(255, 255, 255, 0.45)'
	},
	detailChampWrap: {
		position: 'relative',
		flexShrink: 0,
		display: 'inline-flex'
	},
	detailChampLevel: {
		position: 'absolute',
		right: -4,
		bottom: -4,
		minWidth: 15,
		height: 15,
		borderRadius: 8,
		background: 'rgba(0, 0, 0, 0.85)',
		border: '1px solid rgba(255, 255, 255, 0.25)',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.8rem',
		fontWeight: 700,
		color: '#fff',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '0 2px'
	},
	detailSpellRuneGrid: {
		display: 'grid',
		gridTemplateColumns: '14px 14px',
		gridAutoRows: 14,
		gap: 1,
		flexShrink: 0
	},
	detailSpellRuneIcon: {
		width: 14,
		height: 14,
		borderRadius: 3,
		objectFit: 'cover',
		background: 'rgba(0, 0, 0, 0.4)'
	},
	detailSpellRuneEmpty: {
		width: 14,
		height: 14,
		borderRadius: 3,
		background: 'rgba(255, 255, 255, 0.06)'
	},
	detailItemImg: {
		width: 20,
		height: 20,
		borderRadius: 4,
		objectFit: 'cover',
		border: '1px solid rgba(255, 255, 255, 0.12)'
	},
	detailItemEmpty: {
		width: 20,
		height: 20,
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.06)'
	},
	wardSub: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.98rem',
		color: 'rgba(255, 255, 255, 0.45)'
	},
	bansRow: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 3,
		marginLeft: 12
	},
	banLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.4)',
		marginRight: 2
	},
	banImg: {
		width: 18,
		height: 18,
		borderRadius: 4,
		objectFit: 'cover',
		filter: 'grayscale(0.7) brightness(0.8)'
	},
	objRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	objText: {
		flex: 1,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.02rem',
		fontWeight: 600,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	objCenter: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.35)',
		textTransform: 'uppercase',
		letterSpacing: '0.06em',
		flexShrink: 0
	},
	// 팀 합계 스트립 (Total Kill / Total Gold)
	summaryStrip: {
		display: 'flex',
		flexDirection: 'column',
		gap: 6,
		padding: '10px 16px',
		borderTop: '1px solid rgba(255, 255, 255, 0.07)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
		background: 'rgba(0, 0, 0, 0.25)'
	},
	summaryRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	summaryValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		minWidth: 52,
		color: 'rgba(255, 255, 255, 0.85)'
	},
	summaryBarTrack: {
		flex: 1,
		height: 14,
		borderRadius: 7,
		overflow: 'hidden',
		display: 'flex',
		position: 'relative'
	},
	summaryLabel: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '0.98rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.9)',
		textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
		pointerEvents: 'none'
	},
	// 스탯 없는 매치 폴백 로스터
	simpleTeams: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		[theme.breakpoints.down('md')]: {
			gridTemplateColumns: '1fr'
		}
	},
	simpleTeamBlock: {
		padding: '12px 16px'
	},
	simpleTeamHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginBottom: 10,
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.8)'
	},
	simplePlayerRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '3px 0'
	},
	pagination: {
		color: 'rgba(255, 255, 255, 0.7)',
		'& .MuiIconButton-root': {
			color: 'rgba(255, 255, 255, 0.5)'
		},
		'& .MuiIconButton-root.Mui-disabled': {
			color: 'rgba(255, 255, 255, 0.2)'
		}
	},
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: '60px 20px',
		textAlign: 'center',
		gap: 12
	},
	emptyIcon: {
		fontSize: '4rem',
		opacity: 0.5
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		color: 'rgba(255, 255, 255, 0.4)'
	}
}));

/**
 * 내정보 전용 내전 기록 리스트 (op.gg 스타일).
 * - perspectivePuuid 기준 승(초록)/패(빨강) 행 + 내 챔피언/KDA/킬관여/CS/라인전 골드 지분
 * - 우측 미니 로스터(데스크톱), 행 클릭 시 팀별 상세 테이블(KDA/피해량 바/시야/CS/골드) + 팀 합계
 * - 헬퍼(elise) 미수집 매치는 "상세 미수집" + 단순 로스터 폴백
 * 그룹 매치기록 페이지의 MatchList와 별개 컴포넌트 (관점·챔피언 중심이라 구조가 다름).
 */
function InternalMatchList({ matches, total, page, rowsPerPage, onPageChange, perspectivePuuid }) {
	const { classes, cx } = useStyles();
	const navigate = useNavigate();
	const [expandedIds, setExpandedIds] = useState(() => new Set());
	// 밴 목록(championId 숫자)의 아이콘 렌더용 id → DDragon 키 맵
	const [champKeys, setChampKeys] = useState({});

	useEffect(() => {
		let alive = true;
		loadChampionKeysById().then(map => {
			if (alive) setChampKeys(map);
		});
		return () => {
			alive = false;
		};
	}, []);

	// 스펠(좌열) + 룬(우열) 2x2 아이콘. 스펠/룬 정보가 아예 없으면 렌더 안 함(구 수집분 호환)
	const renderSpellsRunes = (stat, gridCls, iconCls, emptyCls) => {
		if (stat.spell1Id == null && stat.runeKeystoneId == null) return null;
		const cells = [
			stat.spell1Id != null ? getSpellIcon(stat.spell1Id) : null,
			stat.runeKeystoneId != null ? getKeystoneIcon(stat.runeKeystoneId) : null,
			stat.spell2Id != null ? getSpellIcon(stat.spell2Id) : null,
			stat.runeSubStyleId != null ? getKeystoneIcon(stat.runeSubStyleId) : null
		];
		return (
			<div className={gridCls}>
				{cells.map((src, i) =>
					src ? (
						// eslint-disable-next-line react/no-array-index-key
						<img key={i} className={iconCls} src={src} alt="" />
					) : (
						// eslint-disable-next-line react/no-array-index-key
						<span key={i} className={emptyCls} />
					)
				)}
			</div>
		);
	};

	// 아이템 6칸 + 장신구. items 정보 없으면 렌더 안 함(구 수집분 호환)
	const renderItems = (stat, imgCls, emptyCls) => {
		if (!stat.items && stat.trinket == null) return null;
		const slots = [...(stat.items || [])];
		while (slots.length < 6) slots.push(0);
		return (
			<div className={classes.itemsRow}>
				{slots.slice(0, 6).map((id, i) =>
					id ? (
						// eslint-disable-next-line react/no-array-index-key
						<img key={i} className={imgCls} src={getItemIcon(id)} alt="" />
					) : (
						// eslint-disable-next-line react/no-array-index-key
						<span key={i} className={emptyCls} />
					)
				)}
				{stat.trinket ? (
					<img className={cx(imgCls, classes.trinketGap)} src={getItemIcon(stat.trinket)} alt="" />
				) : (
					<span className={cx(emptyCls, classes.trinketGap)} />
				)}
			</div>
		);
	};

	const toggleExpand = gameId => {
		setExpandedIds(prev => {
			const next = new Set(prev);
			if (next.has(gameId)) next.delete(gameId);
			else next.add(gameId);
			return next;
		});
	};

	const getMyContext = match => {
		const inT1 = match.team1.players.some(p => p.puuid === perspectivePuuid);
		const inT2 = !inT1 && match.team2.players.some(p => p.puuid === perspectivePuuid);
		const myTeamNo = inT1 ? 1 : inT2 ? 2 : null;
		if (!myTeamNo) return null;
		const myTeam = myTeamNo === 1 ? match.team1 : match.team2;
		const me = myTeam.players.find(p => p.puuid === perspectivePuuid);
		return {
			won: match.winTeam === myTeamNo,
			myLp: myTeam.ratingChange == null ? null : myTeam.ratingChange * 4,
			myStat: me && me.stat ? me.stat : null,
			myTeamPlayers: myTeam.players,
			myPosition: me ? getPlayerPosition(me) : null
		};
	};

	const renderLp = lp => {
		if (lp == null) return null;
		const cls = lp > 0 ? classes.lpUp : lp < 0 ? classes.lpDown : classes.lpNeutral;
		return (
			<span className={`${classes.lpText} ${cls}`}>
				{lp > 0 ? `+${lp}` : lp} LP
			</span>
		);
	};

	const goUser = (e, p) => {
		e.stopPropagation();
		navigate(`/userinfo/${p.puuid}`);
	};

	// 접힌 행 우측 미니 로스터 (팀별 5명: 챔프 아이콘 + 이름)
	const renderMiniRoster = team => (
		<div className={classes.miniRosterCol}>
			{sortPlayers(team.players).map(p => (
				<div key={p.puuid} className={classes.miniPlayer}>
					{p.stat ? (
						<img
							className={classes.miniChampImg}
							src={getChampionIcon(p.stat.championName)}
							alt={p.stat.championKoName || p.stat.championName}
							onError={e => {
								e.currentTarget.style.visibility = 'hidden';
							}}
						/>
					) : (
						<span className={classes.miniChampSlot} />
					)}
					<span
						className={cx(classes.miniName, p.puuid === perspectivePuuid && classes.miniNameMe)}
						title={p.name}
						onClick={e => goUser(e, p)}
					>
						{p.name}
					</span>
				</div>
			))}
		</div>
	);

	// 펼침: 팀별 상세 테이블 (KDA / 피해량 / 시야 / CS / 골드)
	const renderTeamTable = (match, teamNo, maxDealt, maxTaken, durationSec) => {
		const team = teamNo === 1 ? match.team1 : match.team2;
		const won = match.winTeam === teamNo;
		const players = sortPlayers(team.players);
		const durationMin = durationSec ? durationSec / 60 : null;
		const teamStat = match.teamStats ? match.teamStats[`team${teamNo}`] : null;
		const bans = teamStat && teamStat.bans ? teamStat.bans : [];
		return (
			<div className={classes.teamTableWrap}>
				<table className={classes.teamTable}>
					<thead>
						<tr className={classes.teamHeadRow}>
							<th className={classes.teamNameTh} style={{ color: TEAM_COLORS[teamNo] }}>
								<span role="img" aria-label={teamNo === 1 ? 'dog' : 'cat'}>
									{teamNo === 1 ? '🐶' : '🐱'}
								</span>{' '}
								Team {teamNo}{' '}
								<span className={won ? classes.teamResultWin : classes.teamResultLose}>{won ? 'WIN' : 'LOSE'}</span>
								{bans.length > 0 && (
									<span className={classes.bansRow}>
										<span className={classes.banLabel}>밴</span>
										{bans.map(b => {
											const key = champKeys[b.championId];
											return key ? (
												<img key={`${b.championId}-${b.pickTurn}`} className={classes.banImg} src={getChampionIcon(key)} alt="" title={key} />
											) : null;
										})}
									</span>
								)}
							</th>
							<th>KDA</th>
							<th>피해량 (가한/받은)</th>
							<th title="시야점수 · 제어와드 / 설치 / 제거">와드</th>
							<th>CS</th>
							<th>골드</th>
							<th>아이템</th>
						</tr>
					</thead>
					<tbody>
						{players.map(player => {
							const pos = getPlayerPosition(player);
							const posIconKey = POSITION_ICON_KEY[pos];
							const { stat } = player;
							const isMe = player.puuid === perspectivePuuid;
							const ratio = stat ? getKdaRatio(stat) : null;
							const kp = stat ? getKillParticipation(stat, team.players) : null;
							return (
								<tr key={player.puuid}>
									<td className={classes.td}>
										<div className={classes.playerCell}>
											<span className={classes.posSlot}>
												{posIconKey && (
													<PositionIcon
														position={posIconKey}
														className={classes.posIcon}
														fallbackClassName={classes.posFallback}
													/>
												)}
											</span>
											{stat && (
												<>
													<span className={classes.detailChampWrap}>
														<img
															className={classes.detailChampImg}
															src={getChampionIcon(stat.championName)}
															alt={stat.championKoName || stat.championName}
															title={stat.championKoName || stat.championName}
															onError={e => {
																e.currentTarget.style.visibility = 'hidden';
															}}
														/>
														{stat.champLevel != null && (
															<span className={classes.detailChampLevel}>{stat.champLevel}</span>
														)}
													</span>
													{renderSpellsRunes(
														stat,
														classes.detailSpellRuneGrid,
														classes.detailSpellRuneIcon,
														classes.detailSpellRuneEmpty
													)}
												</>
											)}
											<img
												className={classes.tierIcon}
												src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(player.tier)}.webp`}
												alt={player.tier}
											/>
											<span className={classes.tierBadge} style={{ color: getTierColor(player.tier) }}>
												{getTierShortName(player.tier)}
											</span>
											<span
												className={cx(classes.playerName, isMe && classes.playerNameHighlight)}
												title={player.name}
												onClick={e => goUser(e, player)}
											>
												{player.name}
											</span>
										</div>
									</td>
									{stat ? (
										<>
											<td className={classes.td}>
												<div className={classes.kdaCell}>
													<span className={classes.kdaCellMain}>
														{stat.kills} / <span className={classes.kdaDeath}>{stat.deaths}</span> / {stat.assists}
														{kp != null && <span className={classes.kpText}> ({kp}%)</span>}
													</span>
													<span className={classes.kdaCellSub} style={{ color: kdaRatioColor(ratio) }}>
														{ratio == null ? 'Perfect' : `${ratio.toFixed(2)}:1`}
													</span>
												</div>
											</td>
											<td className={classes.td}>
												<div className={classes.dmgCell}>
													<div className={classes.dmgRow}>
														<span className={classes.dmgNum}>{formatK(stat.damageToChampions)}</span>
														<div className={classes.dmgBarTrack}>
															<div
																className={classes.dmgBarDealt}
																style={{ width: `${maxDealt > 0 ? (stat.damageToChampions / maxDealt) * 100 : 0}%` }}
															/>
														</div>
													</div>
													<div className={classes.dmgRow}>
														<span className={classes.dmgNum}>{formatK(stat.damageTaken)}</span>
														<div className={classes.dmgBarTrack}>
															<div
																className={classes.dmgBarTaken}
																style={{
																	width: `${
																		maxTaken > 0 && stat.damageTaken != null
																			? (stat.damageTaken / maxTaken) * 100
																			: 0
																	}%`
																}}
															/>
														</div>
													</div>
												</div>
											</td>
											<td className={classes.td}>
												<div className={classes.csCell} title="시야점수 · 제어와드 / 설치 / 제거">
													<span>{stat.visionScore != null ? stat.visionScore : '-'}</span>
													{stat.wardsPlaced != null && (
														<span className={classes.wardSub}>
															{stat.controlWardsBought != null ? stat.controlWardsBought : 0} /{' '}
															{stat.wardsPlaced} / {stat.wardsKilled != null ? stat.wardsKilled : 0}
														</span>
													)}
												</div>
											</td>
											<td className={classes.td}>
												<div className={classes.csCell}>
													<span>{stat.cs}</span>
													{durationMin && <span className={classes.csSub}>분당 {(stat.cs / durationMin).toFixed(1)}</span>}
												</div>
											</td>
											<td className={classes.td}>{formatK(stat.goldEarned)}</td>
											<td className={classes.td}>
												{renderItems(stat, classes.detailItemImg, classes.detailItemEmpty) || '-'}
											</td>
										</>
									) : (
										<td className={classes.td} colSpan={6}>
											<span className={classes.noDetail}>-</span>
										</td>
									)}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	};

	// 팀 합계 스트립 (Total Kill / Total Gold — 팀 컬러 비율 바)
	const renderSummaryStrip = match => {
		const sum = (team, key) => team.players.reduce((s, p) => s + (p.stat ? p.stat[key] || 0 : 0), 0);
		const rows = [
			{ label: 'Total Kill', t1: sum(match.team1, 'kills'), t2: sum(match.team2, 'kills'), fmt: v => v },
			{ label: 'Total Gold', t1: sum(match.team1, 'goldEarned'), t2: sum(match.team2, 'goldEarned'), fmt: formatK }
		];
		const ts = match.teamStats;
		const objText = team =>
			OBJECTIVE_DEFS.filter(([k]) => team[k] != null)
				.map(([k, label]) => `${label} ${team[k]}`)
				.join(' · ');
		return (
			<div className={classes.summaryStrip}>
				{rows.map(r => {
					const totalVal = r.t1 + r.t2;
					const pct1 = totalVal > 0 ? (r.t1 / totalVal) * 100 : 50;
					return (
						<div key={r.label} className={classes.summaryRow}>
							<span className={classes.summaryValue} style={{ color: TEAM_COLORS[1], textAlign: 'right' }}>
								{r.fmt(r.t1)}
							</span>
							<div className={classes.summaryBarTrack}>
								<div style={{ width: `${pct1}%`, background: 'rgba(0, 212, 255, 0.55)' }} />
								<div style={{ width: `${100 - pct1}%`, background: 'rgba(255, 107, 154, 0.55)' }} />
								<span className={classes.summaryLabel}>{r.label}</span>
							</div>
							<span className={classes.summaryValue} style={{ color: TEAM_COLORS[2] }}>
								{r.fmt(r.t2)}
							</span>
						</div>
					);
				})}
				{ts && ts.team1 && ts.team2 && (
					<div className={classes.objRow}>
						<span className={classes.objText} style={{ color: TEAM_COLORS[1], textAlign: 'right' }}>
							{objText(ts.team1)}
						</span>
						<span className={classes.objCenter}>오브젝트</span>
						<span className={classes.objText} style={{ color: TEAM_COLORS[2] }}>
							{objText(ts.team2)}
						</span>
					</div>
				)}
			</div>
		);
	};

	// 스탯 없는 매치 폴백: 단순 로스터 (포지션/티어/이름)
	const renderSimpleTeam = (match, teamNo) => {
		const team = teamNo === 1 ? match.team1 : match.team2;
		const won = match.winTeam === teamNo;
		return (
			<div className={classes.simpleTeamBlock}>
				<div className={classes.simpleTeamHeader}>
					<span role="img" aria-label={teamNo === 1 ? 'dog' : 'cat'}>
						{teamNo === 1 ? '🐶' : '🐱'}
					</span>
					Team {teamNo}
					<span className={won ? classes.teamResultWin : classes.teamResultLose}>{won ? 'WIN' : 'LOSE'}</span>
				</div>
				{sortPlayers(team.players).map(player => {
					const posIconKey = POSITION_ICON_KEY[getPlayerPosition(player)];
					const isMe = player.puuid === perspectivePuuid;
					return (
						<div key={player.puuid} className={classes.simplePlayerRow}>
							<span className={classes.posSlot}>
								{posIconKey && (
									<PositionIcon position={posIconKey} className={classes.posIcon} fallbackClassName={classes.posFallback} />
								)}
							</span>
							<img
								className={classes.tierIcon}
								src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(player.tier)}.webp`}
								alt={player.tier}
							/>
							<span className={classes.tierBadge} style={{ color: getTierColor(player.tier) }}>
								{getTierShortName(player.tier)}
							</span>
							<span
								className={cx(classes.playerName, isMe && classes.playerNameHighlight)}
								title={player.name}
								onClick={e => goUser(e, player)}
							>
								{player.name}
							</span>
						</div>
					);
				})}
			</div>
		);
	};

	if (!matches || matches.length === 0) {
		return (
			<div className={classes.emptyState}>
				<div className={classes.emptyIcon}>
					<span role="img" aria-label="scroll">
						📜
					</span>
				</div>
				<div className={classes.emptyText}>내전 기록이 없습니다</div>
			</div>
		);
	}

	return (
		<div className={classes.wrapper}>
			{matches.map(match => {
				const ctx = getMyContext(match);
				if (!ctx) return null;
				const { won, myLp, myStat, myTeamPlayers, myPosition } = ctx;
				const expanded = expandedIds.has(match.gameId);
				const durationSec = match.gameDurationSec || (myStat && myStat.gameDurationSec) || null;
				const kdaRatio = myStat ? getKdaRatio(myStat) : null;
				const csPerMin = myStat && durationSec ? (myStat.cs / (durationSec / 60)).toFixed(1) : null;
				const kp = myStat ? getKillParticipation(myStat, myTeamPlayers) : null;
				const laneShare = myStat ? getLaneShare(myStat) : null;
				const multiKill = myStat ? getMultiKillBadge(myStat) : null;
				const patch = match.gameVersion ? match.gameVersion.split('.').slice(0, 2).join('.') : null;
				const posIconKey = POSITION_ICON_KEY[myPosition];
				const allPlayers = [...match.team1.players, ...match.team2.players];
				const hasAnyStats = allPlayers.some(p => p.stat);
				const maxDealt = Math.max(...allPlayers.map(p => (p.stat ? p.stat.damageToChampions || 0 : 0)));
				const maxTaken = Math.max(...allPlayers.map(p => (p.stat ? p.stat.damageTaken || 0 : 0)));
				return (
					<div
						key={match.gameId}
						className={cx(classes.matchCard, won ? classes.matchWin : classes.matchLose)}
						onClick={() => toggleExpand(match.gameId)}
					>
						<div className={classes.rowMain}>
							<div className={classes.resultCol}>
								<span className={won ? classes.resultWin : classes.resultLose}>{won ? '승리' : '패배'}</span>
								{renderLp(myLp)}
								<span className={classes.metaText}>{formatDate(match.createdAt)}</span>
								{durationSec != null && <span className={classes.metaText}>{formatDuration(durationSec)}</span>}
								{patch && <span className={classes.metaText}>패치 {patch}</span>}
							</div>
							<div className={classes.champCol}>
								{myStat ? (
									<>
										<div className={classes.champColInner}>
											<div className={classes.champTopRow}>
												<span className={classes.champWrap}>
													<img
														className={classes.champImg}
														src={getChampionIcon(myStat.championName)}
														alt={myStat.championKoName || myStat.championName}
														onError={e => {
															e.currentTarget.style.visibility = 'hidden';
														}}
													/>
													{myStat.champLevel != null && (
														<span className={classes.champLevel}>{myStat.champLevel}</span>
													)}
												</span>
												{renderSpellsRunes(
													myStat,
													classes.spellRuneGrid,
													classes.spellRuneIcon,
													classes.spellRuneEmpty
												)}
												<div className={classes.kdaBlock}>
													<span className={classes.champNameSmall}>
														{myStat.championKoName || myStat.championName}
													</span>
													<span className={classes.kdaLine}>
														{myStat.kills} / <span className={classes.kdaDeath}>{myStat.deaths}</span> /{' '}
														{myStat.assists}
													</span>
													<span className={classes.kdaRatio} style={{ color: kdaRatioColor(kdaRatio) }}>
														{kdaRatio == null ? 'Perfect' : `${kdaRatio.toFixed(2)}:1 평점`}
													</span>
												</div>
											</div>
											{(myStat.items || multiKill || myStat.firstBloodKill) && (
												<div className={classes.champBottomRow}>
													{renderItems(myStat, classes.itemImg, classes.itemEmpty)}
													{multiKill && <span className={classes.killBadge}>{multiKill}</span>}
													{myStat.firstBloodKill && <span className={classes.fbBadge}>퍼스트 블러드</span>}
												</div>
											)}
										</div>
										<div className={classes.miniStats}>
											{kp != null && (
												<span className={classes.miniStatLine}>
													킬관여 <span className={classes.miniStatValue}>{kp}%</span>
												</span>
											)}
											<span className={classes.miniStatLine}>
												CS{' '}
												<span className={classes.miniStatValue}>
													{myStat.cs}
													{csPerMin != null ? ` (${csPerMin})` : ''}
												</span>
											</span>
											{laneShare != null && (
												<span className={classes.miniStatLine}>
													라인전{' '}
													<span
														className={cx(
															classes.miniStatValue,
															laneShare > 50 && classes.laneWin,
															laneShare < 50 && classes.laneLose
														)}
													>
														{laneShare}
													</span>{' '}
													: {100 - laneShare}
												</span>
											)}
										</div>
									</>
								) : (
									<span className={classes.noDetail}>상세 미수집</span>
								)}
							</div>
							<div className={classes.miniRosters}>
								{renderMiniRoster(match.team1)}
								{renderMiniRoster(match.team2)}
							</div>
							{posIconKey && (
								<span className={classes.posSlot}>
									<PositionIcon position={posIconKey} className={classes.posIcon} fallbackClassName={classes.posFallback} />
								</span>
							)}
							<ExpandMoreIcon className={cx(classes.expandIcon, expanded && classes.expandIconOpen)} />
						</div>
						{expanded && (
							<div className={classes.detailWrap} onClick={e => e.stopPropagation()}>
								{hasAnyStats ? (
									<>
										{renderTeamTable(match, 1, maxDealt, maxTaken, durationSec)}
										{renderSummaryStrip(match)}
										{renderTeamTable(match, 2, maxDealt, maxTaken, durationSec)}
									</>
								) : (
									<div className={classes.simpleTeams}>
										{renderSimpleTeam(match, 1)}
										{renderSimpleTeam(match, 2)}
									</div>
								)}
							</div>
						)}
					</div>
				);
			})}
			<TablePagination
				className={classes.pagination}
				component="div"
				count={total}
				rowsPerPage={rowsPerPage}
				rowsPerPageOptions={[]}
				page={page - 1}
				backIconButtonProps={{ 'aria-label': 'Previous Page' }}
				nextIconButtonProps={{ 'aria-label': 'Next Page' }}
				onPageChange={(event, newPage) => onPageChange(newPage + 1)}
			/>
		</div>
	);
}

export default InternalMatchList;
