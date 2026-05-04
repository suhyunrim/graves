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
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';

const useStyles = makeStyles()((theme) => ({
	paperWidth: {
		minWidth: 560,
		maxWidth: 720,
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 12
		}
	},
	matchGrid: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: 16,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr'
		}
	},
	matchBox: {
		background: 'rgba(0, 0, 0, 0.25)',
		border: '1px solid rgba(0, 212, 255, 0.15)',
		borderRadius: 12,
		padding: '12px 14px',
		display: 'flex',
		flexDirection: 'column',
		gap: 8
	},
	matchTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
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
	shuffleBtn: {
		color: '#00d4ff',
		border: '1px solid rgba(0, 212, 255, 0.4)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		textTransform: 'none',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.08)'
		}
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

	const teamMap = useMemo(() => {
		const m = new Map();
		teams.forEach(t => m.set(t.id, t));
		return m;
	}, [teams]);

	const placedSet = useMemo(() => new Set(slots.filter(Boolean)), [slots]);

	function handleSlotChange(idx, value) {
		setSlots(prev => {
			const next = prev.slice();
			// 같은 팀이 다른 슬롯에 있으면 비움
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
		// 팀들을 무작위로 섞고 매치별로 양쪽에 분배 (한 매치에 두 BYE 안 생기도록)
		const next = Array(bracketSize).fill(null);
		const shuffled = shuffle(teams.map(t => t.id));
		shuffled.forEach((id, i) => {
			next[i] = id;
		});
		setSlots(next);
	}

	function validate() {
		const placed = slots.filter(Boolean);
		if (placed.length !== teams.length) {
			return `등록된 팀(${teams.length})을 모두 배치하세요. (현재 ${placed.length}/${teams.length})`;
		}
		if (new Set(placed).size !== placed.length) {
			return '같은 팀이 여러 슬롯에 배치되어 있습니다.';
		}
		// 한 매치(i, i+1) 양쪽이 모두 BYE인지 검사
		for (let i = 0; i < bracketSize; i += 2) {
			if (slots[i] == null && slots[i + 1] == null) {
				return `매치 ${i / 2 + 1}: 한 매치에 두 BYE는 허용되지 않습니다.`;
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

	const matches = [];
	for (let i = 0; i < bracketSize; i += 2) {
		matches.push({ matchIdx: i / 2, slot1: i, slot2: i + 1 });
	}

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>1라운드 슬롯 배치</DialogTitle>
			<div className={dialogClasses.subtitle}>
				{teams.length}팀 / {bracketSize}강 브래킷 · 빈 슬롯은 BYE 처리
			</div>
			<DialogContent className={dialogClasses.contentPad}>
				<div className={classes.helperRow}>
					<span className={classes.helperText}>
						배치된 팀: {placedSet.size}/{teams.length}
					</span>
					<Button
						className={classes.shuffleBtn}
						onClick={handleAutoSeed}
						startIcon={<ShuffleIcon />}
						disabled={loading}
					>
						자동 시드 (랜덤)
					</Button>
				</div>
				<div className={classes.matchGrid}>
					{matches.map(({ matchIdx, slot1, slot2 }) => {
						const bothEmpty = slots[slot1] == null && slots[slot2] == null;
						return (
							<div
								key={matchIdx}
								className={cx(classes.matchBox, bothEmpty && classes.matchInvalid)}
							>
								<div className={classes.matchTitle}>매치 {matchIdx + 1}</div>
								{[slot1, slot2].map((slotIdx, i) => (
									<TextField
										key={slotIdx}
										className={classes.slotField}
										label={`슬롯 ${i + 1}`}
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
								))}
							</div>
						);
					})}
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
