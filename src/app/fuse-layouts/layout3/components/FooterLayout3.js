import AppBar from '@mui/material/AppBar';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useSelector } from 'react-redux';

function FooterLayout3(props) {
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
                    <Toolbar className="flex items-center container py-0 px-16 lg:px-24">
                        <Typography>Footer</Typography>
                    </Toolbar>
                </AppBar>
            </ThemeProvider>)
        </StyledEngineProvider>
    );
}

export default React.memo(FooterLayout3);
