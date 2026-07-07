import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import { makeStyles } from 'tss-react/mui';
import { withStyles } from 'tss-react/mui';
import React from 'react';

const rows = [
	{
		id: 'ranking',
		align: 'left',
		disablePadding: false,
		label: '#',
		sort: true
	},
	{
		id: 'name',
		align: 'left',
		disablePadding: false,
		label: '소환사',
		sort: true
	},
	{
		id: 'rating',
		align: 'left',
		disablePadding: false,
		label: '티어',
		sort: true
	},
	{
		id: 'games',
		align: 'left',
		disablePadding: false,
		label: '판수',
		sort: true
	},
	{
		id: 'win',
		align: 'left',
		disablePadding: false,
		label: '승',
		sort: true
	},
	{
		id: 'lose',
		align: 'left',
		disablePadding: false,
		label: '패',
		sort: true
	},
	{
		id: 'winRate',
		align: 'left',
		disablePadding: false,
		label: '승률',
		sort: true
	}
];

// 포지션 필터 선택 시 컬럼 구성: 전적을 포지션/전체로 나눠 보여준다
const positionRows = [
	{
		id: 'ranking',
		align: 'left',
		disablePadding: false,
		label: '#',
		sort: true
	},
	{
		id: 'name',
		align: 'left',
		disablePadding: false,
		label: '소환사',
		sort: true
	},
	{
		id: 'rating',
		align: 'left',
		disablePadding: false,
		label: '티어',
		sort: true
	},
	{
		id: 'positionWinRate',
		align: 'left',
		disablePadding: false,
		label: '포지션 전적',
		sort: true
	},
	{
		id: 'winRate',
		align: 'left',
		disablePadding: false,
		label: '전체 전적',
		sort: true
	}
];

const useStyles = makeStyles()((theme) => ({
	sortLabel: {
		color: 'rgba(255, 255, 255, 0.7) !important',
		'&:hover': {
			color: '#00d4ff !important'
		},
		'&.MuiTableSortLabel-active': {
			color: '#00d4ff !important'
		},
		'& .MuiTableSortLabel-icon': {
			color: '#00d4ff !important'
		}
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
	}
}));

const StyledTableRow = withStyles(TableRow, (theme) => ({
	root: {
		height: 64
	}
}));

function RankingTableHead(props) {
	const { classes } = useStyles();

	const createSortHandler = property => event => {
		props.onRequestSort(event, property);
	};

	const headRows = props.isPosition ? positionRows : rows;

	return (
		<TableHead>
			<StyledTableRow>
				{headRows.map(row => {
					return (
						<StyledTableCell
							key={row.id}
							align={row.align}
							padding={row.disablePadding ? 'none' : 'default'}
							sortDirection={props.order.id === row.id ? props.order.direction : false}
						>
							{row.sort && (
								<Tooltip
									title="정렬"
									placement={row.align === 'right' ? 'bottom-end' : 'bottom-start'}
									enterDelay={300}
								>
									<TableSortLabel
										className={classes.sortLabel}
										active={props.order.id === row.id}
										direction={props.order.direction}
										onClick={createSortHandler(row.id)}
									>
										{row.label}
									</TableSortLabel>
								</Tooltip>
							)}
						</StyledTableCell>
					);
				}, this)}
			</StyledTableRow>
		</TableHead>
	);
}

export default RankingTableHead;
