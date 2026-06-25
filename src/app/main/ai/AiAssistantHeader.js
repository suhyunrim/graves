import React from 'react';
import { Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useSelector } from 'react-redux';

const useStyles = makeStyles()((theme) => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		width: '100%',
		padding: '20px 28px 14px',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
	},
	titleRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 12
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '2.8rem',
		color: '#fff',
		letterSpacing: '0.05em',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
		margin: 0,
		[theme.breakpoints.down('md')]: {
			fontSize: '2.2rem'
		}
	},
	icon: {
		fontSize: '2.8rem',
		[theme.breakpoints.down('md')]: {
			fontSize: '2.2rem'
		}
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginTop: 6,
		letterSpacing: '0.03em',
		[theme.breakpoints.down('md')]: {
			fontSize: '1.25rem'
		}
	}
}));

function AiAssistantHeader() {
	const { classes } = useStyles();
	const groupName = useSelector(state => state.auth.user?.reprGroup?.groupName) || '우리 그룹';

	return (
		<div className={classes.root}>
			<div className={classes.titleRow}>
				<span className={classes.icon} role="img" aria-label="robot">
					&#x1F916;
				</span>
				<Typography className={classes.title} variant="h4">
					AI 도우미
				</Typography>
			</div>
			<Typography className={classes.subtitle}>{groupName}에 대해 자유롭게 물어보세요!</Typography>
		</div>
	);
}

export default AiAssistantHeader;
