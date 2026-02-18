import React from 'react';
import { Typography, InputBase } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from './store/actions';

const periodOptions = [
	{ id: 'thisMonth', label: '이번 달' },
	{ id: 'lastMonth', label: '지난 달' },
	{ id: 'all', label: '전체' }
];

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		padding: '24px 28px 20px',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '4rem',
		color: '#fff',
		textTransform: 'uppercase',
		letterSpacing: '0.15em',
		textShadow: '0 0 20px rgba(255, 193, 7, 0.5)',
		margin: 0,
		[theme.breakpoints.down('sm')]: {
			fontSize: '2.75rem'
		}
	},
	subtitleRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		marginTop: 10,
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			alignItems: 'flex-start',
			gap: 12
		}
	},
	subtitle: {
		position: 'absolute',
		left: 0,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.6)',
		letterSpacing: '0.05em',
		[theme.breakpoints.down('sm')]: {
			position: 'static',
			fontSize: '1.35rem'
		}
	},
	searchWrapper: {
		display: 'flex',
		alignItems: 'center',
		background: 'rgba(255, 255, 255, 0.05)',
		border: '1px solid rgba(255, 193, 7, 0.3)',
		borderRadius: 12,
		padding: '8px 16px',
		width: 450,
		maxWidth: 'calc(100% - 300px)',
		transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
		'&:focus-within': {
			borderColor: 'rgba(255, 193, 7, 0.6)',
			boxShadow: '0 0 20px rgba(255, 193, 7, 0.2)'
		},
		[theme.breakpoints.down('sm')]: {
			width: '100%',
			maxWidth: '100%'
		}
	},
	searchIcon: {
		color: 'rgba(255, 255, 255, 0.4)',
		marginRight: 10,
		fontSize: '1.4rem'
	},
	searchInput: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: '#fff',
		flex: 1,
		'&::placeholder': {
			color: 'rgba(255, 255, 255, 0.4)'
		}
	},
	filterRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginTop: 16,
		[theme.breakpoints.down('sm')]: {
			justifyContent: 'center'
		}
	},
	filterChip: {
		display: 'flex',
		alignItems: 'center',
		padding: '6px 16px',
		borderRadius: 16,
		background: 'rgba(255, 255, 255, 0.08)',
		border: '1px solid rgba(255, 255, 255, 0.1)',
		color: 'rgba(255, 255, 255, 0.7)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 500,
		cursor: 'pointer',
		transition: 'all 0.2s ease',
		'&:hover': {
			background: 'rgba(255, 193, 7, 0.15)',
			borderColor: 'rgba(255, 193, 7, 0.3)'
		}
	},
	filterChipActive: {
		background: 'rgba(255, 193, 7, 0.2)',
		borderColor: '#ffc107',
		color: '#ffc107'
	}
}));

function HonorRankingHeader() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const searchText = useSelector(({ HonorRanking }) => HonorRanking.honorRanking.searchText);
	const period = useSelector(({ HonorRanking }) => HonorRanking.honorRanking.period);

	return (
		<div className={classes.root}>
			<Typography className={classes.title} variant="h4">
				Honor
			</Typography>
			<div className={classes.subtitleRow}>
				<Typography className={classes.subtitle}>MVP 투표 명예 랭킹</Typography>
				<div className={classes.searchWrapper}>
					<SearchIcon className={classes.searchIcon} />
					<InputBase
						className={classes.searchInput}
						placeholder="소환사 검색..."
						value={searchText}
						onChange={ev => dispatch(Actions.setSearchText(ev))}
						inputProps={{ 'aria-label': 'search' }}
					/>
				</div>
			</div>
			<div className={classes.filterRow}>
				{periodOptions.map(option => (
					<div
						key={option.id}
						className={`${classes.filterChip} ${period === option.id ? classes.filterChipActive : ''}`}
						onClick={() => dispatch(Actions.setPeriod(option.id))}
						role="button"
						tabIndex={0}
						onKeyDown={e => e.key === 'Enter' && dispatch(Actions.setPeriod(option.id))}
					>
						{option.label}
					</div>
				))}
			</div>
		</div>
	);
}

export default HonorRankingHeader;
