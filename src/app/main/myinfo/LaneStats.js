import React from 'react';
import { makeStyles } from 'tss-react/mui';
import PositionIcon from '../tournament/PositionIcon';

// 표시 순서 고정: 탑 → 정글 → 미드 → 원딜 → 서폿
const LANE_ORDER = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
const POSITION_META = {
	TOP: { label: '탑', icon: 'top' },
	JUNGLE: { label: '정글', icon: 'jungle' },
	MIDDLE: { label: '미드', icon: 'mid' },
	BOTTOM: { label: '원딜', icon: 'adc' },
	UTILITY: { label: '서폿', icon: 'support' }
};

const useStyles = makeStyles()((theme) => ({
	root: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 16,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		padding: '20px 24px',
		[theme.breakpoints.down('sm')]: {
			padding: '16px 18px',
			borderRadius: 14
		}
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.04em',
		textTransform: 'uppercase',
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		'&::before': {
			content: '""',
			display: 'inline-block',
			width: 4,
			height: 20,
			borderRadius: 2,
			background: 'linear-gradient(180deg, #00d4ff, #0066ff)'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.4rem'
		}
	},
	caption: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		margin: '6px 0 16px'
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
		gap: 12,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr',
			gap: 10
		}
	},
	card: {
		background: 'rgba(0, 212, 255, 0.06)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		borderRadius: 12,
		padding: '14px 16px'
	},
	cardHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginBottom: 12
	},
	posIcon: {
		width: 20,
		height: 20
	},
	posLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.9)'
	},
	laneGames: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginLeft: 'auto'
	},
	metricRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '5px 0',
		borderTop: '1px solid rgba(255, 255, 255, 0.06)'
	},
	metricLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.55)'
	},
	metricValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 700
	}
}));

const diffColor = v => {
	if (v == null) return 'rgba(255, 255, 255, 0.4)';
	if (v > 0) return '#00ff7f';
	if (v < 0) return '#ff6b6b';
	return 'rgba(255, 255, 255, 0.6)';
};

const fmtDiff = (v, digits) => {
	if (v == null) return '-';
	const rounded = digits > 0 ? v.toFixed(digits) : Math.round(v).toLocaleString();
	return v > 0 ? `+${rounded}` : rounded;
};

// 딜량은 값이 커서 1000 이상이면 k 단위로 축약
const fmtDmg = v => {
	if (v == null) return '-';
	const abs = Math.abs(v);
	const body = abs >= 1000 ? `${(abs / 1000).toFixed(1)}k` : Math.round(abs).toLocaleString();
	if (v > 0) return `+${body}`;
	if (v < 0) return `-${body}`;
	return body;
};

// 포지션별 맞라인 격차(본인 - 상대 평균). laneGames > 0인 포지션만 표시하고,
// 하나도 없으면 렌더하지 않는다.
function LaneStats({ positions }) {
	const { classes } = useStyles();
	const rows = (positions || [])
		.filter(p => p && p.laneGames > 0)
		.sort((a, b) => LANE_ORDER.indexOf(a.position) - LANE_ORDER.indexOf(b.position));

	if (rows.length === 0) {
		return null;
	}

	return (
		<div className={classes.root}>
			<div className={classes.title}>내전 라인전 지표</div>
			<div className={classes.caption}>※ 맞라인 상대가 특정된 판만 집계됩니다. 값은 상대 대비 평균 격차(본인 − 상대)입니다.</div>
			<div className={classes.grid}>
				{rows.map(p => {
					const meta = POSITION_META[p.position] || { label: p.position, icon: null };
					return (
						<div key={p.position} className={classes.card}>
							<div className={classes.cardHeader}>
								<PositionIcon position={meta.icon} className={classes.posIcon} fallbackClassName={classes.posLabel} />
								<span className={classes.posLabel}>{meta.label}</span>
								<span className={classes.laneGames}>{p.laneGames}판</span>
							</div>
							<div className={classes.metricRow}>
								<span className={classes.metricLabel}>CS 격차</span>
								<span className={classes.metricValue} style={{ color: diffColor(p.csDiffAvg) }}>
									{fmtDiff(p.csDiffAvg, 1)}
								</span>
							</div>
							<div className={classes.metricRow}>
								<span className={classes.metricLabel}>골드 격차</span>
								<span className={classes.metricValue} style={{ color: diffColor(p.goldDiffAvg) }}>
									{fmtDiff(p.goldDiffAvg, 0)}
								</span>
							</div>
							<div className={classes.metricRow}>
								<span className={classes.metricLabel}>딜량 격차</span>
								<span className={classes.metricValue} style={{ color: diffColor(p.damageDiffAvg) }}>
									{fmtDmg(p.damageDiffAvg)}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default LaneStats;
