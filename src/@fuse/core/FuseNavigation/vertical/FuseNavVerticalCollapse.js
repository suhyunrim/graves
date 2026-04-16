import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseUtils from '@fuse/utils';
import Collapse from '@mui/material/Collapse';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { makeStyles } from 'tss-react/mui';
import clsx from 'clsx';

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import FuseNavBadge from '../FuseNavBadge';
import FuseNavItem from '../FuseNavItem';

const useStyles = makeStyles()((theme, params) => ({
	root: {
		padding: 0,
		'&.open': {
			backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,.015)' : 'rgba(0,0,0,.04)'
		}
	},
	item: {
		display: 'flex !important',
		alignItems: 'center',
		height: 40,
		width: 'calc(100% - 16px)',
		borderRadius: '0 20px 20px 0',
		paddingRight: 12,
		paddingLeft: params.itemPadding > 80 ? 80 : params.itemPadding,
		color: theme.palette.text.primary,
		'&.active > .list-item-text > span': {
			fontWeight: 600
		},
		'& .list-item-icon': {
			marginRight: 16
		}
	}
}));

function needsToBeOpened(location, item) {
	return location && isUrlInChildren(item, location.pathname);
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

function FuseNavVerticalCollapse(props) {
	const userRole = useSelector(({ auth }) => auth.user.role);
	const location = useLocation();
	const [open, setOpen] = useState(() => needsToBeOpened(location, props.item));
	const { item, nestedLevel } = props;
	const { classes } = useStyles({
		itemPadding: nestedLevel > 0 ? 40 + nestedLevel * 16 : 24
	});
	const { t } = useTranslation('navigation');

	useEffect(() => {
		if (needsToBeOpened(location, props.item)) {
			if (!open) {
				setOpen(true);
			}
		}
		// eslint-disable-next-line
	}, [location, props.item]);

	function handleClick() {
		setOpen(!open);
	}

	const hasPermission = useMemo(() => FuseUtils.hasPermission(item.auth, userRole), [item.auth, userRole]);

	if (!hasPermission) {
		return null;
	}

	return (
        <ul className={clsx(classes.root, open && 'open')}>
            <ListItem
				button
				className={clsx(classes.item, 'list-item')}
				onClick={handleClick}
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

				{item.badge && <FuseNavBadge className="mx-4" badge={item.badge} />}

				<IconButton
                    disableRipple
                    className="w-40 h-40 -mx-12 p-0 focus:bg-transparent hover:bg-transparent"
                    onClick={ev => ev.preventDefault()}
                    size="large">
					<Icon className="text-16 arrow-icon" color="inherit">
						{open ? 'expand_less' : 'expand_more'}
					</Icon>
				</IconButton>
			</ListItem>
            {item.children && (
				<Collapse in={open} className="collapse-children">
					{item.children.map(_item => (
						<FuseNavItem key={_item.id} type={`vertical-${_item.type}`} item={_item} nestedLevel={nestedLevel + 1} />
					))}
				</Collapse>
			)}
        </ul>
    );
}

const NavVerticalCollapse = React.memo(FuseNavVerticalCollapse);

export default NavVerticalCollapse;
