import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import useDialogStyles from '../components/dialogStyles';
import useToast from 'app/utility/useToast';
import * as Actions from './store/actions';
import TrophyTypeGrid from './TrophyTypeGrid';
import PredictionModeField from './PredictionModeField';
import { STATUS, isAuctionTournament } from './tournamentUtils';

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
	const toast = useToast();

	// 경매 타입 토너먼트에서만 경매시간(초) 필드를 노출. 현재값은 auctionConfig.bidDurationSeconds.
	const isAuction = isAuctionTournament(tournament);
	const currentBidDuration = isAuction && tournament.auctionConfig ? tournament.auctionConfig.bidDurationSeconds : null;

	const [name, setName] = useState(tournament ? tournament.name : '');
	const [trophyType, setTrophyType] = useState(tournament && tournament.trophyType ? tournament.trophyType : '');
	const [predictionMode, setPredictionMode] = useState(
		tournament && tournament.predictionMode ? tournament.predictionMode : 'bracket'
	);
	const [bidDuration, setBidDuration] = useState(currentBidDuration != null ? String(currentBidDuration) : '');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	// 예측 방식은 준비중일 때만 변경 가능 (백엔드도 그 외 상태면 409).
	const canEditMode = tournament && tournament.status === STATUS.PREPARING;

	function handleSubmit() {
		if (!tournament) return;
		const trimmed = name.trim();
		const body = {};
		// 변경된 필드만 보냄. 둘 다 동일하면 백엔드에서 400 떨어지니 클라에서 미리 차단.
		if (trimmed && trimmed !== tournament.name) body.name = trimmed;
		const newTrophy = trophyType || null;
		if (newTrophy !== (tournament.trophyType || null)) body.trophyType = newTrophy;
		const curMode = tournament.predictionMode || 'bracket';
		if (canEditMode && predictionMode !== curMode) body.predictionMode = predictionMode;
		// 경매 타입: 경매시간(초)은 양의 정수만 허용. 변경됐을 때만 body에 포함.
		if (isAuction) {
			const seconds = Number(bidDuration);
			if (bidDuration.trim() === '' || !Number.isInteger(seconds) || seconds <= 0) {
				setError('경매시간(초)은 0보다 큰 정수여야 합니다.');
				return;
			}
			if (seconds !== currentBidDuration) body.bidDurationSeconds = seconds;
		}
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
				toast.error(msg);
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
				<TrophyTypeGrid
					label="트로피 종류"
					value={trophyType}
					onChange={setTrophyType}
					helperText="우승 시 표시되는 트로피. 미지정도 가능."
				/>
				<PredictionModeField
					value={predictionMode}
					onChange={setPredictionMode}
					disabled={!canEditMode}
					disabledReason="준비중인 토너먼트만 예측 방식을 변경할 수 있습니다."
				/>
				{isAuction && (
					<TextField
						className={classes.field}
						label="경매시간(초)"
						type="number"
						value={bidDuration}
						onChange={e => setBidDuration(e.target.value)}
						variant="outlined"
						fullWidth
						inputProps={{ min: 1, step: 1 }}
						helperText="다음 매물 입찰부터 적용됩니다. 진행 중인 타이머에는 영향이 없습니다."
					/>
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

export default TournamentEditDialog;
