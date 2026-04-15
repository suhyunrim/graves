import React, { useEffect } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Button } from '@mui/material';
import history from '@history';
import createCamilleAxios from 'app/utility/camilleAxios';

const useStyles = makeStyles()(() => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: '100vh',
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		padding: 20,
		textAlign: 'center'
	},
	icon: {
		fontSize: '5rem',
		marginBottom: 24
	},
	title: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		color: '#fff',
		marginBottom: 12
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 32
	},
	retryBtn: {
		background: 'rgba(0, 212, 255, 0.15)',
		color: '#00d4ff',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 600,
		fontSize: '1.2rem',
		padding: '10px 32px',
		borderRadius: 12,
		textTransform: 'none',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.25)'
		}
	}
}));

function Maintenance() {
	const { classes } = useStyles();

	useEffect(() => {
		const interval = setInterval(() => {
			createCamilleAxios()
				.get('/api/health', { silentError: true })
				.then(() => {
					history.replace('/');
				})
				.catch(() => {});
		}, 15000);
		return () => clearInterval(interval);
	}, []);

	function handleRetry() {
		createCamilleAxios()
			.get('/api/health', { silentError: true })
			.then(() => {
				history.replace('/');
			})
			.catch(() => {});
	}

	return (
		<div className={classes.root}>
			<span className={classes.icon} role="img" aria-label="tools">&#x1F6E0;&#xFE0F;</span>
			<div className={classes.title}>서버 점검 중입니다</div>
			<div className={classes.subtitle}>잠시 후 다시 시도해주세요.</div>
			<Button className={classes.retryBtn} onClick={handleRetry}>
				다시 연결
			</Button>
		</div>
	);
}

export default Maintenance;
