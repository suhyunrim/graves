import FuseSearch from '@fuse/core/FuseSearch';
import FuseShortcuts from '@fuse/core/FuseShortcuts';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import Toolbar from '@mui/material/Toolbar';
import NavbarMobileToggleButton from 'app/fuse-layouts/shared-components/NavbarMobileToggleButton';
import QuickPanelToggleButton from 'app/fuse-layouts/shared-components/quickPanel/QuickPanelToggleButton';
import UserMenu from 'app/fuse-layouts/shared-components/UserMenu';
import React from 'react';
import { useSelector } from 'react-redux';
import LanguageSwitcher from '../../shared-components/LanguageSwitcher';

const useStyles = makeStyles()((theme) => ({
	separator: {
		width: 1,
		height: 64,
		backgroundColor: theme.palette.divider
	}
}));

function ToolbarLayout2(props) {
	const config = useSelector(({ fuse }) => fuse.settings.current.layout.config);
	const toolbarTheme = useSelector(({ fuse }) => fuse.settings.toolbarTheme);

	const { classes } = useStyles(props);

	return (
        <StyledEngineProvider injectFirst>
            (<ThemeProvider theme={toolbarTheme}>
                <AppBar
                    id="fuse-toolbar"
                    className="flex relative z-10"
                    color="default"
                    style={{ backgroundColor: toolbarTheme.palette.background.default }}
                >
                    <Toolbar className="container p-0 lg:px-24">
                        {config.navbar.display && (
                            <Box sx={{ display: { lg: 'none' } }}>
                                <NavbarMobileToggleButton className="w-64 h-64 p-0" />
                                <div className={classes.separator} />
                            </Box>
                        )}

                        <div className="flex flex-1">
                            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                                <FuseShortcuts />
                            </Box>
                        </div>

                        <div className="flex">
                            <UserMenu />

                            <div className={classes.separator} />

                            <FuseSearch />

                            <div className={classes.separator} />

                            <LanguageSwitcher />

                            <div className={classes.separator} />

                            <QuickPanelToggleButton />
                        </div>
                    </Toolbar>
                </AppBar>
            </ThemeProvider>)
        </StyledEngineProvider>
    );
}

export default React.memo(ToolbarLayout2);
