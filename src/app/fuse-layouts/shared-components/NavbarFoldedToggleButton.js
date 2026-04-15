import _ from '@lodash';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import * as Actions from 'app/store/actions';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

function NavbarFoldedToggleButton({ className, children = <Icon>menu</Icon> }) {
	const dispatch = useDispatch();
	const settings = useSelector(({ fuse }) => fuse.settings.current);

	return (
        <IconButton
            className={className}
            onClick={() => {
				dispatch(
					Actions.setDefaultSettings(
						_.set({}, 'layout.config.navbar.folded', !settings.layout.config.navbar.folded)
					)
				);
			}}
            color="inherit"
            size="large">
            {children}
        </IconButton>
    );
}

export default NavbarFoldedToggleButton;
