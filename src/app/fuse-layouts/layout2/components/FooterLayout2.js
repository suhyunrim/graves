import AppBar from '@mui/material/AppBar';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useSelector } from 'react-redux';

function FooterLayout2(props) {
	const footerTheme = useSelector(({ fuse }) => fuse.settings.footerTheme);

	return (
        <StyledEngineProvider injectFirst>
            (<ThemeProvider theme={footerTheme}>
                <AppBar
                    id="fuse-footer"
                    className="relative z-10"
                    color="default"
                    style={{ backgroundColor: footerTheme.palette.background.default }}
                >
                    <Toolbar className="px-16 py-0 flex items-center">
                        <Typography>Footer</Typography>
                    </Toolbar>
                </AppBar>
            </ThemeProvider>)
        </StyledEngineProvider>
    );
}

export default React.memo(FooterLayout2);
