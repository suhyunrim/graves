import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';

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

const BEST_OF_OPTIONS = [1, 3, 5, 7];

function TournamentCreateDialog({ open, onClose, onSuccess, groupId }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();

	const [form, setForm] = useState({
		name: '',
		defaultBestOf: 3,
		finalBestOf: 5
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	function handleChange(e) {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: name === 'name' ? value : Number(value) }));
	}

	function validate() {
		if (!form.name.trim()) return '토너먼트 이름을 입력하세요.';
		return null;
	}

	function handleSubmit() {
		const validationError = validate();
		if (validationError) {
			setError(validationError);
			return;
		}
		setError('');
		setLoading(true);

		Actions.createTournament({
			groupId,
			name: form.name.trim(),
			defaultBestOf: form.defaultBestOf,
			finalBestOf: form.finalBestOf
		})
			.then(() => {
				setLoading(false);
				onSuccess();
			})
			.catch(err => {
				setLoading(false);
				const status = err.response && err.response.status;
				const msg = err.response && err.response.data ? err.response.data.result : '오류가 발생했습니다.';
				if (status === 409) {
					setError(msg || '이미 진행 중인 토너먼트가 있습니다.');
				} else {
					setError(msg);
				}
			});
	}

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>토너먼트 생성</DialogTitle>
			<DialogContent className={dialogClasses.contentPad}>
				<TextField
					className={classes.field}
					label="이름"
					name="name"
					value={form.name}
					onChange={handleChange}
					variant="outlined"
					fullWidth
					required
					autoFocus
					inputProps={{ maxLength: 60 }}
					helperText="팀 수는 시작 시점에 등록된 팀 수로 자동 결정됩니다."
				/>
				<TextField
					className={classes.field}
					label="일반 매치 BO"
					name="defaultBestOf"
					value={form.defaultBestOf}
					onChange={handleChange}
					variant="outlined"
					fullWidth
					select
					required
				>
					{BEST_OF_OPTIONS.map(n => (
						<MenuItem key={n} value={n}>BO{n}</MenuItem>
					))}
				</TextField>
				<TextField
					className={classes.field}
					label="결승 BO"
					name="finalBestOf"
					value={form.finalBestOf}
					onChange={handleChange}
					variant="outlined"
					fullWidth
					select
					required
				>
					{BEST_OF_OPTIONS.map(n => (
						<MenuItem key={n} value={n}>BO{n}</MenuItem>
					))}
				</TextField>
				{error && <div className={classes.errorText}>{error}</div>}
			</DialogContent>
			<DialogActions className={dialogClasses.actionsPad}>
				<Button className={dialogClasses.cancelBtn} onClick={onClose} disabled={loading}>
					취소
				</Button>
				<Button className={dialogClasses.saveBtn} onClick={handleSubmit} disabled={loading}>
					{loading ? '생성 중...' : '생성'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default TournamentCreateDialog;
