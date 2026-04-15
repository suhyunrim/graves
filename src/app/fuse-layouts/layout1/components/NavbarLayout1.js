import FuseScrollbars from '@fuse/core/FuseScrollbars';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Icon from '@mui/material/Icon';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import Logo from 'app/fuse-layouts/shared-components/Logo';
import NavbarFoldedToggleButton from 'app/fuse-layouts/shared-components/NavbarFoldedToggleButton';
import NavbarMobileToggleButton from 'app/fuse-layouts/shared-components/NavbarMobileToggleButton';
import Navigation from 'app/fuse-layouts/shared-components/Navigation';
import UserNavbarHeader from 'app/fuse-layouts/shared-components/UserNavbarHeader';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles({
	root: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		borderRight: '1px solid rgba(0, 212, 255, 0.15)'
	},
	content: {
		overflowX: 'hidden',
		overflowY: 'auto',
		WebkitOverflowScrolling: 'touch',
		background: 'transparent',
		'&::-webkit-scrollbar': {
			width: 6
		},
		'&::-webkit-scrollbar-track': {
			background: 'rgba(255, 255, 255, 0.05)'
		},
		'&::-webkit-scrollbar-thumb': {
			background: 'rgba(0, 212, 255, 0.3)',
			borderRadius: 3,
			'&:hover': {
				background: 'rgba(0, 212, 255, 0.5)'
			}
		}
	},
	appBar: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderBottom: '1px solid rgba(0, 212, 255, 0.2)'
	},
	toggleButton: {
		color: 'rgba(255, 255, 255, 0.7)',
		transition: 'all 0.3s ease',
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.1)'
		}
	}
});

function NavbarLayout1(props) {
	const { classes } = useStyles();
	const theme = useTheme();

	return (
        <div className={clsx('flex flex-col overflow-hidden h-full', classes.root, props.className)}>
            <AppBar
				position="static"
				elevation={0}
				className={clsx('flex flex-row items-center flex-shrink h-64 min-h-64 px-12', classes.appBar)}
			>
				<div className="flex flex-1 mx-8">
					<Logo />
				</div>

				<Box sx={{ display: { xs: 'none', lg: 'block' } }}>
					<NavbarFoldedToggleButton className={clsx('w-40 h-40 p-0', classes.toggleButton)} />
				</Box>

				<Box sx={{ display: { lg: 'none' } }}>
					<NavbarMobileToggleButton className={clsx('w-40 h-40 p-0', classes.toggleButton)}>
						<Icon>{theme.direction === 'ltr' ? 'arrow_back' : 'arrow_forward'}"</Icon>
					</NavbarMobileToggleButton>
				</Box>
			</AppBar>
            <FuseScrollbars className={clsx(classes.content)} option={{ suppressScrollX: true }}>
				<UserNavbarHeader />

				<Navigation layout="vertical" />
			</FuseScrollbars>
        </div>
    );
}

export default React.memo(NavbarLayout1);
