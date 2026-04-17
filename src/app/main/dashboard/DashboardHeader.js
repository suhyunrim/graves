import React from 'react';
import { Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import SeasonCountdownBadge from '../components/SeasonCountdownBadge';

const useStyles = makeStyles()((theme) => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		width: '100%',
		padding: '24px 24px 16px',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '3.5rem',
		color: '#fff',
		textTransform: 'uppercase',
		letterSpacing: '0.15em',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
		margin: 0,
		[theme.breakpoints.down('md')]: {
			fontSize: '2.75rem'
		}
	},
	subtitleRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
		marginTop: 8,
		flexWrap: 'wrap'
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.6)',
		letterSpacing: '0.05em',
		[theme.breakpoints.down('md')]: {
			fontSize: '1.35rem'
		}
	}
}));

function DashboardHeader() {
	const { classes } = useStyles();

	return (
		<div className={classes.root}>
			<Typography className={classes.title} variant="h4">
				Dashboard
			</Typography>
			<div className={classes.subtitleRow}>
				<Typography className={classes.subtitle}>이번 달 내전 하이라이트</Typography>
				<SeasonCountdownBadge />
			</div>
		</div>
	);
}

export default DashboardHeader;
