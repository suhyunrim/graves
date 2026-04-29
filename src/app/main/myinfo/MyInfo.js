import React, { useEffect, useState } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import {
	Button,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Snackbar,
	CircularProgress,
	Tabs,
	Tab
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import withReducer from 'app/store/withReducer';
import getLatesetRiotDataVersion from 'app/utility/getLatesetRiotDataVersion';
import { MyInfoSkeleton } from '../components/SkeletonLoaders';
import AchievementContent from '../achievement/AchievementContent';
import achievementReducer from '../achievement/store/reducers';
import MyInfoHeader from './MyInfoHeader';
import RatingChart from './RatingChart';
import VisitorCounter from './VisitorCounter';
import Guestbook from './Guestbook';
import StatusMessage from './StatusMessage';
import reducer from './store/reducers';
import * as Actions from './store/actions';

const tierColors = {
	IRON: { primary: '#5C5C5C', glow: 'rgba(92, 92, 92, 0.4)' },
	BRONZE: { primary: '#CD7F32', glow: 'rgba(205, 127, 50, 0.4)' },
	SILVER: { primary: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.4)' },
	GOLD: { primary: '#FFD700', glow: 'rgba(255, 215, 0, 0.4)' },
	PLATINUM: { primary: '#00CED1', glow: 'rgba(0, 206, 209, 0.4)' },
	EMERALD: { primary: '#50C878', glow: 'rgba(80, 200, 120, 0.4)' },
	DIAMOND: { primary: '#B9F2FF', glow: 'rgba(185, 242, 255, 0.4)' },
	MASTER: { primary: '#9932CC', glow: 'rgba(153, 50, 204, 0.4)' },
	GRANDMASTER: { primary: '#FF4500', glow: 'rgba(255, 69, 0, 0.4)' },
	CHALLENGER: { primary: '#F0E68C', glow: 'rgba(240, 230, 140, 0.4)' },
	UNRANKED: { primary: '#888888', glow: 'rgba(136, 136, 136, 0.3)' }
};

// keyframes 헬퍼로 애니메이션 정의 (tss-react는 JSS $ruleName 참조 미지원)
const fadeIn = keyframes`
	0% { opacity: 0; transform: translateY(20px); }
	100% { opacity: 1; transform: translateY(0); }
`;

const fadeInUp = keyframes`
	0% { opacity: 0; transform: translateY(30px); }
	100% { opacity: 1; transform: translateY(0); }
`;

const useStyles = makeStyles()((theme) => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	},
	container: {
		padding: '28px',
		maxWidth: 1400,
		margin: '0 auto',
		[theme.breakpoints.down('sm')]: {
			padding: '16px'
		}
	},
	statsSection: {
		marginBottom: 32
	},
	profileSection: {
		display: 'flex',
		alignItems: 'flex-start',
		gap: 24,
		marginBottom: 32,
		padding: 24,
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 16,
		border: '1px solid rgba(0, 212, 255, 0.2)',
		animation: `${fadeIn} 0.5s ease`,
		flexWrap: 'wrap',
		[theme.breakpoints.down('sm')]: {
			gap: 16,
			padding: 16
		}
	},
	profileVisitor: {
		marginLeft: 'auto',
		[theme.breakpoints.down('sm')]: {
			marginLeft: 0,
			width: '100%',
			display: 'flex',
			justifyContent: 'flex-end'
		}
	},
	profileIcon: {
		width: 120,
		height: 120,
		borderRadius: 16,
		border: '3px solid rgba(0, 212, 255, 0.5)',
		boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
		transition: 'transform 0.3s ease, box-shadow 0.3s ease',
		'&:hover': {
			transform: 'scale(1.05)',
			boxShadow: '0 0 40px rgba(0, 212, 255, 0.5)'
		},
		[theme.breakpoints.down('sm')]: {
			width: 80,
			height: 80,
			borderRadius: 12
		}
	},
	profileInfo: {
		flex: 1
	},
	summonerName: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '3.2rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.02em',
		textShadow: '0 2px 20px rgba(0, 212, 255, 0.3)',
		marginBottom: 6,
		[theme.breakpoints.down('sm')]: {
			fontSize: '2.2rem'
		}
	},
	summonerLevel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.5)',
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	levelBadge: {
		background: 'rgba(0, 212, 255, 0.15)',
		padding: '6px 16px',
		borderRadius: 20,
		fontSize: '1.3rem',
		color: '#00d4ff',
		fontWeight: 600
	},
	subInfoRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		marginTop: 10,
		flexWrap: 'wrap'
	},
	honorInfo: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		flexWrap: 'wrap'
	},
	honorTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 600,
		color: '#ffd700',
		background: 'rgba(255, 215, 0, 0.12)',
		padding: '4px 14px',
		borderRadius: 20,
		border: '1px solid rgba(255, 215, 0, 0.25)'
	},
	honorPoints: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		color: 'rgba(255, 255, 255, 0.6)'
	},
	cardsGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
		gap: 24,
		marginBottom: 32,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr',
			gap: 16
		}
	},
	rankCard: {
		position: 'relative',
		borderRadius: 20,
		padding: 28,
		overflow: 'hidden',
		transition: 'transform 0.3s ease, box-shadow 0.3s ease',
		animation: `${fadeInUp} 0.6s ease forwards`,
		opacity: 0,
		'&:hover': {
			transform: 'translateY(-6px) scale(1.02)'
		},
		[theme.breakpoints.down('sm')]: {
			padding: 20,
			borderRadius: 16
		}
	},
	soloRankCard: {
		background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
		border: '1px solid rgba(99, 102, 241, 0.3)',
		animationDelay: '0.1s',
		'&:hover': {
			boxShadow: '0 20px 50px rgba(99, 102, 241, 0.25)'
		}
	},
	customRatingCard: {
		background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		animationDelay: '0.2s',
		'&:hover': {
			boxShadow: '0 20px 50px rgba(0, 212, 255, 0.25)'
		}
	},
	cardHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 20,
		marginBottom: 20
	},
	emblemContainer: {
		position: 'relative'
	},
	emblem: {
		width: 100,
		height: 100,
		filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))',
		transition: 'transform 0.3s ease',
		'&:hover': {
			transform: 'scale(1.1) rotate(5deg)'
		},
		[theme.breakpoints.down('sm')]: {
			width: 72,
			height: 72
		}
	},
	cardTitleWrapper: {
		flex: 1
	},
	cardLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 8
	},
	tierText: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		letterSpacing: '0.03em',
		textShadow: '0 2px 10px currentColor',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.8rem'
		}
	},
	statsRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		marginTop: 18,
		flexWrap: 'wrap'
	},
	statItem: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.45rem',
		color: 'rgba(255, 255, 255, 0.8)'
	},
	winRate: {
		fontWeight: 700,
		padding: '6px 16px',
		borderRadius: 8,
		fontSize: '1.4rem'
	},
	winRateHigh: {
		background: 'rgba(0, 255, 127, 0.2)',
		color: '#00ff7f'
	},
	winRateMid: {
		background: 'rgba(255, 215, 0, 0.2)',
		color: '#ffd700'
	},
	winRateLow: {
		background: 'rgba(255, 107, 107, 0.2)',
		color: '#ff6b6b'
	},
	decorLine: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: 4,
		background: 'linear-gradient(90deg, transparent, currentColor, transparent)',
		opacity: 0.6
	},
	sectionTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff',
		marginBottom: 20,
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		'&::before': {
			content: '""',
			width: 4,
			height: 28,
			background: 'linear-gradient(180deg, #00d4ff, #0066ff)',
			borderRadius: 2
		}
	},
	// 새로운 통계 섹션 스타일
	statsGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
		gap: 16,
		marginBottom: 24,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
			gap: 12
		}
	},
	statCard: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 16,
		padding: '20px 24px',
		border: '1px solid rgba(0, 212, 255, 0.15)',
		animation: `${fadeInUp} 0.5s ease forwards`,
		opacity: 0,
		'&:nth-child(1)': { animationDelay: '0.1s' },
		'&:nth-child(2)': { animationDelay: '0.15s' },
		'&:nth-child(3)': { animationDelay: '0.2s' },
		'&:nth-child(4)': { animationDelay: '0.25s' }
	},
	statLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 8
	},
	statValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		color: '#fff'
	},
	statSubValue: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginTop: 4
	},
	recentWinRateHigh: {
		color: '#00ff7f'
	},
	recentWinRateMid: {
		color: '#ffd700'
	},
	recentWinRateLow: {
		color: '#ff6b6b'
	},
	streakWin: {
		color: '#00d4ff'
	},
	streakLose: {
		color: '#ff6b6b'
	},
	// 팀원/상대 카드 섹션
	relationSection: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
		gap: 24,
		marginBottom: 32,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr',
			gap: 16
		}
	},
	relationCard: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 20,
		padding: 24,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		animation: `${fadeInUp} 0.6s ease forwards`,
		opacity: 0,
		'&:nth-child(1)': { animationDelay: '0.2s' },
		'&:nth-child(2)': { animationDelay: '0.3s' },
		[theme.breakpoints.down('sm')]: {
			padding: 16,
			borderRadius: 16
		}
	},
	relationTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		marginBottom: 20,
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	relationTitleIcon: {
		fontSize: '1.4rem'
	},
	relationList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12
	},
	relationItem: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '12px 16px',
		background: 'rgba(0, 0, 0, 0.2)',
		borderRadius: 12,
		transition: 'background 0.2s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.1)'
		},
		[theme.breakpoints.down('sm')]: {
			flexWrap: 'wrap',
			gap: 4,
			padding: '10px 12px'
		}
	},
	relationRank: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.4)',
		width: 28
	},
	relationName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.35rem',
		color: '#fff',
		flex: 1,
		marginLeft: 12
	},
	relationStats: {
		display: 'flex',
		alignItems: 'center',
		gap: 16
	},
	relationGames: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.6)'
	},
	relationWinRate: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.35rem',
		fontWeight: 700,
		padding: '4px 12px',
		borderRadius: 6
	},
	// 베스트/워스트 카드
	highlightSection: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
		gap: 16,
		marginBottom: 32,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr',
			gap: 12
		}
	},
	highlightCard: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 16,
		padding: '20px 24px',
		border: '1px solid rgba(0, 212, 255, 0.15)',
		animation: `${fadeInUp} 0.5s ease forwards`,
		opacity: 0,
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		'&:nth-child(1)': { animationDelay: '0.3s' },
		'&:nth-child(2)': { animationDelay: '0.35s' },
		'&:nth-child(3)': { animationDelay: '0.4s' }
	},
	highlightIcon: {
		fontSize: '2.2rem',
		width: 48,
		height: 48,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 12,
		background: 'rgba(0, 0, 0, 0.3)'
	},
	highlightContent: {
		flex: 1
	},
	highlightLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 4
	},
	highlightName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 600,
		color: '#fff'
	},
	highlightStat: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		marginTop: 2
	},
	highlightBest: {
		color: '#00ff7f'
	},
	highlightWorst: {
		color: '#ff6b6b'
	},
	moreButton: {
		color: '#00d4ff',
		fontSize: '1.2rem',
		fontFamily: '"Noto Sans KR", sans-serif',
		marginLeft: 'auto',
		padding: '4px 12px',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		borderRadius: 8,
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.1)',
			borderColor: 'rgba(0, 212, 255, 0.5)'
		}
	},
	noData: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: '20px 0'
	},
	// 더보기 Dialog
	dialogPaper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		borderRadius: '20px !important',
		color: '#fff',
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 212, 255, 0.08)',
		overflow: 'hidden',
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
	dialogTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.05em',
		textTransform: 'uppercase',
		padding: '24px 28px 8px',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
	},
	dialogSubtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.4)',
		padding: '0 28px 16px'
	},
	dialogContent: {
		padding: '8px 28px 24px !important'
	},
	dialogListItem: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '12px 16px',
		background: 'rgba(0, 0, 0, 0.2)',
		borderRadius: 12,
		transition: 'all 0.2s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.08)',
			borderColor: 'rgba(0, 212, 255, 0.2)'
		},
		[theme.breakpoints.down('sm')]: {
			flexWrap: 'wrap',
			gap: 4,
			padding: '10px 12px'
		}
	},
	dialogRankTop3: {
		color: '#00d4ff',
		textShadow: '0 0 8px rgba(0, 212, 255, 0.4)'
	},
	dialogCloseButton: {
		color: 'rgba(255, 255, 255, 0.5)',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		borderRadius: 10,
		padding: '8px 24px',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		transition: 'all 0.2s ease',
		'&:hover': {
			color: '#00d4ff',
			borderColor: 'rgba(0, 212, 255, 0.4)',
			background: 'rgba(0, 212, 255, 0.08)'
		}
	},
	// 부캐 설정
	subAccountSection: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.2)',
		padding: '24px 28px',
		marginTop: 20,
		animation: `${fadeInUp} 0.6s ease forwards`,
		opacity: 0,
		animationDelay: '0.4s'
	},
	subAccountTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		marginBottom: 16
	},
	subAccountEmpty: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 16
	},
	subAccountForm: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			alignItems: 'stretch'
		}
	},
	subAccountInput: {
		flex: 1,
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif'
		},
		'& .MuiInputLabel-root': {
			color: 'rgba(255, 255, 255, 0.5)',
			fontFamily: '"Noto Sans KR", sans-serif'
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(255, 255, 255, 0.2)'
		},
		'& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.5)'
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: '#00d4ff'
		},
		'& .MuiInputLabel-root.Mui-focused': {
			color: '#00d4ff'
		}
	},
	subAccountRegisterBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.2rem',
		padding: '10px 24px',
		borderRadius: 10,
		textTransform: 'none',
		whiteSpace: 'nowrap',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)'
		},
		'&.Mui-disabled': {
			background: 'rgba(255, 255, 255, 0.1)',
			color: 'rgba(255, 255, 255, 0.3)'
		}
	},
	subAccountInfo: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		flexWrap: 'wrap',
		gap: 12
	},
	subAccountName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 600,
		color: '#00d4ff'
	},
	subAccountRemoveBtn: {
		background: 'rgba(255, 107, 107, 0.15)',
		color: '#ff6b6b',
		border: '1px solid rgba(255, 107, 107, 0.3)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 600,
		fontSize: '1.1rem',
		padding: '6px 16px',
		borderRadius: 10,
		textTransform: 'none',
		'&:hover': {
			background: 'rgba(255, 107, 107, 0.25)'
		}
	},
	subAccountNote: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginTop: 12
	},
	snackSuccess: {
		'& .MuiSnackbarContent-root': {
			background: '#51cf66',
			color: '#000',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontWeight: 600
		}
	},
	snackError: {
		'& .MuiSnackbarContent-root': {
			background: '#ff6b6b',
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontWeight: 600
		}
	},
	tabs: {
		marginBottom: 32,
		animation: `${fadeInUp} 0.5s ease forwards`,
		opacity: 0,
		animationDelay: '0.15s',
		'& .MuiTabs-indicator': {
			background: '#00d4ff'
		}
	},
	tab: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.5)',
		textTransform: 'none',
		minWidth: 100,
		'&.Mui-selected': {
			color: '#00d4ff'
		}
	}
}));

function MyInfoPage(props) {
	const { classes } = useStyles(props);
	const dispatch = useDispatch();

	const { puuid } = useParams();
	const myPuuid = localStorage.getItem('camille_riot_puuid');
	const isDiscordLoggedIn = Boolean(localStorage.getItem('camille_discord_token'));
	const isOtherUser = puuid && puuid !== myPuuid;
	const user = useSelector(state => state.auth.user);
	const scoreInfo = useSelector(({ MyInfo }) => MyInfo.myInfo.scoreInfo);
	const summonerInfo = useSelector(({ MyInfo }) => MyInfo.myInfo.summonerInfo);
	const topTeammates = useSelector(({ MyInfo }) => MyInfo.myInfo.topTeammates);
	const topOpponents = useSelector(({ MyInfo }) => MyInfo.myInfo.topOpponents);
	const bestTeammates = useSelector(({ MyInfo }) => MyInfo.myInfo.bestTeammates);
	const recentGames = useSelector(({ MyInfo }) => MyInfo.myInfo.recentGames);
	const recentWins = useSelector(({ MyInfo }) => MyInfo.myInfo.recentWins);
	const recentWinRate = useSelector(({ MyInfo }) => MyInfo.myInfo.recentWinRate);
	const maxWinStreak = useSelector(({ MyInfo }) => MyInfo.myInfo.maxWinStreak);
	const maxLoseStreak = useSelector(({ MyInfo }) => MyInfo.myInfo.maxLoseStreak);
	const bestOpponents = useSelector(({ MyInfo }) => MyInfo.myInfo.bestOpponents);
	const worstOpponents = useSelector(({ MyInfo }) => MyInfo.myInfo.worstOpponents);
	const honorStats = useSelector(({ MyInfo }) => MyInfo.myInfo.honorStats);
	const subAccount = useSelector(({ MyInfo }) => MyInfo.myInfo.subAccount);

	const [activeTab, setActiveTab] = useState(0);
	const [subAccountInput, setSubAccountInput] = useState('');
	const [subAccountLoading, setSubAccountLoading] = useState(false);
	const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
	const [snack, setSnack] = useState({ open: false, message: '', type: 'success' });
	const [listDialog, setListDialog] = useState({ open: false, title: '', data: [], type: '' });

	const isMyPage = !puuid || puuid === myPuuid;
	const isLoggedIn = Boolean(myPuuid);

	function handleRegisterSubAccount() {
		if (!subAccountInput.trim()) return;
		setSubAccountLoading(true);
		dispatch(Actions.registerSubAccount(subAccountInput.trim(), user.reprGroup.groupId))
			.then(result => {
				setSubAccountLoading(false);
				setSubAccountInput('');
				setSnack({ open: true, message: result.message || '부캐가 등록되었습니다.', type: 'success' });
			})
			.catch(err => {
				setSubAccountLoading(false);
				const msg = err.response && err.response.data ? err.response.data.result : '부캐 등록에 실패했습니다.';
				setSnack({ open: true, message: msg, type: 'error' });
			});
	}

	function handleRemoveSubAccount() {
		setRemoveDialogOpen(false);
		dispatch(Actions.removeSubAccount(user.reprGroup.groupId))
			.then(() => {
				setSnack({ open: true, message: '부캐가 해제되었습니다.', type: 'success' });
			})
			.catch(() => {
				setSnack({ open: true, message: '부캐 해제에 실패했습니다.', type: 'error' });
			});
	}

	const getSoloRankTierName = () => {
		const tier = summonerInfo.rankTier;
		if (!tier || tier === 'UNRANKED') return 'UNRANKED';
		return tier.split(' ')[0];
	};

	const getRatingTierDisplay = () => {
		const rating = scoreInfo.defaultRating + scoreInfo.additionalRating;
		const tierSteps = ['IV', 'III', 'II', 'I'];
		const bases = [
			['CHALLENGER', 1150],
			['GRANDMASTER', 1000],
			['MASTER', 900],
			['DIAMOND', 800],
			['EMERALD', 700],
			['PLATINUM', 600],
			['GOLD', 500],
			['SILVER', 400],
			['BRONZE', 300],
			['IRON', 200]
		];
		for (const [name, base] of bases) {
			if (rating >= base) {
				if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(name)) {
					return name;
				}
				return `${name} ${tierSteps[Math.floor((rating - base) / 25)]}`;
			}
		}
		return 'IRON IV';
	};

	const getRatingTierName = () => {
		return getRatingTierDisplay().split(' ')[0];
	};

	const getRatingLP = () => {
		const rating = scoreInfo.defaultRating + scoreInfo.additionalRating;
		const bases = [
			['CHALLENGER', 1150],
			['GRANDMASTER', 1000],
			['MASTER', 900],
			['DIAMOND', 800],
			['EMERALD', 700],
			['PLATINUM', 600],
			['GOLD', 500],
			['SILVER', 400],
			['BRONZE', 300],
			['IRON', 200]
		];
		for (const [name, base] of bases) {
			if (rating >= base) {
				if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(name)) {
					return Math.floor((rating - base) * 4);
				}
				return Math.floor(((rating - base) % 25) * 4);
			}
		}
		return 0;
	};

	const getProfileIconURI = () => {
		return `https://ddragon.leagueoflegends.com/cdn/${getLatesetRiotDataVersion()}/img/profileicon/${
			summonerInfo.profileIconId
		}.png`;
	};

	const getTierColor = tierName => {
		return tierColors[tierName] || tierColors.UNRANKED;
	};

	const getWinRateClass = winRate => {
		if (winRate >= 55) return classes.winRateHigh;
		if (winRate >= 45) return classes.winRateMid;
		return classes.winRateLow;
	};

	const getRecentWinRateClass = winRate => {
		if (winRate >= 55) return classes.recentWinRateHigh;
		if (winRate >= 45) return classes.recentWinRateMid;
		return classes.recentWinRateLow;
	};

	const calculateWinRate = (wins, losses) => {
		const total = wins + losses;
		if (total === 0) return 0;
		return Math.round((wins / total) * 100);
	};

	useEffect(() => {
		dispatch(Actions.getMyInfo(user.reprGroup.groupId, puuid));
	}, [dispatch, user, puuid]);

	const location = useLocation();
	useEffect(() => {
		if (location.hash && location.hash.startsWith('#comment-')) {
			setActiveTab(2);
		}
	}, [location.hash]);

	if (!scoreInfo) {
		return (
			<FusePageSimple
				classes={{ root: classes.layoutRoot }}
				header={<MyInfoHeader showBack={isOtherUser} />}
				content={<MyInfoSkeleton />}
			/>
		);
	}

	const soloTierName = getSoloRankTierName();
	const ratingTierName = getRatingTierName();
	const soloTierColor = getTierColor(soloTierName);
	const ratingTierColor = getTierColor(ratingTierName);
	const soloWinRate = calculateWinRate(summonerInfo.rankWin, summonerInfo.rankLose);
	const customWinRate = calculateWinRate(scoreInfo.win, scoreInfo.lose);

	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot
			}}
			header={
				<MyInfoHeader
					title={puuid ? 'Player Info' : undefined}
					subtitle={puuid ? '소환사 정보 및 내전 기록' : undefined}
					showBack={isOtherUser}
				/>
			}
			content={
				<div className={classes.container}>
					{/* 프로필 섹션 */}
					<div className={classes.profileSection}>
						<img className={classes.profileIcon} src={getProfileIconURI()} alt="Profile Icon" />
						<div className={classes.profileInfo}>
							<div className={classes.summonerName}>{summonerInfo.name}</div>
							<div className={classes.summonerLevel}>
								<span className={classes.levelBadge}>Lv. {summonerInfo.summonerLevel}</span>
							</div>
							<div className={classes.subInfoRow}>
								{honorStats && (
									<div className={classes.honorInfo}>
										{honorStats.title && (
											<span className={classes.honorTitle}>
												<span role="img" aria-label="honor title">
													{honorStats.title.emoji}
												</span>{' '}
												{honorStats.title.title}
											</span>
										)}
										<span className={classes.honorPoints}>명예 포인트: {honorStats.received}</span>
									</div>
								)}
								{user?.reprGroup?.groupId && (puuid || myPuuid) && (
									<StatusMessage
										groupId={user.reprGroup.groupId}
										puuid={puuid || myPuuid}
										editable={isDiscordLoggedIn && isMyPage && !scoreInfo.primaryPuuid}
									/>
								)}
							</div>
						</div>
						{user?.reprGroup?.groupId && (
							<div className={classes.profileVisitor}>
								<VisitorCounter
									groupId={user.reprGroup.groupId}
									puuid={puuid || myPuuid}
									isLoggedIn={isDiscordLoggedIn}
								/>
							</div>
						)}
					</div>

					<Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} className={classes.tabs}>
						<Tab label="정보" className={classes.tab} />
						<Tab label="업적" className={classes.tab} />
						<Tab label="방명록" className={classes.tab} />
					</Tabs>

					{activeTab === 1 && <AchievementContent />}

					{activeTab === 2 && user?.reprGroup?.groupId && (
						<Guestbook groupId={user.reprGroup.groupId} puuid={puuid || myPuuid} />
					)}

					{activeTab === 0 && (
						<>
							{/* 랭크 카드들 */}
							<div className={classes.cardsGrid}>
								{/* 솔로 랭크 카드 */}
								<div className={`${classes.rankCard} ${classes.soloRankCard}`}>
									<div className={classes.cardHeader}>
										<div className={classes.emblemContainer}>
											<img
												className={classes.emblem}
												src={`/assets/images/ranked-emblems/Emblem_${soloTierName}.webp`}
												alt={soloTierName}
												style={{ filter: `drop-shadow(0 0 20px ${soloTierColor.glow})` }}
											/>
										</div>
										<div className={classes.cardTitleWrapper}>
											<div className={classes.cardLabel}>Solo Rank</div>
											<div className={classes.tierText} style={{ color: soloTierColor.primary }}>
												{summonerInfo.rankTier}
											</div>
										</div>
									</div>
									<div className={classes.statsRow}>
										<span className={classes.statItem}>
											{summonerInfo.rankWin}승 {summonerInfo.rankLose}패
										</span>
										{summonerInfo.rankWin + summonerInfo.rankLose > 0 && (
											<span className={`${classes.winRate} ${getWinRateClass(soloWinRate)}`}>{soloWinRate}%</span>
										)}
									</div>
									<div className={classes.decorLine} style={{ color: soloTierColor.primary }} />
								</div>

								{/* 커스텀 레이팅 카드 */}
								<div className={`${classes.rankCard} ${classes.customRatingCard}`}>
									<div className={classes.cardHeader}>
										<div className={classes.emblemContainer}>
											<img
												className={classes.emblem}
												src={`/assets/images/ranked-emblems/Emblem_${ratingTierName}.webp`}
												alt={ratingTierName}
												style={{ filter: `drop-shadow(0 0 20px ${ratingTierColor.glow})` }}
											/>
										</div>
										<div className={classes.cardTitleWrapper}>
											<div className={classes.cardLabel}>Custom Rating</div>
											<div className={classes.tierText} style={{ color: ratingTierColor.primary }}>
												{getRatingTierDisplay()} {getRatingLP()}LP
											</div>
										</div>
									</div>
									<div className={classes.statsRow}>
										<span className={classes.statItem}>
											{scoreInfo.win}승 {scoreInfo.lose}패
										</span>
										{scoreInfo.win + scoreInfo.lose > 0 && (
											<span className={`${classes.winRate} ${getWinRateClass(customWinRate)}`}>{customWinRate}%</span>
										)}
									</div>
									<div className={classes.decorLine} style={{ color: '#00d4ff' }} />
								</div>
							</div>

							{/* 최근 전적 & 연승/연패 통계 */}
							<div className={classes.statsSection}>
								<div className={classes.statsGrid}>
									<div className={classes.statCard}>
										<div className={classes.statLabel}>최근 10경기</div>
										<div className={`${classes.statValue} ${getRecentWinRateClass(recentWinRate)}`}>
											{recentWinRate}%
										</div>
										<div className={classes.statSubValue}>
											{recentWins}승 {recentGames - recentWins}패
										</div>
									</div>
									<div className={classes.statCard}>
										<div className={classes.statLabel}>최다 연승</div>
										<div className={`${classes.statValue} ${classes.streakWin}`}>{maxWinStreak}연승</div>
									</div>
									<div className={classes.statCard}>
										<div className={classes.statLabel}>최다 연패</div>
										<div className={`${classes.statValue} ${classes.streakLose}`}>{maxLoseStreak}연패</div>
									</div>
								</div>
							</div>

							{/* 베스트/워스트 하이라이트 */}
							<div className={classes.highlightSection}>
								{bestTeammates.length > 0 && (
									<div className={classes.highlightCard}>
										<div className={classes.highlightIcon}>
											<span role="img" aria-label="best teammate">
												🤝
											</span>
										</div>
										<div className={classes.highlightContent}>
											<div className={classes.highlightLabel}>함께하면 승률 최고</div>
											<div className={classes.highlightName}>{bestTeammates[0].name}</div>
											<div className={`${classes.highlightStat} ${classes.highlightBest}`}>
												{bestTeammates[0].games}판 ({bestTeammates[0].wins}승 {bestTeammates[0].losses}패) {bestTeammates[0].winRate}%
											</div>
										</div>
										{bestTeammates.length > 1 && (
											<Button
												size="small"
												className={classes.moreButton}
												onClick={() => setListDialog({ open: true, title: '함께하면 승률 최고', data: bestTeammates, type: 'teammate' })}
											>
												+{bestTeammates.length - 1}명 더보기
											</Button>
										)}
									</div>
								)}
								{bestOpponents.length > 0 && (
									<div className={classes.highlightCard}>
										<div className={classes.highlightIcon}>
											<span role="img" aria-label="best opponent">
												💪
											</span>
										</div>
										<div className={classes.highlightContent}>
											<div className={classes.highlightLabel}>상대 전적 최고</div>
											<div className={classes.highlightName}>{bestOpponents[0].name}</div>
											<div className={`${classes.highlightStat} ${classes.highlightBest}`}>
												{bestOpponents[0].games}판 ({bestOpponents[0].myWins}승 {bestOpponents[0].myLosses}패){' '}
												{bestOpponents[0].winRate}%
											</div>
										</div>
										{bestOpponents.length > 1 && (
											<Button
												size="small"
												className={classes.moreButton}
												onClick={() => setListDialog({ open: true, title: '상대 전적 최고', data: bestOpponents, type: 'opponent' })}
											>
												+{bestOpponents.length - 1}명 더보기
											</Button>
										)}
									</div>
								)}
								{worstOpponents.length > 0 && (
									<div className={classes.highlightCard}>
										<div className={classes.highlightIcon}>
											<span role="img" aria-label="worst opponent">
												😰
											</span>
										</div>
										<div className={classes.highlightContent}>
											<div className={classes.highlightLabel}>상대 전적 최악</div>
											<div className={classes.highlightName}>{worstOpponents[0].name}</div>
											<div className={`${classes.highlightStat} ${classes.highlightWorst}`}>
												{worstOpponents[0].games}판 ({worstOpponents[0].myWins}승 {worstOpponents[0].myLosses}패){' '}
												{worstOpponents[0].winRate}%
											</div>
										</div>
										{worstOpponents.length > 1 && (
											<Button
												size="small"
												className={classes.moreButton}
												onClick={() => setListDialog({ open: true, title: '상대 전적 최악', data: worstOpponents, type: 'opponent' })}
											>
												+{worstOpponents.length - 1}명 더보기
											</Button>
										)}
									</div>
								)}
							</div>

							{/* 자주 함께한 팀원 / 자주 맞선 상대 */}
							<div className={classes.relationSection}>
								<div className={classes.relationCard}>
									<div className={classes.relationTitle}>
										<span role="img" aria-label="teammates" className={classes.relationTitleIcon}>
											👥
										</span>
										자주 함께한 팀원 Top 5
										{topTeammates && topTeammates.length > 5 && (
											<Button
												size="small"
												className={classes.moreButton}
												onClick={() => setListDialog({ open: true, title: '자주 함께한 팀원', data: topTeammates, type: 'teammate' })}
											>
												전체 {topTeammates.length}명 보기
											</Button>
										)}
									</div>
									{topTeammates && topTeammates.length > 0 ? (
										<div className={classes.relationList}>
											{topTeammates.slice(0, 5).map((teammate, index) => (
												<div key={teammate.puuid} className={classes.relationItem}>
													<span className={classes.relationRank}>{index + 1}</span>
													<span className={classes.relationName}>{teammate.name}</span>
													<div className={classes.relationStats}>
														<span className={classes.relationGames}>
															{teammate.games}판 ({teammate.wins}승 {teammate.games - teammate.wins}패)
														</span>
														<span className={`${classes.relationWinRate} ${getWinRateClass(teammate.winRate)}`}>
															{teammate.winRate}%
														</span>
													</div>
												</div>
											))}
										</div>
									) : (
										<div className={classes.noData}>데이터가 없습니다</div>
									)}
								</div>

								<div className={classes.relationCard}>
									<div className={classes.relationTitle}>
										<span role="img" aria-label="opponents" className={classes.relationTitleIcon}>
											⚔️
										</span>
										자주 맞선 상대 Top 5
										{topOpponents && topOpponents.length > 5 && (
											<Button
												size="small"
												className={classes.moreButton}
												onClick={() => setListDialog({ open: true, title: '자주 맞선 상대', data: topOpponents, type: 'opponent' })}
											>
												전체 {topOpponents.length}명 보기
											</Button>
										)}
									</div>
									{topOpponents && topOpponents.length > 0 ? (
										<div className={classes.relationList}>
											{topOpponents.slice(0, 5).map((opponent, index) => (
												<div key={opponent.puuid} className={classes.relationItem}>
													<span className={classes.relationRank}>{index + 1}</span>
													<span className={classes.relationName}>{opponent.name}</span>
													<div className={classes.relationStats}>
														<span className={classes.relationGames}>
															{opponent.games}판 ({opponent.myWins}승 {opponent.myLosses}패)
														</span>
														<span className={`${classes.relationWinRate} ${getWinRateClass(opponent.winRate)}`}>
															{opponent.winRate}%
														</span>
													</div>
												</div>
											))}
										</div>
									) : (
										<div className={classes.noData}>데이터가 없습니다</div>
									)}
								</div>
							</div>

							{/* 레이팅 차트 */}
							<RatingChart />

							{/* 부캐 설정 - 본인 페이지에서만 */}
							{isMyPage && isLoggedIn && (
								<div className={classes.subAccountSection}>
									<div className={classes.subAccountTitle}>부캐 설정</div>
									{subAccount ? (
										<>
											<div className={classes.subAccountInfo}>
												<span className={classes.subAccountName}>
													<span role="img" aria-label="gamepad">
														&#x1F3AE;
													</span>{' '}
													{subAccount.name}
												</span>
												<Button className={classes.subAccountRemoveBtn} onClick={() => setRemoveDialogOpen(true)}>
													해제
												</Button>
											</div>
											<div className={classes.subAccountNote}>※ 챌린지에서 부캐 전적이 합산됩니다.</div>
										</>
									) : (
										<>
											<div className={classes.subAccountEmpty}>등록된 부캐가 없습니다.</div>
											<div className={classes.subAccountForm}>
												<TextField
													className={classes.subAccountInput}
													label="Riot ID (닉네임#태그)"
													variant="outlined"
													size="small"
													value={subAccountInput}
													onChange={e => setSubAccountInput(e.target.value)}
													onKeyDown={e => e.key === 'Enter' && handleRegisterSubAccount()}
													disabled={subAccountLoading}
												/>
												<Button
													className={classes.subAccountRegisterBtn}
													onClick={handleRegisterSubAccount}
													disabled={subAccountLoading || !subAccountInput.trim()}
												>
													{subAccountLoading ? <CircularProgress size={20} style={{ color: '#000' }} /> : '등록'}
												</Button>
											</div>
										</>
									)}
								</div>
							)}
						</>
					)}

					{/* 부캐 해제 확인 다이얼로그 */}
					<Dialog
						open={removeDialogOpen}
						onClose={() => setRemoveDialogOpen(false)}
						PaperProps={{
							style: {
								background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
								color: '#fff',
								border: '1px solid rgba(255, 107, 107, 0.3)',
								borderRadius: 16
							}
						}}
					>
						<DialogTitle style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>부캐 해제</DialogTitle>
						<DialogContent>
							<DialogContentText
								style={{ fontFamily: '"Noto Sans KR", sans-serif', color: 'rgba(255, 255, 255, 0.7)' }}
							>
								부캐를 해제하시겠습니까? 챌린지에서 부캐 전적이 합산되지 않습니다.
							</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button
								onClick={() => setRemoveDialogOpen(false)}
								style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: '"Noto Sans KR", sans-serif' }}
							>
								취소
							</Button>
							<Button
								onClick={handleRemoveSubAccount}
								style={{ color: '#ff6b6b', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 700 }}
							>
								해제
							</Button>
						</DialogActions>
					</Dialog>

					{/* 더보기 Dialog */}
					<Dialog
						open={listDialog.open}
						onClose={() => setListDialog(prev => ({ ...prev, open: false }))}
						maxWidth="sm"
						fullWidth
						slotProps={{
							paper: {
								className: classes.dialogPaper,
								sx: {
									backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%) !important',
									border: '1px solid rgba(0, 212, 255, 0.25) !important',
									borderRadius: '20px !important',
									boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 212, 255, 0.08) !important'
								}
							}
						}}
					>
						<div className={classes.dialogTitle}>{listDialog.title}</div>
						<div className={classes.dialogSubtitle}>
							{listDialog.data.length}명의 소환사
						</div>
						<DialogContent className={classes.dialogContent}>
							<div className={classes.relationList}>
								{listDialog.data.map((item, index) => (
									<div key={item.puuid} className={classes.dialogListItem}>
										<span className={`${classes.relationRank} ${index < 3 ? classes.dialogRankTop3 : ''}`}>
											{index + 1}
										</span>
										<span className={classes.relationName}>{item.name}</span>
										<div className={classes.relationStats}>
											<span className={classes.relationGames}>
												{listDialog.type === 'teammate'
													? `${item.games}판 (${item.wins}승 ${item.games - item.wins}패)`
													: `${item.games}판 (${item.myWins}승 ${item.myLosses}패)`}
											</span>
											<span className={`${classes.relationWinRate} ${getWinRateClass(item.winRate)}`}>
												{item.winRate}%
											</span>
										</div>
									</div>
								))}
							</div>
						</DialogContent>
						<DialogActions style={{ padding: '12px 28px 24px' }}>
							<Button
								className={classes.dialogCloseButton}
								onClick={() => setListDialog(prev => ({ ...prev, open: false }))}
							>
								닫기
							</Button>
						</DialogActions>
					</Dialog>

					{/* Snackbar */}
					<Snackbar
						className={snack.type === 'success' ? classes.snackSuccess : classes.snackError}
						open={snack.open}
						autoHideDuration={3000}
						onClose={() => setSnack(prev => ({ ...prev, open: false }))}
						message={snack.message}
					/>
				</div>
			}
		/>
	);
}

export default withReducer('MyInfo', reducer)(withReducer('Achievement', achievementReducer)(MyInfoPage));
