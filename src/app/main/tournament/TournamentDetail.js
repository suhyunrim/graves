import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from 'tss-react/mui';
import {
	Typography,
	Button,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Tooltip,
	Tabs,
	Tab,
	FormControlLabel,
	Switch
} from '@mui/material';
import useToast from 'app/utility/useToast';
import { getProfileIconUrl } from 'app/main/challenge/ddragonUtils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService/camilleRiotAuthService';
import { getSocket } from 'app/utility/socketClient';
import useDialogStyles from '../components/dialogStyles';
import reducer from './store/reducers';
import * as Actions from './store/actions';
import {
	STATUS,
	STATUS_LABELS,
	STATUS_COLORS,
	checkIsAdmin,
	bracketSizeForTeamCount,
	getTierName,
	getTierLabel,
	getTierShortLabel,
	getTierEmblemUrl,
	bestOfLabel,
	displayNameForPuuid,
	isValidMatch,
	getTrophyIcon,
	getTotalRoundsFromMatches,
	getTeamStanding,
	getStandingBadgeLabel,
	getStandingSortKey
} from './tournamentUtils';
import { CATEGORY_LABELS } from '../achievementDashboard/constants';
import PositionIcon from './PositionIcon';
import TournamentBracket from './TournamentBracket';
import TeamFormDialog from './TeamFormDialog';
import SlotMappingDialog from './SlotMappingDialog';
import MatchResultDialog from './MatchResultDialog';
import ScrimContent from './ScrimContent';
import PredictionContent from './PredictionContent';
import MatchPredictionDialog from './MatchPredictionDialog';
import TournamentEditDialog from './TournamentEditDialog';
import AuctionStage from './AuctionStage';

const useStyles = makeStyles()((theme) => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh',
		width: '100%',
		maxWidth: '100%',
		overflowX: 'hidden'
	},
	contentWrapperOverride: {
		overflowX: 'hidden !important',
		maxWidth: '100%'
	},
	pageOuter: {
		width: '100%',
		maxWidth: '100vw',
		minWidth: 0,
		overflowX: 'hidden',
		boxSizing: 'border-box'
	},
	headerRoot: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		boxSizing: 'border-box',
		padding: '20px 28px 18px',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		[theme.breakpoints.down('sm')]: {
			padding: '14px 16px 12px'
		}
	},
	backRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginBottom: 8
	},
	backBtn: {
		color: 'rgba(255, 255, 255, 0.5)',
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.08)'
		}
	},
	titleBlock: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		[theme.breakpoints.down('sm')]: {
			gap: 10
		}
	},
	titleTrophy: {
		width: 88,
		height: 88,
		objectFit: 'contain',
		flexShrink: 0,
		filter: 'drop-shadow(0 4px 16px rgba(255, 215, 0, 0.35))',
		[theme.breakpoints.down('md')]: {
			width: 70,
			height: 70
		},
		[theme.breakpoints.down('sm')]: {
			width: 54,
			height: 54
		}
	},
	titleColumn: {
		display: 'flex',
		flexDirection: 'column',
		minWidth: 0,
		flex: 1
	},
	titleRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 14,
		flexWrap: 'wrap'
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '3.2rem',
		color: '#fff',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
		margin: 0,
		[theme.breakpoints.down('md')]: {
			fontSize: '2.4rem'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '2rem',
			letterSpacing: '0.02em'
		}
	},
	statusBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		padding: '4px 14px',
		borderRadius: 20,
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.05rem',
			padding: '3px 10px'
		}
	},
	metaRow: {
		display: 'flex',
		gap: 14,
		marginTop: 10,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.55)',
		flexWrap: 'wrap',
		[theme.breakpoints.down('sm')]: {
			gap: 6,
			fontSize: '1.15rem'
		}
	},
	metaPill: {
		background: 'rgba(0, 212, 255, 0.08)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		borderRadius: 16,
		padding: '3px 12px',
		[theme.breakpoints.down('sm')]: {
			padding: '2px 9px',
			borderRadius: 12
		}
	},
	headerBanner: {
		borderRadius: 14,
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		minWidth: 0,
		wordBreak: 'break-word',
		[theme.breakpoints.down('sm')]: {
			padding: '10px 14px',
			gap: 8,
			borderRadius: 12
		}
	},
	championBanner: {
		marginTop: 14,
		padding: '14px 18px',
		background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.18) 0%, rgba(255, 215, 0, 0.06) 100%)',
		border: '1px solid rgba(255, 215, 0, 0.4)',
		fontSize: '1.6rem',
		color: '#ffd700',
		letterSpacing: '0.03em',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.35rem'
		}
	},
	championIcon: {
		fontSize: '2.4rem',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.8rem'
		}
	},
	championTrophyImg: {
		width: 36,
		height: 36,
		objectFit: 'contain',
		flexShrink: 0,
		[theme.breakpoints.down('sm')]: {
			width: 28,
			height: 28
		}
	},
	predictionPerfectBanner: {
		marginTop: 8,
		padding: '12px 16px',
		background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%)',
		border: '1px solid rgba(0, 212, 255, 0.35)',
		fontSize: '1.45rem',
		color: '#00d4ff',
		letterSpacing: '0.02em',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.25rem'
		}
	},
	predictionPerfectIcon: {
		fontSize: '2rem',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.6rem'
		}
	},
	container: {
		padding: '24px 28px',
		maxWidth: 1400,
		margin: '0 auto',
		width: '100%',
		minWidth: 0,
		boxSizing: 'border-box',
		[theme.breakpoints.down('sm')]: {
			padding: '16px'
		}
	},
	section: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 16,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		padding: '24px 28px',
		marginBottom: 24,
		// 안의 가로 스크롤 영역(브래킷 등)이 페이지로 새지 않도록 격리
		minWidth: 0,
		overflow: 'hidden',
		[theme.breakpoints.down('sm')]: {
			padding: '18px 20px',
			borderRadius: 14
		}
	},
	sectionHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 18,
		gap: 12,
		flexWrap: 'wrap'
	},
	sectionTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.04em',
		textTransform: 'uppercase',
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		'&::before': {
			content: '""',
			display: 'inline-block',
			width: 4,
			height: 22,
			borderRadius: 2,
			background: 'linear-gradient(180deg, #00d4ff, #0066ff)'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.5rem',
			gap: 10,
			'&::before': { height: 18 }
		}
	},
	primaryBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.15rem',
		padding: '6px 16px',
		borderRadius: 10,
		textTransform: 'none',
		boxShadow: '0 4px 14px rgba(0, 212, 255, 0.2)',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)'
		},
		'&.Mui-disabled': {
			background: 'rgba(255, 255, 255, 0.08)',
			color: 'rgba(255, 255, 255, 0.3)',
			boxShadow: 'none'
		}
	},
	dangerBtn: {
		background: 'rgba(255, 107, 107, 0.12)',
		color: '#ff6b6b',
		border: '1px solid rgba(255, 107, 107, 0.3)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 600,
		fontSize: '1.1rem',
		padding: '4px 12px',
		borderRadius: 10,
		textTransform: 'none',
		'&:hover': {
			background: 'rgba(255, 107, 107, 0.22)'
		}
	},
	teamGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
		gap: 14,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr',
			gap: 12
		}
	},
	teamCard: {
		background: 'rgba(0, 0, 0, 0.25)',
		border: '1px solid rgba(0, 212, 255, 0.15)',
		borderRadius: 12,
		padding: '14px 16px',
		[theme.breakpoints.down('sm')]: {
			padding: '12px 14px'
		}
	},
	teamCardHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
		gap: 8
	},
	teamName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: '#00d4ff',
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.35rem'
		}
	},
	teamActions: {
		display: 'flex',
		gap: 4,
		flexShrink: 0
	},
	teamActionBtn: {
		color: 'rgba(255, 255, 255, 0.5)',
		padding: 4,
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.08)'
		}
	},
	teamActionBtnDanger: {
		color: 'rgba(255, 255, 255, 0.5)',
		padding: 4,
		'&:hover': {
			color: '#ff6b6b',
			background: 'rgba(255, 107, 107, 0.08)'
		}
	},
	memberList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 6
	},
	memberRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		padding: '4px 4px',
		marginLeft: -4,
		marginRight: -4,
		borderRadius: 6,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.85)',
		textDecoration: 'none',
		cursor: 'pointer',
		transition: 'background 0.15s ease, color 0.15s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.08)',
			color: '#fff'
		},
		[theme.breakpoints.down('sm')]: {
			gap: 8,
			fontSize: '1.1rem'
		}
	},
	memberPositionCell: {
		width: 22,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0
	},
	memberPositionIcon: {
		width: 20,
		height: 20,
		color: '#00d4ff'
	},
	memberPositionFallback: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(0, 212, 255, 0.7)',
		fontWeight: 600
	},
	memberAvatar: {
		width: 24,
		height: 24,
		borderRadius: 6,
		flexShrink: 0
	},
	memberAvatarPlaceholder: {
		width: 24,
		height: 24,
		borderRadius: 6,
		background: 'rgba(0, 212, 255, 0.15)',
		flexShrink: 0
	},
	memberName: {
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	captainStar: {
		fontSize: '1.2rem',
		color: '#ffd700'
	},
	memberTier: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4,
		flexShrink: 0
	},
	memberTierEmblem: {
		width: 18,
		height: 18,
		opacity: 0.9
	},
	memberTierShort: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.05rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.7)',
		letterSpacing: '0.02em',
		minWidth: 18,
		textAlign: 'right'
	},
	teamTierBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 6,
		marginTop: 2,
		marginBottom: 10,
		padding: '4px 10px',
		borderRadius: 20,
		background: 'rgba(0, 0, 0, 0.3)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 600,
		letterSpacing: '0.02em',
		color: 'rgba(255, 255, 255, 0.85)',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.05rem',
			padding: '3px 9px'
		}
	},
	teamTierEmblem: {
		width: 22,
		height: 22
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: 40
	},
	loadingWrapper: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: 60
	},
	tabs: {
		marginBottom: 20,
		'& .MuiTabs-indicator': {
			background: '#00d4ff'
		}
	},
	tab: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.5)',
		textTransform: 'none',
		minWidth: 100,
		'&.Mui-selected': {
			color: '#00d4ff'
		}
	},
	verboseToggle: {
		marginRight: 0,
		'& .MuiFormControlLabel-label': {
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.15rem',
			color: 'rgba(255, 255, 255, 0.6)'
		},
		'& .MuiSwitch-switchBase.Mui-checked': {
			color: '#00d4ff'
		},
		'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
			backgroundColor: '#00d4ff'
		},
		[theme.breakpoints.down('sm')]: {
			'& .MuiFormControlLabel-label': {
				fontSize: '1.05rem'
			}
		}
	},
	headerActions: {
		marginTop: 14,
		display: 'flex',
		gap: 10,
		flexWrap: 'wrap'
	},
	teamCount: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginLeft: 4
	},
	teamCardChampion: {
		border: '1px solid rgba(255, 215, 0, 0.55)',
		background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
		boxShadow: '0 0 20px rgba(255, 215, 0, 0.15), 0 0 50px rgba(255, 215, 0, 0.06)'
	},
	teamCardRunnerup: {
		border: '1px solid rgba(255, 255, 255, 0.32)',
		background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%)'
	},
	teamCardAlive: {
		border: '1px solid rgba(0, 212, 255, 0.28)'
	},
	teamCardEliminated: {
		opacity: 0.62,
		borderColor: 'rgba(255, 255, 255, 0.08)'
	},
	standingBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4,
		padding: '3px 10px',
		borderRadius: 12,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		fontWeight: 700,
		letterSpacing: '0.05em',
		flexShrink: 0,
		whiteSpace: 'nowrap',
		textTransform: 'uppercase'
	},
	standingBadgeChampion: {
		background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.12))',
		border: '1px solid rgba(255, 215, 0, 0.65)',
		color: '#ffd700',
		boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
	},
	standingBadgeRunnerup: {
		background: 'rgba(255, 255, 255, 0.08)',
		border: '1px solid rgba(255, 255, 255, 0.4)',
		color: 'rgba(255, 255, 255, 0.9)'
	},
	standingBadgeAlive: {
		background: 'rgba(0, 212, 255, 0.06)',
		border: '1px solid rgba(0, 212, 255, 0.28)',
		color: 'rgba(0, 212, 255, 0.9)'
	},
	standingBadgeEliminated: {
		background: 'rgba(255, 255, 255, 0.05)',
		border: '1px solid rgba(255, 255, 255, 0.14)',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	standingBadgeIcon: {
		fontSize: '1.1rem',
		display: 'inline-flex',
		alignItems: 'center'
	}
}));

function TournamentDetail() {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { tournamentId } = useParams();
	const toast = useToast();

	const detail = useSelector(({ Tournament }) => Tournament.tournament.detail);
	const teams = useSelector(({ Tournament }) => Tournament.tournament.teams);
	const matches = useSelector(({ Tournament }) => Tournament.tournament.matches);
	const scrims = useSelector(({ Tournament }) => Tournament.tournament.scrims);
	const roundLabels = useSelector(({ Tournament }) => Tournament.tournament.roundLabels);
	const leaderboard = useSelector(({ Tournament }) => Tournament.tournament.leaderboard);
	const loadingDetail = useSelector(({ Tournament }) => Tournament.tournament.loadingDetail);
	const user = useSelector(state => state.auth.user);
	const isAdmin = checkIsAdmin(user);
	const myPuuid = camilleRiotAuthService.getAuthenticatedPuuid();

	const [teamFormOpen, setTeamFormOpen] = useState(false);
	const [editingTeam, setEditingTeam] = useState(null);
	const [deleteTeamTarget, setDeleteTeamTarget] = useState(null);
	const [slotMappingOpen, setSlotMappingOpen] = useState(false);
	const [matchEditTarget, setMatchEditTarget] = useState(null);
	const [deleteTournamentOpen, setDeleteTournamentOpen] = useState(false);
	const [activeTab, setActiveTab] = useState(0);
	const [bracketVerbose, setBracketVerbose] = useState(false);
	const [matchPredictionTarget, setMatchPredictionTarget] = useState(null);
	const [editTournamentOpen, setEditTournamentOpen] = useState(false);

	const teamMap = useMemo(() => {
		const m = new Map();
		teams.forEach(t => m.set(t.id, t));
		return m;
	}, [teams]);

	const championTeam = detail && detail.championTeamId ? teamMap.get(detail.championTeamId) : null;

	const totalRounds = useMemo(() => getTotalRoundsFromMatches(matches), [matches]);
	const standingMap = useMemo(() => {
		const m = new Map();
		const championTeamId = detail && detail.championTeamId;
		teams.forEach(t => {
			m.set(t.id, getTeamStanding(t.id, matches, championTeamId, totalRounds));
		});
		return m;
	}, [teams, matches, detail, totalRounds]);

	// preparing 이면 등록 순서 유지. 그 외엔 성적순 정렬 (우승 > 준우승 > 살아있음 > 깊은 탈락 > 얕은 탈락).
	const sortedTeams = useMemo(() => {
		const isPrep = detail && detail.status === STATUS.PREPARING;
		if (isPrep || !totalRounds) return teams;
		return [...teams].sort((a, b) => {
			const ka = getStandingSortKey(standingMap.get(a.id));
			const kb = getStandingSortKey(standingMap.get(b.id));
			if (kb !== ka) return kb - ka;
			if ((b.avgRating || 0) !== (a.avgRating || 0)) return (b.avgRating || 0) - (a.avgRating || 0);
			return (a.name || '').localeCompare(b.name || '');
		});
	}, [teams, detail, totalRounds, standingMap]);

	// 정상 매치(BYE 제외) 모두 적중한 사용자 = "이번 토너먼트 승부의신".
	// 진행 중엔 settledCount < validMatchCount 라 자연스럽게 빈 배열.
	const perfectUsers = useMemo(() => {
		const validMatchCount = matches.filter(isValidMatch).length;
		if (validMatchCount === 0) return [];
		return (leaderboard || []).filter(
			u => u.settledCount === validMatchCount && u.correctCount === validMatchCount
		);
	}, [matches, leaderboard]);

	function reload() {
		dispatch(Actions.getTournamentDetail(tournamentId));
	}

	useEffect(() => {
		dispatch(Actions.getTournamentDetail(tournamentId));
		return () => {
			dispatch(Actions.clearTournamentDetail());
		};
	}, [dispatch, tournamentId]);

	const [lastBidPuuid, setLastBidPuuid] = useState(null);

	// 경매 실시간 동기화: 룸 join 후 status/bid/undo 이벤트가 오면 detail 재로드.
	useEffect(() => {
		if (!tournamentId) return undefined;
		const socket = getSocket();
		const tid = Number(tournamentId);
		socket.emit('tournament:join', tid);

		const refresh = () => dispatch(Actions.getTournamentDetail(tournamentId));

		const handleStatus = (payload) => {
			if (payload && payload.tournamentId != null && Number(payload.tournamentId) !== tid) return;
			refresh();
		};
		const handleBid = (payload) => {
			if (payload && payload.tournamentId != null && Number(payload.tournamentId) !== tid) return;
			if (payload && payload.puuid) {
				setLastBidPuuid(payload.puuid);
				// 1.4초 후 강조 해제 — 다음 이벤트 오면 또 갱신됨.
				setTimeout(() => setLastBidPuuid(prev => (prev === payload.puuid ? null : prev)), 1400);
			}
			refresh();
		};
		const handleUndo = (payload) => {
			if (payload && payload.tournamentId != null && Number(payload.tournamentId) !== tid) return;
			refresh();
		};
		socket.on('auction:status', handleStatus);
		socket.on('auction:bid', handleBid);
		socket.on('auction:undo', handleUndo);

		return () => {
			socket.emit('tournament:leave', tid);
			socket.off('auction:status', handleStatus);
			socket.off('auction:bid', handleBid);
			socket.off('auction:undo', handleUndo);
		};
	}, [dispatch, tournamentId]);

	function handleTeamCreate() {
		setEditingTeam(null);
		setTeamFormOpen(true);
	}

	function handleTeamEdit(team) {
		setEditingTeam(team);
		setTeamFormOpen(true);
	}

	function handleTeamFormSuccess() {
		setTeamFormOpen(false);
		setEditingTeam(null);
		toast.success('팀이 저장되었습니다.');
		reload();
	}

	function handleTournamentEditSuccess() {
		setEditTournamentOpen(false);
		toast.success('토너먼트가 수정되었습니다.');
		reload();
	}

	function handleTeamDelete() {
		const target = deleteTeamTarget;
		if (!target) return;
		Actions.deleteTeam(tournamentId, target.id)
			.then(() => {
				setDeleteTeamTarget(null);
				toast.success('팀이 삭제되었습니다.');
				reload();
			})
			.catch(err => {
				const msg = err.response && err.response.data ? err.response.data.result : '삭제 실패';
				toast.error(msg);
			});
	}

	function handleStartSuccess() {
		setSlotMappingOpen(false);
		toast.success('토너먼트가 시작되었습니다.');
		reload();
	}

	function handleStartAuction() {
		Actions.startAuction(tournamentId)
			.then(() => {
				toast.success('경매를 시작했습니다.');
				reload();
			})
			.catch(err => {
				const msg = err.response && err.response.data ? err.response.data.result : '경매 시작 실패';
				toast.error(msg);
			});
	}

	function handleMatchResultSuccess() {
		setMatchEditTarget(null);
		toast.success('매치 결과가 저장되었습니다.');
		reload();
	}

	function handleTournamentDelete() {
		Actions.deleteTournament(tournamentId)
			.then(() => {
				toast.success('토너먼트가 삭제되었습니다.');
				navigate('/tournament?all=1');
			})
			.catch(err => {
				setDeleteTournamentOpen(false);
				const msg = err.response && err.response.data ? err.response.data.result : '삭제 실패';
				toast.error(msg);
			});
	}

	if (loadingDetail && !detail) {
		return (
			<FusePageSimple
				classes={{ root: classes.layoutRoot, contentWrapper: classes.contentWrapperOverride }}
				content={<div className={classes.loadingWrapper}>불러오는 중...</div>}
			/>
		);
	}

	if (!detail) {
		return (
			<FusePageSimple
				classes={{ root: classes.layoutRoot, contentWrapper: classes.contentWrapperOverride }}
				content={<div className={classes.emptyText}>토너먼트를 찾을 수 없습니다.</div>}
			/>
		);
	}

	const statusColor = STATUS_COLORS[detail.status] || '#868e96';
	const isPreparing = detail.status === STATUS.PREPARING;
	const isAuctionStatus = detail.status === STATUS.AUCTION;
	const isInProgress = detail.status === STATUS.IN_PROGRESS;
	const isFinished = detail.status === STATUS.FINISHED;
	const isAuctionType = detail.type === 'auction';
	const auctionConfig = detail.auctionConfig;
	const teamCount = teams.length;
	// auction 완료 후엔 preparing 상태로 돌아오지만, 이미 멤버가 차 있어서 일반 대진 짜기 흐름.
	const auctionMembersComplete = isAuctionType && auctionConfig && teams.length > 0
		&& teams.every(t => (t.members || []).length >= (auctionConfig.teamSize || 5));
	const canStart = isAdmin && isPreparing && teamCount >= 2
		&& (!isAuctionType || auctionMembersComplete);
	const canStartAuction = isAdmin && isPreparing && isAuctionType && !auctionMembersComplete && teamCount >= 2;
	// preparation 단계에선 detail.bracketSize/teamCount 가 null. 시작 시점에 등록된 팀 수로 산출한다.
	const computedBracketSize = bracketSizeForTeamCount(teamCount);

	return (
		<FusePageSimple
			classes={{ root: classes.layoutRoot, contentWrapper: classes.contentWrapperOverride }}
			header={
				<div className={classes.headerRoot}>
					<div className={classes.backRow}>
						<IconButton className={classes.backBtn} onClick={() => navigate('/tournament?all=1')} size="small">
							<ArrowBackIcon />
						</IconButton>
					</div>
					<div className={classes.titleBlock}>
						{detail.trophyType && (
							<img className={classes.titleTrophy} src={getTrophyIcon(detail.trophyType)} alt="" />
						)}
						<div className={classes.titleColumn}>
							<div className={classes.titleRow}>
								<Typography className={classes.title} variant="h4">{detail.name}</Typography>
								<span
									className={classes.statusBadge}
									style={{
										background: `${statusColor}20`,
										color: statusColor,
										border: `1px solid ${statusColor}40`
									}}
								>
									{STATUS_LABELS[detail.status] || detail.status}
								</span>
							</div>
							<div className={classes.metaRow}>
								<span className={classes.metaPill}>
									{detail.bracketSize != null
										? `${detail.teamCount}팀 · ${detail.bracketSize}강`
										: `${teamCount}팀 등록됨`}
								</span>
								<span className={classes.metaPill}>{bestOfLabel(detail.defaultBestOf)}</span>
								<span className={classes.metaPill}>결승 {bestOfLabel(detail.finalBestOf)}</span>
							</div>
						</div>
					</div>
					{championTeam && (
						<div className={cx(classes.headerBanner, classes.championBanner)}>
							{detail.trophyType ? (
								<img className={classes.championTrophyImg} src={getTrophyIcon(detail.trophyType)} alt="" />
							) : (
								<EmojiEventsIcon className={classes.championIcon} />
							)}
							{`우승 — ${championTeam.name}`}
						</div>
					)}
					{isFinished && perfectUsers.length > 0 && (
						<div className={cx(classes.headerBanner, classes.predictionPerfectBanner)}>
							<span className={classes.predictionPerfectIcon} role="img" aria-label="crystal-ball">
								{CATEGORY_LABELS.prediction_perfect.icon}
							</span>
							{CATEGORY_LABELS.prediction_perfect.label} — {perfectUsers.map(u => displayNameForPuuid(u.summonerName, u.userPuuid)).join(', ')}
						</div>
					)}
					{isAdmin && (
						<div className={classes.headerActions}>
							{isPreparing && isAuctionType && !auctionMembersComplete && (
								<Tooltip
									title={canStartAuction ? '' : '팀장이 2명 이상 등록되어야 경매를 시작할 수 있습니다.'}
									arrow
								>
									<span>
										<Button
											className={classes.primaryBtn}
											startIcon={<PlayArrowIcon />}
											onClick={handleStartAuction}
											disabled={!canStartAuction}
										>
											경매 시작
										</Button>
									</span>
								</Tooltip>
							)}
							{isPreparing && (!isAuctionType || auctionMembersComplete) && (
								<Tooltip title={canStart ? '' : '팀이 2개 이상 등록되어야 시작할 수 있습니다.'} arrow>
									<span>
										<Button
											className={classes.primaryBtn}
											startIcon={<PlayArrowIcon />}
											onClick={() => setSlotMappingOpen(true)}
											disabled={!canStart}
										>
											브래킷 배치 & 시작
										</Button>
									</span>
								</Tooltip>
							)}
							<Button
								className={classes.primaryBtn}
								startIcon={<EditIcon />}
								onClick={() => setEditTournamentOpen(true)}
							>
								토너먼트 수정
							</Button>
							<Button
								className={classes.dangerBtn}
								startIcon={<DeleteIcon />}
								onClick={() => setDeleteTournamentOpen(true)}
							>
								토너먼트 삭제
							</Button>
						</div>
					)}
				</div>
			}
			content={
				<div className={classes.pageOuter}>
				<div className={classes.container}>
					{isAuctionStatus && (
						<AuctionStage
							tournament={detail}
							teams={teams}
							isAdmin={isAdmin}
							onChanged={reload}
							lastBidPuuid={lastBidPuuid}
						/>
					)}

					{(isInProgress || isFinished) && (
						<Tabs
							value={activeTab}
							onChange={(_, v) => setActiveTab(v)}
							className={classes.tabs}
						>
							<Tab label="대진표" className={classes.tab} />
							<Tab label="스크림" className={classes.tab} />
							<Tab label="승부의신" className={classes.tab} />
						</Tabs>
					)}

					{(isInProgress || isFinished) && activeTab === 0 && (
						<div className={classes.section}>
							<div className={classes.sectionHeader}>
								<div className={classes.sectionTitle}>대진표</div>
								<FormControlLabel
									className={classes.verboseToggle}
									control={
										<Switch
											size="small"
											checked={bracketVerbose}
											onChange={e => setBracketVerbose(e.target.checked)}
										/>
									}
									label="자세히 보기"
								/>
							</div>
							<TournamentBracket
								matches={matches}
								teams={teams}
								roundLabels={roundLabels}
								championTeamId={detail.championTeamId}
								isInProgress={isInProgress}
								isAdmin={isAdmin}
								onEditMatch={(m) => setMatchEditTarget(m)}
								verbose={bracketVerbose}
								myPuuid={myPuuid}
								onMatchClick={(m) => setMatchPredictionTarget(m)}
							/>
						</div>
					)}

					{(isInProgress || isFinished) && activeTab === 1 && (
						<ScrimContent
							tournamentId={tournamentId}
							teams={teams}
							scrims={scrims}
							onMutated={reload}
						/>
					)}

					{(isInProgress || isFinished) && activeTab === 2 && (
						<div className={classes.section}>
							<div className={classes.sectionHeader}>
								<div className={classes.sectionTitle}>승부의신</div>
							</div>
							<PredictionContent
								tournamentId={tournamentId}
								status={detail.status}
								predictionsLocked={detail.predictionsLocked}
								matches={matches}
								teams={teams}
								leaderboard={leaderboard}
								roundLabels={roundLabels}
								onMutated={reload}
							/>
						</div>
					)}

					{(isPreparing || activeTab === 0) && (
					<div className={classes.section}>
						<div className={classes.sectionHeader}>
							<div className={classes.sectionTitle}>
								참가팀
								<span className={classes.teamCount}>({teamCount})</span>
							</div>
							{isAdmin && isPreparing && (
								<Button
									className={classes.primaryBtn}
									startIcon={<AddIcon />}
									onClick={handleTeamCreate}
								>
									팀 등록
								</Button>
							)}
						</div>
						{teams.length === 0 ? (
							<div className={classes.emptyText}>등록된 팀이 없습니다</div>
						) : (
							<div className={classes.teamGrid}>
								{sortedTeams.map(t => {
									const avgRating = t.avgRating;
									const tierName = getTierName(avgRating);
									const tierLabel = getTierLabel(avgRating);
									const tierEmblem = getTierEmblemUrl(tierName);
									const isCaptain = Boolean(myPuuid) && t.captainPuuid === myPuuid;
									// 종료된 토너먼트는 과거 결과 무결성 때문에 수정 불가. preparing/in_progress 둘 다 허용.
									const canEditTeam = (isAdmin || isCaptain) && !isFinished;
									// 삭제는 매치를 깨뜨리지 않도록 preparing 상태에서만 허용.
									const canDeleteTeam = isAdmin && isPreparing;

									const standing = standingMap.get(t.id);
									const badgeLabel = getStandingBadgeLabel(standing, roundLabels);
									const cardVariantCls = (() => {
										if (!standing) return null;
										if (standing.status === 'champion') return classes.teamCardChampion;
										if (standing.status === 'runnerup') return classes.teamCardRunnerup;
										if (standing.status === 'alive') return classes.teamCardAlive;
										if (standing.status === 'eliminated') return classes.teamCardEliminated;
										return null;
									})();
									const badgeVariantCls = (() => {
										if (!standing) return null;
										if (standing.status === 'champion') return classes.standingBadgeChampion;
										if (standing.status === 'runnerup') return classes.standingBadgeRunnerup;
										if (standing.status === 'alive') return classes.standingBadgeAlive;
										if (standing.status === 'eliminated') return classes.standingBadgeEliminated;
										return null;
									})();

									return (
										<div key={t.id} className={cx(classes.teamCard, cardVariantCls)}>
											<div className={classes.teamCardHeader}>
												<span className={classes.teamName}>{t.name}</span>
												{badgeLabel && (
													<span className={cx(classes.standingBadge, badgeVariantCls)}>
														{standing.status === 'champion' && (
															<EmojiEventsIcon className={classes.standingBadgeIcon} />
														)}
														{badgeLabel}
													</span>
												)}
												{(canEditTeam || canDeleteTeam) && (
													<div className={classes.teamActions}>
														{canEditTeam && (
															<Tooltip title="팀 수정" arrow>
																<IconButton
																	className={classes.teamActionBtn}
																	onClick={() => handleTeamEdit(t)}
																	size="small"
																>
																	<SettingsIcon fontSize="small" />
																</IconButton>
															</Tooltip>
														)}
														{canDeleteTeam && (
															<IconButton
																className={classes.teamActionBtnDanger}
																onClick={() => setDeleteTeamTarget(t)}
																size="small"
															>
																<DeleteIcon fontSize="small" />
															</IconButton>
														)}
													</div>
												)}
											</div>
											{tierLabel && (
												<div className={classes.teamTierBadge}>
													{tierEmblem && (
														<img src={tierEmblem} alt={tierName} className={classes.teamTierEmblem} />
													)}
													팀 평균 {tierLabel}
												</div>
											)}
											<div className={classes.memberList}>
												{(t.members || []).map(m => {
													const displayName = displayNameForPuuid(m.name, m.puuid);
													const avatarUrl = m.profileIconId ? getProfileIconUrl(m.profileIconId) : null;
													const memberTierName = getTierName(m.rating);
													const memberTierLabel = getTierLabel(m.rating);
													const memberTierShort = getTierShortLabel(m.rating);
													const memberTierEmblem = getTierEmblemUrl(memberTierName);
													const isCaptain = t.captainPuuid === m.puuid;
													return (
														<Link
															key={m.puuid}
															to={`/userinfo/${m.puuid}`}
															className={classes.memberRow}
														>
															<div className={classes.memberPositionCell}>
																<PositionIcon
																	position={m.position}
																	className={classes.memberPositionIcon}
																	fallbackClassName={classes.memberPositionFallback}
																/>
															</div>
															{avatarUrl ? (
																<img src={avatarUrl} alt="" className={classes.memberAvatar} />
															) : (
																<div className={classes.memberAvatarPlaceholder} />
															)}
															<span className={classes.memberName}>{displayName}</span>
															{isCaptain && <StarIcon className={classes.captainStar} />}
															{memberTierShort && (
																<span className={classes.memberTier} title={memberTierLabel}>
																	{memberTierEmblem && (
																		<img
																			src={memberTierEmblem}
																			alt=""
																			className={classes.memberTierEmblem}
																		/>
																	)}
																	<span className={classes.memberTierShort}>{memberTierShort}</span>
																</span>
															)}
														</Link>
													);
												})}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
					)}

					{isPreparing && (
						<div className={classes.section}>
							<div className={classes.sectionHeader}>
								<div className={classes.sectionTitle}>승부의신</div>
							</div>
							<PredictionContent
								tournamentId={tournamentId}
								status={detail.status}
								predictionsLocked={detail.predictionsLocked}
								matches={matches}
								teams={teams}
								leaderboard={leaderboard}
								roundLabels={roundLabels}
								onMutated={reload}
							/>
						</div>
					)}

					{teamFormOpen && (
						<TeamFormDialog
							open={teamFormOpen}
							onClose={() => {
								setTeamFormOpen(false);
								setEditingTeam(null);
							}}
							onSuccess={handleTeamFormSuccess}
							tournamentId={tournamentId}
							groupId={detail.groupId}
							team={editingTeam}
							allTeams={teams}
							tournament={detail}
						/>
					)}
					{matchPredictionTarget && (
						<MatchPredictionDialog
							open={Boolean(matchPredictionTarget)}
							onClose={() => setMatchPredictionTarget(null)}
							match={matchPredictionTarget}
							team1={teamMap.get(matchPredictionTarget.team1Id)}
							team2={teamMap.get(matchPredictionTarget.team2Id)}
						/>
					)}
					{editTournamentOpen && (
						<TournamentEditDialog
							open
							onClose={() => setEditTournamentOpen(false)}
							onSuccess={handleTournamentEditSuccess}
							tournament={detail}
						/>
					)}
					{slotMappingOpen && (
						<SlotMappingDialog
							open={slotMappingOpen}
							onClose={() => setSlotMappingOpen(false)}
							onSuccess={handleStartSuccess}
							tournamentId={tournamentId}
							teams={teams}
							bracketSize={computedBracketSize}
						/>
					)}
					{matchEditTarget && (
						<MatchResultDialog
							open={Boolean(matchEditTarget)}
							onClose={() => setMatchEditTarget(null)}
							onSuccess={handleMatchResultSuccess}
							match={matchEditTarget}
							team1={teamMap.get(matchEditTarget.team1Id)}
							team2={teamMap.get(matchEditTarget.team2Id)}
						/>
					)}
					{deleteTeamTarget && (
						<Dialog
							open={Boolean(deleteTeamTarget)}
							onClose={() => setDeleteTeamTarget(null)}
							slotProps={{ paper: { className: dialogClasses.paperDestructive } }}
						>
							<DialogTitle className={dialogClasses.titleDestructive}>팀 삭제</DialogTitle>
							<DialogContent>
								<DialogContentText className={dialogClasses.contentText}>
									‘{deleteTeamTarget.name}’ 팀을 삭제하시겠습니까?
								</DialogContentText>
							</DialogContent>
							<DialogActions>
								<Button
									className={dialogClasses.destructiveCancelBtn}
									onClick={() => setDeleteTeamTarget(null)}
								>
									취소
								</Button>
								<Button
									className={dialogClasses.destructiveConfirmBtn}
									onClick={handleTeamDelete}
								>
									삭제
								</Button>
							</DialogActions>
						</Dialog>
					)}
					{deleteTournamentOpen && (
						<Dialog
							open={deleteTournamentOpen}
							onClose={() => setDeleteTournamentOpen(false)}
							slotProps={{ paper: { className: dialogClasses.paperDestructive } }}
						>
							<DialogTitle className={dialogClasses.titleDestructive}>토너먼트 삭제</DialogTitle>
							<DialogContent>
								<DialogContentText className={dialogClasses.contentText}>
									‘{detail.name}’ 토너먼트와 모든 팀/매치 정보가 삭제됩니다. 계속하시겠습니까?
								</DialogContentText>
							</DialogContent>
							<DialogActions>
								<Button
									className={dialogClasses.destructiveCancelBtn}
									onClick={() => setDeleteTournamentOpen(false)}
								>
									취소
								</Button>
								<Button
									className={dialogClasses.destructiveConfirmBtn}
									onClick={handleTournamentDelete}
								>
									삭제
								</Button>
							</DialogActions>
						</Dialog>
					)}
				</div>
				</div>
			}
		/>
	);
}

export default withReducer('Tournament', reducer)(TournamentDetail);
