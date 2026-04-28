import React, { useEffect, useState, useRef } from 'react';
import { makeStyles } from 'tss-react/mui';
import { recordProfileVisit, fetchProfileVisitStats } from './profileApi';

const useStyles = makeStyles()(theme => ({
	root: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 14,
		padding: '8px 16px',
		borderRadius: 12,
		background: 'rgba(0, 0, 0, 0.28)',
		border: '1px solid rgba(0, 212, 255, 0.18)',
		fontFamily: '"Noto Sans KR", sans-serif',
		[theme.breakpoints.down('sm')]: {
			padding: '6px 12px',
			gap: 10
		}
	},
	cell: {
		display: 'flex',
		alignItems: 'baseline',
		gap: 6
	},
	label: {
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	value: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: '#00d4ff'
	},
	totalValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: '#fff'
	},
	divider: {
		width: 1,
		height: 18,
		background: 'rgba(255, 255, 255, 0.15)'
	}
}));

function VisitorCounter({ groupId, puuid, isLoggedIn }) {
	const { classes } = useStyles();
	const [stats, setStats] = useState({ today: 0, total: 0 });
	const visitedRef = useRef(null);

	useEffect(() => {
		if (!groupId || !puuid) return;

		const visitKey = `${groupId}__${puuid}`;
		const shouldVisit = isLoggedIn && visitedRef.current !== visitKey;

		const load = () => {
			fetchProfileVisitStats(groupId, puuid)
				.then(result => {
					if (result) setStats({ today: result.today || 0, total: result.total || 0 });
				})
				.catch(() => {});
		};

		if (shouldVisit) {
			visitedRef.current = visitKey;
			recordProfileVisit(groupId, puuid)
				.catch(() => {})
				.finally(load);
		} else {
			load();
		}
	}, [groupId, puuid, isLoggedIn]);

	return (
		<div className={classes.root}>
			<div className={classes.cell}>
				<span className={classes.label}>투데이</span>
				<span className={classes.value}>{stats.today}</span>
			</div>
			<div className={classes.divider} />
			<div className={classes.cell}>
				<span className={classes.label}>투탈</span>
				<span className={classes.totalValue}>{stats.total}</span>
			</div>
		</div>
	);
}

export default VisitorCounter;
