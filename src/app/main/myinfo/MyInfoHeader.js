import React from 'react';
import { Typography } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		width: '100%',
		padding: '24px 28px 16px',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
	},
	titleRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 12
	},
	backButton: {
		color: 'rgba(255, 255, 255, 0.7)',
		padding: 8,
		transition: 'color 0.2s ease',
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.1)'
		}
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
		[theme.breakpoints.down('sm')]: {
			fontSize: '2.75rem'
		}
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginTop: 10,
		letterSpacing: '0.05em',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.35rem'
		}
	}
}));

function MyInfoHeader({ title, subtitle, showBack }) {
	const classes = useStyles();
	const history = useHistory();

	return (
		<div className={classes.root}>
			<div className={classes.titleRow}>
				{showBack && (
					<IconButton className={classes.backButton} onClick={() => history.goBack()}>
						<ArrowBackIcon />
					</IconButton>
				)}
				<Typography className={classes.title} variant="h4">
					{title || 'My Info'}
				</Typography>
			</div>
			<Typography className={classes.subtitle}>
				{subtitle || '내 소환사 정보 및 내전 기록'}
			</Typography>
		</div>
	);
}

export default MyInfoHeader;
