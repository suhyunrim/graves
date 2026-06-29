import React, { useCallback, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Icon from '@mui/material/Icon';
import Popover from '@mui/material/Popover';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as Actions from 'app/store/actions';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService';
import useNotifications from './useNotifications';
import NotificationPanel from './NotificationPanel';
import NotificationToast from './NotificationToast';
import { getNavigationPath } from './notificationFormat';
import { readNotification } from './notificationsApi';

const useStyles = makeStyles()((theme) => ({
	bellButton: {
		width: 48,
		height: 48,
		color: 'rgba(255, 255, 255, 0.7)',
		transition: 'all 0.3s ease',
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.1)'
		}
	},
	badge: {
		'& .MuiBadge-badge': {
			background: '#ff3860',
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '0.65rem',
			fontWeight: 700,
			minWidth: 16,
			height: 16,
			padding: '0 4px',
			boxShadow: '0 0 6px rgba(255, 56, 96, 0.6)'
		}
	},
	popoverPaper: {
		marginTop: 8,
		background: '#1a1a2e',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
		borderRadius: 8,
		overflow: 'hidden'
	},
	drawerPaper: {
		background: '#1a1a2e',
		borderTop: '1px solid rgba(0, 212, 255, 0.3)',
		maxHeight: '80vh'
	}
}));

function NotificationBell() {
	const { classes } = useStyles();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	const isAuthenticated = !!(user?.role && user.role.length > 0);

	const [anchorEl, setAnchorEl] = useState(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [toast, setToast] = useState(null); // { group, extraCount } | null

	const handleArrival = useCallback((group, extraCount) => {
		setToast({ group, extraCount });
	}, []);

	const {
		unreadCount,
		groups,
		loading,
		refreshList,
		markAllRead,
		pausePolling,
		resumePolling
	} = useNotifications({ enabled: isAuthenticated, onArrival: handleArrival });

	const open = isMobile ? drawerOpen : Boolean(anchorEl);

	const handleOpen = useCallback(async (event) => {
		const hadUnread = unreadCount > 0;
		if (isMobile) {
			setDrawerOpen(true);
		} else {
			setAnchorEl(event.currentTarget);
		}
		pausePolling();
		await refreshList();
		if (hadUnread) {
			markAllRead();
		}
	}, [isMobile, unreadCount, pausePolling, refreshList, markAllRead]);

	const handleClose = useCallback(() => {
		setAnchorEl(null);
		setDrawerOpen(false);
		resumePolling();
	}, [resumePolling]);

	const handleItemClick = useCallback((group) => {
		const myPuuid = camilleRiotAuthService.getPuuid();
		const path = getNavigationPath(group, myPuuid);
		if (group.targetKey) {
			readNotification({ targetKey: group.targetKey, type: group.type }).catch(() => {});
		} else if (group.representativeId != null) {
			readNotification({ id: group.representativeId }).catch(() => {});
		}
		handleClose();
		// 모바일에서 알림 항목 클릭은 NavVertical 항목과 달리 navbar 자동 닫기 분기를 안 타므로 직접 dispatch
		dispatch(Actions.navbarCloseMobile());
		if (path) navigate(path);
	}, [handleClose, navigate, dispatch]);

	const handleToastOpen = useCallback(() => {
		if (toast?.group) handleItemClick(toast.group);
		setToast(null);
	}, [toast, handleItemClick]);

	const handleReadAll = useCallback(() => {
		markAllRead();
	}, [markAllRead]);

	useEffect(() => {
		if (!isAuthenticated && open) handleClose();
	}, [isAuthenticated, open, handleClose]);

	if (!isAuthenticated) return null;

	const badgeContent = unreadCount > 9 ? '9+' : unreadCount;

	const panel = (
		<NotificationPanel
			groups={groups}
			loading={loading}
			onItemClick={handleItemClick}
			onReadAll={handleReadAll}
			hasUnread={unreadCount > 0}
		/>
	);

	return (
		<>
			<Tooltip title="알림" enterDelay={500}>
				<IconButton className={classes.bellButton} onClick={handleOpen} size="large" aria-label="알림 열기">
					<Badge
						className={classes.badge}
						badgeContent={badgeContent}
						invisible={unreadCount === 0}
						overlap="circular"
					>
						<Icon>notifications</Icon>
					</Badge>
				</IconButton>
			</Tooltip>
			{isMobile ? (
				<Drawer
					anchor="bottom"
					open={drawerOpen}
					onClose={handleClose}
					slotProps={{ paper: { className: classes.drawerPaper } }}
				>
					{panel}
				</Drawer>
			) : (
				<Popover
					open={Boolean(anchorEl)}
					anchorEl={anchorEl}
					onClose={handleClose}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					transformOrigin={{ vertical: 'top', horizontal: 'right' }}
					slotProps={{ paper: { className: classes.popoverPaper } }}
				>
					{panel}
				</Popover>
			)}
			<NotificationToast
				group={toast?.group}
				extraCount={toast?.extraCount || 0}
				onOpen={handleToastOpen}
				onClose={() => setToast(null)}
			/>
		</>
	);
}

export default NotificationBell;
