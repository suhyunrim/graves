import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import React from 'react';
import { useSelector } from 'react-redux';

function FusePageSimpleHeader(props) {
	const mainThemeDark = useSelector(({ fuse }) => fuse.settings.mainThemeDark);

	return (
        <div className={props.classes.header}>
            {props.header && <StyledEngineProvider injectFirst>
                <ThemeProvider theme={mainThemeDark}>{props.header}</ThemeProvider>
            </StyledEngineProvider>}
        </div>
    );
}

export default FusePageSimpleHeader;
