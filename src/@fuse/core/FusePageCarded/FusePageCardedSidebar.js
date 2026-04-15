import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import React, { useImperativeHandle, useState } from 'react';
import FusePageCardedSidebarContent from './FusePageCardedSidebarContent';

function FusePageCardedSidebar(props, ref) {
	const [isOpen, setIsOpen] = useState(false);
	const { classes } = props;

	useImperativeHandle(ref, () => ({
		toggleSidebar: handleToggleDrawer
	}));

	const handleToggleDrawer = () => {
		setIsOpen(!isOpen);
	};

	return (
        <>
            <Box sx={props.variant === 'permanent' ? { display: { lg: 'none' } } : {}}>
				<Drawer
					variant="temporary"
					anchor={props.position}
					open={isOpen}
					onClose={ev => handleToggleDrawer()}
					classes={{
						root: clsx(classes.sidebarWrapper, props.variant),
						paper: clsx(
							classes.sidebar,
							props.variant,
							props.position === 'left' ? classes.leftSidebar : classes.rightSidebar
						)
					}}
					ModalProps={{
						keepMounted: true // Better open performance on mobile.
					}}
					container={props.rootRef.current}
					BackdropProps={{
						classes: {
							root: classes.backdrop
						}
					}}
					style={{ position: 'absolute' }}
				>
					<FusePageCardedSidebarContent {...props} />
				</Drawer>
			</Box>
            {props.variant === 'permanent' && (
				<Box sx={{ display: { xs: 'none', lg: 'block' } }}>
					<Drawer
						variant="permanent"
						className={clsx(classes.sidebarWrapper, props.variant)}
						open={isOpen}
						classes={{
							paper: clsx(
								classes.sidebar,
								props.variant,
								props.position === 'left' ? classes.leftSidebar : classes.rightSidebar
							)
						}}
					>
						<FusePageCardedSidebarContent {...props} />
					</Drawer>
				</Box>
			)}
        </>
    );
}

export default React.forwardRef(FusePageCardedSidebar);
