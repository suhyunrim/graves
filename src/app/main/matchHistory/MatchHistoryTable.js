import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import SettingsIcon from '@mui/icons-material/Settings';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { makeStyles } from 'tss-react/mui';
import { withStyles } from 'tss-react/mui';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { MatchHistorySkeleton } from '../components/SkeletonLoaders';
import * as Actions from './store/actions';

const tierColors = {
	IRON: '#5C5C5C',
	BRONZE: '#CD7F32',
	SILVER: '#C0C0C0',
	GOLD: '#FFD700',
	PLATINUM: '#00CED1',
	EMERALD: '#50C878',
	DIAMOND: '#B9F2FF',
	MASTER: '#9932CC',
	GRANDMASTER: '#FF4500',
	CHALLENGER: '#F0E68C'
};

const tierThresholds = {
	IRON: 200,
	BRONZE: 300,
	SILVER: 400,
	GOLD: 500,
	PLATINUM: 600,
	EMERALD: 700,
	DIAMOND: 800,
	MASTER: 900,
	GRANDMASTER: 1000,
	CHALLENGER: 1150
};

const tierSteps = ['IV', 'III', 'II', 'I'];

const useStyles = makeStyles()((theme) => ({
	container: {
		padding: '28px',
		maxWidth: 1600,
		margin: '0 auto',
		width: '100%'
	},
	tableWrapper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.2)',
		overflow: 'hidden',
		animation: '$fadeIn 0.6s ease'
	},
	'@keyframes fadeIn': {
		'0%': { opacity: 0, transform: 'translateY(20px)' },
		'100%': { opacity: 1, transform: 'translateY(0)' }
	},
	headerCell: {
		backgroundColor: 'rgba(0, 212, 255, 0.08)',
		color: 'rgba(255, 255, 255, 0.9)',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		textTransform: 'uppercase',
		letterSpacing: '0.08em',
		borderBottom: '2px solid rgba(0, 212, 255, 0.3)',
		padding: '20px 16px'
	},
	winTeamCell: {
		borderLeft: '5px solid #00c853',
		backgroundColor: 'rgba(0, 200, 83, 0.35) !important'
	},
	loseTeamCell: {
		borderLeft: '5px solid #ff5252',
		backgroundColor: 'rgba(255, 82, 82, 0.3) !important'
	},
	winBadge: {
		display: 'inline-block',
		padding: '4px 12px',
		borderRadius: 6,
		background: 'linear-gradient(135deg, #00c853 0%, #00e676 100%)',
		color: '#fff',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700,
		textTransform: 'uppercase',
		letterSpacing: '0.05em',
		marginBottom: 8,
		boxShadow: '0 2px 8px rgba(0, 200, 83, 0.4)'
	},
	loseBadge: {
		display: 'inline-block',
		padding: '4px 12px',
		borderRadius: 6,
		background: 'linear-gradient(135deg, #ff5252 0%, #ff1744 100%)',
		color: '#fff',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700,
		textTransform: 'uppercase',
		letterSpacing: '0.05em',
		marginBottom: 8,
		boxShadow: '0 2px 8px rgba(255, 82, 82, 0.4)'
	},
	matchIdCell: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#00d4ff',
		textAlign: 'center',
		minWidth: 60
	},
	dateCell: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.7)',
		whiteSpace: 'nowrap'
	},
	avgRatingWrapper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 6
	},
	avgTierDisplay: {
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	avgTierIcon: {
		width: 32,
		height: 32,
		transition: 'transform 0.2s ease',
		'&:hover': {
			transform: 'scale(1.15)'
		}
	},
	avgTierBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700,
		minWidth: 48,
		textAlign: 'center',
		padding: '3px 8px',
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.1)'
	},
	lpChange: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		marginTop: 2
	},
	ratingChange: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600
	},
	ratingUp: {
		color: '#00e676',
		textShadow: '0 0 8px rgba(0, 230, 118, 0.5)'
	},
	ratingDown: {
		color: '#ff5252',
		textShadow: '0 0 8px rgba(255, 82, 82, 0.5)'
	},
	ratingNeutral: {
		color: 'rgba(255, 255, 255, 0.5)'
	},
	playerList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 8
	},
	playerRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		padding: '4px 0'
	},
	tierIcon: {
		width: 28,
		height: 28,
		transition: 'transform 0.2s ease',
		'&:hover': {
			transform: 'scale(1.2)'
		}
	},
	tierBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		minWidth: 40,
		textAlign: 'center',
		padding: '2px 6px',
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.1)'
	},
	playerName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 500,
		color: '#fff',
		cursor: 'pointer'
	},
	playerNameHighlight: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.15)',
		padding: '2px 8px',
		borderRadius: 4,
		textShadow: '0 0 8px rgba(0, 212, 255, 0.5)',
		cursor: 'pointer'
	},
	teamLabel: {
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	teamEmoji: {
		fontSize: '1.6rem'
	},
	vsCell: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.3)',
		textAlign: 'center',
		padding: '0 8px'
	},
	pagination: {
		color: 'rgba(255, 255, 255, 0.7)',
		borderTop: '1px solid rgba(255, 255, 255, 0.1)',
		'& .MuiTablePagination-selectIcon': {
			color: 'rgba(255, 255, 255, 0.5)'
		},
		'& .MuiIconButton-root': {
			color: 'rgba(255, 255, 255, 0.5)'
		},
		'& .MuiIconButton-root.Mui-disabled': {
			color: 'rgba(255, 255, 255, 0.2)'
		},
		'& .MuiSelect-icon': {
			color: 'rgba(255, 255, 255, 0.5)'
		}
	},
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '80px 20px',
		textAlign: 'center'
	},
	emptyIcon: {
		fontSize: '5rem',
		marginBottom: 20,
		opacity: 0.5
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	// Mobile card styles
	mobileCardList: {
		padding: '16px'
	},
	mobileCard: {
		background: 'rgba(255, 255, 255, 0.03)',
		borderRadius: 16,
		marginBottom: 16,
		border: '1px solid rgba(255, 255, 255, 0.08)',
		overflow: 'hidden'
	},
	mobileCardHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: '12px 16px',
		background: 'rgba(0, 212, 255, 0.08)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
	},
	mobileMatchId: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#00d4ff'
	},
	mobileDate: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.6)'
	},
	mobileTeamSection: {
		padding: '12px 16px'
	},
	mobileTeamWin: {
		borderLeft: '4px solid #00c853',
		background: 'rgba(0, 200, 83, 0.08)'
	},
	mobileTeamLose: {
		borderLeft: '4px solid #ff5252',
		background: 'rgba(255, 82, 82, 0.05)'
	},
	mobileTeamHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10
	},
	mobileTeamInfo: {
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	mobileTeamEmoji: {
		fontSize: '1.4rem'
	},
	mobileTeamName: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.8)'
	},
	mobileBadgeWin: {
		padding: '3px 10px',
		borderRadius: 4,
		background: 'linear-gradient(135deg, #00c853 0%, #00e676 100%)',
		color: '#fff',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		fontWeight: 700,
		textTransform: 'uppercase'
	},
	mobileBadgeLose: {
		padding: '3px 10px',
		borderRadius: 4,
		background: 'linear-gradient(135deg, #ff5252 0%, #ff1744 100%)',
		color: '#fff',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		fontWeight: 700,
		textTransform: 'uppercase'
	},
	mobileRatingInfo: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-end',
		gap: 2
	},
	mobileAvgTierRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 4
	},
	mobileAvgTierIcon: {
		width: 20,
		height: 20
	},
	mobileAvgTierBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		fontWeight: 700,
		padding: '2px 6px',
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.1)'
	},
	mobileLpChange: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 600
	},
	mobileRatingChange: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600
	},
	mobilePlayerList: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: 6
	},
	mobilePlayerChip: {
		display: 'flex',
		alignItems: 'center',
		gap: 4,
		padding: '4px 8px',
		background: 'rgba(255, 255, 255, 0.06)',
		borderRadius: 6
	},
	mobilePlayerTierIcon: {
		width: 18,
		height: 18
	},
	mobilePlayerTier: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.9rem',
		fontWeight: 700
	},
	mobilePlayerName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: '#fff',
		cursor: 'pointer'
	},
	mobilePlayerNameHighlight: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		fontWeight: 700,
		color: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.15)',
		padding: '1px 6px',
		borderRadius: 4,
		textShadow: '0 0 6px rgba(0, 212, 255, 0.5)',
		cursor: 'pointer'
	},
	mobileVsDivider: {
		textAlign: 'center',
		padding: '6px 0',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.2)',
		background: 'rgba(0, 0, 0, 0.2)'
	},
	settingsBtn: {
		color: 'rgba(255, 255, 255, 0.4)',
		padding: 6,
		'&:hover': {
			color: '#00d4ff',
			backgroundColor: 'rgba(0, 212, 255, 0.1)'
		}
	},
	settingsIcon: {
		fontSize: '1.6rem'
	},
	dialogPaper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		borderRadius: 16,
		color: '#fff',
		minWidth: 360,
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 16
		}
	},
	dialogTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		color: '#00d4ff',
		borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
	},
	dialogContent: {
		paddingTop: '24px !important'
	},
	dialogInput: {
		'& .MuiInputBase-root': {
			color: '#fff'
		},
		'& .MuiInputLabel-root': {
			color: 'rgba(255, 255, 255, 0.6)'
		},
		'& .MuiInput-underline:before': {
			borderBottomColor: 'rgba(255, 255, 255, 0.2)'
		},
		'& .MuiInput-underline:hover:before': {
			borderBottomColor: 'rgba(0, 212, 255, 0.5)'
		},
		'& .MuiInput-underline:after': {
			borderBottomColor: '#00d4ff'
		}
	},
	formLabel: {
		color: 'rgba(255, 255, 255, 0.7)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		'&.Mui-focused': {
			color: '#00d4ff'
		}
	},
	radioLabel: {
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem'
	},
	radio: {
		color: 'rgba(255, 255, 255, 0.4)',
		'&.Mui-checked': {
			color: '#00d4ff'
		}
	},
	dialogCancelBtn: {
		color: 'rgba(255, 255, 255, 0.5)'
	},
	dialogConfirmBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0094ff 100%)',
		color: '#fff',
		fontWeight: 700,
		borderRadius: 8,
		padding: '6px 20px',
		'&:hover': {
			background: 'linear-gradient(135deg, #00b8e6 0%, #0080e6 100%)'
		},
		'&.Mui-disabled': {
			background: 'rgba(255, 255, 255, 0.1)',
			color: 'rgba(255, 255, 255, 0.3)'
		}
	}
}));

const StyledTableCell = withStyles(TableCell, (theme) => ({
	body: {
		backgroundColor: 'transparent',
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		padding: '16px'
	}
}));

const StyledTableRow = withStyles(TableRow, (theme) => ({
	root: {
		transition: 'background-color 0.2s ease',
		'&:hover': {
			backgroundColor: 'rgba(0, 212, 255, 0.05)'
		}
	}
}));

function MatchHistoryTable() {
	const { classes } = useStyles();
	const dispatch = useDispatch();
	const history = useHistory();

	const user = useSelector(state => state.auth.user);
	const matches = useSelector(({ MatchHistory }) => MatchHistory.matchHistory.matches);
	const total = useSelector(({ MatchHistory }) => MatchHistory.matchHistory.total);
	const serverPage = useSelector(({ MatchHistory }) => MatchHistory.matchHistory.page);
	const searchText = useSelector(({ MatchHistory }) => MatchHistory.matchHistory.searchText);

	const isAdmin = user?.reprGroup?.isAdmin;

	const rowsPerPage = 10;
	const debounceTimer = useRef(null);

	// 복제 관련 상태
	const [menuAnchorEl, setMenuAnchorEl] = useState(null);
	const [menuMatch, setMenuMatch] = useState(null);
	const [dupDialogOpen, setDupDialogOpen] = useState(false);
	const [dupDate, setDupDate] = useState('');
	const [dupWinTeam, setDupWinTeam] = useState('1');
	const [dupLoading, setDupLoading] = useState(false);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [cancelLoading, setCancelLoading] = useState(false);

	const handleMenuOpen = (event, match) => {
		event.stopPropagation();
		setMenuAnchorEl(event.currentTarget);
		setMenuMatch(match);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
		setMenuMatch(null);
	};

	const toLocalDatetimeString = date => {
		const d = new Date(date);
		const pad = n => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
			d.getMinutes()
		)}`;
	};

	const handleDuplicateClick = () => {
		setMenuAnchorEl(null);
		const baseDate = new Date(menuMatch.createdAt);
		baseDate.setSeconds(baseDate.getSeconds() + 30);
		setDupDate(toLocalDatetimeString(baseDate));
		setDupWinTeam(String(menuMatch.winTeam));
		setDupDialogOpen(true);
	};

	const handleDupDialogClose = () => {
		setDupDialogOpen(false);
		setMenuMatch(null);
	};

	const handleDuplicateSubmit = () => {
		if (!menuMatch || !dupDate) return;
		setDupLoading(true);
		const dateToSend = new Date(dupDate).toISOString();
		dispatch(Actions.duplicateMatch(user.reprGroup.groupId, menuMatch.gameId, dateToSend, Number(dupWinTeam)))
			.then(() => {
				setDupDialogOpen(false);
				setMenuMatch(null);
				dispatch(Actions.getMatchHistory(user.reprGroup.groupId, 1, rowsPerPage, searchText));
			})
			.finally(() => {
				setDupLoading(false);
			});
	};

	const handleCancelClick = () => {
		setMenuAnchorEl(null);
		setCancelDialogOpen(true);
	};

	const handleCancelDialogClose = () => {
		setCancelDialogOpen(false);
		setMenuMatch(null);
	};

	const handleCancelSubmit = () => {
		if (!menuMatch) return;
		setCancelLoading(true);
		dispatch(Actions.cancelMatch(user.reprGroup.groupId, menuMatch.gameId))
			.then(() => {
				setCancelDialogOpen(false);
				setMenuMatch(null);
				dispatch(Actions.getMatchHistory(user.reprGroup.groupId, serverPage, rowsPerPage, searchText));
			})
			.finally(() => {
				setCancelLoading(false);
			});
	};

	useEffect(() => {
		dispatch(Actions.getMatchHistory(user.reprGroup.groupId, 1, rowsPerPage));
	}, [dispatch, user]);

	useEffect(() => {
		if (debounceTimer.current) clearTimeout(debounceTimer.current);
		debounceTimer.current = setTimeout(() => {
			dispatch(Actions.getMatchHistory(user.reprGroup.groupId, 1, rowsPerPage, searchText));
		}, 400);
		return () => clearTimeout(debounceTimer.current);
	}, [searchText, dispatch, user]);

	const handleChangePage = (event, newPage) => {
		dispatch(Actions.getMatchHistory(user.reprGroup.groupId, newPage + 1, rowsPerPage, searchText));
	};

	const formatDate = utcDateString => {
		const date = new Date(utcDateString);
		const year = String(date.getFullYear()).slice(-2);
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day} ${hours}:${minutes}`;
	};

	const getTierShortName = tier => {
		if (!tier) return '';
		const parts = tier.split(' ');
		const tierName = parts[0];
		const tierRank = parts[1];

		const tierMap = {
			IRON: 'I',
			BRONZE: 'B',
			SILVER: 'S',
			GOLD: 'G',
			PLATINUM: 'P',
			EMERALD: 'E',
			DIAMOND: 'D',
			MASTER: 'M',
			GRANDMASTER: 'GM',
			CHALLENGER: 'C'
		};

		const rankMap = {
			I: '1',
			II: '2',
			III: '3',
			IV: '4'
		};

		const shortTier = tierMap[tierName] || tierName.charAt(0);
		const shortRank = rankMap[tierRank] || '';

		return `${shortTier}${shortRank}`;
	};

	const getTierIconName = tier => {
		if (!tier) return 'UNRANKED';
		return tier.split(' ')[0];
	};

	const getTierColor = tier => {
		if (!tier) return '#fff';
		const tierName = tier.split(' ')[0];
		return tierColors[tierName] || '#fff';
	};

	const isNonStepTier = tierName => {
		return tierName === 'MASTER' || tierName === 'GRANDMASTER' || tierName === 'CHALLENGER';
	};

	const getTierNameFromRating = rating => {
		const entries = Object.entries(tierThresholds).sort((a, b) => b[1] - a[1]);
		const found = entries.find(([, tierRating]) => rating >= tierRating);
		return found ? found[0] : 'IRON';
	};

	const getRatingTierName = rating => {
		const entries = Object.entries(tierThresholds).sort((a, b) => b[1] - a[1]);
		const found = entries.find(([, tierRating]) => rating >= tierRating);
		if (!found) return 'IRON IV';
		const [name, tierRating] = found;
		if (isNonStepTier(name)) {
			return name;
		}
		return `${name} ${tierSteps[Math.floor((rating - tierRating) / 25)]}`;
	};

	const isPlayerMatched = playerName => {
		if (!searchText) return false;
		return playerName.toLowerCase().includes(searchText.toLowerCase());
	};

	const renderPlayers = players => {
		const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
		return sortedPlayers.map(player => (
			<div key={player.puuid} className={classes.playerRow}>
				<img
					className={classes.tierIcon}
					src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(player.tier)}.webp`}
					alt={player.tier}
					style={{ filter: `drop-shadow(0 0 4px ${getTierColor(player.tier)}40)` }}
				/>
				<span className={classes.tierBadge} style={{ color: getTierColor(player.tier) }}>
					{getTierShortName(player.tier)}
				</span>
				<span
					className={isPlayerMatched(player.name) ? classes.playerNameHighlight : classes.playerName}
					onClick={() => history.push(`/userinfo/${player.puuid}`)}
				>
					{player.name}
				</span>
			</div>
		));
	};

	const renderLpChange = ratingChange => {
		const lp = ratingChange * 4;
		if (lp > 0) {
			return <span className={`${classes.lpChange} ${classes.ratingUp}`}>+{lp} LP</span>;
		}
		if (lp < 0) {
			return <span className={`${classes.lpChange} ${classes.ratingDown}`}>{lp} LP</span>;
		}
		return <span className={`${classes.lpChange} ${classes.ratingNeutral}`}>0 LP</span>;
	};

	const renderMobileLpChange = ratingChange => {
		const lp = ratingChange * 4;
		if (lp > 0) {
			return <span className={`${classes.mobileLpChange} ${classes.ratingUp}`}>+{lp} LP</span>;
		}
		if (lp < 0) {
			return <span className={`${classes.mobileLpChange} ${classes.ratingDown}`}>{lp} LP</span>;
		}
		return <span className={`${classes.mobileLpChange} ${classes.ratingNeutral}`}>0 LP</span>;
	};

	const renderMobilePlayers = players => {
		const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
		return sortedPlayers.map(player => (
			<div key={player.puuid} className={classes.mobilePlayerChip}>
				<img
					className={classes.mobilePlayerTierIcon}
					src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(player.tier)}.webp`}
					alt={player.tier}
				/>
				<span className={classes.mobilePlayerTier} style={{ color: getTierColor(player.tier) }}>
					{getTierShortName(player.tier)}
				</span>
				<span
					className={isPlayerMatched(player.name) ? classes.mobilePlayerNameHighlight : classes.mobilePlayerName}
					onClick={() => history.push(`/userinfo/${player.puuid}`)}
				>
					{player.name}
				</span>
			</div>
		));
	};

	if (!matches) {
		return <MatchHistorySkeleton />;
	}

	const getDisplayId = index => total - ((serverPage - 1) * rowsPerPage + index);

	const renderDuplicateDialog = () => (
		<>
			<Menu
				anchorEl={menuAnchorEl}
				open={Boolean(menuAnchorEl)}
				onClose={handleMenuClose}
				PaperProps={{
					style: {
						background: '#1a1a2e',
						border: '1px solid rgba(0, 212, 255, 0.3)',
						color: '#fff'
					}
				}}
			>
				<MenuItem
					onClick={handleDuplicateClick}
					style={{ fontFamily: '"Noto Sans KR", sans-serif', fontSize: '1.2rem' }}
				>
					<span role="img" aria-label="copy" style={{ marginRight: 8 }}>
						📋
					</span>
					복제
				</MenuItem>
				{menuMatch && menuMatch.winTeam && (
					<MenuItem
						onClick={handleCancelClick}
						style={{ fontFamily: '"Noto Sans KR", sans-serif', fontSize: '1.2rem', color: '#ff5252' }}
					>
						<span role="img" aria-label="cancel" style={{ marginRight: 8 }}>
							❌
						</span>
						취소
					</MenuItem>
				)}
			</Menu>
			<Dialog open={dupDialogOpen} onClose={handleDupDialogClose} classes={{ paper: classes.dialogPaper }}>
				<DialogTitle className={classes.dialogTitle}>매치 복제</DialogTitle>
				<DialogContent className={classes.dialogContent}>
					{menuMatch && (
						<div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
							{[menuMatch.team1, menuMatch.team2].map((team, ti) => (
								<div key={ti} style={{ flex: 1 }}>
									<div
										style={{
											fontFamily: '"Rajdhani", sans-serif',
											fontSize: '1.1rem',
											fontWeight: 700,
											color: 'rgba(255,255,255,0.7)',
											marginBottom: 8
										}}
									>
										<span role="img" aria-label={ti === 0 ? 'dog' : 'cat'}>
											{ti === 0 ? '🐶' : '🐱'}
										</span>{' '}
										Team {ti + 1}
									</div>
									{[...team.players]
										.sort((a, b) => b.rating - a.rating)
										.map(player => (
											<div
												key={player.puuid}
												style={{
													display: 'flex',
													alignItems: 'center',
													gap: 6,
													padding: '3px 0',
													fontFamily: '"Noto Sans KR", sans-serif',
													fontSize: '1.1rem',
													color: '#fff'
												}}
											>
												<img
													src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(player.tier)}.webp`}
													alt={player.tier}
													style={{ width: 20, height: 20 }}
												/>
												<span
													style={{
														color: getTierColor(player.tier),
														fontFamily: '"Rajdhani", sans-serif',
														fontWeight: 700,
														fontSize: '1rem'
													}}
												>
													{getTierShortName(player.tier)}
												</span>
												<span>{player.name}</span>
											</div>
										))}
								</div>
							))}
						</div>
					)}
					<TextField
						label="날짜 및 시간"
						type="datetime-local"
						value={dupDate}
						onChange={e => setDupDate(e.target.value)}
						className={classes.dialogInput}
						fullWidth
						InputLabelProps={{ shrink: true }}
						style={{ marginBottom: 24 }}
					/>
					<FormControl component="fieldset">
						<FormLabel component="legend" className={classes.formLabel}>
							승리팀
						</FormLabel>
						<RadioGroup row value={dupWinTeam} onChange={e => setDupWinTeam(e.target.value)}>
							<FormControlLabel
								value="1"
								control={<Radio className={classes.radio} />}
								label={
									<span className={classes.radioLabel}>
										<span role="img" aria-label="dog">
											🐶
										</span>{' '}
										Team 1
									</span>
								}
							/>
							<FormControlLabel
								value="2"
								control={<Radio className={classes.radio} />}
								label={
									<span className={classes.radioLabel}>
										<span role="img" aria-label="cat">
											🐱
										</span>{' '}
										Team 2
									</span>
								}
							/>
						</RadioGroup>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDupDialogClose} className={classes.dialogCancelBtn}>
						취소
					</Button>
					<Button
						onClick={handleDuplicateSubmit}
						className={classes.dialogConfirmBtn}
						disabled={!dupDate || dupLoading}
					>
						{dupLoading ? <CircularProgress size={20} color="inherit" /> : '복제'}
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={cancelDialogOpen} onClose={handleCancelDialogClose} classes={{ paper: classes.dialogPaper }}>
				<DialogTitle className={classes.dialogTitle}>매치 취소</DialogTitle>
				<DialogContent className={classes.dialogContent}>
					<span
						style={{ fontFamily: '"Noto Sans KR", sans-serif', fontSize: '1.3rem', color: 'rgba(255,255,255,0.8)' }}
					>
						정말 이 매치를 취소하시겠습니까?
						<br />
						<span style={{ color: '#ff5252', fontSize: '1.1rem' }}>
							레이팅이 롤백되고 명예 투표 데이터가 삭제됩니다.
						</span>
					</span>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCancelDialogClose} className={classes.dialogCancelBtn}>
						아니오
					</Button>
					<Button
						onClick={handleCancelSubmit}
						disabled={cancelLoading}
						style={{
							background: 'linear-gradient(135deg, #ff5252 0%, #ff1744 100%)',
							color: '#fff',
							fontWeight: 700,
							borderRadius: 8,
							padding: '6px 20px'
						}}
					>
						{cancelLoading ? <CircularProgress size={20} color="inherit" /> : '취소하기'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);

	return (
        <div className={classes.container}>
            {isAdmin && renderDuplicateDialog()}
            <div className={classes.tableWrapper}>
				{matches && matches.length > 0 ? (
					<>
						{/* Desktop Table View */}
						<Box sx={{ display: { xs: 'none', md: 'block' } }}>
							<FuseScrollbars className="flex-grow overflow-x-auto">
								<Table>
									<TableHead>
										<TableRow>
											<TableCell className={classes.headerCell} align="center">
												#
											</TableCell>
											<TableCell className={classes.headerCell}>날짜</TableCell>
											<TableCell className={classes.headerCell} align="center">
												평균
											</TableCell>
											<TableCell className={classes.headerCell}>
												<span className={classes.teamLabel}>
													<span role="img" aria-label="dog" className={classes.teamEmoji}>
														🐶
													</span>{' '}
													Team 1
												</span>
											</TableCell>
											<TableCell className={classes.headerCell} align="center">
												평균
											</TableCell>
											<TableCell className={classes.headerCell}>
												<span className={classes.teamLabel}>
													<span role="img" aria-label="cat" className={classes.teamEmoji}>
														🐱
													</span>{' '}
													Team 2
												</span>
											</TableCell>
											{isAdmin && <TableCell className={classes.headerCell} style={{ width: 48 }} />}
										</TableRow>
									</TableHead>
									<TableBody>
										{matches.map((match, index) => {
											const isTeam1Win = match.winTeam === 1;
											const displayId = getDisplayId(matches.indexOf(match));
											return (
												<StyledTableRow key={match.gameId}>
													<StyledTableCell>
														<span className={classes.matchIdCell}>{displayId}</span>
													</StyledTableCell>
													<StyledTableCell>
														<span className={classes.dateCell}>{formatDate(match.createdAt)}</span>
													</StyledTableCell>
													<StyledTableCell
														align="center"
														className={isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}
													>
														<div className={classes.avgRatingWrapper}>
															<div className={classes.avgTierDisplay}>
																<img
																	className={classes.avgTierIcon}
																	src={`/assets/images/ranked-emblems/Emblem_${getTierNameFromRating(
																		match.team1.avgRating
																	)}.webp`}
																	alt={getRatingTierName(match.team1.avgRating)}
																	style={{
																		filter: `drop-shadow(0 0 4px ${
																			tierColors[getTierNameFromRating(match.team1.avgRating)]
																		}40)`
																	}}
																/>
																<span
																	className={classes.avgTierBadge}
																	style={{ color: tierColors[getTierNameFromRating(match.team1.avgRating)] }}
																>
																	{getTierShortName(getRatingTierName(match.team1.avgRating))}
																</span>
															</div>
															{renderLpChange(match.team1.ratingChange)}
														</div>
													</StyledTableCell>
													<StyledTableCell className={isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}>
														<div>
															<span className={isTeam1Win ? classes.winBadge : classes.loseBadge}>
																{isTeam1Win ? 'WIN' : 'LOSE'}
															</span>
														</div>
														<div className={classes.playerList}>{renderPlayers(match.team1.players)}</div>
													</StyledTableCell>
													<StyledTableCell
														align="center"
														className={!isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}
													>
														<div className={classes.avgRatingWrapper}>
															<div className={classes.avgTierDisplay}>
																<img
																	className={classes.avgTierIcon}
																	src={`/assets/images/ranked-emblems/Emblem_${getTierNameFromRating(
																		match.team2.avgRating
																	)}.webp`}
																	alt={getRatingTierName(match.team2.avgRating)}
																	style={{
																		filter: `drop-shadow(0 0 4px ${
																			tierColors[getTierNameFromRating(match.team2.avgRating)]
																		}40)`
																	}}
																/>
																<span
																	className={classes.avgTierBadge}
																	style={{ color: tierColors[getTierNameFromRating(match.team2.avgRating)] }}
																>
																	{getTierShortName(getRatingTierName(match.team2.avgRating))}
																</span>
															</div>
															{renderLpChange(match.team2.ratingChange)}
														</div>
													</StyledTableCell>
													<StyledTableCell className={!isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}>
														<div>
															<span className={!isTeam1Win ? classes.winBadge : classes.loseBadge}>
																{!isTeam1Win ? 'WIN' : 'LOSE'}
															</span>
														</div>
														<div className={classes.playerList}>{renderPlayers(match.team2.players)}</div>
													</StyledTableCell>
													{isAdmin && (
														<StyledTableCell align="center" style={{ padding: '8px 4px' }}>
															<IconButton
																className={classes.settingsBtn}
																size="small"
																onClick={e => handleMenuOpen(e, match)}
															>
																<SettingsIcon className={classes.settingsIcon} />
															</IconButton>
														</StyledTableCell>
													)}
												</StyledTableRow>
											);
										})}
									</TableBody>
								</Table>
							</FuseScrollbars>
						</Box>

						{/* Mobile Card View */}
						<Box sx={{ display: { md: 'none' } }}>
							<div className={classes.mobileCardList}>
								{matches.map((match, index) => {
									const isTeam1Win = match.winTeam === 1;
									const displayId = getDisplayId(matches.indexOf(match));
									return (
										<div key={match.gameId} className={classes.mobileCard}>
											<div className={classes.mobileCardHeader}>
												<span className={classes.mobileMatchId}>#{displayId}</span>
												<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
													<span className={classes.mobileDate}>{formatDate(match.createdAt)}</span>
													{isAdmin && (
														<IconButton
															className={classes.settingsBtn}
															size="small"
															onClick={e => handleMenuOpen(e, match)}
														>
															<SettingsIcon className={classes.settingsIcon} />
														</IconButton>
													)}
												</div>
											</div>
											{/* Team 1 */}
											<div
												className={`${classes.mobileTeamSection} ${
													isTeam1Win ? classes.mobileTeamWin : classes.mobileTeamLose
												}`}
											>
												<div className={classes.mobileTeamHeader}>
													<div className={classes.mobileTeamInfo}>
														<span role="img" aria-label="dog" className={classes.mobileTeamEmoji}>
															🐶
														</span>
														<span className={classes.mobileTeamName}>Team 1</span>
														<span className={isTeam1Win ? classes.mobileBadgeWin : classes.mobileBadgeLose}>
															{isTeam1Win ? 'WIN' : 'LOSE'}
														</span>
													</div>
													<div className={classes.mobileRatingInfo}>
														<div className={classes.mobileAvgTierRow}>
															<img
																className={classes.mobileAvgTierIcon}
																src={`/assets/images/ranked-emblems/Emblem_${getTierNameFromRating(
																	match.team1.avgRating
																)}.webp`}
																alt={getRatingTierName(match.team1.avgRating)}
															/>
															<span
																className={classes.mobileAvgTierBadge}
																style={{ color: tierColors[getTierNameFromRating(match.team1.avgRating)] }}
															>
																{getTierShortName(getRatingTierName(match.team1.avgRating))}
															</span>
														</div>
														{renderMobileLpChange(match.team1.ratingChange)}
													</div>
												</div>
												<div className={classes.mobilePlayerList}>{renderMobilePlayers(match.team1.players)}</div>
											</div>
											{/* VS Divider */}
											<div className={classes.mobileVsDivider}>VS</div>
											{/* Team 2 */}
											<div
												className={`${classes.mobileTeamSection} ${
													!isTeam1Win ? classes.mobileTeamWin : classes.mobileTeamLose
												}`}
											>
												<div className={classes.mobileTeamHeader}>
													<div className={classes.mobileTeamInfo}>
														<span role="img" aria-label="cat" className={classes.mobileTeamEmoji}>
															🐱
														</span>
														<span className={classes.mobileTeamName}>Team 2</span>
														<span className={!isTeam1Win ? classes.mobileBadgeWin : classes.mobileBadgeLose}>
															{!isTeam1Win ? 'WIN' : 'LOSE'}
														</span>
													</div>
													<div className={classes.mobileRatingInfo}>
														<div className={classes.mobileAvgTierRow}>
															<img
																className={classes.mobileAvgTierIcon}
																src={`/assets/images/ranked-emblems/Emblem_${getTierNameFromRating(
																	match.team2.avgRating
																)}.webp`}
																alt={getRatingTierName(match.team2.avgRating)}
															/>
															<span
																className={classes.mobileAvgTierBadge}
																style={{ color: tierColors[getTierNameFromRating(match.team2.avgRating)] }}
															>
																{getTierShortName(getRatingTierName(match.team2.avgRating))}
															</span>
														</div>
														{renderMobileLpChange(match.team2.ratingChange)}
													</div>
												</div>
												<div className={classes.mobilePlayerList}>{renderMobilePlayers(match.team2.players)}</div>
											</div>
										</div>
									);
								})}
							</div>
						</Box>

						<TablePagination
							className={classes.pagination}
							component="div"
							count={total}
							rowsPerPage={rowsPerPage}
							rowsPerPageOptions={[]}
							page={serverPage - 1}
							backIconButtonProps={{ 'aria-label': 'Previous Page' }}
							nextIconButtonProps={{ 'aria-label': 'Next Page' }}
							onPageChange={handleChangePage}
						/>
					</>
				) : (
					<div className={classes.emptyState}>
						<div className={classes.emptyIcon}>
							<span role="img" aria-label="scroll">
								📜
							</span>
						</div>
						<div className={classes.emptyText}>매치 기록이 없습니다</div>
					</div>
				)}
			</div>
        </div>
    );
}

export default MatchHistoryTable;
