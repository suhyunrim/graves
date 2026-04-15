import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import clsx from 'clsx';
import React from 'react';
import { useSelector } from 'react-redux';

function FusePageSimpleSidebarContent(props) {
	const mainThemeDark = useSelector(({ fuse }) => fuse.settings.mainThemeDark);

	const { classes } = props;

	return (
        <FuseScrollbars enable={props.innerScroll}>
            {props.header && (
				<StyledEngineProvider injectFirst>
                    (<ThemeProvider theme={mainThemeDark}>
                        <div
                            className={clsx(
                                classes.sidebarHeader,
                                props.variant,
                                props.sidebarInner && classes.sidebarHeaderInnerSidebar
                            )}
                        >
                            {props.header}
                        </div>
                    </ThemeProvider>)
                </StyledEngineProvider>
			)}
            {props.content && <div className={classes.sidebarContent}>{props.content}</div>}
        </FuseScrollbars>
    );
}

export default FusePageSimpleSidebarContent;
