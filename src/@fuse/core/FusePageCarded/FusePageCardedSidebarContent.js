import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import clsx from 'clsx';
import React from 'react';
import { useSelector } from 'react-redux';

function FusePageCardedSidebarContent(props) {
	const mainThemeDark = useSelector(({ fuse }) => fuse.settings.mainThemeDark);

	const { classes } = props;

	return (
        <>
            {props.header && (
				<StyledEngineProvider injectFirst>
                    (<ThemeProvider theme={mainThemeDark}>
                        <div className={clsx(classes.sidebarHeader, props.variant)}>{props.header}</div>
                    </ThemeProvider>)
                </StyledEngineProvider>
			)}
            {props.content && (
				<FuseScrollbars className={classes.sidebarContent} enable={props.innerScroll}>
					{props.content}
				</FuseScrollbars>
			)}
        </>
    );
}

export default FusePageCardedSidebarContent;
