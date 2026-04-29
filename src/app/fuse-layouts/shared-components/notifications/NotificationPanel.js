import React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Icon from '@mui/material/Icon';
import { makeStyles } from 'tss-react/mui';
import NotificationItem from './NotificationItem';

const useStyles = makeStyles()((theme) => ({
	root: {
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		background: '#1a1a2e',
		color: 'rgba(255, 255, 255, 0.9)',
		fontFamily: '"Noto Sans KR", sans-serif',
		[theme.breakpoints.up('sm')]: {
			width: 380
		}
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '14px 16px',
		background: 'linear-gradient(90deg, rgba(0, 212, 255, 0.08) 0%, transparent 100%)'
	},
	title: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		fontWeight: 700,
		color: '#fff'
	},
	readAllBtn: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.78rem',
		color: 'rgba(255, 255, 255, 0.6)',
		minWidth: 0,
		padding: '4px 8px',
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.08)'
		}
	},
	divider: {
		background: 'rgba(0, 212, 255, 0.15)'
	},
	body: {
		flex: 1,
		minHeight: 200,
		maxHeight: 'min(70vh, 540px)',
		overflowY: 'auto',
		'&::-webkit-scrollbar': {
			width: 6
		},
		'&::-webkit-scrollbar-thumb': {
			background: 'rgba(0, 212, 255, 0.3)',
			borderRadius: 3
		}
	},
	itemDivider: {
		background: 'rgba(255, 255, 255, 0.04)',
		marginLeft: 68
	},
	loading: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: 200
	},
	empty: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 240,
		color: 'rgba(255, 255, 255, 0.45)',
		gap: 12
	},
	emptyIcon: {
		fontSize: 48,
		color: 'rgba(0, 212, 255, 0.3)'
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem'
	}
}));

function NotificationPanel({ groups, loading, onItemClick, onReadAll, hasUnread }) {
	const { classes } = useStyles();

	let content;
	if (loading && groups.length === 0) {
		content = (
			<div className={classes.loading}>
				<CircularProgress size={28} sx={{ color: '#00d4ff' }} />
			</div>
		);
	} else if (groups.length === 0) {
		content = (
			<div className={classes.empty}>
				<Icon className={classes.emptyIcon}>notifications_none</Icon>
				<Typography className={classes.emptyText}>새 알림이 없어요</Typography>
			</div>
		);
	} else {
		content = groups.map((group, i) => (
			<React.Fragment key={group.key || group.representativeId || i}>
				<NotificationItem group={group} onClick={onItemClick} />
				{i < groups.length - 1 && <Divider className={classes.itemDivider} />}
			</React.Fragment>
		));
	}

	return (
		<div className={classes.root}>
			<div className={classes.header}>
				<Typography className={classes.title}>알림</Typography>
				{hasUnread && (
					<Button className={classes.readAllBtn} onClick={onReadAll} size="small">
						모두 읽음
					</Button>
				)}
			</div>
			<Divider className={classes.divider} />
			<div className={classes.body}>{content}</div>
		</div>
	);
}

export default NotificationPanel;
