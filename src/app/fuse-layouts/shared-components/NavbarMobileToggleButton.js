import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import * as Actions from 'app/store/actions';
import React from 'react';
import { useDispatch } from 'react-redux';

function NavbarMobileToggleButton({ className, children = <Icon>menu</Icon> }) {
	const dispatch = useDispatch();

	return (
		<IconButton
			className={className}
			onClick={ev => dispatch(Actions.navbarToggleMobile())}
			color="inherit"
			disableRipple
		>
			{children}
		</IconButton>
	);
}

export default NavbarMobileToggleButton;
