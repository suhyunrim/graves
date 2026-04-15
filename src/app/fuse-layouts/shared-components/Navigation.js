import FuseNavigation from '@fuse/core/FuseNavigation';
import clsx from 'clsx';
import React from 'react';
import { useSelector } from 'react-redux';

function Navigation({ className, layout = 'vertical', dense, active }) {
	const navigation = useSelector(({ fuse }) => fuse.navigation);

	return (
		<FuseNavigation
			className={clsx('navigation', className)}
			navigation={navigation}
			layout={layout}
			dense={dense}
			active={active}
		/>
	);
}

export default React.memo(Navigation);
