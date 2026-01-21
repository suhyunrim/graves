import FuseSearch from '@fuse/core/FuseSearch';
import FuseShortcuts from '@fuse/core/FuseShortcuts';
import AppBar from '@material-ui/core/AppBar';
import Hidden from '@material-ui/core/Hidden';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import NavbarMobileToggleButton from 'app/fuse-layouts/shared-components/NavbarMobileToggleButton';
import QuickPanelToggleButton from 'app/fuse-layouts/shared-components/quickPanel/QuickPanelToggleButton';
import UserMenu from 'app/fuse-layouts/shared-components/UserMenu';
import React from 'react';
import { useSelector } from 'react-redux';
import LanguageSwitcher from '../../shared-components/LanguageSwitcher';

const useStyles = makeStyles(theme => ({
	root: {
		background: 'linear-gradient(90deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
		borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
		boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
	},
	separator: {
		width: 1,
		height: 48,
		background: 'linear-gradient(180deg, transparent 0%, rgba(0, 212, 255, 0.3) 50%, transparent 100%)'
	},
	iconButton: {
		color: 'rgba(255, 255, 255, 0.7)',
		transition: 'all 0.3s ease',
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.1)'
		}
	}
}));

function ToolbarLayout1(props) {
	const config = useSelector(({ fuse }) => fuse.settings.current.layout.config);
	const toolbarTheme = useSelector(({ fuse }) => fuse.settings.toolbarTheme);

	const classes = useStyles(props);

	return (
		<ThemeProvider theme={toolbarTheme}>
			<AppBar
				id="fuse-toolbar"
				className={classes.root}
				position="relative"
				elevation={0}
			>
				<Toolbar className="p-0">
					{config.navbar.display && config.navbar.position === 'left' && (
						<Hidden lgUp>
							<NavbarMobileToggleButton className="w-64 h-64 p-0" />
							<div className={classes.separator} />
						</Hidden>
					)}

					<div className="flex flex-1">
						<Hidden mdDown>
							<FuseShortcuts className="px-16" />
						</Hidden>
					</div>

					<div className="flex items-center">
						<UserMenu />

						<div className={classes.separator} />

						<FuseSearch />

						<div className={classes.separator} />

						<LanguageSwitcher />

						<div className={classes.separator} />

						<QuickPanelToggleButton />
					</div>

					{config.navbar.display && config.navbar.position === 'right' && (
						<Hidden lgUp>
							<NavbarMobileToggleButton />
						</Hidden>
					)}
				</Toolbar>
			</AppBar>
		</ThemeProvider>
	);
}

export default React.memo(ToolbarLayout1);
