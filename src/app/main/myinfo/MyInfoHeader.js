import React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		width: '100%',
		padding: '24px 28px 16px',
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
		margin: 0
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginTop: 10,
		letterSpacing: '0.05em'
	}
}));

function MyInfoHeader() {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<Typography className={classes.title} variant="h4">
				My Info
			</Typography>
			<Typography className={classes.subtitle}>
				내 소환사 정보 및 내전 기록
			</Typography>
		</div>
	);
}

export default MyInfoHeader;
