import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import Dialog from '@mui/material/Dialog';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
	getTierName,
	getTierLabel,
	getTierPoint,
	getTierEmblemUrl,
	parseRankTier
} from 'app/main/tournament/tournamentUtils';
import PositionIcon from '../tournament/PositionIcon';
import { Reveal, RevealGroup } from '../components/Reveal';
import OpponentPicker from './OpponentPicker';
import RatingTrajectoryChart from './RatingTrajectoryChart';
import EntangledMatches from './EntangledMatches';
import { fetchCompare } from './compareApi';

const A_COLOR = '#00d4ff';
const B_COLOR = '#ff6b9a';
const GOOD_COLOR = '#00ff7f';
const BAD_COLOR = '#ff6b6b';
// 레이팅 delta → 점(LP) 환산 배수. RankingTable의 formatRatingChange(val*4)/getTierPoint과 동일.
const LP_PER_RATING = 4;

// Riot 표준 포지션 키 → 한글 라벨 + PositionIcon용 키(소문자).
const POSITION_META = {
	TOP: { label: '탑', icon: 'top' },
	JUNGLE: { label: '정글', icon: 'jungle' },
	MIDDLE: { label: '미드', icon: 'mid' },
	BOTTOM: { label: '원딜', icon: 'adc' },
	UTILITY: { label: '서폿', icon: 'support' }
};

const posLabel = pos => (POSITION_META[pos] ? POSITION_META[pos].label : pos);

const RELATION_EMOJI = {
	natural_enemy: '🩸',
	fated_rivals: '⚔️',
	fantastic_duo: '✨',
	love_hate: '💢'
};

function fmtPct(v) {
	return v == null ? '-' : `${v}%`;
}

function signed(v) {
	if (v == null) return '-';
	return v > 0 ? `+${v}` : `${v}`;
}

function toDate(v) {
	if (!v) return null;
	const d = new Date(v);
	return Number.isNaN(d.getTime()) ? null : d;
}

function fmtDate(v) {
	const d = toDate(v);
	if (!d) return '-';
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${d.getFullYear()}.${mm}.${dd}`;
}

function daysAgoLabel(v) {
	const d = toDate(v);
	if (!d) return null;
	const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
	if (diff <= 0) return '오늘';
	if (diff === 1) return '어제';
	return `${diff}일 전`;
}

const useStyles = makeStyles()((theme) => ({
	root: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100%',
		padding: '28px 28px 60px',
		[theme.breakpoints.down('sm')]: {
			padding: '18px 12px 40px'
		}
	},
	inner: {
		maxWidth: 1080,
		margin: '0 auto'
	},
	// ── VS 헤더 ──
	vsHeader: {
		display: 'grid',
		gridTemplateColumns: '1fr auto 1fr',
		alignItems: 'stretch',
		gap: 16,
		marginBottom: 28,
		[theme.breakpoints.down('sm')]: {
			gap: 8
		}
	},
	playerCard: {
		position: 'relative',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		textAlign: 'center',
		padding: '26px 20px',
		borderRadius: 20,
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		border: '1px solid var(--pc-border)',
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
		overflow: 'hidden',
		'&::before': {
			content: '""',
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			height: 3,
			background: 'linear-gradient(90deg, transparent, var(--pc), transparent)'
		},
		[theme.breakpoints.down('sm')]: {
			padding: '16px 8px',
			borderRadius: 14
		}
	},
	playerEmblem: {
		width: 64,
		height: 64,
		marginBottom: 8,
		[theme.breakpoints.down('sm')]: {
			width: 44,
			height: 44
		}
	},
	playerName: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.9rem',
		fontWeight: 700,
		lineHeight: 1.1,
		wordBreak: 'break-all',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.4rem'
		}
	},
	playerTierLabel: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		lineHeight: 1.1,
		margin: '8px 0 2px',
		letterSpacing: '0.03em',
		textShadow: '0 0 24px var(--pc-glow)',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.7rem'
		}
	},
	soloChip: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 5,
		marginTop: 10,
		padding: '3px 10px',
		borderRadius: 20,
		background: 'rgba(255, 255, 255, 0.06)',
		border: '1px solid rgba(255, 255, 255, 0.1)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.7)'
	},
	soloChipEmblem: {
		width: 18,
		height: 18
	},
	playerBottom: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 6,
		marginTop: 14
	},
	posTag: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 6,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.75)'
	},
	posTagIcon: {
		width: 20,
		height: 20
	},
	recordTag: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.85)'
	},
	enemyBadge: {
		position: 'absolute',
		top: 10,
		right: 10,
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4,
		padding: '3px 9px',
		borderRadius: 8,
		background: 'rgba(255, 107, 107, 0.15)',
		border: '1px solid rgba(255, 107, 107, 0.45)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		fontWeight: 700,
		color: '#ff8787'
	},
	vsCenter: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		minWidth: 90,
		[theme.breakpoints.down('sm')]: {
			minWidth: 48,
			gap: 6
		}
	},
	vsText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '3rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.04em',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.35)',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.8rem'
		}
	},
	relationBadges: {
		display: 'flex',
		flexDirection: 'column',
		gap: 6,
		alignItems: 'center'
	},
	relationBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 5,
		padding: '4px 10px',
		borderRadius: 20,
		background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(255, 107, 154, 0.15))',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.9)',
		whiteSpace: 'nowrap'
	},
	changeBtn: {
		marginTop: 14,
		background: 'rgba(255, 255, 255, 0.06)',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		color: 'rgba(255, 255, 255, 0.7)',
		borderRadius: 20,
		padding: '5px 18px',
		cursor: 'pointer',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 600,
		transition: 'all 0.2s ease',
		'&:hover': {
			borderColor: '#00d4ff',
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.08)'
		}
	},
	dialogPaper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		// MUI Paper가 다크 모드에서 elevation 오버레이(backgroundImage)를 덧씌워 프레임 톤이 뜨는 것을 막음
		backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		color: '#fff',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		borderRadius: '20px !important',
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 212, 255, 0.08)',
		overflow: 'hidden',
		position: 'relative',
		'&::before': {
			content: '""',
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			height: 1,
			background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent)'
		}
	},
	// ── 섹션 공통 ──
	sections: {
		display: 'flex',
		flexDirection: 'column',
		gap: 22
	},
	section: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		border: '1px solid rgba(0, 212, 255, 0.15)',
		borderRadius: 18,
		padding: '22px 24px',
		[theme.breakpoints.down('sm')]: {
			padding: '16px 14px',
			borderRadius: 14
		}
	},
	sectionTitle: {
		position: 'relative',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.7rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.03em',
		paddingLeft: 14,
		marginBottom: 18,
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		'&::before': {
			content: '""',
			position: 'absolute',
			left: 0,
			top: 2,
			bottom: 2,
			width: 4,
			borderRadius: 2,
			background: 'linear-gradient(180deg, #00d4ff, #0066ff)'
		}
	},
	sectionEmpty: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		color: 'rgba(255, 255, 255, 0.4)',
		padding: '10px 2px'
	},
	// ── 상대 전적 ──
	h2hScoreRow: {
		display: 'grid',
		gridTemplateColumns: '1fr auto 1fr',
		alignItems: 'center',
		gap: 14,
		marginBottom: 8
	},
	h2hSide: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 2
	},
	h2hSideName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.6)',
		maxWidth: 160,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	h2hScore: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '4rem',
		fontWeight: 700,
		lineHeight: 1,
		[theme.breakpoints.down('sm')]: {
			fontSize: '2.8rem'
		}
	},
	h2hColon: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.35)'
	},
	balanceBar: {
		display: 'flex',
		height: 12,
		borderRadius: 6,
		overflow: 'hidden',
		background: 'rgba(255, 255, 255, 0.08)',
		margin: '10px 0 6px'
	},
	balanceFill: {
		height: '100%',
		transition: 'width 0.4s ease'
	},
	balanceCaption: {
		display: 'flex',
		justifyContent: 'space-between',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.6)'
	},
	dotsRow: {
		display: 'flex',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 7,
		marginTop: 18
	},
	dotsLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.45)',
		marginRight: 4
	},
	dot: {
		width: 20,
		height: 20,
		borderRadius: '50%',
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: '#0f0f1a'
	},
	dotLatest: {
		boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.85)'
	},
	streakText: {
		marginTop: 16,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	maxStreakText: {
		marginTop: 8,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.55)'
	},
	// ── 점수 약탈전 ──
	flowNet: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		textAlign: 'center',
		marginBottom: 14
	},
	flowBar: {
		display: 'flex',
		height: 30,
		borderRadius: 8,
		overflow: 'hidden',
		background: 'rgba(255, 255, 255, 0.06)'
	},
	flowFill: {
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		color: '#0f0f1a',
		transition: 'width 0.4s ease'
	},
	flowFillLeft: {
		justifyContent: 'flex-start',
		paddingLeft: 10
	},
	flowFillRight: {
		justifyContent: 'flex-end',
		paddingRight: 10
	},
	flowLegend: {
		display: 'flex',
		justifyContent: 'space-between',
		marginTop: 8,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.55)'
	},
	caption: {
		marginTop: 12,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	// ── 레이팅 궤적 ──
	chartContainer: {
		height: 340,
		position: 'relative',
		[theme.breakpoints.down('sm')]: {
			height: 260
		}
	},
	// ── 같은 팀 케미 ──
	synergyHero: {
		textAlign: 'center',
		marginBottom: 16
	},
	synergyHeroValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '3.4rem',
		fontWeight: 700,
		lineHeight: 1,
		[theme.breakpoints.down('sm')]: {
			fontSize: '2.6rem'
		}
	},
	synergyHeroLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginTop: 6
	},
	synergyStats: {
		display: 'flex',
		justifyContent: 'center',
		flexWrap: 'wrap',
		gap: 24
	},
	statBlock: {
		textAlign: 'center'
	},
	statBlockValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.9rem',
		fontWeight: 700,
		color: '#fff'
	},
	statBlockLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.45)',
		marginTop: 2
	},
	combos: {
		marginTop: 18,
		borderTop: '1px solid rgba(255, 255, 255, 0.06)',
		paddingTop: 14
	},
	combosTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.45)',
		marginBottom: 8
	},
	comboRow: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 12,
		padding: '5px 0',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem'
	},
	comboPair: {
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.85)'
	},
	comboStat: {
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.6)',
		whiteSpace: 'nowrap'
	},
	// ── 인연 타임라인 ──
	timelineCards: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
		gap: 14,
		marginBottom: 18
	},
	milestone: {
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		borderRadius: 12,
		padding: '14px 16px'
	},
	milestoneLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.45)',
		marginBottom: 6
	},
	milestoneMain: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: '#fff',
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		flexWrap: 'wrap'
	},
	milestoneDate: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginTop: 4
	},
	milestoneSub: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.45)',
		marginTop: 4
	},
	thenTier: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 3,
		verticalAlign: 'middle',
		fontWeight: 700
	},
	thenEmblem: {
		width: 16,
		height: 16
	},
	// ── 맞라인 전적 ──
	laneRow: {
		display: 'grid',
		gridTemplateColumns: '90px 1fr 90px',
		alignItems: 'center',
		gap: 12,
		padding: '10px 0',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
	},
	lanePos: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.8)'
	},
	lanePosIcon: {
		width: 22,
		height: 22
	},
	laneScore: {
		textAlign: 'right',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.75)'
	},
	// ── 둘 다와의 시너지 ──
	synergyCols: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: 16,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr'
		}
	},
	synergyColTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.35rem',
		fontWeight: 700,
		marginBottom: 10,
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	mutualCard: {
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		borderRadius: 12,
		padding: '12px 14px',
		marginBottom: 10
	},
	mutualHead: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8
	},
	mutualName: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#fff',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	mutualAvg: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700,
		padding: '2px 8px',
		borderRadius: 8,
		whiteSpace: 'nowrap'
	},
	mutualWith: {
		display: 'flex',
		justifyContent: 'space-between',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.65)',
		padding: '2px 0'
	},
	mutualEmpty: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.35)'
	},
	crossBlock: {
		marginTop: 20,
		borderTop: '1px solid rgba(255, 255, 255, 0.06)',
		paddingTop: 16
	},
	crossTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.35rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.85)',
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		marginBottom: 12
	},
	// ── 토너먼트 인연 ──
	champBox: {
		display: 'flex',
		flexDirection: 'column',
		gap: 10,
		marginBottom: 16
	},
	champRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		padding: '12px 14px',
		borderRadius: 12,
		background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12), rgba(255, 215, 0, 0.04))',
		border: '1px solid rgba(255, 215, 0, 0.35)'
	},
	champTrophy: {
		fontSize: '1.6rem',
		flexShrink: 0
	},
	champText: {
		flex: 1,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		color: 'rgba(255, 255, 255, 0.9)'
	},
	champDate: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.5)',
		flexShrink: 0
	},
	tnList: {
		marginBottom: 16
	},
	tnListTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.45)',
		marginBottom: 8
	},
	tnRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		padding: '7px 0',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem'
	},
	tnName: {
		flex: 1,
		color: 'rgba(255, 255, 255, 0.85)',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	tnTeam: {
		color: '#00d4ff',
		flexShrink: 0
	},
	tnDate: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		flexShrink: 0,
		minWidth: 90,
		textAlign: 'right'
	},
	tnVs: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		marginTop: 4,
		padding: '12px 0 4px'
	},
	tnVsLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.6)'
	},
	tnVsScore: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '2rem',
		fontWeight: 700
	},
	tnVsGames: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.45)'
	},
	// ── 상태 화면 ──
	centerState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 320,
		textAlign: 'center',
		gap: 14
	},
	stateIcon: {
		fontSize: '4rem',
		opacity: 0.5
	},
	stateText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		color: 'rgba(255, 255, 255, 0.6)'
	},
	stateBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		border: 'none',
		cursor: 'pointer',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.2rem',
		padding: '8px 26px',
		borderRadius: 10,
		boxShadow: '0 4px 18px rgba(0, 212, 255, 0.25)',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)'
		}
	},
	emptyBig: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 12,
		padding: '48px 20px',
		textAlign: 'center'
	}
}));

function Compare() {
	const { classes, cx } = useStyles();
	const [searchParams, setSearchParams] = useSearchParams();
	const puuidA = searchParams.get('a');
	const puuidB = searchParams.get('b');
	const groupId = useSelector(state => state.auth.user?.reprGroup?.groupId);

	const [state, setState] = useState({ loading: false, status: null, result: null });
	const [changing, setChanging] = useState(null); // 변경 다이얼로그 대상 'A' | 'B'
	const myPuuid = localStorage.getItem('camille_riot_puuid');
	const samePuuid = Boolean(puuidA && puuidB && puuidA === puuidB);

	useEffect(() => {
		if (!groupId || !puuidA || !puuidB || samePuuid) return undefined;
		let cancelled = false;
		setState({ loading: true, status: null, result: null });
		fetchCompare(groupId, puuidA, puuidB)
			.then(result => {
				if (!cancelled) setState({ loading: false, status: 200, result });
			})
			.catch(err => {
				if (!cancelled) setState({ loading: false, status: err?.response?.status || 0, result: null });
			});
		return () => {
			cancelled = true;
		};
	}, [groupId, puuidA, puuidB, samePuuid]);

	// 파라미터 없이 진입(좌측 메뉴 등)하면 본인을 A로 기본 지정.
	useEffect(() => {
		if (!puuidA && myPuuid) setSearchParams({ a: myPuuid }, { replace: true });
	}, [puuidA, myPuuid, setSearchParams]);

	const selectOpponent = member => setSearchParams({ a: puuidA, b: member.puuid });
	const resetOpponent = () => setSearchParams({ a: puuidA });
	const handleChangeSelect = member => {
		if (changing === 'A') setSearchParams({ a: member.puuid, b: puuidB });
		else if (changing === 'B') setSearchParams({ a: puuidA, b: member.puuid });
		setChanging(null);
	};

	// ── 진입/상태 처리 ──
	if (!puuidA) {
		return (
			<div className={classes.root}>
				<div className={classes.centerState}>
					{myPuuid ? (
						<div className={classes.stateText}>불러오는 중…</div>
					) : (
						<>
							<div className={classes.stateIcon}>
								<span role="img" aria-label="compare">
									⚔️
								</span>
							</div>
							<div className={classes.stateText}>
								비교할 유저가 지정되지 않았습니다. 랭킹이나 프로필에서 시작해 주세요.
							</div>
						</>
					)}
				</div>
			</div>
		);
	}

	if (!puuidB || samePuuid) {
		return (
			<div className={classes.root}>
				{samePuuid && (
					<div className={classes.centerState} style={{ minHeight: 0, marginBottom: -20 }}>
						<div className={classes.stateText}>같은 유저는 비교할 수 없어요. 다른 상대를 선택해 주세요.</div>
					</div>
				)}
				<OpponentPicker groupId={groupId} anchorPuuid={puuidA} onSelect={selectOpponent} />
			</div>
		);
	}

	if (state.loading) {
		return (
			<div className={classes.root}>
				<div className={classes.centerState}>
					<div className={classes.stateText}>비교 정보를 불러오는 중…</div>
				</div>
			</div>
		);
	}

	if (state.status !== 200 || !state.result) {
		let msg = '비교 정보를 불러오지 못했어요.';
		if (state.status === 404) msg = '그룹에 등록되지 않은 유저예요.';
		else if (state.status === 400) msg = '잘못된 요청이에요.';
		return (
			<div className={classes.root}>
				<div className={classes.centerState}>
					<div className={classes.stateIcon}>
						<span role="img" aria-label="warning">
							⚠️
						</span>
					</div>
					<div className={classes.stateText}>{msg}</div>
					<button type="button" className={classes.stateBtn} onClick={resetOpponent}>
						상대 다시 선택
					</button>
				</div>
			</div>
		);
	}

	const result = state.result;
	const { header, headToHead, together, ratingFlow, timeline, mutualSynergy, laneMatchup, relationTitles, ratingTrajectory, tournament } = result;
	const a = header.a;
	const b = header.b;
	const nameA = a.name;
	const nameB = b.name;

	const naturalEnemy = (relationTitles || []).find(t => t.key === 'natural_enemy');
	const mutualTitles = (relationTitles || []).filter(t => t.key !== 'natural_enemy');

	// 당시 레이팅은 원시 숫자 대신 티어로 환산해 표시한다.
	const renderThenTier = (rating, color) => {
		const tierName = getTierName(rating);
		return (
			<span className={classes.thenTier} style={{ color }}>
				{tierName && <img className={classes.thenEmblem} src={getTierEmblemUrl(tierName)} alt={tierName} />}
				{getTierLabel(rating) || '-'}
			</span>
		);
	};
	const renderThenTiers = (aRating, bRating) => (
		<>
			당시 {renderThenTier(aRating, A_COLOR)}
			{' vs '}
			{renderThenTier(bRating, B_COLOR)}
		</>
	);

	const renderPlayer = (p, color, glow, isEnemy, enemyLabel, side) => {
		const tierName = getTierName(p.rating);
		const rankParsed = parseRankTier(p.rankTier);
		const pos = p.mainPosition ? POSITION_META[p.mainPosition] : null;
		// 마스터+ 는 디비전이 없어 티어명만 나오므로 LP를 함께 표기 (예: MASTER 87LP).
		const isMasterPlus = tierName === 'MASTER' || tierName === 'GRANDMASTER' || tierName === 'CHALLENGER';
		const tierDisplay =
			isMasterPlus && p.rating != null
				? `${getTierLabel(p.rating)} ${getTierPoint(p.rating)}LP`
				: getTierLabel(p.rating) || '언랭';
		return (
			<div
				className={classes.playerCard}
				style={{ '--pc': color, '--pc-glow': glow, '--pc-border': `${color}40` }}
			>
				{isEnemy && (
					<span className={classes.enemyBadge}>
						<span role="img" aria-label="natural enemy">
							🩸
						</span>
						{enemyLabel || '천적'}
					</span>
				)}
				{tierName && (
					<img className={classes.playerEmblem} src={getTierEmblemUrl(tierName)} alt={tierName} />
				)}
				<div className={classes.playerName} style={{ color }}>
					{p.name}
				</div>
				<div className={classes.playerTierLabel} style={{ color }}>
					{tierDisplay}
				</div>
				{rankParsed && (
					<div className={classes.soloChip}>
						<img className={classes.soloChipEmblem} src={rankParsed.emblem} alt={rankParsed.tier} />
						솔랭 {rankParsed.short}
					</div>
				)}
				<div className={classes.playerBottom}>
					{pos && (
						<span className={classes.posTag}>
							<PositionIcon position={pos.icon} className={classes.posTagIcon} />
							{pos.label}
						</span>
					)}
					<span className={classes.recordTag}>
						{p.wins}승 {p.losses}패 · {fmtPct(p.winRate)}
					</span>
				</div>
				<button type="button" className={classes.changeBtn} onClick={() => setChanging(side)}>
					변경
				</button>
			</div>
		);
	};

	// ── 섹션 렌더러 (RevealGroup 직계 자식 → 자동 stagger) ──
	const sectionHeadToHead = () => {
		const h = headToHead;
		const empty = !h || h.games === 0;
		const total = empty ? 0 : h.aWins + h.bWins;
		const aPct = total ? (h.aWins / total) * 100 : 50;
		const streak = h && h.currentStreak;
		const streakName = streak && streak.holder ? (streak.holder === 'A' ? nameA : nameB) : null;
		const streakColor = streak && streak.holder === 'A' ? A_COLOR : B_COLOR;
		return (
			<div className={classes.section} key="h2h">
				<div className={classes.sectionTitle}>
					<span role="img" aria-label="swords">
						⚔️
					</span>
					상대 전적
				</div>
				{empty ? (
					<div className={classes.sectionEmpty}>아직 맞대결 기록이 없어요.</div>
				) : (
					<>
						<div className={classes.h2hScoreRow}>
							<div className={classes.h2hSide}>
								<span className={classes.h2hSideName}>{nameA}</span>
								<span className={classes.h2hScore} style={{ color: A_COLOR }}>
									{h.aWins}
								</span>
							</div>
							<span className={classes.h2hColon}>:</span>
							<div className={classes.h2hSide}>
								<span className={classes.h2hSideName}>{nameB}</span>
								<span className={classes.h2hScore} style={{ color: B_COLOR }}>
									{h.bWins}
								</span>
							</div>
						</div>
						<div className={classes.balanceBar}>
							<div className={classes.balanceFill} style={{ width: `${aPct}%`, background: A_COLOR }} />
							<div className={classes.balanceFill} style={{ width: `${100 - aPct}%`, background: B_COLOR }} />
						</div>
						<div className={classes.balanceCaption}>
							<span>{h.games}전</span>
							<span>{nameA} 승률 {fmtPct(h.aWinRate)}</span>
						</div>
						{h.recentResults && h.recentResults.length > 0 && (
							<div className={classes.dotsRow}>
								<span className={classes.dotsLabel}>최근</span>
								{h.recentResults.map((r, i) => (
									<span
										key={`${i}-${r}`}
										className={cx(classes.dot, i === h.recentResults.length - 1 && classes.dotLatest)}
										style={{ background: r === 'A' ? A_COLOR : B_COLOR }}
									>
										{r}
									</span>
								))}
							</div>
						)}
						{streakName && streak.count > 0 && (
							<div className={classes.streakText} style={{ color: streakColor }}>
								<span role="img" aria-label="fire">
									🔥
								</span>
								현재 {streakName} {streak.count}연승 중
							</div>
						)}
						{h.maxStreak && (h.maxStreak.a > 0 || h.maxStreak.b > 0) && (
							<div className={classes.maxStreakText}>
								<span style={{ color: A_COLOR }}>{nameA} 최다 {h.maxStreak.a}연승</span>
								{' · '}
								<span style={{ color: B_COLOR }}>{nameB} 최다 {h.maxStreak.b}연승</span>
							</div>
						)}
					</>
				)}
			</div>
		);
	};

	const sectionRatingFlow = () => {
		const rf = ratingFlow;
		const empty = !rf || rf.computedGames === 0;
		const takenA = empty ? 0 : rf.takenByA * LP_PER_RATING;
		const takenB = empty ? 0 : rf.takenByB * LP_PER_RATING;
		const netPts = empty ? 0 : rf.net * LP_PER_RATING;
		const total = takenA + takenB;
		const aPct = total ? (takenA / total) * 100 : 50;
		let netText = `${nameA} · ${nameB} 주고받은 점수 같음`;
		if (netPts > 0) netText = `${nameA}가 ${nameB}로부터 +${netPts}점 얻음`;
		else if (netPts < 0) netText = `${nameA}가 ${nameB}에게 ${-netPts}점 뺏김`;
		return (
			<div className={classes.section} key="flow">
				<div className={classes.sectionTitle}>
					<span role="img" aria-label="crossed swords">
						🗡️
					</span>
					점수 약탈
				</div>
				{empty ? (
					<div className={classes.sectionEmpty}>맞대결에서 주고받은 점수 기록이 없어요.</div>
				) : (
					<>
						<div className={classes.flowNet}>{netText}</div>
						<div className={classes.flowBar}>
							<div
								className={cx(classes.flowFill, classes.flowFillLeft)}
								style={{ width: `${aPct}%`, background: A_COLOR }}
							>
								{takenA > 0 && takenA}
							</div>
							<div
								className={cx(classes.flowFill, classes.flowFillRight)}
								style={{ width: `${100 - aPct}%`, background: B_COLOR }}
							>
								{takenB > 0 && takenB}
							</div>
						</div>
						<div className={classes.flowLegend}>
							<span>{nameA}가 뺏음 {takenA}점</span>
							<span>{takenB}점 {nameB}가 뺏음</span>
						</div>
						{rf.skippedGames > 0 && (
							<div className={classes.caption}>{rf.skippedGames}판은 점수 기록이 없어 집계에서 제외됨</div>
						)}
					</>
				)}
			</div>
		);
	};

	const sectionTrajectory = () => {
		const rt = ratingTrajectory || {};
		const hasTraj = (rt.a && rt.a.length > 0) || (rt.b && rt.b.length > 0);
		return (
			<div className={classes.section} key="traj">
				<div className={classes.sectionTitle}>
					<span role="img" aria-label="chart">
						📈
					</span>
					레이팅 궤적
				</div>
				{!hasTraj ? (
					<div className={classes.sectionEmpty}>레이팅 변동 기록이 없어요.</div>
				) : (
					<div className={classes.chartContainer}>
						<RatingTrajectoryChart
							a={rt.a}
							b={rt.b}
							nameA={nameA}
							nameB={nameB}
							colorA={A_COLOR}
							colorB={B_COLOR}
						/>
					</div>
				)}
			</div>
		);
	};

	const sectionTogether = () => {
		const tg = together;
		const empty = !tg || tg.games === 0;
		const delta = empty ? null : tg.synergyDelta;
		const deltaColor = delta == null ? '#fff' : delta > 0 ? GOOD_COLOR : delta < 0 ? BAD_COLOR : 'rgba(255,255,255,0.7)';
		return (
			<div className={classes.section} key="together">
				<div className={classes.sectionTitle}>
					<span role="img" aria-label="handshake">
						🤝
					</span>
					같은 팀 케미
				</div>
				{empty ? (
					<div className={classes.sectionEmpty}>아직 같은 팀으로 함께한 경기가 없어요.</div>
				) : (
					<>
						{delta != null && (
							<div className={classes.synergyHero}>
								<div className={classes.synergyHeroValue} style={{ color: deltaColor }}>
									{signed(delta)}%p
								</div>
								<div className={classes.synergyHeroLabel}>
									둘이 만나면 개인 평균 승률 대비 {delta > 0 ? '올라가요' : delta < 0 ? '내려가요' : '그대로예요'}
								</div>
							</div>
						)}
						<div className={classes.synergyStats}>
							<div className={classes.statBlock}>
								<div className={classes.statBlockValue}>
									{tg.wins}승 {tg.losses}패
								</div>
								<div className={classes.statBlockLabel}>같은 팀 전적</div>
							</div>
							<div className={classes.statBlock}>
								<div className={classes.statBlockValue}>{fmtPct(tg.winRate)}</div>
								<div className={classes.statBlockLabel}>실제 승률</div>
							</div>
							<div className={classes.statBlock}>
								<div className={classes.statBlockValue}>{fmtPct(tg.expectedWinRate)}</div>
								<div className={classes.statBlockLabel}>기대 승률</div>
							</div>
						</div>
						{tg.positionCombos && tg.positionCombos.length > 0 && (
							<div className={classes.combos}>
								<div className={classes.combosTitle}>자주 선 포지션 조합</div>
								{tg.positionCombos.map((c, i) => (
									<div className={classes.comboRow} key={`${c.aPosition}-${c.bPosition}-${i}`}>
										<span className={classes.comboPair}>
											<span style={{ color: A_COLOR }}>{nameA} {posLabel(c.aPosition)}</span>
											{' + '}
											<span style={{ color: B_COLOR }}>{nameB} {posLabel(c.bPosition)}</span>
										</span>
										<span className={classes.comboStat}>
											{c.games}판 {c.wins}승 ({fmtPct(c.winRate)})
										</span>
									</div>
								))}
							</div>
						)}
					</>
				)}
			</div>
		);
	};

	const sectionTimeline = () => {
		const t = timeline;
		const fv = t.firstVs;
		const ft = t.firstTogether;
		const lastLabel = daysAgoLabel(t.lastMetAt);
		return (
			<div className={classes.section} key="timeline">
				<div className={classes.sectionTitle}>
					<span role="img" aria-label="hourglass">
						⏳
					</span>
					인연 타임라인
				</div>
				<div className={classes.timelineCards}>
					{fv && (
						<div className={classes.milestone}>
							<div className={classes.milestoneLabel}>첫 맞대결</div>
							<div className={classes.milestoneMain}>
								<span style={{ color: fv.winner === 'A' ? A_COLOR : B_COLOR }}>
									{fv.winner === 'A' ? nameA : nameB} 승
								</span>
							</div>
							<div className={classes.milestoneDate}>{fmtDate(fv.date)}</div>
							<div className={classes.milestoneSub}>{renderThenTiers(fv.aRating, fv.bRating)}</div>
						</div>
					)}
					{ft && (
						<div className={classes.milestone}>
							<div className={classes.milestoneLabel}>첫 같은 팀</div>
							<div className={classes.milestoneMain}>
								{ft.won ? (
									<>
										함께 승리{' '}
										<span role="img" aria-label="celebrate">
											🎉
										</span>
									</>
								) : (
									'함께 패배'
								)}
							</div>
							<div className={classes.milestoneDate}>{fmtDate(ft.date)}</div>
							<div className={classes.milestoneSub}>{renderThenTiers(ft.aRating, ft.bRating)}</div>
						</div>
					)}
					{t.lastMetAt && (
						<div className={classes.milestone}>
							<div className={classes.milestoneLabel}>마지막 만남</div>
							<div className={classes.milestoneMain}>{lastLabel}</div>
							<div className={classes.milestoneDate}>{fmtDate(t.lastMetAt)}</div>
						</div>
					)}
					<div className={classes.milestone}>
						<div className={classes.milestoneLabel}>누적</div>
						<div className={classes.milestoneMain}>총 {t.totalGames}경기</div>
						<div className={classes.milestoneSub}>맞대결 {t.vsGames} · 같은 팀 {t.togetherGames}</div>
					</div>
				</div>
			</div>
		);
	};

	const sectionLaneMatchup = () => {
		const lm = laneMatchup;
		if (!lm || lm.games === 0) return null;
		const rows = (lm.byPosition || []).filter(p => p.games > 0);
		return (
			<div className={classes.section} key="lane">
				<div className={classes.sectionTitle}>
					<span role="img" aria-label="crossed flags">
						🚩
					</span>
					맞라인 전적
					<span style={{ fontSize: '1.2rem', fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>
						{lm.games}경기 · {lm.aWins} : {lm.bWins}
					</span>
				</div>
				{rows.map(row => {
					const meta = POSITION_META[row.position];
					const total = row.aWins + row.bWins;
					const aPct = total ? (row.aWins / total) * 100 : 50;
					return (
						<div className={classes.laneRow} key={row.position}>
							<span className={classes.lanePos}>
								{meta && <PositionIcon position={meta.icon} className={classes.lanePosIcon} />}
								{meta ? meta.label : row.position}
							</span>
							<div className={classes.balanceBar} style={{ margin: 0 }}>
								<div className={classes.balanceFill} style={{ width: `${aPct}%`, background: A_COLOR }} />
								<div
									className={classes.balanceFill}
									style={{ width: `${100 - aPct}%`, background: B_COLOR }}
								/>
							</div>
							<span className={classes.laneScore}>
								<span style={{ color: A_COLOR }}>{row.aWins}</span>
								{' : '}
								<span style={{ color: B_COLOR }}>{row.bWins}</span>
							</span>
						</div>
					);
				})}
			</div>
		);
	};

	const renderMutualCard = ms => (
		<div className={classes.mutualCard} key={ms.puuid}>
			<div className={classes.mutualHead}>
				<span className={classes.mutualName}>{ms.name}</span>
				<span
					className={classes.mutualAvg}
					style={{
						color: ms.avgWinRate >= 50 ? GOOD_COLOR : BAD_COLOR,
						background: ms.avgWinRate >= 50 ? 'rgba(0,255,127,0.1)' : 'rgba(255,107,107,0.1)'
					}}
				>
					평균 {fmtPct(ms.avgWinRate)}
				</span>
			</div>
			<div className={classes.mutualWith}>
				<span style={{ color: A_COLOR }}>{nameA}와</span>
				<span>{ms.withA.games}판 · {fmtPct(ms.withA.winRate)}</span>
			</div>
			<div className={classes.mutualWith}>
				<span style={{ color: B_COLOR }}>{nameB}와</span>
				<span>{ms.withB.games}판 · {fmtPct(ms.withB.winRate)}</span>
			</div>
		</div>
	);

	// 엇갈린 궁합 — 한쪽엔 승요, 다른 쪽엔 패요. 평균 대신 각 유저별 수치를 대비해 보여준다.
	const renderCrossCard = ms => (
		<div className={classes.mutualCard} key={ms.puuid}>
			<div className={classes.mutualName} style={{ marginBottom: 6 }}>
				{ms.name}
			</div>
			<div className={classes.mutualWith}>
				<span style={{ color: A_COLOR }}>{nameA}와</span>
				<span>{ms.withA.games}판 · {fmtPct(ms.withA.winRate)}</span>
			</div>
			<div className={classes.mutualWith}>
				<span style={{ color: B_COLOR }}>{nameB}와</span>
				<span>{ms.withB.games}판 · {fmtPct(ms.withB.winRate)}</span>
			</div>
		</div>
	);

	const sectionMutualSynergy = () => {
		const ms = mutualSynergy || {};
		const good = ms.goodWithBoth || [];
		const bad = ms.badWithBoth || [];
		const crossAB = ms.goodForABadForB || [];
		const crossBA = ms.goodForBBadForA || [];
		const bothEmpty = good.length === 0 && bad.length === 0;
		const crossEmpty = crossAB.length === 0 && crossBA.length === 0;
		const gateA = ms.minGamesA ?? ms.minGames ?? 5;
		const gateB = ms.minGamesB ?? ms.minGames ?? 5;
		const gateText = gateA === gateB ? `각 ${gateA}판` : `${nameA}와 ${gateA}판·${nameB}와 ${gateB}판`;
		return (
			<div className={classes.section} key="mutual">
				<div className={classes.sectionTitle}>
					<span role="img" aria-label="people">
						👥
					</span>
					둘 다와의 시너지
				</div>
				{bothEmpty && crossEmpty ? (
					<div className={classes.sectionEmpty}>표본 부족 ({gateText} 이상 함께한 유저가 필요해요)</div>
				) : (
					<>
						{!bothEmpty && (
							<div className={classes.synergyCols}>
								<div>
									<div className={classes.synergyColTitle} style={{ color: GOOD_COLOR }}>
										<span role="img" aria-label="up">
											📈
										</span>
										둘 다와 잘 맞는
									</div>
									{good.length > 0 ? (
										good.map(renderMutualCard)
									) : (
										<div className={classes.mutualEmpty}>해당 없음</div>
									)}
								</div>
								<div>
									<div className={classes.synergyColTitle} style={{ color: BAD_COLOR }}>
										<span role="img" aria-label="down">
											📉
										</span>
										둘 다와 안 맞는
									</div>
									{bad.length > 0 ? (
										bad.map(renderMutualCard)
									) : (
										<div className={classes.mutualEmpty}>해당 없음</div>
									)}
								</div>
							</div>
						)}
						{!crossEmpty && (
							<div className={classes.crossBlock}>
								<div className={classes.crossTitle}>
									<span role="img" aria-label="split">
										🔀
									</span>
									엇갈린 궁합
								</div>
								<div className={classes.synergyCols}>
									<div>
										<div className={classes.synergyColTitle} style={{ color: A_COLOR }}>
											{nameA}에겐 승요 · {nameB}에겐 패요
										</div>
										{crossAB.length > 0 ? (
											crossAB.map(renderCrossCard)
										) : (
											<div className={classes.mutualEmpty}>해당 없음</div>
										)}
									</div>
									<div>
										<div className={classes.synergyColTitle} style={{ color: B_COLOR }}>
											{nameB}에겐 승요 · {nameA}에겐 패요
										</div>
										{crossBA.length > 0 ? (
											crossBA.map(renderCrossCard)
										) : (
											<div className={classes.mutualEmpty}>해당 없음</div>
										)}
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		);
	};

	const sectionTournament = () => {
		const tn = tournament;
		if (!tn) return null;
		const champs = tn.togetherChampionships || [];
		const sameTeam = tn.sameTeam || [];
		const vs = tn.vs || {};
		const hasVs = (vs.matches || 0) > 0;
		if (champs.length === 0 && sameTeam.length === 0 && !hasVs) return null;
		// 우승 대회는 트로피 쪽에만 표기 — sameTeam 목록에서 우승 대회는 제외한다.
		const champIds = new Set(champs.map(c => c.tournamentId));
		const sameOnly = sameTeam.filter(s => !champIds.has(s.tournamentId));
		return (
			<div className={classes.section} key="tournament">
				<div className={classes.sectionTitle}>
					<span role="img" aria-label="trophy">
						🏆
					</span>
					토너먼트에서의 인연
				</div>
				{champs.length > 0 && (
					<div className={classes.champBox}>
						{champs.map(c => (
							<div className={classes.champRow} key={c.tournamentId}>
								<span role="img" aria-label="trophy" className={classes.champTrophy}>
									🏆
								</span>
								<span className={classes.champText}>
									<b>{c.name}</b> · <b style={{ color: '#ffd700' }}>{c.teamName}</b>(으)로 함께 우승
								</span>
								<span className={classes.champDate}>{fmtDate(c.heldAt)}</span>
							</div>
						))}
					</div>
				)}
				{sameOnly.length > 0 && (
					<div className={classes.tnList}>
						<div className={classes.tnListTitle}>같은 팀으로 참가</div>
						{sameOnly.map(s => (
							<div className={classes.tnRow} key={s.tournamentId}>
								<span className={classes.tnName}>{s.name}</span>
								<span className={classes.tnTeam}>{s.teamName}</span>
								<span className={classes.tnDate}>{fmtDate(s.heldAt)}</span>
							</div>
						))}
					</div>
				)}
				{hasVs && (
					<div className={classes.tnVs}>
						<span className={classes.tnVsLabel}>토너먼트 맞대결</span>
						<span className={classes.tnVsScore}>
							<span style={{ color: A_COLOR }}>{vs.aWins}</span>
							{' : '}
							<span style={{ color: B_COLOR }}>{vs.bWins}</span>
						</span>
						<span className={classes.tnVsGames}>{vs.matches}시리즈</span>
					</div>
				)}
			</div>
		);
	};

	const noGames = !timeline || timeline.totalGames === 0;

	return (
		<div className={classes.root}>
			<div className={classes.inner}>
				<Reveal>
					<div className={classes.vsHeader}>
						{renderPlayer(a, A_COLOR, 'rgba(0,212,255,0.4)', naturalEnemy && naturalEnemy.holder === 'A', naturalEnemy && naturalEnemy.label, 'A')}
						<div className={classes.vsCenter}>
							<div className={classes.vsText}>VS</div>
							{mutualTitles.length > 0 && (
								<div className={classes.relationBadges}>
									{mutualTitles.map(t => (
										<span className={classes.relationBadge} key={t.key}>
											<span role="img" aria-label={t.key}>
												{RELATION_EMOJI[t.key] || '🏷️'}
											</span>
											{t.label}
										</span>
									))}
								</div>
							)}
						</div>
						{renderPlayer(b, B_COLOR, 'rgba(255,107,154,0.4)', naturalEnemy && naturalEnemy.holder === 'B', naturalEnemy && naturalEnemy.label, 'B')}
					</div>
				</Reveal>

				{noGames ? (
					<div className={classes.section}>
						<div className={classes.emptyBig}>
							<div className={classes.stateIcon}>
								<span role="img" aria-label="empty">
									🌱
								</span>
							</div>
							<div className={classes.stateText}>아직 함께한 내전이 없어요</div>
						</div>
					</div>
				) : (
					<RevealGroup className={classes.sections}>
						{sectionHeadToHead()}
						{sectionRatingFlow()}
						{sectionTrajectory()}
						{sectionTogether()}
						{sectionTimeline()}
						{sectionTournament()}
						{sectionLaneMatchup()}
						{sectionMutualSynergy()}
						<EntangledMatches
							groupId={groupId}
							puuidA={puuidA}
							puuidB={puuidB}
							nameA={nameA}
							nameB={nameB}
						/>
					</RevealGroup>
				)}
			</div>
			<Dialog
				open={changing !== null}
				onClose={() => setChanging(null)}
				fullWidth
				maxWidth="sm"
				PaperProps={{ className: classes.dialogPaper }}
			>
				{changing && (
					<OpponentPicker
						groupId={groupId}
						anchorPuuid={changing === 'A' ? puuidB : puuidA}
						onSelect={handleChangeSelect}
					/>
				)}
			</Dialog>
		</div>
	);
}

export default Compare;
