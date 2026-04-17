import React, { useState } from 'react';
import { Typography, InputBase, Popover, IconButton } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import SearchIcon from '@mui/icons-material/Search';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useDispatch, useSelector } from 'react-redux';
import SeasonCountdownBadge from '../components/SeasonCountdownBadge';
import * as Actions from './store/actions';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getDaysInMonth(year, month) {
	return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
	return new Date(year, month, 1).getDay();
}

function formatDate(date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

function formatDisplay(dateStr) {
	const [y, m, d] = dateStr.split('-');
	return `${y}.${m}.${d}`;
}

const useStyles = makeStyles()((theme) => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		padding: '24px 28px 20px',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '4rem',
		color: '#fff',
		textTransform: 'uppercase',
		letterSpacing: '0.15em',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
		margin: 0,
		[theme.breakpoints.down('md')]: {
			fontSize: '2.75rem'
		}
	},
	subtitleRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		marginTop: 10,
		[theme.breakpoints.down('md')]: {
			flexDirection: 'column',
			alignItems: 'flex-start',
			gap: 12
		}
	},
	subtitle: {
		position: 'absolute',
		left: 0,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.6)',
		letterSpacing: '0.05em',
		[theme.breakpoints.down('md')]: {
			position: 'static',
			fontSize: '1.35rem'
		}
	},
	searchWrapper: {
		display: 'flex',
		alignItems: 'center',
		background: 'rgba(255, 255, 255, 0.05)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		borderRadius: 12,
		padding: '8px 16px',
		width: 450,
		maxWidth: 'calc(100% - 300px)',
		transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
		'&:focus-within': {
			borderColor: 'rgba(0, 212, 255, 0.6)',
			boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)'
		},
		[theme.breakpoints.down('md')]: {
			width: '100%',
			maxWidth: '100%'
		}
	},
	searchIcon: {
		color: 'rgba(255, 255, 255, 0.4)',
		marginRight: 10,
		fontSize: '1.4rem'
	},
	searchInput: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: '#fff',
		flex: 1,
		'&::placeholder': {
			color: 'rgba(255, 255, 255, 0.4)'
		}
	},
	filterRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginTop: 16,
		[theme.breakpoints.down('md')]: {
			flexWrap: 'wrap'
		}
	},
	seasonBadgeWrap: {
		marginLeft: 'auto',
		[theme.breakpoints.down('md')]: {
			marginLeft: 0
		}
	},
	filterChip: {
		display: 'flex',
		alignItems: 'center',
		padding: '6px 16px',
		borderRadius: 16,
		background: 'rgba(255, 255, 255, 0.08)',
		border: '1px solid rgba(255, 255, 255, 0.1)',
		color: 'rgba(255, 255, 255, 0.7)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 500,
		cursor: 'pointer',
		transition: 'all 0.2s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.15)',
			borderColor: 'rgba(0, 212, 255, 0.3)'
		}
	},
	filterChipActive: {
		background: 'rgba(0, 212, 255, 0.2)',
		borderColor: '#00d4ff',
		color: '#00d4ff'
	},
	calendarBtn: {
		color: 'rgba(255, 255, 255, 0.7)',
		padding: '6px 12px',
		borderRadius: 16,
		background: 'rgba(255, 255, 255, 0.08)',
		border: '1px solid rgba(255, 255, 255, 0.1)',
		transition: 'all 0.2s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.15)',
			borderColor: 'rgba(0, 212, 255, 0.3)'
		}
	},
	calendarBtnActive: {
		background: 'rgba(0, 212, 255, 0.2)',
		borderColor: '#00d4ff',
		color: '#00d4ff'
	},
	periodLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: '#00d4ff',
		marginLeft: 4
	},
	// Calendar popover
	calendarPaper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		borderRadius: 16,
		padding: 20,
		color: '#fff',
		minWidth: 300
	},
	calendarHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 16
	},
	calendarTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff'
	},
	calendarNavBtn: {
		color: 'rgba(255, 255, 255, 0.7)',
		padding: 6,
		'&:hover': {
			color: '#00d4ff'
		}
	},
	calendarDaysHeader: {
		display: 'grid',
		gridTemplateColumns: 'repeat(7, 1fr)',
		gap: 2,
		marginBottom: 4
	},
	calendarDayLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: '4px 0'
	},
	calendarGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(7, 1fr)',
		gap: 2
	},
	calendarDay: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		width: 36,
		height: 36,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '50%',
		cursor: 'pointer',
		color: 'rgba(255, 255, 255, 0.8)',
		transition: 'all 0.15s ease',
		margin: '0 auto',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.2)'
		}
	},
	calendarDayInRange: {
		background: 'rgba(0, 212, 255, 0.1)',
		borderRadius: 0
	},
	calendarDaySelected: {
		background: '#00d4ff',
		color: '#000',
		fontWeight: 700,
		borderRadius: '50%',
		'&:hover': {
			background: '#00bce0'
		}
	},
	calendarDayToday: {
		border: '1px solid rgba(0, 212, 255, 0.5)'
	},
	calendarDayEmpty: {
		cursor: 'default',
		'&:hover': {
			background: 'transparent'
		}
	},
	calendarActions: {
		display: 'flex',
		justifyContent: 'flex-end',
		gap: 8,
		marginTop: 16
	},
	calendarActionBtn: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		padding: '6px 16px',
		borderRadius: 12,
		border: 'none',
		cursor: 'pointer',
		transition: 'all 0.2s ease'
	},
	calendarConfirmBtn: {
		background: '#00d4ff',
		color: '#000',
		'&:hover': {
			background: '#00bce0'
		}
	},
	calendarCancelBtn: {
		background: 'rgba(255, 255, 255, 0.1)',
		color: 'rgba(255, 255, 255, 0.7)',
		'&:hover': {
			background: 'rgba(255, 255, 255, 0.2)'
		}
	},
	selectionHint: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		marginTop: 8
	},
	presetRow: {
		display: 'flex',
		gap: 6,
		marginBottom: 16
	},
	presetBtn: {
		flex: 1,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		fontWeight: 500,
		padding: '6px 0',
		borderRadius: 10,
		border: '1px solid rgba(255, 255, 255, 0.1)',
		background: 'rgba(255, 255, 255, 0.05)',
		color: 'rgba(255, 255, 255, 0.7)',
		cursor: 'pointer',
		transition: 'all 0.15s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.15)',
			borderColor: 'rgba(0, 212, 255, 0.3)',
			color: '#00d4ff'
		}
	}
}));

function CalendarPopover({ anchorEl, onClose, onConfirm }) {
	const { classes } = useStyles();
	const today = new Date();
	const [viewYear, setViewYear] = useState(today.getFullYear());
	const [viewMonth, setViewMonth] = useState(today.getMonth());
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);

	const daysInMonth = getDaysInMonth(viewYear, viewMonth);
	const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

	function handlePrevMonth() {
		if (viewMonth === 0) {
			setViewYear(viewYear - 1);
			setViewMonth(11);
		} else {
			setViewMonth(viewMonth - 1);
		}
	}

	function handleNextMonth() {
		if (viewMonth === 11) {
			setViewYear(viewYear + 1);
			setViewMonth(0);
		} else {
			setViewMonth(viewMonth + 1);
		}
	}

	function handleDayClick(day) {
		const clicked = new Date(viewYear, viewMonth, day);
		if (!startDate || (startDate && endDate)) {
			setStartDate(clicked);
			setEndDate(null);
		} else if (clicked < startDate) {
			setEndDate(startDate);
			setStartDate(clicked);
		} else {
			setEndDate(clicked);
		}
	}

	function isInRange(day) {
		if (!startDate || !endDate) return false;
		const d = new Date(viewYear, viewMonth, day);
		return d > startDate && d < endDate;
	}

	function isSelected(day) {
		const d = new Date(viewYear, viewMonth, day);
		if (startDate && d.getTime() === startDate.getTime()) return true;
		if (endDate && d.getTime() === endDate.getTime()) return true;
		return false;
	}

	function isToday(day) {
		return viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
	}

	function handleConfirm() {
		if (startDate && endDate) {
			onConfirm(formatDate(startDate), formatDate(endDate));
		}
	}

	function applyPreset(days) {
		const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const start = new Date(end);
		start.setDate(start.getDate() - days);
		setStartDate(start);
		setEndDate(end);
		setViewYear(start.getFullYear());
		setViewMonth(start.getMonth());
	}

	const hintText = !startDate ? '시작일을 선택하세요' : !endDate ? '종료일을 선택하세요' : null;

	return (
        <Popover
			open={Boolean(anchorEl)}
			anchorEl={anchorEl}
			onClose={onClose}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
			transformOrigin={{ vertical: 'top', horizontal: 'left' }}
			PaperProps={{ className: classes.calendarPaper }}
		>
            <div className={classes.presetRow}>
				<button type="button" className={classes.presetBtn} onClick={() => applyPreset(7)}>
					최근 1주일
				</button>
				<button type="button" className={classes.presetBtn} onClick={() => applyPreset(30)}>
					최근 1달
				</button>
				<button type="button" className={classes.presetBtn} onClick={() => applyPreset(90)}>
					최근 3달
				</button>
			</div>
            <div className={classes.calendarHeader}>
				<IconButton className={classes.calendarNavBtn} onClick={handlePrevMonth} size="large">
					<ChevronLeftIcon />
				</IconButton>
				<span className={classes.calendarTitle}>
					{viewYear}. {String(viewMonth + 1).padStart(2, '0')}
				</span>
				<IconButton className={classes.calendarNavBtn} onClick={handleNextMonth} size="large">
					<ChevronRightIcon />
				</IconButton>
			</div>
            <div className={classes.calendarDaysHeader}>
				{DAYS.map(d => (
					<span key={d} className={classes.calendarDayLabel}>
						{d}
					</span>
				))}
			</div>
            <div className={classes.calendarGrid}>
				{Array.from({ length: firstDay }).map((_, i) => (
					<div key={`e-${i}`} className={`${classes.calendarDay} ${classes.calendarDayEmpty}`} />
				))}
				{Array.from({ length: daysInMonth }).map((_, i) => {
					const day = i + 1;
					const selected = isSelected(day);
					const inRange = isInRange(day);
					const todayClass = isToday(day) ? classes.calendarDayToday : '';
					let dayClass = classes.calendarDay;
					if (selected) dayClass += ` ${classes.calendarDaySelected}`;
					else if (inRange) dayClass += ` ${classes.calendarDayInRange}`;
					if (todayClass) dayClass += ` ${todayClass}`;

					return (
						<div
							key={day}
							className={dayClass}
							onClick={() => handleDayClick(day)}
							role="button"
							tabIndex={0}
							onKeyDown={e => e.key === 'Enter' && handleDayClick(day)}
						>
							{day}
						</div>
					);
				})}
			</div>
            {hintText && <div className={classes.selectionHint}>{hintText}</div>}
            {startDate && endDate && (
				<div className={classes.selectionHint}>
					{formatDisplay(formatDate(startDate))} ~ {formatDisplay(formatDate(endDate))}
				</div>
			)}
            <div className={classes.calendarActions}>
				<button type="button" className={`${classes.calendarActionBtn} ${classes.calendarCancelBtn}`} onClick={onClose}>
					취소
				</button>
				<button
					type="button"
					className={`${classes.calendarActionBtn} ${classes.calendarConfirmBtn}`}
					onClick={handleConfirm}
					disabled={!startDate || !endDate}
				>
					적용
				</button>
			</div>
        </Popover>
    );
}

function RankingHeader() {
	const { classes } = useStyles();
	const dispatch = useDispatch();
	const searchText = useSelector(({ Ranking }) => Ranking.ranking.searchText);
	const period = useSelector(({ Ranking }) => Ranking.ranking.period);
	const [calendarAnchor, setCalendarAnchor] = useState(null);

	const isAll = period === 'all';
	const isCustom = period !== 'all';

	function handleCalendarOpen(e) {
		setCalendarAnchor(e.currentTarget);
	}

	function handleCalendarClose() {
		setCalendarAnchor(null);
	}

	function handleCalendarConfirm(startDate, endDate) {
		dispatch(Actions.setPeriod({ startDate, endDate }));
		setCalendarAnchor(null);
	}

	function handleAllClick() {
		dispatch(Actions.setPeriod('all'));
	}

	return (
		<div className={classes.root}>
			<Typography className={classes.title} variant="h4">
				Ranking
			</Typography>
			<div className={classes.subtitleRow}>
				<Typography className={classes.subtitle}>내전 레이팅 순위</Typography>
				<div className={classes.searchWrapper}>
					<SearchIcon className={classes.searchIcon} />
					<InputBase
						className={classes.searchInput}
						placeholder="소환사 검색..."
						value={searchText}
						onChange={ev => dispatch(Actions.setSearchText(ev))}
						inputProps={{ 'aria-label': 'search' }}
					/>
				</div>
			</div>
			<div className={classes.filterRow}>
				<div
					className={`${classes.filterChip} ${isAll ? classes.filterChipActive : ''}`}
					onClick={handleAllClick}
					role="button"
					tabIndex={0}
					onKeyDown={e => e.key === 'Enter' && handleAllClick()}
				>
					전체
				</div>
				<div
					className={`${classes.filterChip} ${isCustom ? classes.calendarBtnActive : ''}`}
					onClick={handleCalendarOpen}
					role="button"
					tabIndex={0}
					onKeyDown={e => e.key === 'Enter' && handleCalendarOpen(e)}
				>
					<DateRangeIcon style={{ fontSize: '1.4rem', marginRight: 4 }} />
					{isCustom ? (
						<span className={classes.periodLabel}>
							{formatDisplay(period.startDate)} ~ {formatDisplay(period.endDate)}
						</span>
					) : (
						'기간 선택'
					)}
				</div>
				<div className={classes.seasonBadgeWrap}>
					<SeasonCountdownBadge />
				</div>
			</div>
			<CalendarPopover anchorEl={calendarAnchor} onClose={handleCalendarClose} onConfirm={handleCalendarConfirm} />
		</div>
	);
}

export default RankingHeader;
