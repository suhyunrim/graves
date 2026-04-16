import FuseNavigation from '@fuse/core/FuseNavigation';
import clsx from 'clsx';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { prefetchRoutes } from 'app/utility/prefetchRoutes';

function Navigation({ className, layout = 'vertical', dense, active }) {
	const navigation = useSelector(({ fuse }) => fuse.navigation);

	useEffect(() => {
		prefetchRoutes();
	}, []);

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
