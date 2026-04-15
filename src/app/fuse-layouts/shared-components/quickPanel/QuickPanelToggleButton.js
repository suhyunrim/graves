import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import React from 'react';
import { useDispatch } from 'react-redux';
import * as quickPanelActions from './store/actions';

function QuickPanelToggleButton({ children = <Icon>format_list_bulleted</Icon> }) {
	const dispatch = useDispatch();

	return (
        <IconButton
            className="w-64 h-64"
            onClick={ev => dispatch(quickPanelActions.toggleQuickPanel())}
            size="large">
            {children}
        </IconButton>
    );
}

export default QuickPanelToggleButton;
