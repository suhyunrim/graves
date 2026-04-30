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
	Checkbox,
	Alert
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import koLocale from 'date-fns/locale/ko';
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';

const useStyles = makeStyles()((theme) => ({
	paperWidth: {
		minWidth: 400,
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
	lockBanner: {
		marginBottom: 16,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		background: 'rgba(0, 212, 255, 0.08)',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		color: 'rgba(255, 255, 255, 0.9)',
		'& .MuiAlert-icon': {
			color: '#00d4ff'
		}
	},
	errorText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: '#ff6b6b',
		marginTop: 8
	}
}));

function toLocalDate(dateStr) {
	if (!dateStr) return null;
	return new Date(dateStr);
}

function ChallengeFormDialog({ open, onClose, onSuccess, groupId, challenge }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();
	const isEdit = Boolean(challenge);
	// 종료/취소된 챌린지는 백엔드가 cosmetic 필드(title/description/displayOrder/isVisible)만 허용한다.
	// 차단 대상 입력을 disabled 처리하고 PUT body 에서도 제외한다.
	const isLocked = isEdit && (challenge.status === 'ended' || challenge.status === 'canceled');
	const lockHelper = isLocked ? '종료/취소된 챌린지는 이 항목을 수정할 수 없습니다.' : undefined;
	const lockBannerText = isLocked
		? `${challenge.status === 'canceled' ? '취소된' : '종료된'} 챌린지입니다. 제목/설명/노출 설정만 수정 가능합니다.`
		: '';

	const [form, setForm] = useState({
		title: challenge ? challenge.title : '',
		description: challenge ? challenge.description || '' : '',
		gameType: challenge ? challenge.gameType : 'soloRank',
		startAt: challenge ? toLocalDate(challenge.startAt) : null,
		endAt: challenge ? toLocalDate(challenge.endAt) : null,
		scoringType: challenge ? challenge.scoringType : 'points',
		isVisible: challenge ? challenge.isVisible : true
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	function handleChange(e) {
		const { name, value, type, checked } = e.target;
		setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
	}

	function handleStartDateChange(date) {
		setForm(prev => ({ ...prev, startAt: date }));
	}

	function handleEndDateChange(date) {
		setForm(prev => ({ ...prev, endAt: date }));
	}

	function validate() {
		if (!form.title.trim()) return '제목을 입력하세요.';
		if (!isLocked) {
			if (!form.startAt) return '시작일을 선택하세요.';
			if (!form.endAt) return '종료일을 선택하세요.';
			if (form.endAt <= form.startAt) return '종료일은 시작일 이후여야 합니다.';
		}
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

		const body = isLocked
			? {
				title: form.title.trim(),
				description: form.description.trim() || undefined,
				isVisible: form.isVisible
			}
			: {
				title: form.title.trim(),
				description: form.description.trim() || undefined,
				gameType: form.gameType,
				startAt: form.startAt.toISOString(),
				endAt: form.endAt.toISOString(),
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
		<Dialog
			open={open}
			onClose={onClose}
			PaperProps={{ className: cx(dialogClasses.paperCyan, classes.paperWidth) }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>{isEdit ? '챌린지 수정' : '챌린지 생성'}</DialogTitle>
			<DialogContent>
				{isLocked && (
					<Alert severity="info" className={classes.lockBanner}>
						{lockBannerText}
					</Alert>
				)}
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
					disabled={isLocked}
					helperText={lockHelper}
				>
					<MenuItem value="soloRank">솔로랭크</MenuItem>
					<MenuItem value="flexRank">자유랭크</MenuItem>
					<MenuItem value="aram">칼바람</MenuItem>
					<MenuItem value="arena">아레나</MenuItem>
				</TextField>
				<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
					<DatePicker
						className={classes.field}
						label="시작일"
						format="yyyy-MM-dd"
						value={form.startAt}
						onChange={handleStartDateChange}
						disabled={isLocked}
						slotProps={{
							textField: {
								variant: 'outlined',
								fullWidth: true,
								required: !isLocked,
								helperText: lockHelper
							}
						}}
					/>
					<DatePicker
						className={classes.field}
						label="종료일"
						format="yyyy-MM-dd"
						value={form.endAt}
						onChange={handleEndDateChange}
						minDate={form.startAt || undefined}
						disabled={isLocked}
						slotProps={{
							textField: {
								variant: 'outlined',
								fullWidth: true,
								required: !isLocked,
								helperText: lockHelper
							}
						}}
					/>
				</LocalizationProvider>
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
					disabled={isLocked}
					helperText={lockHelper}
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
				<Button className={dialogClasses.cancelBtn} onClick={onClose}>
					취소
				</Button>
				<Button className={dialogClasses.saveBtn} onClick={handleSubmit} disabled={loading}>
					{loading ? '처리 중...' : isEdit ? '수정' : '생성'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default ChallengeFormDialog;
