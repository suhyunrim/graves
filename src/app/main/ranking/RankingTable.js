import FuseScrollbars from '@fuse/core/FuseScrollbars';
import _ from '@lodash';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as Actions from './store/actions';
import RankingTableHead from './RankingTableHeader';

function RankingTable(props) {
	const dispatch = useDispatch();
	const ranking = useSelector(({ Ranking }) => {
		return Ranking.ranking.data;
	});
	const searchText = useSelector(({ Ranking }) => Ranking.ranking.searchText);
	const isRefreshingGroupRating = useSelector(({ Ranking }) => Ranking.ranking.isRefreshingGroupRating);

	const [data, setData] = useState(ranking);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
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
		UNRANKED: 500,
	};
	const tierSteps = ['IV', 'III', 'II', 'I'];

	const groupName = useSelector(state => state.auth.user.reprGroup.groupName);

	useEffect(() => {
		dispatch(Actions.getRanking(groupName));
	}, [dispatch, groupName, isRefreshingGroupRating]);

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

		setOrder({
			direction,
			id
		});
	}

	function handleChangePage(event, value) {
		setPage(value);
	}

	function handleChangeRowsPerPage(event) {
		setRowsPerPage(event.target.value);
	}

	function getTierName(rating) {
		let entries = Object.entries(tierNames);
		entries = entries.filter((elem) => elem[0] !== 'UNRANKED');
		entries = entries.sort((a, b) => b[1] - a[1]);
		for (const [name, tierRating] of entries) {
			if (rating < tierRating) {
				continue;
			}
		
			return `${name}`;
		}
	}

	function getTierPoint(rating) {
		let entries = Object.entries(tierNames);
		entries = entries.filter((elem) => elem[0] !== 'UNRANKED');
		entries = entries.sort((a, b) => b[1] - a[1]);
		for (const [name, tierRating] of entries) {
			if (rating < tierRating) {
				continue;
			}
		
			if (isNonStepTier(name)) {
				return Math.floor((rating - tierRating) * 4);
			} else {
				return Math.floor((rating - tierRating) % 25 * 4);
			}
		}
	}

	function getRatingTierName(rating) {
		let entries = Object.entries(tierNames);
		entries = entries.filter((elem) => elem[0] !== 'UNRANKED');
		entries = entries.sort((a, b) => b[1] - a[1]);
		for (const [name, tierRating] of entries) {
			if (rating < tierRating) {
				continue;
			}
		
			if (isNonStepTier(name)) {
				return `${name}`;
			}
			else {
				return `${name} ${tierSteps[Math.floor((rating - tierRating) / 25)]}`;
			}
		}
	}

	function isNonStepTier(tierName) {
		return tierName === 'MASTER' || tierName === 'GRANDMASTER' || tierName === 'CHALLENGER';
	}

	return (
		<div className="w-full flex flex-col">
			<FuseScrollbars className="flex-grow overflow-x-auto">
				<Table className="min-w-xl" aria-labelledby="tableTitle">
					<RankingTableHead order={order} onRequestSort={handleRequestSort} rowCount={data.length} />

					<TableBody>
						{_.orderBy(data, [o => o[order.id]], [order.direction])
							.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
							.map((n, i) => {
								return (
									<TableRow className="h-64 cursor-pointer" hover role="checkbox" tabIndex={-1} key={n.riotId}>
										<TableCell component="th" scope="row">
											{n.ranking}
										</TableCell>

										<TableCell component="th" scope="row">
											{n.name}
										</TableCell>

										<TableCell component="th" scope="row">
											<img width="32" height="32" src={"/assets/images/ranked-emblems/Emblem_" + getTierName(n.rating) +".png"} alt={getTierName(n.rating)}/> {getRatingTierName(n.rating) + " " + getTierPoint(n.rating) + "LP"}
										</TableCell>

										<TableCell component="th" scope="row">
											{n.win}
										</TableCell>

										<TableCell component="th" scope="row">
											{n.lose}
										</TableCell>

										<TableCell component="th" scope="row">
											{n.winRate}
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</FuseScrollbars>

			<TablePagination
				className="overflow-hidden"
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
		</div>
	);
}

export default withRouter(RankingTable);
