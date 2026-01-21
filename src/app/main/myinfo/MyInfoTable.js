import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseLoading from '@fuse/core/FuseLoading';
import _ from '@lodash';
import getLatesetRiotDataVersion from 'app/utility/getLatesetRiotDataVersion';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getKDAColor, getWinRateColor } from 'app/utility/statisticsColor';
import * as Actions from './store/actions';

const useStyles = makeStyles(theme => ({
	tableContainer: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.2)',
		padding: '24px 0',
		marginTop: 0,
		animation: '$fadeIn 0.6s ease',
		animationDelay: '0.2s',
		animationFillMode: 'backwards'
	},
	'@keyframes fadeIn': {
		'0%': { opacity: 0, transform: 'translateY(20px)' },
		'100%': { opacity: 1, transform: 'translateY(0)' }
	},
	tableTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff',
		marginBottom: 20,
		paddingLeft: 28,
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
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '60px 20px',
		textAlign: 'center'
	},
	emptyIcon: {
		fontSize: '4rem',
		marginBottom: 16,
		opacity: 0.5
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	championImage: {
		width: 48,
		height: 48,
		borderRadius: 8,
		border: '2px solid rgba(255, 255, 255, 0.1)',
		marginRight: 12,
		transition: 'transform 0.2s ease, border-color 0.2s ease',
		'&:hover': {
			transform: 'scale(1.1)',
			borderColor: 'rgba(0, 212, 255, 0.5)'
		}
	},
	championName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 600,
		color: '#fff'
	},
	kdaText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700
	},
	kdaDetail: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginLeft: 8
	},
	winRateText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 700
	},
	recordText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.7)'
	},
	pagination: {
		color: 'rgba(255, 255, 255, 0.7)',
		'& .MuiTablePagination-selectIcon': {
			color: 'rgba(255, 255, 255, 0.5)'
		},
		'& .MuiIconButton-root': {
			color: 'rgba(255, 255, 255, 0.5)'
		},
		'& .MuiIconButton-root.Mui-disabled': {
			color: 'rgba(255, 255, 255, 0.2)'
		}
	}
}));

const StyledTableCell = withStyles(theme => ({
	head: {
		backgroundColor: 'transparent',
		color: 'rgba(255, 255, 255, 0.5)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		fontWeight: 600,
		borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
		padding: '16px 24px'
	},
	body: {
		backgroundColor: 'transparent',
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		padding: '16px 24px'
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

function MyInfoTable(props) {
	const classes = useStyles();
	const dispatch = useDispatch();

	const championInfos = useSelector(({ MyInfo }) => MyInfo.championInfo);

	const [data] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [order] = useState({
		direction: 'desc',
		id: 'totalMatchCount'
	});

	useEffect(() => {
		dispatch(Actions.retrieveChampionInfo());
	}, [dispatch]);

	const handleChangePage = (event, value) => {
		setPage(value);
	};

	const handleChangeRowsPerPage = event => {
		setRowsPerPage(event.target.value);
	};

	const getChampInfo = champId => {
		const id = Object.keys(championInfos.data).find(key => Number(championInfos.data[key].key) === champId);
		return championInfos.data[id];
	};

	const getChampImageURI = champId => {
		const info = getChampInfo(champId);
		return `https://ddragon.leagueoflegends.com/cdn/${getLatesetRiotDataVersion()}/img/champion/${info.id}.png`;
	};

	if (!championInfos.data) {
		return <FuseLoading />;
	}

	return (
		<div className={classes.tableContainer}>
			<div className={classes.tableTitle}>Champion Statistics</div>
			{data.length > 0 ? (
				<>
					<FuseScrollbars className="flex-grow overflow-x-auto">
						<Table>
							<TableHead>
								<TableRow>
									<StyledTableCell>#</StyledTableCell>
									<StyledTableCell>Champion</StyledTableCell>
									<StyledTableCell>Record</StyledTableCell>
									<StyledTableCell>KDA</StyledTableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{_.orderBy(data, [o => o[order.id]], [order.direction])
									.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
									.map((n, i) => {
										return (
											<StyledTableRow key={n.index}>
												<StyledTableCell>
													{page * rowsPerPage + i + 1}
												</StyledTableCell>
												<StyledTableCell>
													<div className="flex items-center">
														<img
															className={classes.championImage}
															src={getChampImageURI(n.championId)}
															alt="champion"
														/>
														<span className={classes.championName}>
															{getChampInfo(n.championId).name}
														</span>
													</div>
												</StyledTableCell>
												<StyledTableCell>
													<span className={classes.recordText}>
														{n.win}승 {n.lose}패
													</span>
													{' '}
													<span
														className={classes.winRateText}
														style={{ color: getWinRateColor(n.winRate) }}
													>
														{n.winRate}%
													</span>
												</StyledTableCell>
												<StyledTableCell>
													<span
														className={classes.kdaText}
														style={{ color: getKDAColor(n.kda) }}
													>
														{n.kda.toFixed(2)}
													</span>
													<span className={classes.kdaDetail}>
														({n.averageKills.toFixed(1)} / {n.averageDeaths.toFixed(1)} / {n.averageAssists.toFixed(1)})
													</span>
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
						count={data.length}
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
				</>
			) : (
				<div className={classes.emptyState}>
					<div className={classes.emptyIcon}>🎮</div>
					<div className={classes.emptyText}>챔피언 통계 데이터가 없습니다</div>
				</div>
			)}
		</div>
	);
}

export default withRouter(MyInfoTable);
