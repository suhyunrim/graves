import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import { makeStyles } from 'tss-react/mui';
import * as Actions from 'app/store/actions';
import clsx from 'clsx';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

const VARIANTS = {
	success: { icon: 'check_circle', accent: '#22d3a8' },
	error: { icon: 'error_outline', accent: '#ff4f6f' },
	warning: { icon: 'warning_amber', accent: '#ffb547' },
	info: { icon: 'info', accent: '#00d4ff' }
};

const useStyles = makeStyles()((theme) => ({
	root: {
		[theme.breakpoints.up('sm')]: {
			minWidth: 320,
			maxWidth: 520
		}
	},
	content: {
		position: 'relative',
		display: 'flex',
		alignItems: 'flex-start',
		gap: 12,
		minHeight: 56,
		padding: '14px 16px 14px 20px',
		background: 'rgba(26, 26, 46, 0.96)',
		backdropFilter: 'blur(8px)',
		WebkitBackdropFilter: 'blur(8px)',
		borderRadius: 10,
		border: '1px solid rgba(255, 255, 255, 0.08)',
		boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
		color: '#fff',
		overflow: 'hidden'
	},
	accentBar: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		width: 4
	},
	iconWrap: {
		flex: '0 0 auto',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 28,
		height: 28,
		borderRadius: '50%',
		marginTop: 2,
		'& .material-icons': {
			fontSize: 22
		}
	},
	message: {
		flex: 1,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		lineHeight: 1.5,
		color: '#fff',
		wordBreak: 'break-word',
		paddingTop: 4
	},
	closeButton: {
		flex: '0 0 auto',
		marginTop: -2,
		marginRight: -6,
		color: 'rgba(255, 255, 255, 0.55)',
		'&:hover': {
			color: '#fff',
			background: 'rgba(255, 255, 255, 0.08)'
		}
	}
}));

function SlideTransition(props) {
	return <Slide {...props} direction="left" />;
}

function FuseMessage() {
	const dispatch = useDispatch();
	const open = useSelector(({ fuse }) => fuse.message.state);
	const options = useSelector(({ fuse }) => fuse.message.options);
	const { classes } = useStyles();

	const variant = VARIANTS[options?.variant] || VARIANTS.info;
	const close = () => dispatch(Actions.hideMessage());

	const {
		message,
		anchorOrigin = { vertical: 'top', horizontal: 'right' },
		autoHideDuration = 3500,
		// eslint-disable-next-line no-unused-vars
		variant: _variantKey,
		...rest
	} = options || {};

	return (
		<Snackbar
			{...rest}
			open={open}
			onClose={close}
			anchorOrigin={anchorOrigin}
			autoHideDuration={autoHideDuration}
			TransitionComponent={SlideTransition}
			classes={{ root: classes.root }}
		>
			<div className={clsx(classes.content)} role="status">
				<span className={classes.accentBar} style={{ background: variant.accent }} />
				<span className={classes.iconWrap} style={{ color: variant.accent, background: `${variant.accent}1f` }}>
					<Icon>{variant.icon}</Icon>
				</span>
				<Typography className={classes.message}>{message}</Typography>
				<IconButton aria-label="알림 닫기" size="small" onClick={close} className={classes.closeButton}>
					<Icon style={{ fontSize: 18 }}>close</Icon>
				</IconButton>
			</div>
		</Snackbar>
	);
}

export default React.memo(FuseMessage);
