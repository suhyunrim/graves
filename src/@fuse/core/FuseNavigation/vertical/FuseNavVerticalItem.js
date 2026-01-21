import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseUtils from '@fuse/utils';
import Icon from '@material-ui/core/Icon';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import * as Actions from 'app/store/actions';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import FuseNavBadge from '../FuseNavBadge';

const useStyles = makeStyles(theme => ({
	item: props => ({
		height: 48,
		width: 'calc(100% - 16px)',
		borderRadius: '0 24px 24px 0',
		paddingRight: 16,
		paddingLeft: props.itemPadding > 80 ? 80 : props.itemPadding,
		marginBottom: 4,
		color: 'rgba(255, 255, 255, 0.7)',
		cursor: 'pointer',
		textDecoration: 'none!important',
		transition: 'all 0.3s ease',
		'&:hover': {
			backgroundColor: 'rgba(0, 212, 255, 0.1)',
			color: '#00d4ff',
			'& .list-item-icon': {
				color: '#00d4ff'
			}
		},
		'&.active': {
			backgroundColor: 'rgba(0, 212, 255, 0.15)',
			color: '#00d4ff',
			boxShadow: 'inset 0 0 20px rgba(0, 212, 255, 0.1)',
			borderRight: '3px solid #00d4ff',
			pointerEvents: 'none',
			'& .list-item-text-primary': {
				color: '#00d4ff',
				fontWeight: 700
			},
			'& .list-item-icon': {
				color: '#00d4ff'
			}
		},
		'& .list-item-icon': {
			marginRight: 16,
			color: 'rgba(255, 255, 255, 0.5)',
			transition: 'color 0.3s ease'
		},
		'& .list-item-text': {}
	}),
	listItemText: {
		'& .MuiTypography-root': {
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.3rem',
			fontWeight: 500,
			letterSpacing: '0.02em'
		}
	}
}));

function FuseNavVerticalItem(props) {
	const userRole = useSelector(({ auth }) => auth.user.role);
	const dispatch = useDispatch();

	const theme = useTheme();
	const mdDown = useMediaQuery(theme.breakpoints.down('md'));
	const { item, nestedLevel } = props;
	const classes = useStyles({
		itemPadding: nestedLevel > 0 ? 40 + nestedLevel * 16 : 24
	});
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
			activeClassName="active"
			className={clsx(classes.item, 'list-item')}
			onClick={ev => mdDown && dispatch(Actions.navbarCloseMobile())}
			exact={item.exact}
		>
			{item.icon && (
				<Icon className="list-item-icon text-18 flex-shrink-0" color="action">
					{item.icon}
				</Icon>
			)}

			<ListItemText
				className={clsx('list-item-text', classes.listItemText)}
				primary={item.translate ? t(item.translate) : item.title}
				classes={{ primary: 'text-14 list-item-text-primary' }}
			/>

			{item.badge && <FuseNavBadge badge={item.badge} />}
		</ListItem>
	);
}

FuseNavVerticalItem.propTypes = {
	item: PropTypes.shape({
		id: PropTypes.string.isRequired,
		title: PropTypes.string,
		icon: PropTypes.string,
		url: PropTypes.string
	})
};

FuseNavVerticalItem.defaultProps = {};

const NavVerticalItem = withRouter(React.memo(FuseNavVerticalItem));

export default NavVerticalItem;
