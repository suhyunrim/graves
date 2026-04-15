import FuseScrollbars from '@fuse/core/FuseScrollbars';
import _ from '@lodash';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { makeStyles } from 'tss-react/mui';
import { withStyles } from 'tss-react/mui';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { RankingTableSkeleton } from '../components/SkeletonLoaders';
import * as Actions from './store/actions';
import RankingTableHead from './RankingTableHeader';

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

const useStyles = makeStyles()((theme) => ({
	container: {
		padding: '28px',
		maxWidth: 1400,
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
	rankingNumber: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		minWidth: 50,
		textAlign: 'center'
	},
	rankTop1: {
		color: '#FFD700',
		textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
	},
	rankTop2: {
		color: '#C0C0C0',
		textShadow: '0 0 10px rgba(192, 192, 192, 0.5)'
	},
	rankTop3: {
		color: '#CD7F32',
		textShadow: '0 0 10px rgba(205, 127, 50, 0.5)'
	},
	rankNormal: {
		color: 'rgba(255, 255, 255, 0.7)'
	},
	playerName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 600,
		color: '#fff',
		textDecoration: 'none',
		display: 'inline',
		transition: 'color 0.2s ease',
		'&:hover': {
			color: '#00d4ff'
		}
	},
	tierWrapper: {
		display: 'flex',
		alignItems: 'center',
		gap: 12
	},
	tierEmblem: {
		width: 48,
		height: 48,
		transition: 'transform 0.2s ease',
		'&:hover': {
			transform: 'scale(1.15)'
		}
	},
	tierInfo: {
		display: 'flex',
		flexDirection: 'column',
		gap: 2
	},
	tierName: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700
	},
	tierLP: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	statNumber: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.8)'
	},
	winRate: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700
	},
	winRateHigh: {
		color: '#00ff7f'
	},
	winRateMid: {
		color: '#ffd700'
	},
	winRateLow: {
		color: '#ff6b6b'
	},
	ratingChangeInline: {
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		marginLeft: 4
	},
	ratingUp: {
		color: '#00ff7f'
	},
	ratingDown: {
		color: '#ff6b6b'
	},
	ratingNeutral: {
		color: 'rgba(255, 255, 255, 0.5)'
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
	// My Ranking row
	myRankingRow: {
		background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 102, 255, 0.06) 100%)',
		cursor: 'pointer',
		'&:hover': {
			background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 102, 255, 0.1) 100%)'
		},
		'& td': {
			borderBottom: '2px solid rgba(0, 212, 255, 0.4)'
		},
		'& td:first-child': {
			boxShadow: 'inset 3px 0 0 #00d4ff'
		}
	},
	myRankingRowUnranked: {
		cursor: 'default',
		'&:hover': {
			background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 102, 255, 0.06) 100%)'
		}
	},
	myRankingLabel: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		letterSpacing: '0.08em',
		textTransform: 'uppercase',
		color: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.12)',
		padding: '2px 8px',
		borderRadius: 4,
		marginRight: 8,
		border: '1px solid rgba(0, 212, 255, 0.25)'
	},
	myRankingReason: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginTop: 2
	},
	// Mobile my ranking card
	myRankingMobileCard: {
		background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 102, 255, 0.06) 100%)',
		borderRadius: 16,
		padding: '16px',
		marginBottom: 12,
		border: '1px solid rgba(0, 212, 255, 0.3)',
		position: 'relative'
	},
	myRankingMobileLabel: {
		position: 'absolute',
		top: -9,
		left: 12,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '0.9rem',
		fontWeight: 700,
		letterSpacing: '0.08em',
		textTransform: 'uppercase',
		color: '#00d4ff',
		background: '#0f0f1a',
		padding: '1px 8px',
		borderRadius: 4,
		border: '1px solid rgba(0, 212, 255, 0.3)'
	},
	// Mobile card styles
	mobileCardList: {
		padding: '16px'
	},
	mobileCard: {
		background: 'rgba(255, 255, 255, 0.03)',
		borderRadius: 16,
		padding: '16px',
		marginBottom: 12,
		border: '1px solid rgba(255, 255, 255, 0.08)',
		transition: 'all 0.2s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.05)',
			borderColor: 'rgba(0, 212, 255, 0.2)'
		}
	},
	mobileCardTop: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		marginBottom: 12
	},
	mobileRankBadge: {
		width: 40,
		height: 40,
		borderRadius: 10,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		background: 'rgba(255, 255, 255, 0.1)'
	},
	mobileRankTop1: {
		background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
		color: '#000',
		boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)'
	},
	mobileRankTop2: {
		background: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)',
		color: '#000',
		boxShadow: '0 0 12px rgba(192, 192, 192, 0.4)'
	},
	mobileRankTop3: {
		background: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
		color: '#fff',
		boxShadow: '0 0 12px rgba(205, 127, 50, 0.4)'
	},
	mobilePlayerInfo: {
		flex: 1,
		minWidth: 0
	},
	mobilePlayerName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: '#fff',
		textDecoration: 'none',
		marginBottom: 2,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		display: 'inline-block',
		maxWidth: '100%',
		transition: 'color 0.2s ease',
		'&:hover': {
			color: '#00d4ff'
		}
	},
	mobileTierRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	mobileTierEmblem: {
		width: 24,
		height: 24
	},
	mobileTierText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600
	},
	mobileLPText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.9rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	mobileStats: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: 12,
		borderTop: '1px solid rgba(255, 255, 255, 0.08)'
	},
	mobileStatItem: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 2
	},
	mobileStatLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.85rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	mobileStatValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700
	},
	mobileWinValue: {
		color: '#4dabf7'
	},
	mobileLoseValue: {
		color: '#ff6b6b'
	},
	mobileWinRateValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700
	},
	// Mobile sort controls
	mobileSortBar: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '12px 16px',
		overflowX: 'auto',
		borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
		background: 'rgba(0, 212, 255, 0.05)',
		'&::-webkit-scrollbar': {
			display: 'none'
		},
		scrollbarWidth: 'none'
	},
	mobileSortLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.5)',
		whiteSpace: 'nowrap',
		flexShrink: 0
	},
	mobileSortChip: {
		display: 'flex',
		alignItems: 'center',
		gap: 4,
		padding: '6px 12px',
		borderRadius: 16,
		background: 'rgba(255, 255, 255, 0.08)',
		border: '1px solid rgba(255, 255, 255, 0.1)',
		color: 'rgba(255, 255, 255, 0.7)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		fontWeight: 500,
		cursor: 'pointer',
		whiteSpace: 'nowrap',
		flexShrink: 0,
		transition: 'all 0.2s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.15)',
			borderColor: 'rgba(0, 212, 255, 0.3)'
		}
	},
	mobileSortChipActive: {
		background: 'rgba(0, 212, 255, 0.2)',
		borderColor: '#00d4ff',
		color: '#00d4ff'
	},
	sortArrow: {
		fontSize: '0.9rem',
		opacity: 0.8
	}
}));

const StyledTableCell = withStyles(theme => ({
	body: {
		backgroundColor: 'transparent',
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		padding: '18px 24px'
	}
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
	root: {
		transition: 'background-color 0.2s ease',
		'&:hover': {
			backgroundColor: 'rgba(0, 212, 255, 0.05)'
		}
	}
}))(TableRow);

function RankingTable(props) {
	const { classes } = useStyles();
	const dispatch = useDispatch();
	const ranking = useSelector(({ Ranking }) => Ranking.ranking.data);
	const myRanking = useSelector(({ Ranking }) => Ranking.ranking.myRanking);
	const rankingLoading = useSelector(({ Ranking }) => Ranking.ranking.loading);
	const searchText = useSelector(({ Ranking }) => Ranking.ranking.searchText);
	const period = useSelector(({ Ranking }) => Ranking.ranking.period);
	const isRefreshingGroupRating = useSelector(({ Ranking }) => Ranking.ranking.isRefreshingGroupRating);

	const [data, setData] = useState(ranking);
	const [page, setPage] = useState(0);
	const rowsPerPage = 10;
	const [order, setOrder] = useState({
		direction: 'desc',
		id: 'rating'
	});

	const tierNames = {
		IRON: 200,
		BRONZE: 300,
		SILVER: 400,
		GOLD: 500,
		PLATINUM: 600,
		EMERALD: 700,
		DIAMOND: 800,
		MASTER: 900,
		GRANDMASTER: 1000,
		CHALLENGER: 1150,
		UNRANKED: 500
	};
	const tierSteps = ['IV', 'III', 'II', 'I'];

	const groupName = useSelector(state => state.auth.user.reprGroup.groupName);
	const groupId = useSelector(state => state.auth.user.reprGroup.groupId);

	useEffect(() => {
		if (period === 'all') {
			dispatch(Actions.getRanking(groupName));
		} else {
			dispatch(Actions.getPeriodRanking(groupId, period.startDate, period.endDate));
		}
		setPage(0);
	}, [dispatch, groupName, groupId, period, isRefreshingGroupRating]);

	useEffect(() => {
		if (searchText.length !== 0) {
			setData(_.filter(ranking, item => item.name.toLowerCase().includes(searchText.toLowerCase())));
			setPage(0);
		} else {
			setData(ranking);
		}
	}, [ranking, searchText]);

	function handleRequestSort(event, property) {
		const id = property;
		let direction = 'desc';

		if (order.id === property && order.direction === 'desc') {
			direction = 'asc';
		}

		setOrder({ direction, id });
	}

	function handleChangePage(event, value) {
		setPage(value);
	}

	function getTierName(rating) {
		let entries = Object.entries(tierNames);
		entries = entries.filter(elem => elem[0] !== 'UNRANKED');
		entries = entries.sort((a, b) => b[1] - a[1]);
		for (const [name, tierRating] of entries) {
			if (rating >= tierRating) {
				return name;
			}
		}
		return 'IRON';
	}

	function getTierPoint(rating) {
		let entries = Object.entries(tierNames);
		entries = entries.filter(elem => elem[0] !== 'UNRANKED');
		entries = entries.sort((a, b) => b[1] - a[1]);
		for (const [name, tierRating] of entries) {
			if (rating >= tierRating) {
				if (isNonStepTier(name)) {
					return Math.floor((rating - tierRating) * 4);
				}
				return Math.floor(((rating - tierRating) % 25) * 4);
			}
		}
		return 0;
	}

	function getRatingTierName(rating) {
		let entries = Object.entries(tierNames);
		entries = entries.filter(elem => elem[0] !== 'UNRANKED');
		entries = entries.sort((a, b) => b[1] - a[1]);
		for (const [name, tierRating] of entries) {
			if (rating >= tierRating) {
				if (isNonStepTier(name)) {
					return name;
				}
				return `${name} ${tierSteps[Math.floor((rating - tierRating) / 25)]}`;
			}
		}
		return 'IRON IV';
	}

	function isNonStepTier(tierName) {
		return tierName === 'MASTER' || tierName === 'GRANDMASTER' || tierName === 'CHALLENGER';
	}

	function getRankClass(rank) {
		if (rank === 1) return classes.rankTop1;
		if (rank === 2) return classes.rankTop2;
		if (rank === 3) return classes.rankTop3;
		return classes.rankNormal;
	}

	function getMobileRankClass(rank) {
		if (rank === 1) return classes.mobileRankTop1;
		if (rank === 2) return classes.mobileRankTop2;
		if (rank === 3) return classes.mobileRankTop3;
		return '';
	}

	function getRatingChangeClass(val) {
		if (val > 0) return classes.ratingUp;
		if (val < 0) return classes.ratingDown;
		return classes.ratingNeutral;
	}

	function formatRatingChange(val) {
		if (val > 0) return `+${val}`;
		return String(val);
	}

	function getWinRateClass(winRate) {
		const rate = parseFloat(winRate);
		if (rate >= 55) return classes.winRateHigh;
		if (rate >= 45) return classes.winRateMid;
		return classes.winRateLow;
	}

	function handleMyRankingClick() {
		if (!myRanking || myRanking.ranking == null) return;
		const targetPage = Math.floor((myRanking.ranking - 1) / rowsPerPage);
		setPage(targetPage);
		setTimeout(() => {
			const row = document.querySelector(`[data-puuid="${myRanking.puuid}"]`);
			if (row) {
				row.scrollIntoView({ behavior: 'smooth', block: 'center' });
				row.style.transition = 'background-color 0.3s ease';
				row.style.backgroundColor = 'rgba(0, 212, 255, 0.15)';
				setTimeout(() => {
					row.style.backgroundColor = '';
				}, 1500);
			}
		}, 100);
	}

	function renderMyRankingRow() {
		if (!myRanking) return null;
		const hasRating = myRanking.rating != null;
		const tierName = hasRating ? getTierName(myRanking.rating) : 'UNRANKED';
		const tierColor = tierColors[tierName] || '#fff';
		const isRanked = myRanking.ranking != null;
		const rank = isRanked ? myRanking.ranking : '-';
		const games = myRanking.win + myRanking.lose;

		return (
			<StyledTableRow
				className={`${classes.myRankingRow} ${!isRanked ? classes.myRankingRowUnranked : ''}`}
				onClick={isRanked ? handleMyRankingClick : undefined}
				style={isRanked ? { cursor: 'pointer' } : undefined}
			>
				<StyledTableCell>
					<span className={classes.myRankingLabel}>MY</span>
					<span className={`${classes.rankingNumber} ${getRankClass(isRanked ? myRanking.ranking : 0)}`}>{rank}</span>
				</StyledTableCell>
				<StyledTableCell>
					<Link to={`/userinfo/${myRanking.puuid}`} className={classes.playerName} onClick={e => e.stopPropagation()}>
						{myRanking.name}
					</Link>
					{!isRanked && myRanking.reason && (
						<div className={classes.myRankingReason}>{myRanking.reason}(으)로 랭킹에 미표시</div>
					)}
				</StyledTableCell>
				<StyledTableCell>
					{hasRating ? (
						<div className={classes.tierWrapper}>
							<img
								className={classes.tierEmblem}
								src={`/assets/images/ranked-emblems/Emblem_${tierName}.webp`}
								alt={tierName}
								style={{ filter: `drop-shadow(0 0 8px ${tierColor}40)` }}
							/>
							<div className={classes.tierInfo}>
								<span className={classes.tierName} style={{ color: tierColor }}>
									{getRatingTierName(myRanking.rating)}
								</span>
								<span className={classes.tierLP}>{getTierPoint(myRanking.rating)} LP</span>
							</div>
						</div>
					) : (
						<span className={classes.tierName} style={{ color: 'rgba(255,255,255,0.4)' }}>
							-
						</span>
					)}
				</StyledTableCell>
				<StyledTableCell>
					<span className={classes.statNumber}>{games}</span>
				</StyledTableCell>
				<StyledTableCell>
					<span className={classes.statNumber} style={{ color: '#4dabf7' }}>
						{myRanking.win}
					</span>
				</StyledTableCell>
				<StyledTableCell>
					<span className={classes.statNumber} style={{ color: '#ff6b6b' }}>
						{myRanking.lose}
					</span>
				</StyledTableCell>
				<StyledTableCell>
					<span className={`${classes.winRate} ${getWinRateClass(myRanking.winRate)}`}>{myRanking.winRate}%</span>
				</StyledTableCell>
			</StyledTableRow>
		);
	}

	function renderMyRankingMobileCard() {
		if (!myRanking) return null;
		const hasRating = myRanking.rating != null;
		const tierName = hasRating ? getTierName(myRanking.rating) : 'UNRANKED';
		const tierColor = tierColors[tierName] || '#fff';
		const isRanked = myRanking.ranking != null;
		const rank = isRanked ? myRanking.ranking : '-';

		const mobileInner = (
			<>
				<span className={classes.myRankingMobileLabel}>MY RANKING</span>
				<div className={classes.mobileCardTop}>
					<div className={`${classes.mobileRankBadge} ${getMobileRankClass(isRanked ? myRanking.ranking : 0)}`}>
						{rank}
					</div>
					<div className={classes.mobilePlayerInfo}>
						<Link
							to={`/userinfo/${myRanking.puuid}`}
							className={classes.mobilePlayerName}
							onClick={e => e.stopPropagation()}
						>
							{myRanking.name}
						</Link>
						{hasRating && (
							<div className={classes.mobileTierRow}>
								<img
									className={classes.mobileTierEmblem}
									src={`/assets/images/ranked-emblems/Emblem_${tierName}.webp`}
									alt={tierName}
								/>
								<span className={classes.mobileTierText} style={{ color: tierColor }}>
									{getRatingTierName(myRanking.rating)}
								</span>
								<span className={classes.mobileLPText}>{getTierPoint(myRanking.rating)} LP</span>
							</div>
						)}
						{!isRanked && myRanking.reason && (
							<div className={classes.myRankingReason}>{myRanking.reason}(으)로 랭킹에 미표시</div>
						)}
					</div>
				</div>
				<div className={classes.mobileStats}>
					<div className={classes.mobileStatItem}>
						<span className={classes.mobileStatLabel}>판수</span>
						<span className={classes.mobileStatValue}>{myRanking.win + myRanking.lose}</span>
					</div>
					<div className={classes.mobileStatItem}>
						<span className={classes.mobileStatLabel}>승</span>
						<span className={`${classes.mobileStatValue} ${classes.mobileWinValue}`}>{myRanking.win}</span>
					</div>
					<div className={classes.mobileStatItem}>
						<span className={classes.mobileStatLabel}>패</span>
						<span className={`${classes.mobileStatValue} ${classes.mobileLoseValue}`}>{myRanking.lose}</span>
					</div>
					<div className={classes.mobileStatItem}>
						<span className={classes.mobileStatLabel}>승률</span>
						<span className={`${classes.mobileWinRateValue} ${getWinRateClass(myRanking.winRate)}`}>
							{myRanking.winRate}%
						</span>
					</div>
				</div>
			</>
		);

		if (isRanked) {
			return (
				<div
					className={classes.myRankingMobileCard}
					onClick={handleMyRankingClick}
					onKeyDown={e => e.key === 'Enter' && handleMyRankingClick()}
					role="button"
					tabIndex={0}
					style={{ cursor: 'pointer' }}
				>
					{mobileInner}
				</div>
			);
		}

		return <div className={classes.myRankingMobileCard}>{mobileInner}</div>;
	}

	const isPeriod = period !== 'all';
	const getSortValue = o => {
		if (order.id === 'games') return o.win + o.lose;
		if (order.id === 'rating') return o.rating != null ? o.rating : -Infinity;
		return o[order.id];
	};
	const sortedData = _.orderBy(data, [getSortValue], [order.direction]).slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage
	);

	if (rankingLoading && (!data || data.length === 0)) {
		return <RankingTableSkeleton />;
	}

	return (
        <div className={classes.container}>
            <div className={classes.tableWrapper}>
				{data && data.length > 0 ? (
					<>
						{/* Desktop Table View */}
						<Box sx={{ display: { xs: 'none', md: 'block' } }}>
							<FuseScrollbars className="flex-grow overflow-x-auto">
								<Table>
									<RankingTableHead order={order} onRequestSort={handleRequestSort} rowCount={data.length} />
									<TableBody>
										{renderMyRankingRow()}
										{sortedData.map((n, idx) => {
											const rank = n.ranking != null ? n.ranking : page * rowsPerPage + idx + 1;
											const hasRating = n.rating != null;
											const tierName = hasRating ? getTierName(n.rating) : 'UNRANKED';
											const tierColor = tierColors[tierName] || '#fff';

											return (
												<StyledTableRow key={n.riotId || n.puuid} data-puuid={n.puuid}>
													<StyledTableCell>
														<span className={`${classes.rankingNumber} ${getRankClass(rank)}`}>{rank}</span>
													</StyledTableCell>
													<StyledTableCell>
														<Link to={`/userinfo/${n.puuid}`} className={classes.playerName}>
															{n.name}
														</Link>
													</StyledTableCell>
													<StyledTableCell>
														{hasRating ? (
															<div className={classes.tierWrapper}>
																<img
																	className={classes.tierEmblem}
																	src={`/assets/images/ranked-emblems/Emblem_${tierName}.webp`}
																	alt={tierName}
																	style={{ filter: `drop-shadow(0 0 8px ${tierColor}40)` }}
																/>
																<div className={classes.tierInfo}>
																	<span className={classes.tierName} style={{ color: tierColor }}>
																		{getRatingTierName(n.rating)}
																	</span>
																	<span className={classes.tierLP}>
																		{getTierPoint(n.rating)} LP
																		{isPeriod && n.ratingChange != null && (
																			<span
																				className={`${classes.ratingChangeInline} ${getRatingChangeClass(
																					n.ratingChange
																				)}`}
																			>
																				{` (${formatRatingChange(n.ratingChange)})`}
																			</span>
																		)}
																	</span>
																</div>
															</div>
														) : (
															<span className={classes.tierName} style={{ color: 'rgba(255,255,255,0.4)' }}>
																-
																{isPeriod && n.ratingChange != null && (
																	<span
																		className={`${classes.ratingChangeInline} ${getRatingChangeClass(n.ratingChange)}`}
																	>
																		{` (${formatRatingChange(n.ratingChange)})`}
																	</span>
																)}
															</span>
														)}
													</StyledTableCell>
													<StyledTableCell>
														<span className={classes.statNumber}>{n.win + n.lose}</span>
													</StyledTableCell>
													<StyledTableCell>
														<span className={classes.statNumber} style={{ color: '#4dabf7' }}>
															{n.win}
														</span>
													</StyledTableCell>
													<StyledTableCell>
														<span className={classes.statNumber} style={{ color: '#ff6b6b' }}>
															{n.lose}
														</span>
													</StyledTableCell>
													<StyledTableCell>
														<span className={`${classes.winRate} ${getWinRateClass(n.winRate)}`}>{n.winRate}%</span>
													</StyledTableCell>
												</StyledTableRow>
											);
										})}
									</TableBody>
								</Table>
							</FuseScrollbars>
						</Box>

						{/* Mobile Card View */}
						<Box sx={{ display: { md: 'none' } }}>
							{/* Mobile Sort Bar */}
							<div className={classes.mobileSortBar}>
								<span className={classes.mobileSortLabel}>정렬:</span>
								{[
									{ id: 'rating', label: '티어' },
									{ id: 'games', label: '판수' },
									{ id: 'win', label: '승' },
									{ id: 'lose', label: '패' },
									{ id: 'winRate', label: '승률' }
								].map(option => (
									<div
										key={option.id}
										className={`${classes.mobileSortChip} ${
											order.id === option.id ? classes.mobileSortChipActive : ''
										}`}
										onClick={() => handleRequestSort(null, option.id)}
										role="button"
										tabIndex={0}
										onKeyDown={e => e.key === 'Enter' && handleRequestSort(null, option.id)}
									>
										{option.label}
										{order.id === option.id && (
											<span className={classes.sortArrow}>{order.direction === 'asc' ? '↑' : '↓'}</span>
										)}
									</div>
								))}
							</div>
							<div className={classes.mobileCardList}>
								{renderMyRankingMobileCard()}
								{sortedData.map((n, idx) => {
									const rank = n.ranking != null ? n.ranking : page * rowsPerPage + idx + 1;
									const hasRating = n.rating != null;
									const tierName = hasRating ? getTierName(n.rating) : 'UNRANKED';
									const tierColor = tierColors[tierName] || '#fff';

									return (
										<div key={n.riotId || n.puuid} className={classes.mobileCard} data-puuid={n.puuid}>
											<div className={classes.mobileCardTop}>
												<div className={`${classes.mobileRankBadge} ${getMobileRankClass(rank)}`}>{rank}</div>
												<div className={classes.mobilePlayerInfo}>
													<Link to={`/userinfo/${n.puuid}`} className={classes.mobilePlayerName}>
														{n.name}
													</Link>
													{hasRating && (
														<div className={classes.mobileTierRow}>
															<img
																className={classes.mobileTierEmblem}
																src={`/assets/images/ranked-emblems/Emblem_${tierName}.webp`}
																alt={tierName}
															/>
															<span className={classes.mobileTierText} style={{ color: tierColor }}>
																{getRatingTierName(n.rating)}
															</span>
															<span className={classes.mobileLPText}>
																{getTierPoint(n.rating)} LP
																{isPeriod && n.ratingChange != null && (
																	<span className={getRatingChangeClass(n.ratingChange)}>
																		{` (${formatRatingChange(n.ratingChange)})`}
																	</span>
																)}
															</span>
														</div>
													)}
												</div>
											</div>
											<div className={classes.mobileStats}>
												<div className={classes.mobileStatItem}>
													<span className={classes.mobileStatLabel}>판수</span>
													<span className={classes.mobileStatValue}>{n.win + n.lose}</span>
												</div>
												<div className={classes.mobileStatItem}>
													<span className={classes.mobileStatLabel}>승</span>
													<span className={`${classes.mobileStatValue} ${classes.mobileWinValue}`}>{n.win}</span>
												</div>
												<div className={classes.mobileStatItem}>
													<span className={classes.mobileStatLabel}>패</span>
													<span className={`${classes.mobileStatValue} ${classes.mobileLoseValue}`}>{n.lose}</span>
												</div>
												<div className={classes.mobileStatItem}>
													<span className={classes.mobileStatLabel}>승률</span>
													<span className={`${classes.mobileWinRateValue} ${getWinRateClass(n.winRate)}`}>
														{n.winRate}%
													</span>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</Box>

						<TablePagination
							className={classes.pagination}
							component="div"
							count={data.length}
							rowsPerPage={rowsPerPage}
							rowsPerPageOptions={[]}
							page={page}
							backIconButtonProps={{ 'aria-label': 'Previous Page' }}
							nextIconButtonProps={{ 'aria-label': 'Next Page' }}
							onPageChange={handleChangePage}
						/>
					</>
				) : (
					<div className={classes.emptyState}>
						<div className={classes.emptyIcon}>
							<span role="img" aria-label="trophy">
								🏆
							</span>
						</div>
						<div className={classes.emptyText}>랭킹 데이터가 없습니다</div>
					</div>
				)}
			</div>
        </div>
    );
}

export default withRouter(RankingTable);
