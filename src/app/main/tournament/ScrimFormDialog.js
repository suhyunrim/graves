import React, { useState } from 'react';
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
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';

const useStyles = makeStyles()((theme) => ({
	paperWidth: {
		minWidth: 460,
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 16
		}
	},
	teamRow: {
		display: 'grid',
		gridTemplateColumns: '1fr auto 1fr',
		alignItems: 'end',
		gap: 12,
		marginBottom: 12,
		[theme.breakpoints.down('sm')]: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'stretch',
			gap: 8
		}
	},
	versus: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: 'rgba(0, 212, 255, 0.6)',
		paddingBottom: 12,
		[theme.breakpoints.down('sm')]: {
			padding: 0,
			fontSize: '1.3rem',
			textAlign: 'center'
		}
	},
	field: {
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
	scoreField: {
		'& .MuiInputBase-input': {
			textAlign: 'center',
			fontFamily: '"Rajdhani", sans-serif',
			fontSize: '1.8rem',
			fontWeight: 700
		}
	},
	errorText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: '#ff6b6b',
		marginTop: 12
	}
}));

function ScrimFormDialog({ open, onClose, onSuccess, tournamentId, teams, scrim }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();
	const isEdit = Boolean(scrim);

	const [team1Id, setTeam1Id] = useState(scrim ? scrim.team1Id : '');
	const [team2Id, setTeam2Id] = useState(scrim ? scrim.team2Id : '');
	const [team1Score, setTeam1Score] = useState(scrim ? String(scrim.team1Score) : '0');
	const [team2Score, setTeam2Score] = useState(scrim ? String(scrim.team2Score) : '0');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	function validate() {
		if (!team1Id || !team2Id) return '두 팀을 모두 선택하세요.';
		if (team1Id === team2Id) return '같은 팀끼리는 기록할 수 없습니다.';
		const s1 = Number(team1Score);
		const s2 = Number(team2Score);
		if (!Number.isInteger(s1) || !Number.isInteger(s2)) return '점수는 정수로 입력하세요.';
		if (s1 < 0 || s2 < 0) return '점수는 0 이상이어야 합니다.';
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

		const body = {
			team1Id,
			team2Id,
			team1Score: Number(team1Score),
			team2Score: Number(team2Score)
		};

		const req = isEdit
			? Actions.updateScrim(tournamentId, scrim.id, body)
			: Actions.createScrim(tournamentId, body);

		req
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

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>{isEdit ? '스크림 수정' : '스크림 결과 기록'}</DialogTitle>
			<div className={dialogClasses.subtitle}>두 팀이 가져간 세트 수를 입력하세요.</div>
			<DialogContent className={dialogClasses.contentPad}>
				<div className={classes.teamRow}>
					<TextField
						className={classes.field}
						label="팀 1"
						value={team1Id}
						onChange={e => setTeam1Id(e.target.value)}
						variant="outlined"
						select
						fullWidth
						required
					>
						{teams.map(t => (
							<MenuItem key={t.id} value={t.id} disabled={t.id === team2Id}>
								{t.name}
							</MenuItem>
						))}
					</TextField>
					<div className={classes.versus}>VS</div>
					<TextField
						className={classes.field}
						label="팀 2"
						value={team2Id}
						onChange={e => setTeam2Id(e.target.value)}
						variant="outlined"
						select
						fullWidth
						required
					>
						{teams.map(t => (
							<MenuItem key={t.id} value={t.id} disabled={t.id === team1Id}>
								{t.name}
							</MenuItem>
						))}
					</TextField>
				</div>
				<div className={classes.teamRow}>
					<TextField
						className={cx(classes.field, classes.scoreField)}
						label="팀 1 점수"
						value={team1Score}
						onChange={e => setTeam1Score(e.target.value)}
						type="number"
						variant="outlined"
						inputProps={{ min: 0 }}
						fullWidth
					/>
					<div className={classes.versus}>:</div>
					<TextField
						className={cx(classes.field, classes.scoreField)}
						label="팀 2 점수"
						value={team2Score}
						onChange={e => setTeam2Score(e.target.value)}
						type="number"
						variant="outlined"
						inputProps={{ min: 0 }}
						fullWidth
					/>
				</div>
				{error && <div className={classes.errorText}>{error}</div>}
			</DialogContent>
			<DialogActions className={dialogClasses.actionsPad}>
				<Button className={dialogClasses.cancelBtn} onClick={onClose} disabled={loading}>
					취소
				</Button>
				<Button className={dialogClasses.saveBtn} onClick={handleSubmit} disabled={loading}>
					{loading ? '저장 중...' : isEdit ? '수정' : '기록'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default ScrimFormDialog;
