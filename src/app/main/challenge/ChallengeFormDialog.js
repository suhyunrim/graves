import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	MenuItem,
	FormControlLabel,
	Checkbox
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as Actions from './store/actions';

const useStyles = makeStyles(() => ({
	paper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		color: '#fff',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.3)',
		minWidth: 400
	},
	title: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.8rem',
		borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
		color: '#fff'
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
		}
	},
	checkbox: {
		color: 'rgba(255, 255, 255, 0.6)',
		'&.Mui-checked': {
			color: '#00d4ff'
		}
	},
	checkboxLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		color: 'rgba(255, 255, 255, 0.8)'
	},
	cancelBtn: {
		color: 'rgba(255, 255, 255, 0.7)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 600
	},
	submitBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		borderRadius: 10,
		padding: '8px 24px',
		textTransform: 'none',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)'
		},
		'&.Mui-disabled': {
			background: 'rgba(255, 255, 255, 0.1)',
			color: 'rgba(255, 255, 255, 0.3)'
		}
	},
	errorText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: '#ff6b6b',
		marginTop: 8
	}
}));

function toLocalDatetime(dateStr) {
	if (!dateStr) return '';
	const d = new Date(dateStr);
	const offset = d.getTimezoneOffset();
	const local = new Date(d.getTime() - offset * 60 * 1000);
	return local.toISOString().slice(0, 16);
}

function ChallengeFormDialog({ open, onClose, onSuccess, groupId, challenge }) {
	const classes = useStyles();
	const isEdit = Boolean(challenge);

	const [form, setForm] = useState({
		title: challenge ? challenge.title : '',
		description: challenge ? challenge.description || '' : '',
		gameType: challenge ? challenge.gameType : 'soloRank',
		startAt: challenge ? toLocalDatetime(challenge.startAt) : '',
		endAt: challenge ? toLocalDatetime(challenge.endAt) : '',
		scoringType: challenge ? challenge.scoringType : 'points',
		isVisible: challenge ? challenge.isVisible : true
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	function handleChange(e) {
		const { name, value, type, checked } = e.target;
		setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
	}

	function validate() {
		if (!form.title.trim()) return '제목을 입력하세요.';
		if (!form.startAt) return '시작일시를 선택하세요.';
		if (!form.endAt) return '종료일시를 선택하세요.';
		if (new Date(form.endAt) <= new Date(form.startAt)) return '종료일시는 시작일시 이후여야 합니다.';
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

		const body = {
			title: form.title.trim(),
			description: form.description.trim() || undefined,
			gameType: form.gameType,
			startAt: new Date(form.startAt).toISOString(),
			endAt: new Date(form.endAt).toISOString(),
			scoringType: form.scoringType,
			isVisible: form.isVisible
		};

		const request = isEdit
			? Actions.updateChallenge(groupId, challenge.id, body)
			: Actions.createChallenge(groupId, body);

		request
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
		<Dialog open={open} onClose={onClose} PaperProps={{ className: classes.paper }}>
			<DialogTitle className={classes.title}>{isEdit ? '챌린지 수정' : '챌린지 생성'}</DialogTitle>
			<DialogContent>
				<TextField
					className={classes.field}
					label="제목"
					name="title"
					value={form.title}
					onChange={handleChange}
					variant="outlined"
					fullWidth
					required
					autoFocus
				/>
				<TextField
					className={classes.field}
					label="설명"
					name="description"
					value={form.description}
					onChange={handleChange}
					variant="outlined"
					fullWidth
					multiline
					rows={3}
				/>
				<TextField
					className={classes.field}
					label="게임 타입"
					name="gameType"
					value={form.gameType}
					onChange={handleChange}
					variant="outlined"
					fullWidth
					select
					required
				>
					<MenuItem value="soloRank">솔로랭크</MenuItem>
					<MenuItem value="flexRank">자유랭크</MenuItem>
					<MenuItem value="aram">칼바람</MenuItem>
					<MenuItem value="arena">아레나</MenuItem>
				</TextField>
				<TextField
					className={classes.field}
					label="시작일시"
					name="startAt"
					type="datetime-local"
					value={form.startAt}
					onChange={handleChange}
					variant="outlined"
					fullWidth
					required
					InputLabelProps={{ shrink: true }}
				/>
				<TextField
					className={classes.field}
					label="종료일시"
					name="endAt"
					type="datetime-local"
					value={form.endAt}
					onChange={handleChange}
					variant="outlined"
					fullWidth
					required
					InputLabelProps={{ shrink: true }}
				/>
				<TextField
					className={classes.field}
					label="점수 방식"
					name="scoringType"
					value={form.scoringType}
					onChange={handleChange}
					variant="outlined"
					fullWidth
					select
					required
				>
					<MenuItem value="points">포인트 (판당 1점)</MenuItem>
					<MenuItem value="games">판수</MenuItem>
					<MenuItem value="wins">승수</MenuItem>
					<MenuItem value="winRate">승률</MenuItem>
				</TextField>
				<FormControlLabel
					control={
						<Checkbox
							className={classes.checkbox}
							checked={form.isVisible}
							onChange={handleChange}
							name="isVisible"
						/>
					}
					label="공개"
					classes={{ label: classes.checkboxLabel }}
				/>
				{error && <div className={classes.errorText}>{error}</div>}
			</DialogContent>
			<DialogActions>
				<Button className={classes.cancelBtn} onClick={onClose}>
					취소
				</Button>
				<Button className={classes.submitBtn} onClick={handleSubmit} disabled={loading}>
					{loading ? '처리 중...' : isEdit ? '수정' : '생성'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default ChallengeFormDialog;
