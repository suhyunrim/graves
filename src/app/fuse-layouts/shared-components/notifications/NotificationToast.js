import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Avatar from '@mui/material/Avatar';
import Slide from '@mui/material/Slide';
import { makeStyles } from 'tss-react/mui';
import { formatMessage, getActorAvatar, getActorInitial } from './notificationFormat';

const useStyles = makeStyles()((theme) => ({
	root: {
		[theme.breakpoints.up('sm')]: {
			maxWidth: 440
		}
	},
	card: {
		display: 'flex',
		alignItems: 'flex-start',
		gap: 12,
		width: '100%',
		padding: '14px 14px 14px 18px',
		cursor: 'pointer',
		textAlign: 'left',
		border: '1px solid rgba(0, 212, 255, 0.35)',
		borderRadius: 14,
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 32px rgba(0, 212, 255, 0.12)',
		color: '#fff',
		transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
		'&:hover': {
			borderColor: 'rgba(0, 212, 255, 0.6)',
			boxShadow: '0 10px 36px rgba(0, 0, 0, 0.55), 0 0 44px rgba(0, 212, 255, 0.22)'
		}
	},
	avatar: {
		flex: '0 0 auto',
		width: 38,
		height: 38,
		marginTop: 2,
		border: '1px solid rgba(0, 212, 255, 0.3)',
		background: 'rgba(0, 212, 255, 0.12)',
		color: '#00d4ff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 600,
		fontSize: '1.2rem'
	},
	body: {
		flex: 1,
		minWidth: 0
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.35rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.03em'
	},
	preview: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		lineHeight: 1.45,
		color: 'rgba(255, 255, 255, 0.85)',
		marginTop: 3,
		display: '-webkit-box',
		WebkitLineClamp: 2,
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden',
		wordBreak: 'break-word'
	},
	hint: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(0, 212, 255, 0.7)',
		marginTop: 6
	},
	closeBtn: {
		flex: '0 0 auto',
		marginTop: -2,
		marginRight: -4,
		color: 'rgba(255, 255, 255, 0.5)',
		'&:hover': {
			color: '#fff',
			background: 'rgba(255, 255, 255, 0.08)'
		}
	}
}));

function SlideUp(props) {
	return <Slide {...props} direction="up" />;
}

// 페이지 접속 중 새 알림이 도착하면 띄우는 클릭형 토스트. 클릭하면 해당 알림 위치로 이동(onOpen).
// AI 답변 토스트(AiAnswerToast)와 같은 톤이며, 알림은 여러 건이 올 수 있어 자동으로 사라진다.
function NotificationToast({ group, extraCount = 0, onOpen, onClose }) {
	const { classes } = useStyles();
	const avatarUrl = group ? getActorAvatar(group) : null;
	const initial = group ? getActorInitial(group) : '';

	const handleKeyDown = (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onOpen();
		}
	};

	return (
		<Snackbar
			open={Boolean(group)}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			slots={{ transition: SlideUp }}
			autoHideDuration={6000}
			onClose={(e, reason) => {
				if (reason !== 'clickaway') onClose();
			}}
			classes={{ root: classes.root }}
		>
			<div
				role="button"
				tabIndex={0}
				className={classes.card}
				onClick={onOpen}
				onKeyDown={handleKeyDown}
			>
				<Avatar src={avatarUrl || undefined} className={classes.avatar}>
					{avatarUrl ? null : initial || <Icon style={{ fontSize: 20 }}>notifications</Icon>}
				</Avatar>
				<div className={classes.body}>
					<div className={classes.title}>새 알림{extraCount > 0 ? ` 외 ${extraCount}건` : ''}</div>
					<div className={classes.preview}>{group ? formatMessage(group) : ''}</div>
					<div className={classes.hint}>탭하여 보기 →</div>
				</div>
				<IconButton
					aria-label="알림 닫기"
					size="small"
					className={classes.closeBtn}
					onClick={(e) => {
						e.stopPropagation();
						onClose();
					}}
				>
					<Icon style={{ fontSize: 20 }}>close</Icon>
				</IconButton>
			</div>
		</Snackbar>
	);
}

export default React.memo(NotificationToast);
