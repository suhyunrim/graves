import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import React from 'react';
import { useDispatch } from 'react-redux';
import * as quickPanelActions from './store/actions';

function QuickPanelToggleButton({ children = <Icon>format_list_bulleted</Icon> }) {
	const dispatch = useDispatch();

	return (
		<IconButton className="w-64 h-64" onClick={ev => dispatch(quickPanelActions.toggleQuickPanel())}>
			{children}
		</IconButton>
	);
}

export default QuickPanelToggleButton;
