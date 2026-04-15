import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseUtils from '@fuse/utils';
import Icon from '@mui/material/Icon';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { makeStyles } from 'tss-react/mui';
import clsx from 'clsx';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import FuseNavBadge from '../FuseNavBadge';

const useStyles = makeStyles()((theme) => ({
	root: {
		minHeight: 48,
		'&.active': {
			backgroundColor: theme.palette.secondary.main,
			color: `${theme.palette.secondary.contrastText}!important`,
			pointerEvents: 'none',
			'& .list-item-text-primary': {
				color: 'inherit'
			},
			'& .list-item-icon': {
				color: 'inherit'
			}
		},
		'& .list-item-icon': {},
		'& .list-item-text': {
			padding: '0 0 0 16px'
		},
		color: theme.palette.text.primary,
		textDecoration: 'none!important'
	}
}));

function FuseNavHorizontalItem(props) {
	const userRole = useSelector(({ auth }) => auth.user.role);

	const { classes } = useStyles(props);
	const { item } = props;
	const { t } = useTranslation('navigation');

	const hasPermission = useMemo(() => FuseUtils.hasPermission(item.auth, userRole), [item.auth, userRole]);

	if (!hasPermission) {
		return null;
	}

	return (
		<ListItem
			button
			component={NavLinkAdapter}
			to={item.url}
			className={({ isActive }) => clsx('list-item', classes.root, isActive && 'active')}
			end={item.exact}
		>
			{item.icon && (
				<Icon className="list-item-icon text-16 flex-shrink-0" color="action">
					{item.icon}
				</Icon>
			)}

			<ListItemText
				className="list-item-text"
				primary={item.translate ? t(item.translate) : item.title}
				classes={{ primary: 'text-14 list-item-text-primary' }}
			/>

			{item.badge && <FuseNavBadge className="ltr:ml-8 rtl:mr-8" badge={item.badge} />}
		</ListItem>
	);
}

const NavHorizontalItem = React.memo(FuseNavHorizontalItem);

export default NavHorizontalItem;
