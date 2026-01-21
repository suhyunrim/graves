import FuseAnimate from '@fuse/core/FuseAnimate';
import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import { useForm } from '@fuse/hooks';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as authActions from 'app/auth/store/actions';

const useStyles = makeStyles(theme => ({
	'@keyframes pulseGlow': {
		'0%, 100%': {
			boxShadow: '0 0 30px rgba(0, 212, 255, 0.4), 0 0 60px rgba(0, 212, 255, 0.2)'
		},
		'50%': {
			boxShadow: '0 0 50px rgba(0, 212, 255, 0.6), 0 0 100px rgba(0, 212, 255, 0.4)'
		}
	},
	root: {
		background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
		position: 'relative',
		overflow: 'hidden',
		'&::before': {
			content: '""',
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 212, 255, 0.15) 0%, transparent 50%)',
			pointerEvents: 'none'
		}
	},
	card: {
		background: 'rgba(26, 26, 46, 0.95)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		borderRadius: 16,
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(0, 212, 255, 0.1)',
		backdropFilter: 'blur(10px)',
		maxWidth: 384,
		width: '100%',
		[theme.breakpoints.up('md')]: {
			maxWidth: 600,
			borderRadius: 24
		}
	},
	cardContent: {
		padding: 32,
		[theme.breakpoints.up('md')]: {
			padding: 56
		}
	},
	logo: {
		width: 128,
		height: 128,
		margin: 32,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '3px solid rgba(0, 212, 255, 0.5)',
		boxShadow: '0 0 30px rgba(0, 212, 255, 0.4), 0 0 60px rgba(0, 212, 255, 0.2)',
		animation: '$pulseGlow 3s ease-in-out infinite',
		[theme.breakpoints.up('md')]: {
			width: 200,
			height: 200,
			margin: 48,
			border: '4px solid rgba(0, 212, 255, 0.5)'
		}
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.5rem',
		color: '#fff',
		textTransform: 'uppercase',
		letterSpacing: '0.15em',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
		[theme.breakpoints.up('md')]: {
			fontSize: '3rem'
		}
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.9rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginTop: 8,
		[theme.breakpoints.up('md')]: {
			fontSize: '1.8rem',
			marginTop: 16
		}
	},
	textField: {
		'& .MuiOutlinedInput-root': {
			background: 'rgba(255, 255, 255, 0.03)',
			borderRadius: 8,
			[theme.breakpoints.up('md')]: {
				borderRadius: 12
			},
			'& fieldset': {
				borderColor: 'rgba(0, 212, 255, 0.3)'
			},
			'&:hover fieldset': {
				borderColor: 'rgba(0, 212, 255, 0.5)'
			},
			'&.Mui-focused fieldset': {
				borderColor: '#00d4ff',
				boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
			}
		},
		'& .MuiInputLabel-root': {
			color: 'rgba(255, 255, 255, 0.6)',
			[theme.breakpoints.up('md')]: {
				fontSize: '1.8rem'
			}
		},
		'& .MuiInputBase-input': {
			color: '#fff',
			[theme.breakpoints.up('md')]: {
				fontSize: '1.8rem',
				padding: '20px 18px'
			}
		}
	},
	button: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		borderRadius: 8,
		padding: '12px 32px',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 600,
		fontSize: '1rem',
		letterSpacing: '0.1em',
		textTransform: 'uppercase',
		boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
		transition: 'all 0.3s ease',
		'&:hover': {
			background: 'linear-gradient(135deg, #00e5ff 0%, #00b8e6 100%)',
			boxShadow: '0 6px 20px rgba(0, 212, 255, 0.5)',
			transform: 'translateY(-2px)'
		},
		'&:disabled': {
			background: 'rgba(255, 255, 255, 0.1)',
			color: 'rgba(255, 255, 255, 0.3)',
			boxShadow: 'none'
		},
		[theme.breakpoints.up('md')]: {
			padding: '18px 48px',
			fontSize: '2rem',
			borderRadius: 12
		}
	}
}));

function LoginPage() {
	const classes = useStyles();
	const dispatch = useDispatch();

	const { form, handleChange, resetForm } = useForm({
		riotId: ''
	});

	const isPending = useSelector(({ auth }) => auth.login.isPending);

	function isFormValid() {
		return form.riotId.length > 0 && form.riotId.includes('#');
	}

	function handleSubmit(ev) {
		dispatch(authActions.submitLogin(form));
		ev.preventDefault();
		resetForm();
	}

	if (isPending) return <FuseSplashScreen />;

	return (
		<div className={clsx(classes.root, 'flex flex-col flex-auto flex-shrink-0 items-center justify-center p-32')}>
			<div className="flex flex-col items-center justify-center w-full">
				<FuseAnimate animation="transition.expandIn">
					<Card className={classes.card}>
						<CardContent className={clsx(classes.cardContent, 'flex flex-col items-center justify-center')}>
							<img className={classes.logo} src="assets/images/graves.jpg" alt="Graves" />

							<Typography className={classes.title}>
								Login
							</Typography>
							<Typography className={classes.subtitle}>
								롤 <b>닉네임#태그</b> 로 로그인하세요
							</Typography>

							<form name="loginForm" noValidate className="flex flex-col justify-center w-full mt-24" onSubmit={handleSubmit}>
								<TextField
									className={clsx(classes.textField, 'mb-16')}
									label="Nickname#TAG"
									placeholder="Nickname#TAG"
									autoFocus
									name="riotId"
									value={form.riotId}
									onChange={handleChange}
									variant="outlined"
									required
									fullWidth
								/>

								<Button
									className={clsx(classes.button, 'w-224 mx-auto mt-16')}
									aria-label="LOG IN"
									disabled={!isFormValid()}
									type="submit"
								>
									Login
								</Button>
							</form>
						</CardContent>
					</Card>
				</FuseAnimate>
			</div>
		</div>
	);
}

export default LoginPage;
