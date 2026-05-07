import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Tabs,
	Tab,
	Select,
	MenuItem,
	FormControl
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import koLocale from 'date-fns/locale/ko';
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';
import { validateMatchScore, bestOfLabel } from './tournamentUtils';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 30];

const useStyles = makeStyles()((theme) => ({
	paperWidth: {
		minWidth: 380,
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 16
		}
	},
	tabs: {
		marginBottom: 12,
		'& .MuiTabs-indicator': {
			background: '#00d4ff'
		}
	},
	tab: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.5)',
		textTransform: 'none',
		minWidth: 100,
		'&.Mui-selected': {
			color: '#00d4ff'
		}
	},
	scoreRow: {
		display: 'grid',
		gridTemplateColumns: '1fr auto 1fr',
		alignItems: 'center',
		gap: 14,
		padding: '12px 0'
	},
	teamLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: '#fff',
		textAlign: 'center',
		fontWeight: 600,
		wordBreak: 'break-word'
	},
	versus: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: 'rgba(0, 212, 255, 0.6)'
	},
	scoreInput: {
		marginTop: 12,
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Rajdhani", sans-serif',
			fontSize: '1.8rem',
			fontWeight: 700
		},
		'& .MuiInputBase-input': {
			textAlign: 'center'
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(255, 255, 255, 0.2)'
		},
		'& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.5)'
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: '#00d4ff'
		}
	},
	hint: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.5)',
		textAlign: 'center',
		marginTop: 8
	},
	scheduleField: {
		marginTop: 8,
		width: '100%',
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.3rem'
		},
		'& .MuiInputLabel-root': {
			color: 'rgba(255, 255, 255, 0.6)',
			fontFamily: '"Noto Sans KR", sans-serif'
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(255, 255, 255, 0.2)'
		},
		'& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.5)'
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: '#00d4ff'
		},
		'& .MuiSvgIcon-root': {
			color: 'rgba(0, 212, 255, 0.7)'
		}
	},
	scheduleLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginTop: 12
	},
	timeRow: {
		marginTop: 8,
		display: 'flex',
		gap: 10
	},
	timeSelect: {
		flex: 1,
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.3rem'
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(255, 255, 255, 0.2)'
		},
		'& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.5)'
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: '#00d4ff'
		},
		'& .MuiSvgIcon-root': {
			color: 'rgba(0, 212, 255, 0.7)'
		}
	},
	clearScheduleBtn: {
		marginTop: 10,
		color: '#ff6b6b',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		textTransform: 'none',
		alignSelf: 'flex-start',
		padding: '4px 8px',
		'&:hover': {
			background: 'rgba(255, 107, 107, 0.08)'
		}
	},
	scheduleBody: {
		display: 'flex',
		flexDirection: 'column',
		gap: 4
	},
	errorText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: '#ff6b6b',
		marginTop: 12,
		textAlign: 'center'
	}
}));

const TAB_SCHEDULE = 0;
const TAB_SCORE = 1;

function MatchResultDialog({ open, onClose, onSuccess, match, team1, team2 }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();

	// 일정이 이미 있으면 스코어 탭으로 자동 이동, 없으면 일정 탭부터.
	const initialTab = match && match.scheduledAt ? TAB_SCORE : TAB_SCHEDULE;
	const [activeTab, setActiveTab] = useState(initialTab);

	const [score1, setScore1] = useState('');
	const [score2, setScore2] = useState('');
	// 일정은 사용자 로컬(=KST 사이트라 KST) 기준으로 (date, hour, minute) 분리 보관.
	// 저장 시 `date.setHours(hour, minute)` → toISOString() 으로 UTC 변환.
	const initialDate = match && match.scheduledAt ? new Date(match.scheduledAt) : null;
	const [date, setDate] = useState(initialDate);
	const [hour, setHour] = useState(initialDate ? initialDate.getHours() : 19);
	const [minute, setMinute] = useState(
		initialDate ? (initialDate.getMinutes() < 30 ? 0 : 30) : 0
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const winScore = match ? Math.ceil(match.bestOf / 2) : 0;

	function handleScoreSubmit() {
		const s1 = Number(score1);
		const s2 = Number(score2);
		const v = validateMatchScore(s1, s2, match.bestOf);
		if (v) {
			setError(v);
			return;
		}
		setError('');
		setLoading(true);

		Actions.updateMatchResult(match.id, s1, s2)
			.then(() => {
				setLoading(false);
				onSuccess();
			})
			.catch(err => {
				setLoading(false);
				const msg = err.response && err.response.data ? err.response.data.result : '오류가 발생했습니다.';
				setError(msg);
			});
	}

	function handleScheduleSubmit(forceClear) {
		let isoOrNull;
		if (forceClear) {
			isoOrNull = null;
		} else {
			if (!date) {
				setError('날짜를 선택하세요.');
				return;
			}
			const local = new Date(date);
			local.setHours(hour, minute, 0, 0);
			if (Number.isNaN(local.getTime())) {
				setError('유효하지 않은 일정입니다.');
				return;
			}
			isoOrNull = local.toISOString();
		}
		setError('');
		setLoading(true);
		Actions.updateMatchSchedule(match.id, isoOrNull)
			.then(() => {
				setLoading(false);
				onSuccess();
			})
			.catch(err => {
				setLoading(false);
				const msg = err.response && err.response.data ? err.response.data.result : '오류가 발생했습니다.';
				setError(msg);
			});
	}

	function handleSubmit() {
		if (activeTab === TAB_SCHEDULE) handleScheduleSubmit();
		else handleScoreSubmit();
	}

	function handleTabChange(_, v) {
		if (loading) return;
		setError('');
		setActiveTab(v);
	}

	if (!match) return null;

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>매치 관리</DialogTitle>
			<DialogContent className={dialogClasses.contentPad}>
				<Tabs value={activeTab} onChange={handleTabChange} className={classes.tabs}>
					<Tab label="일정" className={classes.tab} />
					<Tab label="스코어" className={classes.tab} />
				</Tabs>

				<div className={classes.scoreRow}>
					<div className={classes.teamLabel}>{team1 ? team1.name : 'TBD'}</div>
					<div className={classes.versus}>VS</div>
					<div className={classes.teamLabel}>{team2 ? team2.name : 'TBD'}</div>
				</div>

				{activeTab === TAB_SCHEDULE && (
					<div className={classes.scheduleBody}>
						<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
							<DatePicker
								value={date}
								onChange={setDate}
								format="yyyy-MM-dd"
								slotProps={{
									textField: { className: classes.scheduleField, variant: 'outlined', label: '날짜' }
								}}
							/>
						</LocalizationProvider>
						<div className={classes.scheduleLabel}>시간</div>
						<div className={classes.timeRow}>
							<FormControl className={classes.timeSelect} variant="outlined">
								<Select value={hour} onChange={(e) => setHour(Number(e.target.value))}>
									{HOURS.map(h => (
										<MenuItem key={h} value={h}>{String(h).padStart(2, '0')}시</MenuItem>
									))}
								</Select>
							</FormControl>
							<FormControl className={classes.timeSelect} variant="outlined">
								<Select value={minute} onChange={(e) => setMinute(Number(e.target.value))}>
									{MINUTES.map(m => (
										<MenuItem key={m} value={m}>{String(m).padStart(2, '0')}분</MenuItem>
									))}
								</Select>
							</FormControl>
						</div>
						{match.scheduledAt && (
							<Button
								className={classes.clearScheduleBtn}
								onClick={() => handleScheduleSubmit(true)}
								disabled={loading}
							>
								일정 취소
							</Button>
						)}
					</div>
				)}

				{activeTab === TAB_SCORE && (
					<>
						<div className={dialogClasses.subtitle} style={{ padding: '0 0 12px' }}>
							{bestOfLabel(match.bestOf)} · 승자 {winScore}점
						</div>
						<div className={classes.scoreRow}>
							<TextField
								className={classes.scoreInput}
								value={score1}
								onChange={e => setScore1(e.target.value)}
								type="number"
								variant="outlined"
								inputProps={{ min: 0, max: winScore }}
								autoFocus
							/>
							<div className={classes.versus}>:</div>
							<TextField
								className={classes.scoreInput}
								value={score2}
								onChange={e => setScore2(e.target.value)}
								type="number"
								variant="outlined"
								inputProps={{ min: 0, max: winScore }}
							/>
						</div>
						<div className={classes.hint}>
							승자: {winScore}점 / 패자: 0~{winScore - 1}점
						</div>
					</>
				)}

				{error && <div className={classes.errorText}>{error}</div>}
			</DialogContent>
			<DialogActions className={dialogClasses.actionsPad}>
				<Button className={dialogClasses.cancelBtn} onClick={onClose} disabled={loading}>
					취소
				</Button>
				<Button className={dialogClasses.saveBtn} onClick={handleSubmit} disabled={loading}>
					{loading ? '저장 중...' : '저장'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default MatchResultDialog;
