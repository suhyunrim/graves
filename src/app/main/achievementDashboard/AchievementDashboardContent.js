import React, { useEffect, useMemo, useRef, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import * as Actions from './store/actions';
import { CATEGORY_LABELS, CATEGORY_ORDER, TIER_COLORS, TIER_RANK } from './constants';

const fadeInUp = keyframes`
	0% { opacity: 0; transform: translateY(12px); }
	100% { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
	0%, 100% { opacity: 0.9; }
	50% { opacity: 1; }
`;

const shimmer = keyframes`
	0% { background-position: -200% 0; }
	100% { background-position: 200% 0; }
`;

const useStyles = makeStyles()((theme) => ({
	container: {
		padding: 28,
		maxWidth: 1400,
		margin: '0 auto',
		width: '100%',
		[theme.breakpoints.down('md')]: {
			padding: 16
		}
	},
	// Header
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2.6rem',
		fontWeight: 700,
		color: '#fff',
		marginBottom: 6,
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 28
	},
	// Hero
	hero: {
		background: 'linear-gradient(135deg, #181830 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.18)',
		borderRadius: 20,
		padding: '28px 32px',
		marginBottom: 24,
		position: 'relative',
		overflow: 'hidden',
		animation: `${fadeInUp} 0.5s ease`,
		'&::before': {
			content: '""',
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			height: 2,
			background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.6), transparent)',
			backgroundSize: '200% 100%',
			animation: `${shimmer} 4s linear infinite`
		},
		[theme.breakpoints.down('sm')]: {
			padding: '20px 18px'
		}
	},
	heroStatsGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(4, 1fr)',
		gap: 16,
		marginBottom: 24,
		[theme.breakpoints.down('md')]: {
			gridTemplateColumns: 'repeat(2, 1fr)'
		}
	},
	heroStat: {
		position: 'relative',
		padding: '16px 20px',
		borderRadius: 14,
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.06)',
		transition: 'transform 0.2s ease, border-color 0.2s ease',
		'&:hover': {
			transform: 'translateY(-2px)',
			borderColor: 'rgba(0, 212, 255, 0.35)'
		}
	},
	heroStatLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 6,
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	heroStatValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		color: '#fff',
		lineHeight: 1.1
	},
	heroStatSub: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.35)',
		marginTop: 4
	},
	valuePrimary: {
		background: 'linear-gradient(90deg, #00d4ff, #0066ff)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent'
	},
	valueSuccess: {
		color: '#00ff9c',
		textShadow: '0 0 12px rgba(0, 255, 156, 0.3)'
	},
	valueWarning: {
		color: '#ffaa33',
		textShadow: '0 0 12px rgba(255, 170, 51, 0.25)'
	},
	// Top users
	topUsersTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.6)',
		marginBottom: 10,
		textTransform: 'uppercase',
		letterSpacing: '0.05em'
	},
	topUsersRow: {
		display: 'flex',
		gap: 12,
		flexWrap: 'wrap'
	},
	topUserCard: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		padding: '10px 16px',
		borderRadius: 12,
		background: 'rgba(255, 255, 255, 0.04)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		textDecoration: 'none',
		transition: 'transform 0.2s ease, background 0.2s ease',
		minWidth: 200,
		flex: '1 1 auto',
		'&:hover': {
			transform: 'translateY(-2px)',
			background: 'rgba(0, 212, 255, 0.08)',
			borderColor: 'rgba(0, 212, 255, 0.3)'
		}
	},
	topUserMedal: {
		fontSize: '1.6rem',
		lineHeight: 1,
		filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.4))'
	},
	topUserInfo: {
		display: 'flex',
		flexDirection: 'column',
		minWidth: 0,
		flex: 1
	},
	topUserName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 600,
		color: '#fff',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	topUserCount: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.05rem',
		color: '#00d4ff'
	},
	// Heatmap
	section: {
		marginBottom: 24,
		animation: `${fadeInUp} 0.6s ease`
	},
	sectionTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.7rem',
		fontWeight: 700,
		color: '#fff',
		marginBottom: 14,
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	heatmapCard: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.18)',
		borderRadius: 20,
		padding: '20px 24px',
		[theme.breakpoints.down('sm')]: {
			padding: '16px 14px'
		}
	},
	heatmapRow: {
		display: 'grid',
		gridTemplateColumns: '140px 1fr 64px',
		alignItems: 'center',
		gap: 14,
		padding: '8px 0',
		cursor: 'pointer',
		borderRadius: 8,
		transition: 'background 0.2s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.05)'
		},
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '110px 1fr 52px',
			gap: 10
		}
	},
	heatmapLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.85)',
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	heatmapBarOuter: {
		height: 16,
		borderRadius: 8,
		background: 'rgba(255, 255, 255, 0.05)',
		overflow: 'hidden',
		position: 'relative'
	},
	heatmapBarInner: {
		height: '100%',
		borderRadius: 8,
		transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
		background: 'linear-gradient(90deg, #00d4ff, #0066ff)',
		boxShadow: '0 0 10px rgba(0, 212, 255, 0.4)'
	},
	heatmapBarFull: {
		background: 'linear-gradient(90deg, #ffd700, #ffaa33)',
		boxShadow: '0 0 12px rgba(255, 215, 0, 0.45)'
	},
	heatmapPct: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 700,
		color: '#fff',
		textAlign: 'right'
	},
	// Category section
	categoryAccordion: {
		marginBottom: 14,
		border: '1px solid rgba(255, 255, 255, 0.06)',
		borderRadius: 16,
		overflow: 'hidden',
		background: 'rgba(255, 255, 255, 0.02)',
		animation: `${fadeInUp} 0.5s ease`,
		transition: 'border-color 0.2s ease'
	},
	categoryAccordionOpen: {
		borderColor: 'rgba(0, 212, 255, 0.3)',
		background: 'rgba(0, 212, 255, 0.03)'
	},
	categoryHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 14,
		padding: '16px 20px',
		cursor: 'pointer',
		userSelect: 'none',
		transition: 'background 0.2s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.05)'
		},
		[theme.breakpoints.down('sm')]: {
			padding: '14px 14px',
			gap: 10
		}
	},
	categoryIcon: {
		fontSize: '1.8rem',
		lineHeight: 1,
		flexShrink: 0
	},
	categoryInfo: {
		flex: 1,
		minWidth: 0
	},
	categoryLabel: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: '#fff'
	},
	categoryMeta: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.45)',
		marginTop: 2
	},
	categoryProgress: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		flexShrink: 0
	},
	categoryProgressBar: {
		width: 120,
		height: 8,
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.06)',
		overflow: 'hidden',
		[theme.breakpoints.down('sm')]: {
			display: 'none'
		}
	},
	categoryProgressBarInner: {
		height: '100%',
		background: 'linear-gradient(90deg, #00d4ff, #0066ff)',
		transition: 'width 0.4s ease'
	},
	categoryProgressText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 700,
		color: '#00d4ff',
		minWidth: 52,
		textAlign: 'right'
	},
	categoryChevron: {
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.4)',
		transition: 'transform 0.3s ease',
		flexShrink: 0
	},
	categoryChevronOpen: {
		transform: 'rotate(180deg)',
		color: '#00d4ff'
	},
	categoryBody: {
		padding: '4px 20px 20px 20px',
		[theme.breakpoints.down('sm')]: {
			padding: '4px 14px 16px 14px'
		}
	},
	categoryLoading: {
		display: 'flex',
		justifyContent: 'center',
		padding: '32px 0'
	},
	sortBar: {
		display: 'flex',
		gap: 8,
		marginBottom: 14,
		flexWrap: 'wrap'
	},
	sortChip: {
		padding: '5px 12px',
		borderRadius: 14,
		background: 'rgba(255, 255, 255, 0.04)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		color: 'rgba(255, 255, 255, 0.55)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		cursor: 'pointer',
		transition: 'all 0.2s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.08)',
			color: '#fff'
		}
	},
	sortChipActive: {
		background: 'rgba(0, 212, 255, 0.18)',
		borderColor: 'rgba(0, 212, 255, 0.5)',
		color: '#00d4ff'
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(4, 1fr)',
		gap: 14,
		[theme.breakpoints.down('lg')]: {
			gridTemplateColumns: 'repeat(3, 1fr)'
		},
		[theme.breakpoints.down('md')]: {
			gridTemplateColumns: 'repeat(2, 1fr)'
		},
		[theme.breakpoints.down('xs')]: {
			gridTemplateColumns: '1fr'
		}
	},
	card: {
		position: 'relative',
		borderRadius: 14,
		padding: 16,
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		cursor: 'pointer',
		overflow: 'hidden',
		transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
		textDecoration: 'none',
		color: 'inherit',
		display: 'flex',
		flexDirection: 'column',
		'&:hover': {
			transform: 'translateY(-3px)',
			borderColor: 'rgba(0, 212, 255, 0.35)',
			boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
		},
		'&:hover .achievement-card-search': {
			background: 'rgba(0, 212, 255, 0.28)',
			borderColor: 'rgba(0, 212, 255, 0.6)',
			transform: 'scale(1.1)',
			boxShadow: '0 0 12px rgba(0, 212, 255, 0.35)'
		}
	},
	cardFullUnlocked: {
		borderColor: 'rgba(255, 215, 0, 0.45)',
		background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.06) 0%, rgba(255, 170, 51, 0.03) 100%)',
		'&::before': {
			content: '""',
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			height: 2,
			background: 'linear-gradient(90deg, transparent, #ffd700, transparent)',
			animation: `${pulse} 2.5s ease-in-out infinite`
		}
	},
	cardUntouched: {
		opacity: 0.55,
		filter: 'grayscale(0.7)'
	},
	cardHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		marginBottom: 10
	},
	cardEmoji: {
		fontSize: '2rem',
		lineHeight: 1,
		flexShrink: 0
	},
	cardEmblem: {
		width: 36,
		height: 36,
		flexShrink: 0
	},
	cardTextCol: {
		flex: 1,
		minWidth: 0
	},
	cardName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		color: '#fff',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	cardDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginTop: 2,
		lineHeight: 1.3,
		display: '-webkit-box',
		WebkitLineClamp: 2,
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden'
	},
	cardProgressWrap: {
		marginTop: 'auto',
		paddingTop: 10
	},
	cardProgressLabels: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.9rem',
		color: 'rgba(255, 255, 255, 0.45)'
	},
	cardUnlockedCount: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		fontWeight: 700,
		color: '#00d4ff'
	},
	cardProgressBar: {
		height: 6,
		borderRadius: 3,
		background: 'rgba(255, 255, 255, 0.05)',
		overflow: 'hidden'
	},
	cardProgressBarInner: {
		height: '100%',
		background: 'linear-gradient(90deg, #00d4ff, #0066ff)',
		transition: 'width 0.5s ease'
	},
	cardProgressBarFull: {
		background: 'linear-gradient(90deg, #ffd700, #ffaa33)'
	},
	cardTierBadge: {
		position: 'absolute',
		top: 12,
		right: 12,
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.85rem',
		fontWeight: 700,
		padding: '2px 8px',
		borderRadius: 6,
		background: 'rgba(0, 0, 0, 0.4)',
		backdropFilter: 'blur(8px)',
		border: '1px solid rgba(255, 255, 255, 0.1)',
		display: 'flex',
		alignItems: 'center',
		gap: 4,
		letterSpacing: '0.05em'
	},
	cardTierEmblem: {
		width: 14,
		height: 14
	},
	cardLockIcon: {
		position: 'absolute',
		top: 12,
		right: 12,
		fontSize: '1rem',
		opacity: 0.5
	},
	cardFooter: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 8,
		paddingTop: 8,
		borderTop: '1px solid rgba(255, 255, 255, 0.05)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.88rem',
		color: 'rgba(255, 255, 255, 0.4)',
		gap: 8
	},
	avatarStack: {
		display: 'flex',
		alignItems: 'center',
		flexShrink: 0
	},
	avatar: {
		width: 24,
		height: 24,
		borderRadius: '50%',
		border: '2px solid #0f0f1a',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.78rem',
		fontWeight: 700,
		color: '#fff',
		marginLeft: -6,
		position: 'relative',
		'&:first-of-type': {
			marginLeft: 0
		}
	},
	avatarRank1: {
		borderColor: '#FFD700',
		boxShadow: '0 0 6px rgba(255, 215, 0, 0.55)'
	},
	avatarRank2: {
		borderColor: '#C0C0C0',
		boxShadow: '0 0 6px rgba(192, 192, 192, 0.55)'
	},
	avatarRank3: {
		borderColor: '#CD7F32',
		boxShadow: '0 0 6px rgba(205, 127, 50, 0.55)'
	},
	topAchieverBanner: {
		display: 'flex',
		alignItems: 'center',
		gap: 14,
		padding: '10px 14px',
		marginBottom: 14,
		borderRadius: 12,
		background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 170, 51, 0.03) 100%)',
		border: '1px solid rgba(255, 215, 0, 0.25)',
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			alignItems: 'flex-start',
			gap: 10
		}
	},
	topAchieverHead: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		minWidth: 0,
		flexShrink: 0,
		textDecoration: 'none',
		color: 'inherit',
		transition: 'opacity 0.2s ease',
		'&:hover': {
			opacity: 0.85
		}
	},
	topAchieverEmoji: {
		fontSize: '1.8rem',
		lineHeight: 1,
		flexShrink: 0
	},
	topAchieverEmblem: {
		width: 30,
		height: 30,
		flexShrink: 0
	},
	topAchieverInfo: {
		display: 'flex',
		flexDirection: 'column',
		minWidth: 0
	},
	topAchieverTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 700,
		color: '#fff',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	topAchieverLabel: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '0.88rem',
		fontWeight: 700,
		color: 'rgba(255, 215, 0, 0.75)',
		letterSpacing: '0.05em',
		textTransform: 'uppercase'
	},
	topAchieverMedals: {
		display: 'flex',
		gap: 8,
		flex: 1,
		flexWrap: 'wrap',
		justifyContent: 'flex-end',
		[theme.breakpoints.down('sm')]: {
			justifyContent: 'flex-start',
			width: '100%'
		}
	},
	topAchieverMedal: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 6,
		padding: '4px 10px',
		borderRadius: 8,
		background: 'rgba(255, 255, 255, 0.04)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: '#fff',
		textDecoration: 'none',
		transition: 'background 0.2s ease, border-color 0.2s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.1)',
			borderColor: 'rgba(0, 212, 255, 0.3)'
		}
	},
	topAchieverMedalIcon: {
		fontSize: '1.1rem',
		lineHeight: 1
	},
	topAchieverMedalName: {
		maxWidth: 110,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	topAchieverMedalTime: {
		fontSize: '0.85rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	recentTextWrap: {
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		flex: 1
	},
	emptyHint: {
		padding: '24px',
		textAlign: 'center',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	heroRankingLink: {
		position: 'absolute',
		top: 16,
		right: 18,
		display: 'inline-flex',
		alignItems: 'center',
		gap: 6,
		zIndex: 2,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '0.98rem',
		fontWeight: 700,
		color: '#00d4ff',
		textDecoration: 'none',
		padding: '6px 14px',
		borderRadius: 10,
		background: 'rgba(0, 212, 255, 0.1)',
		border: '1px solid rgba(0, 212, 255, 0.4)',
		letterSpacing: '0.04em',
		transition: 'all 0.2s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.22)',
			borderColor: 'rgba(0, 212, 255, 0.7)',
			boxShadow: '0 0 14px rgba(0, 212, 255, 0.3)'
		},
		[theme.breakpoints.down('sm')]: {
			position: 'static',
			marginBottom: 14,
			alignSelf: 'flex-start'
		}
	},
	heroRankingLinkIcon: {
		fontSize: '1.1rem',
		lineHeight: 1
	},
	searchBtn: {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 28,
		height: 28,
		borderRadius: 8,
		background: 'rgba(0, 212, 255, 0.1)',
		color: '#00d4ff',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		transition: 'transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
		flexShrink: 0,
		'& svg': {
			fontSize: 16
		}
	},
	errorState: {
		padding: '48px 20px',
		textAlign: 'center',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	skeletonHero: {
		background: 'linear-gradient(135deg, #181830 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.18)',
		borderRadius: 20,
		padding: 28,
		marginBottom: 24,
		height: 260
	},
	skeletonHeatmap: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.18)',
		borderRadius: 20,
		padding: 28,
		height: 360,
		marginBottom: 24
	}
}));

const SORT_OPTIONS = [
	{ id: 'rate_desc', label: '해금률↓' },
	{ id: 'tier', label: '티어순' },
	{ id: 'recent', label: '최근 달성순' }
];

function getInitial(name) {
	if (!name) return '?';
	const clean = name.replace(/#.+$/, '').trim();
	return clean.charAt(0).toUpperCase();
}

function hashColor(key) {
	const palette = ['#00d4ff', '#ff7eb9', '#ffaa33', '#50c878', '#9b59b6', '#f1c40f', '#e74c3c', '#4dabf7'];
	let h = 0;
	for (let i = 0; i < key.length; i += 1) {
		h = (h * 31 + key.charCodeAt(i)) & 0xffff;
	}
	return palette[h % palette.length];
}

function getRankMedal(rank) {
	if (rank === 1) return '🥇';
	if (rank === 2) return '🥈';
	if (rank === 3) return '🥉';
	return `${rank}위`;
}

function getRankMedalText(rank) {
	return getRankMedal(rank);
}

function getRankAriaLabel(rank) {
	if (rank === 1) return 'first place';
	if (rank === 2) return 'second place';
	if (rank === 3) return 'third place';
	return `rank ${rank}`;
}

function formatRelative(iso) {
	if (!iso) return '';
	const now = Date.now();
	const t = new Date(iso).getTime();
	const diff = Math.max(0, now - t);
	const sec = Math.floor(diff / 1000);
	if (sec < 60) return '방금';
	const min = Math.floor(sec / 60);
	if (min < 60) return `${min}분 전`;
	const hr = Math.floor(min / 60);
	if (hr < 24) return `${hr}시간 전`;
	const day = Math.floor(hr / 24);
	if (day < 30) return `${day}일 전`;
	const mo = Math.floor(day / 30);
	if (mo < 12) return `${mo}개월 전`;
	const yr = Math.floor(mo / 12);
	return `${yr}년 전`;
}

function AchievementDashboardContent() {
	const { classes, cx } = useStyles();
	const dispatch = useDispatch();

	const user = useSelector(state => state.auth.user);
	const groupId = user?.reprGroup?.groupId;

	const dashboard = useSelector(({ AchievementDashboard }) => AchievementDashboard.achievementDashboard.dashboard);
	const dashboardLoading = useSelector(
		({ AchievementDashboard }) => AchievementDashboard.achievementDashboard.dashboardLoading
	);
	const categories = useSelector(({ AchievementDashboard }) => AchievementDashboard.achievementDashboard.categories);

	const [openCats, setOpenCats] = useState({});
	const [sortBy, setSortBy] = useState({});
	const sectionRefs = useRef({});

	useEffect(() => {
		if (groupId) {
			dispatch(Actions.getDashboard(groupId));
		}
	}, [dispatch, groupId]);

	const categoryStatsByKey = useMemo(() => {
		const map = {};
		if (dashboard?.categoryStats) {
			dashboard.categoryStats.forEach(c => {
				map[c.category] = c;
			});
		}
		return map;
	}, [dashboard]);

	const heatmapRows = useMemo(() => {
		if (!dashboard?.categoryStats) return [];
		return [...dashboard.categoryStats].sort((a, b) => b.unlockRate - a.unlockRate);
	}, [dashboard]);

	function toggleCat(cat) {
		const willOpen = !openCats[cat];
		setOpenCats(prev => ({ ...prev, [cat]: willOpen }));
		if (willOpen && groupId && !categories?.[cat]?.data) {
			dispatch(Actions.getCategory(groupId, cat));
		}
	}

	function openAndScroll(cat) {
		setOpenCats(prev => ({ ...prev, [cat]: true }));
		if (groupId && !categories?.[cat]?.data) {
			dispatch(Actions.getCategory(groupId, cat));
		}
		setTimeout(() => {
			const el = sectionRefs.current[cat];
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 60);
	}

	function setCatSort(cat, id) {
		setSortBy(prev => ({ ...prev, [cat]: id }));
	}

	function sortAchievements(items, sortId) {
		const arr = [...items];
		if (sortId === 'tier') {
			arr.sort((a, b) => (TIER_RANK[a.tier] || 0) - (TIER_RANK[b.tier] || 0));
		} else if (sortId === 'recent') {
			arr.sort((a, b) => {
				const at = a.latestUnlocker?.unlockedAt ? new Date(a.latestUnlocker.unlockedAt).getTime() : 0;
				const bt = b.latestUnlocker?.unlockedAt ? new Date(b.latestUnlocker.unlockedAt).getTime() : 0;
				return bt - at;
			});
		} else {
			arr.sort((a, b) => (b.unlockRate || 0) - (a.unlockRate || 0));
		}
		return arr;
	}

	if (dashboardLoading && !dashboard) {
		return (
			<div className={classes.container}>
				<div className={classes.title}>
					<span role="img" aria-label="trophy">🏆</span>
					<span>업적 대시보드</span>
				</div>
				<div className={classes.subtitle}>그룹 전체의 도전 현황을 한눈에</div>
				<div className={classes.skeletonHero} />
				<div className={classes.skeletonHeatmap} />
			</div>
		);
	}

	if (!dashboard) {
		return (
			<div className={classes.container}>
				<div className={classes.errorState}>
					<div>
						<span role="img" aria-label="error">⚠️</span>
					</div>
					<div>업적 데이터를 불러오지 못했습니다</div>
				</div>
			</div>
		);
	}

	const { summary, topUsers } = dashboard;
	const untouched = Math.max(0, (summary?.totalAchievements || 0) - (summary?.unlockedAchievements || 0));

	return (
		<div className={classes.container}>
			<div className={classes.title}>
				<span role="img" aria-label="trophy">🏆</span>
				<span>업적 대시보드</span>
			</div>
			<div className={classes.subtitle}>그룹 전체의 도전 현황을 한눈에</div>

			{/* Hero */}
			<div className={classes.hero}>
				<Link to="/achievement-dashboard/user-ranking" className={classes.heroRankingLink}>
					<span role="img" aria-label="leaderboard" className={classes.heroRankingLinkIcon}>🏅</span>
					<span>전체 랭킹 보기 →</span>
				</Link>
				<div className={classes.heroStatsGrid}>
					<div className={classes.heroStat}>
						<div className={classes.heroStatLabel}>해금</div>
						<div className={cx(classes.heroStatValue, classes.valuePrimary)}>
							{summary.unlockedAchievements} <span style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.35)' }}>/ {summary.totalAchievements}</span>
						</div>
						<div className={classes.heroStatSub}>{summary.unlockRate?.toFixed(1)}% 달성</div>
					</div>
					<div className={classes.heroStat}>
						<div className={classes.heroStatLabel}>
							<span role="img" aria-label="new">✨</span>
							<span>이번 주 신규</span>
						</div>
						<div className={cx(classes.heroStatValue, classes.valueSuccess)}>+{summary.newUnlocksThisWeek}</div>
						<div className={classes.heroStatSub}>최근 7일 해금</div>
					</div>
					<div className={classes.heroStat}>
						<div className={classes.heroStatLabel}>총 해금</div>
						<div className={classes.heroStatValue}>{summary.totalUnlocks}</div>
						<div className={classes.heroStatSub}>활성 유저 {summary.totalActiveUsers}명</div>
					</div>
					<div className={classes.heroStat}>
						<div className={classes.heroStatLabel}>
							<span role="img" aria-label="locked">🔒</span>
							<span>미개척</span>
						</div>
						<div className={cx(classes.heroStatValue, classes.valueWarning)}>{untouched}</div>
						<div className={classes.heroStatSub}>도전 남음</div>
					</div>
				</div>

				{topUsers && topUsers.length > 0 && (
					<>
						<div className={classes.topUsersTitle}>
							<span role="img" aria-label="medal">🏅</span> TOP 달성자
						</div>
						<div className={classes.topUsersRow}>
							{topUsers.slice(0, 3).map((u, idx) => {
								const medal = ['🥇', '🥈', '🥉'][idx] || '🏅';
								const medalLabels = ['first place', 'second place', 'third place'];
								return (
									<Link key={u.puuid} to={`/userinfo/${u.puuid}`} className={classes.topUserCard}>
										<span role="img" aria-label={medalLabels[idx] || 'medal'} className={classes.topUserMedal}>
											{medal}
										</span>
										<div className={classes.topUserInfo}>
											<span className={classes.topUserName}>{u.name}</span>
											<span className={classes.topUserCount}>{u.unlockCount}개 해금</span>
										</div>
									</Link>
								);
							})}
						</div>
					</>
				)}
			</div>

			{/* Heatmap */}
			{heatmapRows.length > 0 && (
				<div className={classes.section}>
					<div className={classes.sectionTitle}>
						<span role="img" aria-label="chart">📊</span>
						<span>카테고리 히트맵</span>
					</div>
					<div className={classes.heatmapCard}>
						{heatmapRows.map(row => {
							const label = CATEGORY_LABELS[row.category]?.label || row.category;
							const icon = CATEGORY_LABELS[row.category]?.icon;
							const rate = row.unlockRate || 0;
							return (
								<div
									key={row.category}
									className={classes.heatmapRow}
									onClick={() => openAndScroll(row.category)}
									onKeyDown={e => e.key === 'Enter' && openAndScroll(row.category)}
									role="button"
									tabIndex={0}
								>
									<div className={classes.heatmapLabel}>
										{icon && (
											<span role="img" aria-label={label}>
												{icon}
											</span>
										)}
										<span>{label}</span>
									</div>
									<div className={classes.heatmapBarOuter}>
										<div
											className={cx(classes.heatmapBarInner, rate >= 100 && classes.heatmapBarFull)}
											style={{ width: `${Math.min(100, rate)}%` }}
										/>
									</div>
									<div className={classes.heatmapPct}>{rate.toFixed(0)}%</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Categories */}
			<div className={classes.section}>
				<div className={classes.sectionTitle}>
					<span role="img" aria-label="folder">📁</span>
					<span>카테고리별 업적</span>
				</div>

				{CATEGORY_ORDER.map(cat => {
					const stat = categoryStatsByKey[cat];
					if (!stat) return null;

					const open = !!openCats[cat];
					const catData = categories?.[cat];
					const catLoading = catData?.loading;
					const catItems = catData?.data?.achievements;
					const sortId = sortBy[cat] || 'rate_desc';
					const sortedItems = catItems ? sortAchievements(catItems, sortId) : null;

					const meta = `${stat.unlockedAchievements}/${stat.totalAchievements} 업적 · 총 ${stat.totalUnlocks}회 달성 · 평균 ${stat.avgUnlockRate?.toFixed(1)}%`;

					return (
						<div
							key={cat}
							ref={el => { sectionRefs.current[cat] = el; }}
							className={cx(classes.categoryAccordion, open && classes.categoryAccordionOpen)}
						>
							<div
								className={classes.categoryHeader}
								onClick={() => toggleCat(cat)}
								onKeyDown={e => e.key === 'Enter' && toggleCat(cat)}
								role="button"
								tabIndex={0}
								aria-expanded={open}
							>
								<span role="img" aria-label={CATEGORY_LABELS[cat]?.label || cat} className={classes.categoryIcon}>
									{CATEGORY_LABELS[cat]?.icon || '🏷️'}
								</span>
								<div className={classes.categoryInfo}>
									<div className={classes.categoryLabel}>{CATEGORY_LABELS[cat]?.label || cat}</div>
									<div className={classes.categoryMeta}>{meta}</div>
								</div>
								<div className={classes.categoryProgress}>
									<div className={classes.categoryProgressBar}>
										<div
											className={classes.categoryProgressBarInner}
											style={{ width: `${Math.min(100, stat.unlockRate)}%` }}
										/>
									</div>
									<span className={classes.categoryProgressText}>{stat.unlockRate.toFixed(0)}%</span>
								</div>
								<span className={cx(classes.categoryChevron, open && classes.categoryChevronOpen)}>▼</span>
							</div>

							{open && (
								<div className={classes.categoryBody}>
									{catLoading && !catItems && (
										<div className={classes.categoryLoading}>
											<CircularProgress size={28} sx={{ color: '#00d4ff' }} />
										</div>
									)}
									{catItems && (
										<>
											<TopTierBanner items={catItems} classes={classes} />
											<div className={classes.sortBar}>
												{SORT_OPTIONS.map(opt => (
													<button
														type="button"
														key={opt.id}
														className={cx(classes.sortChip, sortId === opt.id && classes.sortChipActive)}
														onClick={() => setCatSort(cat, opt.id)}
													>
														{opt.label}
													</button>
												))}
											</div>
											{sortedItems.length === 0 ? (
												<div className={classes.emptyHint}>표시할 업적이 없습니다</div>
											) : (
												<div className={classes.grid}>
													{sortedItems.map(a => {
														const unlockedByAnyone = (a.unlockedCount || 0) > 0;
														const fullyUnlocked = a.unlockRate >= 100;
														const tierColor = TIER_COLORS[a.tier] || '#fff';
														const isTierCat = a.category === 'tier';
														const iconNode = isTierCat ? (
															<img
																className={classes.cardEmblem}
																src={`/assets/images/ranked-emblems/Emblem_${String(a.id).replace('TIER_', '')}.webp`}
																alt={a.name}
															/>
														) : (
															<span role="img" aria-label={a.name} className={classes.cardEmoji}>
																{a.emoji || '🏆'}
															</span>
														);
														const top = (a.topUnlockers || []).slice(0, 3);
														const rate = a.unlockRate || 0;
														return (
															<Link
																key={a.id}
																to={`/achievement-dashboard/ranking/${a.id}`}
																className={cx(
																	classes.card,
																	fullyUnlocked && classes.cardFullUnlocked,
																	!unlockedByAnyone && classes.cardUntouched
																)}
																style={
																	unlockedByAnyone && !fullyUnlocked
																		? { borderColor: `${tierColor}30` }
																		: undefined
																}
															>
																{unlockedByAnyone ? (
																	<span className={classes.cardTierBadge} style={{ color: tierColor }}>
																		<img
																			className={classes.cardTierEmblem}
																			src={`/assets/images/ranked-emblems/Emblem_${a.tier}.webp`}
																			alt={a.tier}
																		/>
																		{a.tier}
																	</span>
																) : (
																	<span className={classes.cardLockIcon} role="img" aria-label="locked">
																		🔒
																	</span>
																)}

																<div className={classes.cardHeader}>
																	{iconNode}
																	<div className={classes.cardTextCol}>
																		<div className={classes.cardName}>{a.name}</div>
																		<div className={classes.cardDesc}>{a.description}</div>
																	</div>
																</div>

																<div className={classes.cardProgressWrap}>
																	<div className={classes.cardProgressLabels}>
																		<span>
																			<span className={classes.cardUnlockedCount}>{a.unlockedCount || 0}</span>
																			명 달성
																		</span>
																		<span>{rate.toFixed(1)}%</span>
																	</div>
																	<div className={classes.cardProgressBar}>
																		<div
																			className={cx(
																				classes.cardProgressBarInner,
																				fullyUnlocked && classes.cardProgressBarFull
																			)}
																			style={{ width: `${Math.min(100, rate)}%` }}
																		/>
																	</div>
																</div>

																{top.length > 0 ? (
																	<div className={classes.cardFooter}>
																		<div className={classes.avatarStack}>
																			{top.map(u => (
																				<Tooltip
																					key={u.puuid}
																					title={`${getRankMedalText(u.rank)} ${u.name} · ${formatRelative(u.unlockedAt)}`}
																					arrow
																					placement="top"
																					enterTouchDelay={0}
																					leaveTouchDelay={2000}
																				>
																					<div
																						className={cx(
																							classes.avatar,
																							u.rank === 1 && classes.avatarRank1,
																							u.rank === 2 && classes.avatarRank2,
																							u.rank === 3 && classes.avatarRank3
																						)}
																						style={{
																							background: `linear-gradient(135deg, ${hashColor(u.puuid)}, ${hashColor(`${u.puuid}x`)})`
																						}}
																					>
																						{getInitial(u.name)}
																					</div>
																				</Tooltip>
																			))}
																		</div>
																		<div className={classes.recentTextWrap}>
																			<span role="img" aria-label="first place">🥇</span> {top[0].name}
																		</div>
																		<Tooltip title="랭킹 보기" arrow placement="top">
																			<span
																				className={cx(classes.searchBtn, 'achievement-card-search')}
																				aria-label="상세 보기"
																			>
																				<SearchIcon />
																			</span>
																		</Tooltip>
																	</div>
																) : (
																	<div className={classes.cardFooter}>
																		<span role="img" aria-label="locked">🔒</span>
																		<span style={{ flex: 1 }}>아직 아무도 달성 못함</span>
																		<Tooltip title="랭킹 보기" arrow placement="top">
																			<span
																				className={cx(classes.searchBtn, 'achievement-card-search')}
																				aria-label="상세 보기"
																			>
																				<SearchIcon />
																			</span>
																		</Tooltip>
																	</div>
																)}
															</Link>
														);
													})}
												</div>
											)}
										</>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function TopTierBanner({ items, classes }) {
	const candidates = (items || []).filter(a => (a.topUnlockers || []).length > 0);
	if (candidates.length === 0) return null;
	const sorted = [...candidates].sort((a, b) => {
		const tierDiff = (TIER_RANK[b.tier] || 0) - (TIER_RANK[a.tier] || 0);
		if (tierDiff !== 0) return tierDiff;
		return (b.goal || 0) - (a.goal || 0);
	});
	const highest = sorted[0];
	const top = (highest.topUnlockers || []).slice(0, 3);
	if (top.length === 0) return null;

	const tierColor = TIER_COLORS[highest.tier] || '#fff';
	const isTierCat = highest.category === 'tier';
	const iconNode = isTierCat ? (
		<img
			className={classes.topAchieverEmblem}
			src={`/assets/images/ranked-emblems/Emblem_${String(highest.id).replace('TIER_', '')}.webp`}
			alt={highest.name}
		/>
	) : (
		<span role="img" aria-label={highest.name} className={classes.topAchieverEmoji}>
			{highest.emoji || '🏆'}
		</span>
	);

	return (
		<div className={classes.topAchieverBanner}>
			<Link to={`/achievement-dashboard/ranking/${highest.id}`} className={classes.topAchieverHead}>
				{iconNode}
				<div className={classes.topAchieverInfo}>
					<span className={classes.topAchieverLabel} style={{ color: `${tierColor}cc` }}>
						{highest.tier} · 최고 달성
					</span>
					<span className={classes.topAchieverTitle}>{highest.name}</span>
				</div>
			</Link>
			<div className={classes.topAchieverMedals}>
				{top.map(u => (
					<Link
						key={u.puuid}
						to={`/userinfo/${u.puuid}`}
						className={classes.topAchieverMedal}
					>
						<span
							role="img"
							aria-label={getRankAriaLabel(u.rank)}
							className={classes.topAchieverMedalIcon}
						>
							{getRankMedal(u.rank)}
						</span>
						<span className={classes.topAchieverMedalName}>{u.name}</span>
						<Tooltip
							title={new Date(u.unlockedAt).toLocaleString('ko-KR')}
							arrow
							placement="top"
							enterTouchDelay={0}
							leaveTouchDelay={2000}
						>
							<span className={classes.topAchieverMedalTime}>{formatRelative(u.unlockedAt)}</span>
						</Tooltip>
					</Link>
				))}
			</div>
		</div>
	);
}

export default AchievementDashboardContent;
