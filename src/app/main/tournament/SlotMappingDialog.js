import React, { useState, useMemo } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	MenuItem
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ClearIcon from '@mui/icons-material/Clear';
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';
import { roundLabelFor } from './tournamentUtils';

const useStyles = makeStyles()((theme) => ({
	paperWidth: {
		minWidth: 720,
		maxWidth: '95vw',
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 12
		}
	},
	helperRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 16,
		gap: 12,
		flexWrap: 'wrap'
	},
	helperText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.6)'
	},
	helperBtnGroup: {
		display: 'flex',
		gap: 8,
		flexWrap: 'wrap'
	},
	outlineBtn: {
		color: '#00d4ff',
		border: '1px solid rgba(0, 212, 255, 0.4)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		textTransform: 'none',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.08)'
		}
	},
	bracketScroll: {
		overflowX: 'auto',
		paddingBottom: 8
	},
	bracket: {
		display: 'flex',
		gap: 24,
		minWidth: 'min-content',
		padding: '4px 4px 8px'
	},
	column: {
		display: 'flex',
		flexDirection: 'column',
		minWidth: 240,
		flexShrink: 0
	},
	columnTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.05em',
		textTransform: 'uppercase',
		textShadow: '0 0 12px rgba(0, 212, 255, 0.3)',
		marginBottom: 12,
		paddingBottom: 8,
		borderBottom: '1px solid rgba(0, 212, 255, 0.25)',
		textAlign: 'center'
	},
	columnBody: {
		display: 'flex',
		flexDirection: 'column',
		flex: 1,
		justifyContent: 'space-around',
		gap: 12
	},
	matchBox: {
		background: 'rgba(0, 0, 0, 0.25)',
		border: '1px solid rgba(0, 212, 255, 0.15)',
		borderRadius: 12,
		padding: '10px 12px',
		display: 'flex',
		flexDirection: 'column',
		gap: 8
	},
	matchTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(0, 212, 255, 0.7)',
		fontWeight: 600
	},
	matchInvalid: {
		borderColor: 'rgba(255, 107, 107, 0.4)'
	},
	slotField: {
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif'
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
		'& .MuiSelect-icon': {
			color: 'rgba(255, 255, 255, 0.5)'
		}
	},
	slotLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginBottom: 2
	},
	upcomingRow: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)',
		padding: '6px 8px',
		background: 'rgba(255, 255, 255, 0.03)',
		borderRadius: 8,
		fontStyle: 'italic'
	},
	errorText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: '#ff6b6b',
		marginTop: 12
	}
}));

function shuffle(arr) {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function SlotMappingDialog({ open, onClose, onSuccess, tournamentId, teams, bracketSize }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();

	const [slots, setSlots] = useState(() => Array(bracketSize).fill(null));
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const totalRounds = Math.max(1, Math.log2(bracketSize));

	const placedSet = useMemo(() => new Set(slots.filter(Boolean)), [slots]);

	function handleSlotChange(idx, value) {
		setSlots(prev => {
			const next = prev.slice();
			if (value) {
				next.forEach((s, i) => {
					if (i !== idx && s === value) next[i] = null;
				});
			}
			next[idx] = value || null;
			return next;
		});
	}

	function handleAutoSeed() {
		const next = Array(bracketSize).fill(null);
		const shuffled = shuffle(teams.map(t => t.id));
		shuffled.forEach((id, i) => {
			next[i] = id;
		});
		setSlots(next);
	}

	function handleClear() {
		setSlots(Array(bracketSize).fill(null));
	}

	function validate() {
		const placed = slots.filter(Boolean);
		if (placed.length !== teams.length) {
			return `등록된 팀(${teams.length})을 모두 배치하세요. (현재 ${placed.length}/${teams.length})`;
		}
		if (new Set(placed).size !== placed.length) {
			return '같은 팀이 여러 슬롯에 배치되어 있습니다.';
		}
		// 한 R1 매치(슬롯 i, i+1) 양쪽이 모두 BYE 인지 검사
		for (let i = 0; i < bracketSize; i += 2) {
			if (slots[i] == null && slots[i + 1] == null) {
				return `${roundLabelFor(1, totalRounds)} 매치 ${i / 2 + 1}: 한 매치에 두 BYE 는 허용되지 않습니다.`;
			}
		}
		return null;
	}

	function handleSubmit() {
		const v = validate();
		if (v) {
			setError(v);
			return;
		}
		setError('');
		setLoading(true);

		Actions.startTournament(tournamentId, slots)
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

	// 라운드별 매치 메타데이터 계산
	// R1 매치 m 의 두 슬롯: 2m, 2m+1
	// R(r) 매치 m 은 R(r-1) 매치 (2m), (2m+1) 의 승자가 만난다.
	const roundColumns = [];
	for (let r = 1; r <= totalRounds; r += 1) {
		const matchCount = bracketSize / 2 ** r;
		const matches = [];
		for (let i = 0; i < matchCount; i += 1) {
			matches.push(i);
		}
		roundColumns.push({ round: r, matches });
	}

	function renderR1Match(matchIdx) {
		const slotA = matchIdx * 2;
		const slotB = matchIdx * 2 + 1;
		const bothEmpty = slots[slotA] == null && slots[slotB] == null;
		return (
			<div key={matchIdx} className={cx(classes.matchBox, bothEmpty && classes.matchInvalid)}>
				<div className={classes.matchTitle}>매치 {matchIdx + 1}</div>
				{[slotA, slotB].map((slotIdx) => (
					<div key={slotIdx}>
						<div className={classes.slotLabel}>슬롯 {slotIdx + 1}</div>
						<TextField
							className={classes.slotField}
							value={slots[slotIdx] || ''}
							onChange={(e) => handleSlotChange(slotIdx, e.target.value)}
							variant="outlined"
							select
							size="small"
							fullWidth
						>
							<MenuItem value="">— BYE —</MenuItem>
							{teams.map(t => {
								const usedElsewhere = placedSet.has(t.id) && slots[slotIdx] !== t.id;
								return (
									<MenuItem
										key={t.id}
										value={t.id}
										disabled={usedElsewhere}
									>
										{t.name}{usedElsewhere ? ' (배치됨)' : ''}
									</MenuItem>
								);
							})}
						</TextField>
					</div>
				))}
			</div>
		);
	}

	function renderUpcomingMatch(round, matchIdx) {
		const fromA = matchIdx * 2;
		const fromB = matchIdx * 2 + 1;
		const prevLabel = roundLabelFor(round - 1, totalRounds);
		return (
			<div key={matchIdx} className={classes.matchBox}>
				<div className={classes.matchTitle}>매치 {matchIdx + 1}</div>
				<div className={classes.upcomingRow}>{prevLabel} 매치 {fromA + 1} 승자</div>
				<div className={classes.upcomingRow}>{prevLabel} 매치 {fromB + 1} 승자</div>
			</div>
		);
	}

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>브래킷 슬롯 배치</DialogTitle>
			<div className={dialogClasses.subtitle}>
				{teams.length}팀 · {bracketSize}강 브래킷 · 빈 슬롯은 BYE 처리
			</div>
			<DialogContent className={dialogClasses.contentPad}>
				<div className={classes.helperRow}>
					<span className={classes.helperText}>
						배치된 팀: {placedSet.size}/{teams.length}
					</span>
					<div className={classes.helperBtnGroup}>
						<Button
							className={classes.outlineBtn}
							onClick={handleClear}
							startIcon={<ClearIcon />}
							disabled={loading}
						>
							초기화
						</Button>
						<Button
							className={classes.outlineBtn}
							onClick={handleAutoSeed}
							startIcon={<ShuffleIcon />}
							disabled={loading}
						>
							자동 시드 (랜덤)
						</Button>
					</div>
				</div>
				<div className={classes.bracketScroll}>
					<div className={classes.bracket}>
						{roundColumns.map(({ round, matches }) => (
							<div key={round} className={classes.column}>
								<div className={classes.columnTitle}>{roundLabelFor(round, totalRounds)}</div>
								<div className={classes.columnBody}>
									{matches.map(m => (
										round === 1 ? renderR1Match(m) : renderUpcomingMatch(round, m)
									))}
								</div>
							</div>
						))}
					</div>
				</div>
				{error && <div className={classes.errorText}>{error}</div>}
			</DialogContent>
			<DialogActions className={dialogClasses.actionsPad}>
				<Button className={dialogClasses.cancelBtn} onClick={onClose} disabled={loading}>
					취소
				</Button>
				<Button className={dialogClasses.saveBtn} onClick={handleSubmit} disabled={loading}>
					{loading ? '시작 중...' : '토너먼트 시작'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default SlotMappingDialog;
