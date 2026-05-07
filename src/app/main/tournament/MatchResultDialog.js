import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';
import { validateMatchScore, bestOfLabel } from './tournamentUtils';

const useStyles = makeStyles()((theme) => ({
	paperWidth: {
		minWidth: 380,
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 16
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
	errorText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: '#ff6b6b',
		marginTop: 12,
		textAlign: 'center'
	}
}));

function MatchResultDialog({ open, onClose, onSuccess, match, team1, team2 }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();

	const [score1, setScore1] = useState('');
	const [score2, setScore2] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	function handleSubmit() {
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

	const winScore = Math.ceil(match.bestOf / 2);

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>매치 결과 입력</DialogTitle>
			<div className={dialogClasses.subtitle}>{bestOfLabel(match.bestOf)} · 승자 {winScore}점</div>
			<DialogContent className={dialogClasses.contentPad}>
				<div className={classes.scoreRow}>
					<div className={classes.teamLabel}>{team1 ? team1.name : 'TBD'}</div>
					<div className={classes.versus}>VS</div>
					<div className={classes.teamLabel}>{team2 ? team2.name : 'TBD'}</div>
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
