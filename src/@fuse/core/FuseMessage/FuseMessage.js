import { amber, blue, green } from '@mui/material/colors';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';
import * as Actions from 'app/store/actions';
import clsx from 'clsx';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useStyles = makeStyles()((theme) => ({
	root: {},
	success: {
		backgroundColor: green[600],
		color: '#FFFFFF'
	},
	error: {
		backgroundColor: theme.palette.error.dark,
		color: theme.palette.getContrastText(theme.palette.error.dark)
	},
	info: {
		backgroundColor: blue[600],
		color: '#FFFFFF'
	},
	warning: {
		backgroundColor: amber[600],
		color: '#FFFFFF'
	}
}));

const variantIcon = {
	success: 'check_circle',
	warning: 'warning',
	error: 'error_outline',
	info: 'info'
};

function FuseMessage(props) {
	const dispatch = useDispatch();
	const state = useSelector(({ fuse }) => fuse.message.state);
	const options = useSelector(({ fuse }) => fuse.message.options);

	const { classes } = useStyles();

	return (
        <Snackbar
			{...options}
			open={state}
			onClose={() => dispatch(Actions.hideMessage())}
			classes={{
				root: classes.root
			}}
			ContentProps={{
				variant: 'body2',
				headlineMapping: {
					body1: 'div',
					body2: 'div'
				}
			}}
		>
            <SnackbarContent
				className={clsx(classes[options.variant])}
				message={
					<div className="flex items-center">
						{variantIcon[options.variant] && <Icon color="inherit">{variantIcon[options.variant]}</Icon>}
						<Typography className="mx-8">{options.message}</Typography>
					</div>
				}
				action={[
					<IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        onClick={() => dispatch(Actions.hideMessage())}
                        size="large">
						<Icon>close</Icon>
					</IconButton>
				]}
			/>
        </Snackbar>
    );
}

export default React.memo(FuseMessage);
