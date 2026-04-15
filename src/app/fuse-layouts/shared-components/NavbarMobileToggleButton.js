import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
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
            size="large">
            {children}
        </IconButton>
    );
}

export default NavbarMobileToggleButton;
