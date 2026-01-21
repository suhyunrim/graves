import React from 'react';
import { Typography, InputBase } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from './store/actions';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		padding: '24px 28px 20px',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
	},
	topRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			gap: 16
		}
	},
	titleWrapper: {
		position: 'absolute',
		left: 0,
		[theme.breakpoints.down('sm')]: {
			position: 'static',
			width: '100%'
		}
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '4.5rem',
		color: '#fff',
		textTransform: 'uppercase',
		letterSpacing: '0.15em',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
		margin: 0,
		[theme.breakpoints.down('sm')]: {
			fontSize: '2.75rem'
		}
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginTop: 10,
		letterSpacing: '0.05em',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.35rem'
		}
	},
	searchWrapper: {
		display: 'flex',
		alignItems: 'center',
		background: 'rgba(255, 255, 255, 0.05)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		borderRadius: 12,
		padding: '10px 18px',
		width: 560,
		transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
		'&:focus-within': {
			borderColor: 'rgba(0, 212, 255, 0.6)',
			boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)'
		},
		[theme.breakpoints.down('sm')]: {
			width: '100%'
		}
	},
	searchIcon: {
		color: 'rgba(255, 255, 255, 0.4)',
		marginRight: 12,
		fontSize: '1.5rem'
	},
	searchInput: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: '#fff',
		flex: 1,
		'&::placeholder': {
			color: 'rgba(255, 255, 255, 0.4)'
		}
	}
}));

function RankingHeader() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const searchText = useSelector(({ Ranking }) => Ranking.ranking.searchText);

	return (
		<div className={classes.root}>
			<div className={classes.topRow}>
				<div className={classes.titleWrapper}>
					<Typography className={classes.title} variant="h4">
						Ranking
					</Typography>
					<Typography className={classes.subtitle}>내전 레이팅 순위</Typography>
				</div>
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
		</div>
	);
}

export default RankingHeader;
