import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { useDispatch } from 'react-redux';
import history from '@history';
import * as userActions from 'app/auth/store/actions';

const useStyles = makeStyles(() => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: '100vh',
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		padding: 24
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '5rem',
		color: '#fff',
		textTransform: 'uppercase',
		letterSpacing: '0.15em',
		textShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
		marginBottom: 16
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginBottom: 48,
		textAlign: 'center'
	},
	button: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0094ff 100%)',
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		padding: '16px 48px',
		borderRadius: 16,
		textTransform: 'none',
		boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)',
		transition: 'all 0.3s ease',
		'&:hover': {
			background: 'linear-gradient(135deg, #00b8e6 0%, #0080e6 100%)',
			boxShadow: '0 0 50px rgba(0, 212, 255, 0.6)',
			transform: 'translateY(-2px)'
		}
	},
	description: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginTop: 32,
		textAlign: 'center',
		maxWidth: 500,
		lineHeight: 1.6
	}
}));

function SampleLanding() {
	const classes = useStyles();
	const dispatch = useDispatch();

	function handleStart() {
		dispatch(userActions.enterSampleMode());
		history.push('/dashboard');
	}

	return (
		<div className={classes.root}>
			<Typography className={classes.title} variant="h1">
				GRAVES
			</Typography>
			<Typography className={classes.subtitle}>
				LoL Custom Game Statistics Dashboard
			</Typography>
			<Button className={classes.button} onClick={handleStart}>
				체험하기
			</Button>
			<Typography className={classes.description}>
				서버 연결 없이 샘플 데이터로 대시보드를 체험합니다.
				<br />
				변경사항은 로컬에 저장됩니다.
			</Typography>
		</div>
	);
}

export default SampleLanding;
