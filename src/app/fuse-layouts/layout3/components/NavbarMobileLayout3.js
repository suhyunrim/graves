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
	content: {
		overflowX: 'hidden',
		overflowY: 'auto',
		WebkitOverflowScrolling: 'touch',
		background:
			'linear-gradient(rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0) 30%), linear-gradient(rgba(0, 0, 0, 0.25) 0, rgba(0, 0, 0, 0) 40%)',
		backgroundRepeat: 'no-repeat',
		backgroundSize: '100% 40px, 100% 10px',
		backgroundAttachment: 'local, scroll'
	}
});

function NavbarMobileLayout3(props) {
	const classes = useStyles(props);
	const theme = useTheme();

	return (
        <div className="flex flex-col h-full overflow-hidden">
            <AppBar
				color="primary"
				position="static"
				elevation={0}
				className="flex flex-row items-center flex-shrink h-64 min-h-64 px-12"
			>
				<div className="flex flex-1 mx-8">
					<Logo />
				</div>

				<Box sx={{ display: { xs: 'none', lg: 'block' } }}>
					<NavbarFoldedToggleButton className="w-40 h-40 p-0" />
				</Box>

				<Box sx={{ display: { lg: 'none' } }}>
					<NavbarMobileToggleButton className="w-40 h-40 p-0">
						<Icon>{theme.direction === 'ltr' ? 'arrow_back' : 'arrow_forward'}"</Icon>
					</NavbarMobileToggleButton>
				</Box>
			</AppBar>
            <FuseScrollbars className={clsx(classes.content)}>
				<UserNavbarHeader />

				<Navigation layout="vertical" />
			</FuseScrollbars>
        </div>
    );
}

export default React.memo(NavbarMobileLayout3);
