import React from 'react';
import { useSelector } from 'react-redux';
import { Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { makeStyles } from 'tss-react/mui';

function getSeasonEndDate(seasonEndMonth) {
	const [y, m] = seasonEndMonth.split('-').map(Number);
	const nextYear = m === 12 ? y + 1 : y;
	const nextMonth = m === 12 ? 1 : m + 1;
	const iso = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:05:00+09:00`;
	return new Date(iso);
}

function formatTimeLeft(ms) {
	const days = Math.floor(ms / (1000 * 60 * 60 * 24));
	const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	if (days >= 1) return `D-${days}`;
	if (hours >= 1) return `${hours}시간 남음`;
	return '곧 종료';
}

const useStyles = makeStyles()(() => ({
	badge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 8,
		padding: '6px 14px',
		borderRadius: 20,
		background: 'rgba(0, 212, 255, 0.1)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: '#00d4ff',
		fontWeight: 600,
		cursor: 'help',
		whiteSpace: 'nowrap'
	},
	urgent: {
		background: 'rgba(255, 107, 107, 0.12)',
		borderColor: 'rgba(255, 107, 107, 0.4)',
		color: '#ff6b6b'
	},
	divider: {
		width: 1,
		height: 12,
		background: 'currentColor',
		opacity: 0.35
	},
	season: {
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		letterSpacing: '0.04em',
		fontSize: '1.25rem'
	},
	infoIcon: {
		fontSize: '1.3rem',
		opacity: 0.7
	},
	tooltip: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		padding: '10px 12px',
		lineHeight: 1.6,
		maxWidth: 260
	}
}));

function SeasonCountdownBadge() {
	const { classes } = useStyles();
	const settings = useSelector(state => state.auth?.user?.reprGroup?.settings);

	const currentSeason = settings?.currentSeason;
	const seasonEndMonth = settings?.seasonEndMonth;

	if (!currentSeason && !seasonEndMonth) return null;

	let label = null;
	let urgent = false;

	if (seasonEndMonth) {
		const diffMs = getSeasonEndDate(seasonEndMonth).getTime() - Date.now();
		if (diffMs > 0) {
			label = formatTimeLeft(diffMs);
			urgent = diffMs <= 7 * 24 * 60 * 60 * 1000;
		}
	}

	const tooltipText = seasonEndMonth
		? '시즌 종료 시 시즌 동안 쌓은 레이팅이 절반으로 줄어듭니다 (기본 티어 점수는 유지).'
		: '현재 시즌 자동 종료는 설정되어 있지 않습니다.';

	return (
		<Tooltip title={tooltipText} classes={{ tooltip: classes.tooltip }} arrow placement="bottom">
			<span className={`${classes.badge} ${urgent ? classes.urgent : ''}`}>
				{currentSeason && <span className={classes.season}>시즌 {currentSeason}</span>}
				{currentSeason && label && <span className={classes.divider} />}
				{label && <span>종료 {label}</span>}
				<InfoOutlinedIcon className={classes.infoIcon} />
			</span>
		</Tooltip>
	);
}

export default SeasonCountdownBadge;
