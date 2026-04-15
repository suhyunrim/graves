import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { addDays, differenceInSeconds } from 'date-fns';
import React, { useCallback, useEffect, useRef, useState } from 'react';

function FuseCountdown(props) {
	const { onComplete, endDate: endDateProp = addDays(new Date(), 15) } = props;
	const [endDate] = useState(endDateProp instanceof Date ? endDateProp : new Date(endDateProp));
	const [countdown, setCountdown] = useState({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0
	});
	const intervalRef = useRef();

	const complete = useCallback(() => {
		window.clearInterval(intervalRef.current);
		if (onComplete) {
			onComplete();
		}
	}, [onComplete]);

	const tick = useCallback(() => {
		const now = new Date();
		const diff = differenceInSeconds(endDate, now);
		if (diff < 0) {
			complete();
			return;
		}
		const days = Math.floor(diff / 86400);
		const hours = Math.floor((diff % 86400) / 3600);
		const minutes = Math.floor((diff % 3600) / 60);
		const seconds = diff % 60;
		setCountdown({ days, hours, minutes, seconds });
	}, [complete, endDate]);

	useEffect(() => {
		intervalRef.current = setInterval(tick, 1000);
		return () => {
			clearInterval(intervalRef.current);
		};
	}, [tick]);

	return (
		<div className={clsx('flex items-center', props.className)}>
			<div className="flex flex-col items-center justify-center px-12">
				<Typography variant="h4" className="mb-4">
					{countdown.days}
				</Typography>
				<Typography variant="caption" color="textSecondary">
					days
				</Typography>
			</div>
			<div className="flex flex-col items-center justify-center px-12">
				<Typography variant="h4" className="mb-4">
					{countdown.hours}
				</Typography>
				<Typography variant="caption" color="textSecondary">
					hours
				</Typography>
			</div>
			<div className="flex flex-col items-center justify-center px-12">
				<Typography variant="h4" className="mb-4">
					{countdown.minutes}
				</Typography>
				<Typography variant="caption" color="textSecondary">
					minutes
				</Typography>
			</div>
			<div className="flex flex-col items-center justify-center px-12">
				<Typography variant="h4" className="mb-4">
					{countdown.seconds}
				</Typography>
				<Typography variant="caption" color="textSecondary">
					seconds
				</Typography>
			</div>
		</div>
	);
}

export default React.memo(FuseCountdown);
