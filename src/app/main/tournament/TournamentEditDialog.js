import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';
import { TROPHY_TYPES, TROPHY_TYPE_ORDER } from './tournamentUtils';

const useStyles = makeStyles()((theme) => ({
	paperWidth: {
		minWidth: 420,
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 16
		}
	},
	field: {
		marginBottom: 16,
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
		'& .MuiInputLabel-root.Mui-focused': {
			color: '#00d4ff'
		},
		'& .MuiSelect-icon': {
			color: 'rgba(255, 255, 255, 0.5)'
		},
		'& .MuiFormHelperText-root': {
			color: 'rgba(255, 255, 255, 0.5)'
		}
	},
	errorText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: '#ff6b6b',
		marginTop: 8
	}
}));

function TournamentEditDialog({ open, onClose, onSuccess, tournament }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();

	const [name, setName] = useState(tournament ? tournament.name : '');
	const [trophyType, setTrophyType] = useState(tournament && tournament.trophyType ? tournament.trophyType : '');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	function handleSubmit() {
		if (!tournament) return;
		const trimmed = name.trim();
		const body = {};
		// 변경된 필드만 보냄. 둘 다 동일하면 백엔드에서 400 떨어지니 클라에서 미리 차단.
		if (trimmed && trimmed !== tournament.name) body.name = trimmed;
		const newTrophy = trophyType || null;
		if (newTrophy !== (tournament.trophyType || null)) body.trophyType = newTrophy;
		if (Object.keys(body).length === 0) {
			onClose();
			return;
		}
		if (body.name === '') {
			setError('이름을 입력하세요.');
			return;
		}
		setError('');
		setLoading(true);
		Actions.updateTournament(tournament.id, body)
			.then(() => {
				setLoading(false);
				onSuccess();
			})
			.catch(err => {
				setLoading(false);
				const msg = err.response && err.response.data ? err.response.data.result : '수정 실패';
				setError(msg);
			});
	}

	if (!tournament) return null;

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>토너먼트 수정</DialogTitle>
			<DialogContent className={dialogClasses.contentPad}>
				<TextField
					className={classes.field}
					label="이름"
					value={name}
					onChange={e => setName(e.target.value)}
					variant="outlined"
					fullWidth
					required
					autoFocus
					inputProps={{ maxLength: 60 }}
				/>
				<TextField
					className={classes.field}
					label="트로피 종류"
					value={trophyType}
					onChange={e => setTrophyType(e.target.value)}
					variant="outlined"
					fullWidth
					select
					helperText="우승 시 표시되는 트로피. 미지정도 가능."
				>
					<MenuItem value="">미지정</MenuItem>
					{TROPHY_TYPE_ORDER.map(t => (
						<MenuItem key={t} value={t}>{TROPHY_TYPES[t].ko}</MenuItem>
					))}
				</TextField>
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

export default TournamentEditDialog;
