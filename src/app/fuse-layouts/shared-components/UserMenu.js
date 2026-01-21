import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import * as authActions from 'app/auth/store/actions';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
	userButton: {
		height: 64,
		transition: 'all 0.3s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.1)'
		}
	},
	avatar: {
		border: '2px solid rgba(0, 212, 255, 0.5)',
		boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)'
	},
	userName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: '#fff'
	},
	userRole: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	dropdownIcon: {
		color: '#00d4ff'
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
	}
}));

function UserMenu(props) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);

	const [userMenu, setUserMenu] = useState(null);

	const userMenuClick = event => {
		setUserMenu(event.currentTarget);
	};

	const userMenuClose = () => {
		setUserMenu(null);
	};

	return (
		<>
			<Button className={classes.userButton} onClick={userMenuClick}>
				{user.data.photoURL ? (
					<Avatar className={classes.avatar} alt="user photo" src={user.data.photoURL} />
				) : (
					<Avatar className={classes.avatar}>{user.data.displayName[0]}</Avatar>
				)}

				<div className="hidden md:flex flex-col mx-12 items-start">
					<Typography component="span" className={classes.userName}>
						{user.data.displayName}
					</Typography>
					<Typography className={classes.userRole}>
						{user.role.toString()}
					</Typography>
				</div>

				<Icon className={clsx(classes.dropdownIcon, 'text-16 hidden sm:flex')} variant="action">
					keyboard_arrow_down
				</Icon>
			</Button>

			<Popover
				open={Boolean(userMenu)}
				anchorEl={userMenu}
				onClose={userMenuClose}
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
				{!user.role || user.role.length === 0 ? (
					<>
						<MenuItem component={Link} to="/login" role="button" className={classes.menuItem}>
							<ListItemIcon className={clsx('min-w-40', classes.menuIcon)}>
								<Icon>lock</Icon>
							</ListItemIcon>
							<ListItemText primary="Login" />
						</MenuItem>
						<MenuItem component={Link} to="/register" role="button" className={classes.menuItem}>
							<ListItemIcon className={clsx('min-w-40', classes.menuIcon)}>
								<Icon>person_add</Icon>
							</ListItemIcon>
							<ListItemText primary="Register" />
						</MenuItem>
					</>
				) : (
					<>
						<MenuItem component={Link} to="/pages/profile" onClick={userMenuClose} role="button" className={classes.menuItem}>
							<ListItemIcon className={clsx('min-w-40', classes.menuIcon)}>
								<Icon>account_circle</Icon>
							</ListItemIcon>
							<ListItemText primary="My Profile" />
						</MenuItem>
						<MenuItem component={Link} to="/apps/mail" onClick={userMenuClose} role="button" className={classes.menuItem}>
							<ListItemIcon className={clsx('min-w-40', classes.menuIcon)}>
								<Icon>mail</Icon>
							</ListItemIcon>
							<ListItemText primary="Inbox" />
						</MenuItem>
						<MenuItem
							onClick={() => {
								dispatch(authActions.logoutUser());
								userMenuClose();
							}}
							className={classes.menuItem}
						>
							<ListItemIcon className={clsx('min-w-40', classes.menuIcon)}>
								<Icon>exit_to_app</Icon>
							</ListItemIcon>
							<ListItemText primary="Logout" />
						</MenuItem>
					</>
				)}
			</Popover>
		</>
	);
}

export default UserMenu;
