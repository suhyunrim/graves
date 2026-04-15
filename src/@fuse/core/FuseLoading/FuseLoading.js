import { useTimeout } from '@fuse/hooks';
import { LinearProgress, CircularProgress } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';

function FuseLoading({ delay = false, isShowingText = true, isLinearProgress = true }) {
	const [showLoading, setShowLoading] = useState(!delay);

	useTimeout(() => {
		setShowLoading(true);
	}, delay);

	if (!showLoading) {
		return null;
	}

	return (
		<div className="flex flex-1 flex-col items-center justify-center">
			{isShowingText ? (
				<Typography className="text-20 mb-16" color="textSecondary">
					Loading...
				</Typography>
			) : null}
			{isLinearProgress ? (
				<LinearProgress className="w-xs" color="primary" />
			) : (
				<CircularProgress className="w-xs" color="primary" />
			)}
		</div>
	);
}

export default FuseLoading;
