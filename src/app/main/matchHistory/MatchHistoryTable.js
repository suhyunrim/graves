import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseLoading from '@fuse/core/FuseLoading';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from './store/actions';

const useStyles = makeStyles(theme => ({
	winTeamCell: {
		backgroundColor: 'rgba(33, 150, 243, 0.15)',
		fontWeight: 'bold'
	},
	loseTeamCell: {
		backgroundColor: 'rgba(244, 67, 54, 0.15)'
	},
	playerList: {
		fontSize: '2rem',
		lineHeight: 1.8
	},
	playerRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	tierIcon: {
		width: 24,
		height: 24
	},
	tierName: {
		fontSize: '2rem',
		fontWeight: 'bold',
		minWidth: 60
	},
	dateCell: {
		whiteSpace: 'nowrap',
		width: '1%',
		fontSize: '1.5rem',
		fontWeight: 'bold'
	},
	idCell: {
		whiteSpace: 'nowrap',
		width: '1%',
		fontSize: '1.5rem',
		fontWeight: 'bold'
	},
	headerCell: {
		fontSize: '2rem',
		fontWeight: 'bold'
	},
	avgRatingCell: {
		whiteSpace: 'nowrap',
		width: '1%',
		paddingLeft: 8,
		paddingRight: 24,
		fontSize: '2rem'
	},
	teamCell: {
		paddingRight: 8
	},
	ratingUp: {
		color: '#4caf50',
		fontWeight: 'bold'
	},
	ratingDown: {
		color: '#f44336',
		fontWeight: 'bold'
	},
	spacerCell: {
		width: 40,
		padding: 0
	}
}));

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

	const renderPlayers = players => {
		const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
		return sortedPlayers.map(player => (
			<div key={player.puuid} className={classes.playerRow}>
				<img
					className={classes.tierIcon}
					src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(player.tier)}.png`}
					alt={player.tier}
				/>
				<span className={classes.tierName}>{getTierShortName(player.tier)}</span>
				{player.name}
			</div>
		));
	};

	const renderRatingChange = ratingChange => {
		if (ratingChange > 0) {
			return <span className={classes.ratingUp}>(+{ratingChange})</span>;
		} else if (ratingChange < 0) {
			return <span className={classes.ratingDown}>({ratingChange})</span>;
		}
		return <span>(0)</span>;
	};

	if (!allMatches) {
		return <FuseLoading />;
	}

	return (
		<div className="w-full flex flex-col">
			<FuseScrollbars className="flex-grow overflow-x-auto">
				<Table className="min-w-xl" aria-labelledby="tableTitle">
					<TableHead>
						<TableRow>
							<TableCell className={`${classes.idCell} ${classes.headerCell}`}>ID</TableCell>
							<TableCell className={`${classes.dateCell} ${classes.headerCell}`}>Date</TableCell>
							<TableCell align="center" className={`${classes.avgRatingCell} ${classes.headerCell}`}>평균 레이팅</TableCell>
							<TableCell className={`${classes.teamCell} ${classes.headerCell}`}>🐶Team 1</TableCell>
							<TableCell className={classes.spacerCell}></TableCell>
							<TableCell align="center" className={`${classes.avgRatingCell} ${classes.headerCell}`}>평균 레이팅</TableCell>
							<TableCell className={`${classes.teamCell} ${classes.headerCell}`}>🐱Team 2</TableCell>
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
									<TableRow key={match.gameId} className="h-64" hover>
										<TableCell className={classes.idCell}>{displayId}</TableCell>
										<TableCell className={classes.dateCell}>{formatDate(match.createdAt)}</TableCell>
										<TableCell align="center" className={`${classes.avgRatingCell} ${isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}`}>
											{match.team1.avgRating}<br />
											{renderRatingChange(match.team1.ratingChange)}
										</TableCell>
										<TableCell className={`${classes.teamCell} ${isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}`}>
											<div className={classes.playerList}>
												{renderPlayers(match.team1.players)}
											</div>
										</TableCell>
										<TableCell className={classes.spacerCell}></TableCell>
										<TableCell align="center" className={`${classes.avgRatingCell} ${!isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}`}>
											{match.team2.avgRating}<br />
											{renderRatingChange(match.team2.ratingChange)}
										</TableCell>
										<TableCell className={`${classes.teamCell} ${!isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}`}>
											<div className={classes.playerList}>
												{renderPlayers(match.team2.players)}
											</div>
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</FuseScrollbars>
			<TablePagination
				className="flex-shrink-0 overflow-hidden"
				component="div"
				count={filteredMatches.length}
				rowsPerPage={rowsPerPage}
				page={page}
				backIconButtonProps={{
					'aria-label': 'Previous Page'
				}}
				nextIconButtonProps={{
					'aria-label': 'Next Page'
				}}
				onChangePage={handleChangePage}
				onChangeRowsPerPage={handleChangeRowsPerPage}
			/>
		</div>
	);
}

export default MatchHistoryTable;
