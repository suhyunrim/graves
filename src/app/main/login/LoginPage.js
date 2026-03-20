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
	},
	divider: {
		display: 'flex',
		alignItems: 'center',
		width: '100%',
		margin: '24px 0',
		[theme.breakpoints.up('md')]: {
			margin: '32px 0'
		}
	},
	dividerLine: {
		flex: 1,
		height: 1,
		background: 'rgba(255, 255, 255, 0.15)'
	},
	dividerText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.85rem',
		color: 'rgba(255, 255, 255, 0.4)',
		padding: '0 16px',
		[theme.breakpoints.up('md')]: {
			fontSize: '1.4rem'
		}
	},
	discordButton: {
		background: '#5865F2',
		borderRadius: 8,
		padding: '12px 32px',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 600,
		fontSize: '1rem',
		letterSpacing: '0.05em',
		color: '#fff',
		boxShadow: '0 4px 15px rgba(88, 101, 242, 0.3)',
		transition: 'all 0.3s ease',
		'&:hover': {
			background: '#4752C4',
			boxShadow: '0 6px 20px rgba(88, 101, 242, 0.5)',
			transform: 'translateY(-2px)'
		},
		[theme.breakpoints.up('md')]: {
			padding: '18px 48px',
			fontSize: '2rem',
			borderRadius: 12
		}
	},
	discordIcon: {
		width: 24,
		height: 24,
		marginRight: 8,
		[theme.breakpoints.up('md')]: {
			width: 32,
			height: 32,
			marginRight: 12
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

	function handleDiscordLogin() {
		window.location.href = `${process.env.REACT_APP_CAMILLE_HOST}api/auth/discord`;
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

							<div className={classes.divider}>
								<div className={classes.dividerLine} />
								<span className={classes.dividerText}>또는</span>
								<div className={classes.dividerLine} />
							</div>

							<Button className={clsx(classes.discordButton, 'w-full')} onClick={handleDiscordLogin}>
								<svg className={classes.discordIcon} viewBox="0 0 71 55" fill="currentColor">
									<path d="M60.1 4.9C55.6 2.8 50.7 1.3 45.7.4c-.1 0-.2 0-.2.1-.6 1.1-1.3 2.6-1.8 3.7-5.5-.8-10.9-.8-16.2 0-.5-1.2-1.2-2.6-1.8-3.7-.1-.1-.2-.1-.2-.1C20.3 1.3 15.4 2.8 10.9 4.9c0 0-.1 0-.1.1C1.6 18.7-.9 32.1.3 45.4c0 .1 0 .1.1.2 6.1 4.5 12 7.2 17.7 9 .1 0 .2 0 .3-.1 1.4-1.9 2.6-3.8 3.6-5.9.1-.1 0-.3-.1-.3-2-.7-3.8-1.6-5.6-2.7-.1-.1-.1-.3 0-.4.5-.3.9-.6 1.2-.9.1-.1.1-.1.2-.1 11.6 5.3 24.2 5.3 35.7 0h.2c.4.3.8.7 1.2.9.1.1.1.3 0 .4-1.8 1-3.6 2-5.6 2.7-.1 0-.2.2-.1.3 1.1 2.1 2.3 4 3.6 5.9.1.1.2.1.3.1 5.8-1.8 11.7-4.5 17.8-9 .1 0 .1-.1.1-.2 1.5-15.3-2.5-28.6-10.5-40.4 0 0 0-.1-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.4 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.4 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" />
								</svg>
								Discord로 로그인
							</Button>
						</CardContent>
					</Card>
				</FuseAnimate>
			</div>
		</div>
	);
}

export default LoginPage;
