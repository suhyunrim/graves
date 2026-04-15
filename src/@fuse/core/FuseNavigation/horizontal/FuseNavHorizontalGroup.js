import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useDebounce } from '@fuse/hooks';
import FuseUtils from '@fuse/utils';
import Grow from '@mui/material/Grow';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import clsx from 'clsx';

import React, { useState, useMemo } from 'react';
import * as ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Manager, Popper, Reference } from 'react-popper';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import FuseNavItem from '../FuseNavItem';

const useStyles = makeStyles()((theme) => ({
	root: {
		color: theme.palette.text.primary,
		'&.active, &.active:hover, &.active:focus': {
			backgroundColor: `${theme.palette.secondary.main}!important`,
			color: `${theme.palette.secondary.contrastText}!important`,
			'& .list-item-text-primary': {
				color: 'inherit'
			},
			'& .list-item-icon': {
				color: 'inherit'
			}
		},
		'& .list-item-text': {
			padding: '0 0 0 16px'
		},
		'&.level-0': {
			height: 44,
			borderRadius: 4,
			'&:hover': {
				background: 'transparent'
			}
		}
	},
	children: {},
	popper: {
		zIndex: 999
	},
	popperClose: {
		pointerEvents: 'none'
	}
}));

function FuseNavHorizontalGroup(props) {
	const userRole = useSelector(({ auth }) => auth.user.role);
	const location = useLocation();

	const { classes } = useStyles(props);
	const [opened, setOpened] = useState(false);
	const { item, nestedLevel, dense } = props;
	const theme = useTheme();
	const { t } = useTranslation('navigation');

	const handleToggle = useDebounce(open => {
		setOpened(open);
	}, 150);

	const hasPermission = useMemo(() => FuseUtils.hasPermission(item.auth, userRole), [item.auth, userRole]);

	if (!hasPermission) {
		return null;
	}

	function isUrlInChildren(parent, url) {
		if (!parent.children) {
			return false;
		}

		for (let i = 0; i < parent.children.length; i += 1) {
			if (parent.children[i].children) {
				if (isUrlInChildren(parent.children[i], url)) {
					return true;
				}
			}

			if (parent.children[i].url === url || url.includes(parent.children[i].url)) {
				return true;
			}
		}

		return false;
	}

	return (
        <Manager>
            <Reference>
				{({ ref }) => (
					<div ref={ref}>
						<ListItem
							button
							className={clsx(
								'list-item ',
								classes.root,
								'relative',
								`level-${nestedLevel}`,
								isUrlInChildren(item, location.pathname) && 'active'
							)}
							onMouseEnter={() => handleToggle(true)}
							onMouseLeave={() => handleToggle(false)}
							aria-owns={opened ? 'menu-list-grow' : null}
							aria-haspopup="true"
							component={item.url ? NavLinkAdapter : 'li'}
							to={item.url}
							role="button"
						>
							{item.icon && (
								<Icon color="action" className="list-item-icon text-16 flex-shrink-0">
									{item.icon}
								</Icon>
							)}

							<ListItemText
								className="list-item-text"
								primary={item.translate ? t(item.translate) : item.title}
								classes={{ primary: 'text-14' }}
							/>

							{nestedLevel > 0 && (
								<IconButton
                                    disableRipple
                                    className="w-16 h-16 ltr:ml-4 rtl:mr-4 p-0"
                                    color="inherit"
                                    size="large">
									<Icon className="text-16 arrow-icon">
										{theme.direction === 'ltr' ? 'keyboard_arrow_right' : 'keyboard_arrow_left'}
									</Icon>
								</IconButton>
							)}
						</ListItem>
					</div>
				)}
			</Reference>
            {ReactDOM.createPortal(
				<Popper
					placement={
						nestedLevel === 0
							? theme.direction === 'ltr'
								? 'bottom-start'
								: 'bottom-end'
							: theme.direction === 'ltr'
							? 'right'
							: 'left'
					}
					eventsEnabled={opened}
					positionFixed
				>
					{({ ref, style, placement, arrowProps }) =>
						opened && (
							<div
								ref={ref}
								style={{
									...style,
									zIndex: 999 + nestedLevel
								}}
								data-placement={placement}
								className={clsx(classes.popper, { [classes.popperClose]: !opened })}
							>
								<Grow in={opened} id="menu-list-grow" style={{ transformOrigin: '0 0 0' }}>
									<Paper onMouseEnter={() => handleToggle(true)} onMouseLeave={() => handleToggle(false)}>
										{item.children && (
											<ul className={clsx(classes.children, 'popper-navigation-list', dense && 'dense', 'px-0')}>
												{item.children.map(_item => (
													<FuseNavItem
														key={_item.id}
														type={`horizontal-${_item.type}`}
														item={_item}
														nestedLevel={nestedLevel}
														dense={dense}
													/>
												))}
											</ul>
										)}
									</Paper>
								</Grow>
							</div>
						)
					}
				</Popper>,
				document.querySelector('#root')
			)}
        </Manager>
    );
}

const NavHorizontalGroup = React.memo(FuseNavHorizontalGroup);

export default NavHorizontalGroup;
