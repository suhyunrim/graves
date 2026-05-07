import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import startDiscordLogin from 'app/utility/discordAuth';
import useDialogStyles from './dialogStyles';

const useStyles = makeStyles()((theme) => ({
	paperWidth: {
		minWidth: 380,
		maxWidth: 480,
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 16,
			width: 'calc(100% - 32px)'
		}
	},
	body: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.85)',
		lineHeight: 1.6,
		paddingTop: 4
	},
	emphasis: {
		color: '#00d4ff',
		fontWeight: 700
	},
	discordBtn: {
		background: 'linear-gradient(135deg, #5865F2 0%, #4752c4 100%)',
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.2rem',
		padding: '8px 22px',
		borderRadius: 10,
		textTransform: 'none',
		boxShadow: '0 4px 18px rgba(88, 101, 242, 0.35)',
		'&:hover': {
			background: 'linear-gradient(135deg, #4752c4 0%, #3942a8 100%)',
			boxShadow: '0 6px 22px rgba(88, 101, 242, 0.5)'
		}
	}
}));

function LoginRequiredDialog({ open, onClose, actionLabel }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();

	function handleLogin() {
		const returnTo = window.location.pathname + window.location.search + window.location.hash;
		startDiscordLogin(returnTo);
	}

	return (
		<Dialog
			open={open}
			onClose={onClose}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>로그인 필요</DialogTitle>
			<DialogContent className={dialogClasses.contentPad}>
				<div className={classes.body}>
					{actionLabel ? (
						<>
							<span className={classes.emphasis}>{actionLabel}</span>
							{'은(는) 디스코드 로그인이 필요한 기능입니다.'}
						</>
					) : '디스코드 로그인이 필요한 기능입니다.'}
					<br />
					로그인 후 원래 페이지로 자동 복귀합니다.
				</div>
			</DialogContent>
			<DialogActions className={dialogClasses.actionsPad}>
				<Button className={dialogClasses.cancelBtn} onClick={onClose}>
					취소
				</Button>
				<Button className={classes.discordBtn} onClick={handleLogin}>
					디스코드 로그인
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default LoginRequiredDialog;
