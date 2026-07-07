import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { makeStyles, withStyles } from 'tss-react/mui';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { RankingTableSkeleton } from '../components/SkeletonLoaders';
import * as Actions from './store/actions';

const HEAD_CELLS = [
	{ id: 'ranking', label: '#' },
	{ id: 'name', label: '소환사' },
	{ id: 'point', label: '포인트' },
	{ id: 'record', label: '승-패' },
	{ id: 'winRate', label: '승률' }
];

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
		overflow: 'hidden'
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
	point: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.7rem',
		fontWeight: 700
	},
	pointUp: {
		color: '#00ff7f'
	},
	pointDown: {
		color: '#ff6b6b'
	},
	pointNeutral: {
		color: 'rgba(255, 255, 255, 0.5)'
	},
	record: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 600
	},
	winText: {
		color: '#4dabf7'
	},
	loseText: {
		color: '#ff6b6b',
		marginLeft: 8
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
		background: 'rgba(255, 255, 255, 0.1)',
		flexShrink: 0
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
	mobilePoint: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.7rem',
		fontWeight: 700,
		flexShrink: 0
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
	}
}));

const StyledTableCell = withStyles(TableCell, (theme) => ({
	head: {
		backgroundColor: 'rgba(0, 212, 255, 0.08)',
		color: 'rgba(255, 255, 255, 0.9)',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		textTransform: 'uppercase',
		letterSpacing: '0.08em',
		borderBottom: '2px solid rgba(0, 212, 255, 0.3)',
		padding: '20px 24px'
	},
	body: {
		backgroundColor: 'transparent',
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		padding: '18px 24px'
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

function PositionRankingTable() {
	const { classes } = useStyles();
	const dispatch = useDispatch();
	const data = useSelector(({ PositionRanking }) => PositionRanking.positionRanking.data);
	const myRanking = useSelector(({ PositionRanking }) => PositionRanking.positionRanking.myRanking);
	const loading = useSelector(({ PositionRanking }) => PositionRanking.positionRanking.loading);
	const position = useSelector(({ PositionRanking }) => PositionRanking.positionRanking.position);
	const groupId = useSelector(state => state.auth.user.reprGroup?.groupId);

	useEffect(() => {
		// 모바일 쿠키 세션 복원 중엔 reprGroup이 아직 없을 수 있다. 준비되면 deps 변경으로 재실행.
		if (!groupId) return;
		dispatch(Actions.getPositionRanking(groupId));
	}, [dispatch, groupId]);

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

	function getPointClass(val) {
		if (val > 0) return classes.pointUp;
		if (val < 0) return classes.pointDown;
		return classes.pointNeutral;
	}

	function formatPoint(val) {
		return val > 0 ? `+${val}` : `${val}`;
	}

	function getWinRateClass(winRate) {
		const rate = parseFloat(winRate);
		if (rate >= 55) return classes.winRateHigh;
		if (rate >= 45) return classes.winRateMid;
		return classes.winRateLow;
	}

	const rows = (data && data[position]) || [];
	const hasAnyData = data && Object.values(data).some(arr => Array.isArray(arr) && arr.length > 0);
	const my = myRanking ? myRanking[position] : null;

	function handleMyRankingClick() {
		if (!my || my.ranking == null) return;
		const row = document.querySelector(`[data-puuid="${my.puuid}"]`);
		if (row) {
			row.scrollIntoView({ behavior: 'smooth', block: 'center' });
			row.style.transition = 'background-color 0.3s ease';
			row.style.backgroundColor = 'rgba(0, 212, 255, 0.15)';
			setTimeout(() => {
				row.style.backgroundColor = '';
			}, 1500);
		}
	}

	function renderMyRankingRow() {
		if (!my) return null;
		const isRanked = my.ranking != null;

		return (
			<StyledTableRow
				className={`${classes.myRankingRow} ${!isRanked ? classes.myRankingRowUnranked : ''}`}
				onClick={isRanked ? handleMyRankingClick : undefined}
				style={isRanked ? { cursor: 'pointer' } : undefined}
			>
				<StyledTableCell>
					<span className={classes.myRankingLabel}>MY</span>
					<span className={`${classes.rankingNumber} ${getRankClass(isRanked ? my.ranking : 0)}`}>
						{isRanked ? my.ranking : '-'}
					</span>
				</StyledTableCell>
				<StyledTableCell>
					<Link to={`/userinfo/${my.puuid}`} className={classes.playerName} onClick={e => e.stopPropagation()}>
						{my.name}
					</Link>
					{!isRanked && my.reason && <div className={classes.myRankingReason}>{my.reason}</div>}
				</StyledTableCell>
				<StyledTableCell>
					<span className={`${classes.point} ${getPointClass(my.ratingChange)}`}>{formatPoint(my.ratingChange)}</span>
				</StyledTableCell>
				<StyledTableCell>
					<span className={classes.record}>
						<span className={classes.winText}>{my.win}승</span>
						<span className={classes.loseText}>{my.lose}패</span>
					</span>
				</StyledTableCell>
				<StyledTableCell>
					<span className={`${classes.winRate} ${getWinRateClass(my.winRate)}`}>{my.winRate}%</span>
				</StyledTableCell>
			</StyledTableRow>
		);
	}

	function renderMyRankingMobileCard() {
		if (!my) return null;
		const isRanked = my.ranking != null;

		const mobileInner = (
			<>
				<span className={classes.myRankingMobileLabel}>MY RANKING</span>
				<div className={classes.mobileCardTop}>
					<div className={`${classes.mobileRankBadge} ${getMobileRankClass(isRanked ? my.ranking : 0)}`}>
						{isRanked ? my.ranking : '-'}
					</div>
					<div className={classes.mobilePlayerInfo}>
						<Link
							to={`/userinfo/${my.puuid}`}
							className={classes.mobilePlayerName}
							onClick={e => e.stopPropagation()}
						>
							{my.name}
						</Link>
						{!isRanked && my.reason && <div className={classes.myRankingReason}>{my.reason}</div>}
					</div>
					<div className={`${classes.mobilePoint} ${getPointClass(my.ratingChange)}`}>
						{formatPoint(my.ratingChange)}
					</div>
				</div>
				<div className={classes.mobileStats}>
					<div className={classes.mobileStatItem}>
						<span className={classes.mobileStatLabel}>승</span>
						<span className={`${classes.mobileStatValue} ${classes.mobileWinValue}`}>{my.win}</span>
					</div>
					<div className={classes.mobileStatItem}>
						<span className={classes.mobileStatLabel}>패</span>
						<span className={`${classes.mobileStatValue} ${classes.mobileLoseValue}`}>{my.lose}</span>
					</div>
					<div className={classes.mobileStatItem}>
						<span className={classes.mobileStatLabel}>승률</span>
						<span className={`${classes.mobileStatValue} ${getWinRateClass(my.winRate)}`}>{my.winRate}%</span>
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

	if (loading || !data) {
		return <RankingTableSkeleton />;
	}

	return (
		<div className={classes.container}>
			<Reveal distance={20}>
				<div className={classes.tableWrapper}>
					{rows.length > 0 ? (
						<>
							{/* Desktop Table View */}
							<Box sx={{ display: { xs: 'none', md: 'block' } }}>
								<FuseScrollbars className="flex-grow overflow-x-auto">
									<Table>
										<TableHead>
											<TableRow style={{ height: 64 }}>
												{HEAD_CELLS.map(cell => (
													<StyledTableCell
														key={cell.id}
														style={cell.id === 'point' ? { color: '#00d4ff' } : undefined}
													>
														{cell.label}
													</StyledTableCell>
												))}
											</TableRow>
										</TableHead>
										<TableBody>
											{renderMyRankingRow()}
											{rows.map(n => (
												<StyledTableRow key={n.puuid} data-puuid={n.puuid}>
													<StyledTableCell>
														<span className={`${classes.rankingNumber} ${getRankClass(n.ranking)}`}>
															{n.ranking}
														</span>
													</StyledTableCell>
													<StyledTableCell>
														<Link to={`/userinfo/${n.puuid}`} className={classes.playerName}>
															{n.name}
														</Link>
													</StyledTableCell>
													<StyledTableCell>
														<span className={`${classes.point} ${getPointClass(n.ratingChange)}`}>
															{formatPoint(n.ratingChange)}
														</span>
													</StyledTableCell>
													<StyledTableCell>
														<span className={classes.record}>
															<span className={classes.winText}>{n.win}승</span>
															<span className={classes.loseText}>{n.lose}패</span>
														</span>
													</StyledTableCell>
													<StyledTableCell>
														<span className={`${classes.winRate} ${getWinRateClass(n.winRate)}`}>
															{n.winRate}%
														</span>
													</StyledTableCell>
												</StyledTableRow>
											))}
										</TableBody>
									</Table>
								</FuseScrollbars>
							</Box>

							{/* Mobile Card View */}
							<Box sx={{ display: { md: 'none' } }}>
								<div className={classes.mobileCardList}>
									{renderMyRankingMobileCard()}
									{rows.map(n => (
										<div key={n.puuid} className={classes.mobileCard} data-puuid={n.puuid}>
											<div className={classes.mobileCardTop}>
												<div className={`${classes.mobileRankBadge} ${getMobileRankClass(n.ranking)}`}>
													{n.ranking}
												</div>
												<div className={classes.mobilePlayerInfo}>
													<Link to={`/userinfo/${n.puuid}`} className={classes.mobilePlayerName}>
														{n.name}
													</Link>
												</div>
												<div className={`${classes.mobilePoint} ${getPointClass(n.ratingChange)}`}>
													{formatPoint(n.ratingChange)}
												</div>
											</div>
											<div className={classes.mobileStats}>
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
													<span className={`${classes.mobileStatValue} ${getWinRateClass(n.winRate)}`}>
														{n.winRate}%
													</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</Box>
						</>
					) : (
						<div className={classes.emptyState}>
							<div className={classes.emptyIcon}>
								<span role="img" aria-label="trophy">
									🏆
								</span>
							</div>
							<div className={classes.emptyText}>
								{hasAnyData ? '아직 랭킹에 오른 유저가 없습니다' : '포지션이 기록된 내전이 아직 없습니다'}
							</div>
						</div>
					)}
				</div>
			</Reveal>
		</div>
	);
}

export default PositionRankingTable;
