import React from 'react';
import { Typography, InputBase } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from './store/actions';

const useStyles = makeStyles()((theme) => ({
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
		textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
		margin: 0,
		[theme.breakpoints.down('md')]: {
			fontSize: '2.75rem'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '2.1rem',
			letterSpacing: '0.06em'
		}
	},
	subtitleRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		marginTop: 10,
		[theme.breakpoints.down('md')]: {
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
		[theme.breakpoints.down('md')]: {
			position: 'static',
			fontSize: '1.35rem'
		}
	},
	searchWrapper: {
		display: 'flex',
		alignItems: 'center',
		background: 'rgba(255, 255, 255, 0.05)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		borderRadius: 12,
		padding: '8px 16px',
		width: 450,
		maxWidth: 'calc(100% - 300px)',
		transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
		'&:focus-within': {
			borderColor: 'rgba(0, 212, 255, 0.6)',
			boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)'
		},
		[theme.breakpoints.down('md')]: {
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
	}
}));

function GroupSettingsHeader({ subtitle, showSearch }) {
	const { classes } = useStyles();
	const dispatch = useDispatch();
	const searchText = useSelector(({ GroupSettings }) => GroupSettings.groupSettings.searchText);

	return (
		<div className={classes.root}>
			<Typography className={classes.title} variant="h4">
				Group Settings
			</Typography>
			<div className={classes.subtitleRow}>
				<Typography className={classes.subtitle}>{subtitle}</Typography>
				{showSearch && (
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
				)}
			</div>
		</div>
	);
}

export default GroupSettingsHeader;
