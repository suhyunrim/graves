import React from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import { makeStyles } from 'tss-react/mui';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService';
import {
	formatMessage,
	formatRelative,
	getActorAvatar,
	getActorInitial,
	getPrimaryActorProfile
} from './notificationFormat';

const TYPE_ICONS = {
	guestbook_comment: 'chat_bubble',
	guestbook_reply: 'reply',
	guestbook_like: 'favorite',
	guestbook_mention: 'alternate_email',
	challenge_end: 'emoji_events',
	achievement_unlock: 'military_tech',
	season_end: 'workspace_premium'
};

const useStyles = makeStyles()((theme) => ({
	root: {
		display: 'flex',
		alignItems: 'flex-start',
		gap: 12,
		padding: '12px 16px',
		cursor: 'pointer',
		transition: 'background 0.2s ease',
		borderLeft: '3px solid transparent',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.08)'
		}
	},
	unread: {
		background: 'rgba(0, 212, 255, 0.06)',
		borderLeftColor: '#00d4ff'
	},
	avatarWrap: {
		position: 'relative',
		flex: '0 0 auto'
	},
	avatar: {
		width: 40,
		height: 40,
		border: '2px solid rgba(0, 212, 255, 0.3)',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		color: '#00d4ff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 600
	},
	avatarClickable: {
		cursor: 'pointer',
		transition: 'transform 0.15s ease, border-color 0.15s ease',
		'&:hover': {
			transform: 'scale(1.06)',
			borderColor: 'rgba(0, 212, 255, 0.7)'
		}
	},
	systemAvatar: {
		background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.05) 100%)'
	},
	typeBadge: {
		position: 'absolute',
		bottom: -2,
		right: -2,
		width: 18,
		height: 18,
		borderRadius: '50%',
		background: '#00d4ff',
		color: '#0f0f1a',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		boxShadow: '0 0 0 2px #1a1a2e',
		'& .material-icons': {
			fontSize: 12
		}
	},
	body: {
		flex: 1,
		minWidth: 0
	},
	message: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		lineHeight: 1.4,
		color: 'rgba(255, 255, 255, 0.9)',
		wordBreak: 'break-word',
		display: '-webkit-box',
		WebkitLineClamp: 2,
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden'
	},
	time: {
		marginTop: 4,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.78rem',
		color: 'rgba(255, 255, 255, 0.45)'
	},
	dot: {
		alignSelf: 'center',
		width: 8,
		height: 8,
		borderRadius: '50%',
		background: '#00d4ff',
		flex: '0 0 auto',
		boxShadow: '0 0 6px rgba(0, 212, 255, 0.6)'
	}
}));

function NotificationItem({ group, onClick, onClose }) {
	const { classes } = useStyles();
	const navigate = useNavigate();
	const avatarUrl = getActorAvatar(group);
	const initial = getActorInitial(group);
	const isSystem = !group.latestActorName && !group.actors?.length;
	const typeIcon = TYPE_ICONS[group.type];
	const primaryActor = getPrimaryActorProfile(group);
	const myPuuid = camilleRiotAuthService.getPuuid();
	const avatarClickable = !isSystem && Boolean(primaryActor);

	const handleAvatarClick = (e) => {
		if (!avatarClickable) return;
		e.stopPropagation();
		const targetPuuid = primaryActor.puuid;
		onClose?.();
		if (targetPuuid === myPuuid) navigate('/myinfo');
		else navigate(`/userinfo/${targetPuuid}`);
	};

	return (
		<div
			role="button"
			tabIndex={0}
			className={clsx(classes.root, group.hasUnread && classes.unread)}
			onClick={() => onClick(group)}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') onClick(group);
			}}
		>
			<div className={classes.avatarWrap}>
				{avatarUrl ? (
					<Avatar
						src={avatarUrl}
						alt=""
						className={clsx(classes.avatar, avatarClickable && classes.avatarClickable)}
						onClick={handleAvatarClick}
					/>
				) : (
					<Avatar
						className={clsx(
							classes.avatar,
							isSystem && classes.systemAvatar,
							avatarClickable && classes.avatarClickable
						)}
						onClick={handleAvatarClick}
					>
						{isSystem ? <Icon style={{ fontSize: 20 }}>{typeIcon || 'notifications'}</Icon> : initial}
					</Avatar>
				)}
				{!isSystem && typeIcon && (
					<span className={classes.typeBadge}>
						<Icon>{typeIcon}</Icon>
					</span>
				)}
			</div>
			<div className={classes.body}>
				<Typography className={classes.message}>{formatMessage(group)}</Typography>
				<Typography className={classes.time}>{formatRelative(group.latestAt)}</Typography>
			</div>
			{group.hasUnread && <span className={classes.dot} />}
		</div>
	);
}

export default React.memo(NotificationItem);
