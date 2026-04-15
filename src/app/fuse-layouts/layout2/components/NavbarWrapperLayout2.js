import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import NavbarMobileLayout2 from 'app/fuse-layouts/layout2/components/NavbarMobileLayout2';
import NavbarMobileToggleFab from 'app/fuse-layouts/shared-components/NavbarMobileToggleFab';
import * as Actions from 'app/store/actions';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NavbarLayout2 from './NavbarLayout2';

const navbarWidth = 280;

const useStyles = makeStyles()((theme) => ({
	navbar: {
		display: 'flex',
		overflow: 'hidden',
		height: 64,
		minHeight: 64,
		alignItems: 'center',
		boxShadow: theme.shadows[3],
		zIndex: 6
	},
	navbarMobile: {
		display: 'flex',
		overflow: 'hidden',
		flexDirection: 'column',
		width: navbarWidth,
		minWidth: navbarWidth,
		height: '100%',
		zIndex: 4,
		transition: theme.transitions.create(['width', 'min-width'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.shorter
		}),
		boxShadow: theme.shadows[3]
	}
}));

function NavbarWrapperLayout2(props) {
	const dispatch = useDispatch();
	const config = useSelector(({ fuse }) => fuse.settings.current.layout.config);
	const navbarTheme = useSelector(({ fuse }) => fuse.settings.navbarTheme);
	const navbar = useSelector(({ fuse }) => fuse.navbar);

	const { classes } = useStyles(props);

	return (
        <>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={navbarTheme}>
                    <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                        <Paper className={classes.navbar} square>
                            <NavbarLayout2 />
                        </Paper>
                    </Box>

                    <Box sx={{ display: { lg: 'none' } }}>
                        <Drawer
                            anchor="left"
                            variant="temporary"
                            open={navbar.mobileOpen}
                            classes={{
                                paper: classes.navbarMobile
                            }}
                            onClose={ev => dispatch(Actions.navbarCloseMobile())}
                            ModalProps={{
                                keepMounted: true // Better open performance on mobile.
                            }}
                        >
                            <NavbarMobileLayout2 />
                        </Drawer>
                    </Box>
                </ThemeProvider>
            </StyledEngineProvider>
            {config.navbar.display && !config.toolbar.display && (
				<Box sx={{ display: { lg: 'none' } }}>
					<NavbarMobileToggleFab />
				</Box>
			)}
        </>
    );
}

export default React.memo(NavbarWrapperLayout2);
