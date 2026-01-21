import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseLoading from '@fuse/core/FuseLoading';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

const useStyles = makeStyles(theme => ({
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
		backgroundColor: 'rgba(0, 200, 83, 0.15)',
		borderLeft: '5px solid #00c853',
		boxShadow: 'inset 0 0 20px rgba(0, 200, 83, 0.1)'
	},
	loseTeamCell: {
		backgroundColor: 'rgba(255, 82, 82, 0.12)',
		borderLeft: '5px solid #ff5252',
		boxShadow: 'inset 0 0 20px rgba(255, 82, 82, 0.08)'
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
		gap: 4
	},
	avgRating: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff'
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
		color: '#fff'
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
	}
}));

const StyledTableCell = withStyles(theme => ({
	body: {
		backgroundColor: 'transparent',
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		padding: '16px'
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

function MatchHistoryTable() {
	const classes = useStyles();
	const dispatch = useDispatch();

	const user = useSelector(state => state.auth.user);
	const allMatches = useSelector(({ MatchHistory }) => {
		return MatchHistory.matchHistory.matches.matches;
	});
	const searchText = useSelector(({ MatchHistory }) => MatchHistory.matchHistory.searchText);

	const filteredMatches = allMatches
		? allMatches.filter(match => {
				if (!searchText) return true;
				const searchLower = searchText.toLowerCase();
				const team1HasPlayer = match.team1.players.some(player =>
					player.name.toLowerCase().includes(searchLower)
				);
				const team2HasPlayer = match.team2.players.some(player =>
					player.name.toLowerCase().includes(searchLower)
				);
				return team1HasPlayer || team2HasPlayer;
		  })
		: [];

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	useEffect(() => {
		dispatch(Actions.getMatchHistory(user.reprGroup.groupId));
	}, [dispatch, user]);

	useEffect(() => {
		setPage(0);
	}, [searchText]);

	const handleChangePage = (event, value) => {
		setPage(value);
	};

	const handleChangeRowsPerPage = event => {
		setRowsPerPage(event.target.value);
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

	const renderPlayers = players => {
		const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
		return sortedPlayers.map(player => (
			<div key={player.puuid} className={classes.playerRow}>
				<img
					className={classes.tierIcon}
					src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(player.tier)}.png`}
					alt={player.tier}
					style={{ filter: `drop-shadow(0 0 4px ${getTierColor(player.tier)}40)` }}
				/>
				<span
					className={classes.tierBadge}
					style={{ color: getTierColor(player.tier) }}
				>
					{getTierShortName(player.tier)}
				</span>
				<span className={classes.playerName}>{player.name}</span>
			</div>
		));
	};

	const renderRatingChange = ratingChange => {
		if (ratingChange > 0) {
			return (
				<span className={`${classes.ratingChange} ${classes.ratingUp}`}>
					+{ratingChange}
				</span>
			);
		} else if (ratingChange < 0) {
			return (
				<span className={`${classes.ratingChange} ${classes.ratingDown}`}>
					{ratingChange}
				</span>
			);
		}
		return <span className={`${classes.ratingChange} ${classes.ratingNeutral}`}>0</span>;
	};

	if (!allMatches) {
		return <FuseLoading />;
	}

	return (
		<div className={classes.container}>
			<div className={classes.tableWrapper}>
				{filteredMatches && filteredMatches.length > 0 ? (
					<>
						<FuseScrollbars className="flex-grow overflow-x-auto">
							<Table>
								<TableHead>
									<TableRow>
										<TableCell className={classes.headerCell} align="center">#</TableCell>
										<TableCell className={classes.headerCell}>날짜</TableCell>
										<TableCell className={classes.headerCell} align="center">평균</TableCell>
										<TableCell className={classes.headerCell}>
											<span className={classes.teamLabel}>
												<span className={classes.teamEmoji}>🐶</span> Team 1
											</span>
										</TableCell>
										<TableCell className={classes.headerCell} align="center">VS</TableCell>
										<TableCell className={classes.headerCell} align="center">평균</TableCell>
										<TableCell className={classes.headerCell}>
											<span className={classes.teamLabel}>
												<span className={classes.teamEmoji}>🐱</span> Team 2
											</span>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{filteredMatches
										.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
										.map((match) => {
											const isTeam1Win = match.winTeam === 1;
											const originalIndex = allMatches.indexOf(match);
											const displayId = allMatches.length - originalIndex;
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
															<span className={classes.avgRating}>{match.team1.avgRating}</span>
															{renderRatingChange(match.team1.ratingChange)}
														</div>
													</StyledTableCell>
													<StyledTableCell className={isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}>
														<div>
															<span className={isTeam1Win ? classes.winBadge : classes.loseBadge}>
																{isTeam1Win ? 'WIN' : 'LOSE'}
															</span>
														</div>
														<div className={classes.playerList}>
															{renderPlayers(match.team1.players)}
														</div>
													</StyledTableCell>
													<StyledTableCell>
														<span className={classes.vsCell}>VS</span>
													</StyledTableCell>
													<StyledTableCell
														align="center"
														className={!isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}
													>
														<div className={classes.avgRatingWrapper}>
															<span className={classes.avgRating}>{match.team2.avgRating}</span>
															{renderRatingChange(match.team2.ratingChange)}
														</div>
													</StyledTableCell>
													<StyledTableCell className={!isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}>
														<div>
															<span className={!isTeam1Win ? classes.winBadge : classes.loseBadge}>
																{!isTeam1Win ? 'WIN' : 'LOSE'}
															</span>
														</div>
														<div className={classes.playerList}>
															{renderPlayers(match.team2.players)}
														</div>
													</StyledTableCell>
												</StyledTableRow>
											);
										})}
								</TableBody>
							</Table>
						</FuseScrollbars>
						<TablePagination
							className={classes.pagination}
							component="div"
							count={filteredMatches.length}
							rowsPerPage={rowsPerPage}
							page={page}
							backIconButtonProps={{ 'aria-label': 'Previous Page' }}
							nextIconButtonProps={{ 'aria-label': 'Next Page' }}
							onChangePage={handleChangePage}
							onChangeRowsPerPage={handleChangeRowsPerPage}
						/>
					</>
				) : (
					<div className={classes.emptyState}>
						<div className={classes.emptyIcon}>📜</div>
						<div className={classes.emptyText}>매치 기록이 없습니다</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default MatchHistoryTable;
