import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import * as authActions from 'app/auth/store/actions';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
	root: {
		background: 'linear-gradient(135deg, #16213e 0%, #1a1a2e 100%)',
		borderBottom: '1px solid rgba(0, 212, 255, 0.15)',
		'&.user': {
			'& .username, & .email': {
				transition: theme.transitions.create('opacity', {
					duration: theme.transitions.duration.shortest,
					easing: theme.transitions.easing.easeInOut
				})
			}
		}
	},
	avatar: {
		width: 80,
		height: 80,
		position: 'absolute',
		top: 72,
		padding: 4,
		background: 'linear-gradient(135deg, #00d4ff 0%, #0066ff 100%)',
		boxSizing: 'content-box',
		left: '50%',
		transform: 'translateX(-50%)',
		transition: theme.transitions.create('all', {
			duration: theme.transitions.duration.shortest,
			easing: theme.transitions.easing.easeInOut
		}),
		boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
		'& > img': {
			borderRadius: '50%'
		}
	},
	username: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		textShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
		letterSpacing: '0.05em'
	},
	discordInfo: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 4,
		paddingTop: 28,
		paddingBottom: 8
	},
	discordIcon: {
		width: 14,
		height: 14
	},
	discordName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.45)',
		letterSpacing: '0.02em'
	},
	dropdownIcon: {
		color: '#00d4ff',
		marginLeft: 4
	},
	userButton: {
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.1)'
		}
	},
	popover: {
		background: '#1a1a2e',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
	},
	menuItem: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		transition: 'all 0.2s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.1)',
			color: '#00d4ff'
		}
	},
	menuIcon: {
		color: 'rgba(255, 255, 255, 0.6)'
	},
	divider: {
		background: 'rgba(0, 212, 255, 0.2)',
		margin: '8px 16px'
	}
}));

function UserNavbarHeader(props) {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);

	const classes = useStyles();

	const [groupListMenu, setGroupListMenu] = useState(null);

	const onGroupListClick = event => {
		setGroupListMenu(event.currentTarget);
	};

	const onGroupListClose = () => {
		setGroupListMenu(null);
	};

	const onChangeGroup = groupId => {
		dispatch(authActions.changeGroup(groupId));
		onGroupListClose();
	};

	if (!user.groupList) {
		return null;
	}

	return (
		<>
			<AppBar
				position="static"
				elevation={0}
				classes={{ root: classes.root }}
				className="user relative flex flex-col items-center justify-center pt-24 pb-64 mb-32 z-0"
			>
				<Button onClick={onGroupListClick} className={classes.userButton}>
					<Typography className={clsx(classes.username, 'username whitespace-no-wrap')}>
						{user.data.displayName}
					</Typography>

					<Icon className={clsx(classes.dropdownIcon, 'text-16 hidden sm:flex')} variant="action">
						keyboard_arrow_down
					</Icon>
				</Button>

				<Popover
					open={Boolean(groupListMenu)}
					anchorEl={groupListMenu}
					onClose={onGroupListClose}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'center'
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'center'
					}}
					classes={{
						paper: clsx('py-8', classes.popover)
					}}
				>
					{user.groupList.map(elem => (
						<MenuItem
							key={elem.groupId}
							onClick={() => onChangeGroup(elem.groupId)}
							role="button"
							className={classes.menuItem}
						>
							<ListItemIcon className={clsx('min-w-40', classes.menuIcon)}>
								<Icon>account_circle</Icon>
							</ListItemIcon>
							<ListItemText primary={elem.groupName} />
						</MenuItem>
					))}
					<Divider className={classes.divider} />
					<MenuItem className={classes.menuItem}>
						<ListItemIcon className={clsx('min-w-40', classes.menuIcon)}>
							<Icon>add_box</Icon>
						</ListItemIcon>
						<ListItemText primary="Create Group" />
					</MenuItem>
					<MenuItem
						onClick={() => {
							dispatch(authActions.logoutUser());
							onGroupListClose();
						}}
						className={classes.menuItem}
					>
						<ListItemIcon className={clsx('min-w-40', classes.menuIcon)}>
							<Icon>exit_to_app</Icon>
						</ListItemIcon>
						<ListItemText primary="Logout" />
					</MenuItem>
				</Popover>

				<Avatar
					className={clsx(classes.avatar, 'avatar')}
					alt="user photo"
					src={
						user.data.photoURL && user.data.photoURL !== '' ? user.data.photoURL : 'assets/images/avatars/profile.jpg'
					}
				/>
			</AppBar>
			{user.data.discordUser && (
				<div className={classes.discordInfo}>
					<img className={classes.discordIcon} src="/assets/images/logos/discord-mark-white.svg" alt="Discord" />
					<span className={classes.discordName}>{user.data.discordUser.globalName || user.data.discordUser.username}</span>
				</div>
			)}
		</>
	);
}

export default UserNavbarHeader;
