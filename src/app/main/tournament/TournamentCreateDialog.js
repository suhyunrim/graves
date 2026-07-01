import React, { useState, useEffect, useMemo } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	MenuItem,
	Tabs,
	Tab,
	Autocomplete,
	FormControlLabel,
	Switch,
	Chip
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import koLocale from 'date-fns/locale/ko';
import { format } from 'date-fns';
import { makeStyles } from 'tss-react/mui';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileIconUrl } from 'app/main/challenge/ddragonUtils';
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';
import { bestOfLabel, POSITIONS, POSITION_LABELS } from './tournamentUtils';
import PositionIcon from './PositionIcon';
import TrophyTypeGrid from './TrophyTypeGrid';
import PredictionModeField from './PredictionModeField';

const useStyles = makeStyles()((theme) => ({
	paperWidth: {
		minWidth: 560,
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
	typeTabs: {
		marginBottom: 16,
		'& .MuiTabs-indicator': {
			backgroundColor: '#00d4ff',
			height: 3
		}
	},
	typeTab: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		color: 'rgba(255, 255, 255, 0.5)',
		textTransform: 'none',
		'&.Mui-selected': {
			color: '#00d4ff',
			fontWeight: 700
		}
	},
	auctionSection: {
		background: 'rgba(0, 212, 255, 0.04)',
		border: '1px solid rgba(0, 212, 255, 0.18)',
		borderRadius: 12,
		padding: 16,
		marginBottom: 16
	},
	auctionSectionTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: '#00d4ff',
		marginBottom: 12,
		letterSpacing: '0.02em'
	},
	switchRow: {
		display: 'flex',
		alignItems: 'center',
		marginBottom: 8,
		'& .MuiFormControlLabel-label': {
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.25rem',
			color: 'rgba(255, 255, 255, 0.85)'
		},
		'& .MuiSwitch-switchBase.Mui-checked': {
			color: '#00d4ff'
		},
		'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
			backgroundColor: '#00d4ff'
		}
	},
	candidatesBlock: {
		marginTop: 8
	},
	positionRow: {
		display: 'flex',
		alignItems: 'flex-start',
		gap: 10,
		marginBottom: 10,
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			alignItems: 'stretch',
			gap: 4
		}
	},
	positionHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		width: 84,
		flexShrink: 0,
		paddingTop: 14,
		[theme.breakpoints.down('sm')]: {
			width: 'auto',
			paddingTop: 0
		}
	},
	positionIcon: {
		width: 22,
		height: 22,
		color: '#00d4ff'
	},
	positionLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		color: '#fff',
		fontWeight: 600
	},
	positionCount: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(0, 212, 255, 0.8)',
		marginLeft: 4
	},
	positionCountMismatch: {
		color: '#ff8c00'
	},
	memberAutocomplete: {
		flex: 1,
		minWidth: 0,
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif',
			minHeight: 44
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
	memberChip: {
		background: 'rgba(0, 212, 255, 0.18)',
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		'& .MuiChip-deleteIcon': {
			color: 'rgba(255, 255, 255, 0.7)',
			'&:hover': { color: '#fff' }
		}
	},
	memberOption: {
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	optionAvatar: {
		width: 28,
		height: 28,
		borderRadius: 6
	},
	optionName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem'
	},
	hintText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginTop: 8
	},
	hintWarn: {
		color: '#ff8c00'
	},
	errorText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: '#ff6b6b',
		marginTop: 8
	}
}));

const BEST_OF_OPTIONS = [1, 3, 5, 7];

const DEFAULT_AUCTION = {
	minBid: 5,
	bidDurationSeconds: 30,
	allowNegative: false
};

function makeEmptyCandidates() {
	return POSITIONS.reduce((acc, p) => {
		acc[p] = [];
		return acc;
	}, {});
}

function TournamentCreateDialog({ open, onClose, onSuccess, groupId }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();
	const dispatch = useDispatch();
	const activeMembers = useSelector(({ Tournament }) => Tournament.tournament.activeMembers);

	const [form, setForm] = useState({
		name: '',
		defaultBestOf: 3,
		finalBestOf: 5,
		trophyType: '',
		heldAt: new Date()
	});
	const [type, setType] = useState('normal');
	const [predictionMode, setPredictionMode] = useState('bracket');
	const [allowSingleTeam, setAllowSingleTeam] = useState(false);
	const [auction, setAuction] = useState(DEFAULT_AUCTION);
	const [candidates, setCandidates] = useState(makeEmptyCandidates);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		// 경매 탭으로 전환되거나 다이얼로그가 열린 시점에 멤버 목록을 lazy 로드.
		if (open && type === 'auction' && groupId) {
			dispatch(Actions.getActiveMembers(groupId));
		}
	}, [dispatch, groupId, open, type]);

	const memberMap = useMemo(() => {
		const m = new Map();
		(activeMembers || []).forEach(x => m.set(x.puuid, x));
		return m;
	}, [activeMembers]);

	// 이미 어떤 포지션에 등록된 puuid는 다른 포지션 옵션에서 제외.
	const assignedPuuids = useMemo(() => {
		const s = new Set();
		POSITIONS.forEach(pos => {
			candidates[pos].forEach(p => s.add(p));
		});
		return s;
	}, [candidates]);

	const counts = useMemo(() => POSITIONS.map(p => candidates[p].length), [candidates]);
	const allSameCount = counts.every(n => n === counts[0]) && counts[0] > 0;

	function handleChange(e) {
		const { name, value } = e.target;
		const isNumberField = name === 'defaultBestOf' || name === 'finalBestOf';
		setForm(prev => ({ ...prev, [name]: isNumberField ? Number(value) : value }));
	}

	function handleAuctionChange(field) {
		return (e) => {
			const v = e.target.value;
			setAuction(prev => ({ ...prev, [field]: Number(v) }));
		};
	}

	function handleCandidatesChange(pos) {
		return (_e, value) => {
			setCandidates(prev => ({ ...prev, [pos]: value.map(m => m.puuid) }));
		};
	}

	function validate() {
		if (!form.name.trim()) return '토너먼트 이름을 입력하세요.';
		if (!form.heldAt || Number.isNaN(form.heldAt.getTime())) return '개최일을 선택하세요.';
		if (type === 'auction') {
			if (!auction.minBid || auction.minBid <= 0) return '최소 입찰가는 1 이상이어야 합니다.';
			if (!auction.bidDurationSeconds || auction.bidDurationSeconds <= 0) {
				return '기본 입찰 제한 시간은 1초 이상이어야 합니다.';
			}
			if (!allSameCount) return '각 포지션의 후보 인원이 동일해야 합니다.';
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

		const body = {
			groupId,
			name: form.name.trim(),
			defaultBestOf: form.defaultBestOf,
			finalBestOf: form.finalBestOf,
			trophyType: form.trophyType || null,
			type,
			predictionMode,
			heldAt: format(form.heldAt, 'yyyy-MM-dd')
		};
		if (type === 'normal' && allowSingleTeam) {
			body.allowSingleTeam = true;
		}
		if (type === 'auction') {
			body.auctionConfig = {
				minBid: auction.minBid,
				bidDurationSeconds: auction.bidDurationSeconds,
				allowNegative: auction.allowNegative,
				candidates: POSITIONS.reduce((acc, p) => {
					acc[p] = candidates[p];
					return acc;
				}, {})
			};
		}

		Actions.createTournament(body)
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

	function renderPositionRow(pos) {
		const selectedPuuids = candidates[pos];
		const selectedSet = new Set(selectedPuuids);
		const selectedMembers = selectedPuuids
			.map(puuid => memberMap.get(puuid))
			.filter(Boolean);
		// 다른 포지션에 이미 등록된 사람은 후보에서 제외 (한 사람이 여러 포지션 등록 불가).
		const options = (activeMembers || []).filter(
			m => selectedSet.has(m.puuid) || !assignedPuuids.has(m.puuid)
		);
		const count = selectedPuuids.length;
		const mismatched = allSameCount ? false : count !== counts[0] || counts.some(n => n !== count);

		return (
			<div className={classes.positionRow} key={pos}>
				<div className={classes.positionHeader}>
					<PositionIcon position={pos} className={classes.positionIcon} />
					<span className={classes.positionLabel}>{POSITION_LABELS[pos]}</span>
					<span className={cx(classes.positionCount, mismatched && classes.positionCountMismatch)}>
						{count}명
					</span>
				</div>
				<Autocomplete
					multiple
					className={classes.memberAutocomplete}
					options={options}
					value={selectedMembers}
					onChange={handleCandidatesChange(pos)}
					getOptionLabel={(opt) => (opt && opt.name) || ''}
					isOptionEqualToValue={(opt, val) => opt.puuid === val.puuid}
					renderOption={(props, option) => (
						<li {...props} key={option.puuid}>
							<div className={classes.memberOption}>
								{option.profileIconId != null && (
									<img
										className={classes.optionAvatar}
										src={getProfileIconUrl(option.profileIconId)}
										alt=""
									/>
								)}
								<span className={classes.optionName}>{option.name}</span>
							</div>
						</li>
					)}
					renderTags={(value, getTagProps) =>
						value.map((option, index) => {
							const { key, ...tagProps } = getTagProps({ index });
							return (
								<Chip
									key={key}
									{...tagProps}
									label={option.name}
									className={classes.memberChip}
									size="small"
								/>
							);
						})
					}
					renderInput={(params) => (
						<TextField
							{...params}
							placeholder={selectedPuuids.length === 0 ? '후보 선택' : ''}
							variant="outlined"
							size="small"
						/>
					)}
				/>
			</div>
		);
	}

	const candidateHint = (() => {
		if (type !== 'auction') return null;
		if (counts.some(n => n === 0)) {
			return { text: '5개 포지션 모두 후보를 등록해야 합니다.', cls: classes.hintWarn };
		}
		if (!allSameCount) {
			return { text: '각 포지션의 후보 인원이 동일해야 합니다.', cls: classes.hintWarn };
		}
		return { text: `포지션별 ${counts[0]}명 — 총 ${counts[0] * 5}명 등록됨.`, cls: classes.hintText };
	})();

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>토너먼트 생성</DialogTitle>
			<DialogContent className={dialogClasses.contentPad}>
				<Tabs
					className={classes.typeTabs}
					value={type}
					onChange={(_e, v) => setType(v)}
					variant="fullWidth"
				>
					<Tab className={classes.typeTab} value="normal" label="일반" />
					<Tab className={classes.typeTab} value="auction" label="경매 (자낳대)" />
				</Tabs>
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
					helperText={type === 'auction'
						? '팀장만 먼저 등록한 뒤 어드민이 경매를 진행해 팀을 채웁니다.'
						: '팀 수는 시작 시점에 등록된 팀 수로 자동 결정됩니다.'}
				/>
				<TextField
					className={classes.field}
					label="일반 매치 형식"
					name="defaultBestOf"
					value={form.defaultBestOf}
					onChange={handleChange}
					variant="outlined"
					fullWidth
					select
					required
				>
					{BEST_OF_OPTIONS.map(n => (
						<MenuItem key={n} value={n}>{bestOfLabel(n)}</MenuItem>
					))}
				</TextField>
				<TextField
					className={classes.field}
					label="결승 형식"
					name="finalBestOf"
					value={form.finalBestOf}
					onChange={handleChange}
					variant="outlined"
					fullWidth
					select
					required
				>
					{BEST_OF_OPTIONS.map(n => (
						<MenuItem key={n} value={n}>{bestOfLabel(n)}</MenuItem>
					))}
				</TextField>
				<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={koLocale}>
					<DatePicker
						className={classes.field}
						label="개최일"
						format="yyyy-MM-dd"
						value={form.heldAt}
						onChange={(date) => setForm(prev => ({ ...prev, heldAt: date }))}
						slotProps={{
							textField: {
								variant: 'outlined',
								fullWidth: true,
								required: true,
								helperText: '토너먼트가 열린 날짜. 과거 토너먼트는 실제 개최일을 선택하세요.'
							}
						}}
					/>
				</LocalizationProvider>
				<TrophyTypeGrid
					label="트로피 종류 (선택)"
					value={form.trophyType}
					onChange={v => setForm(prev => ({ ...prev, trophyType: v }))}
					helperText="우승 시 표시되는 트로피. 미지정도 가능."
				/>

				<PredictionModeField value={predictionMode} onChange={setPredictionMode} />

				{type === 'normal' && (
					<>
						<div className={classes.switchRow}>
							<FormControlLabel
								control={
									<Switch
										checked={allowSingleTeam}
										onChange={(e) => setAllowSingleTeam(e.target.checked)}
									/>
								}
								label="이미 끝난 과거 토너먼트 (우승팀만 등록)"
							/>
						</div>
						{allowSingleTeam && (
							<div className={classes.hintText}>
								우승팀 1팀만 등록하고 시작하면 즉시 우승 처리됩니다. 브래킷 배치는 생략됩니다.
							</div>
						)}
					</>
				)}

				{type === 'auction' && (
					<div className={classes.auctionSection}>
						<div className={classes.auctionSectionTitle}>경매 설정</div>
						<TextField
							className={classes.field}
							label="최소 입찰가"
							type="number"
							value={auction.minBid}
							onChange={handleAuctionChange('minBid')}
							variant="outlined"
							size="small"
							inputProps={{ min: 1 }}
							helperText="팀당 5명 고정. 팀장 예산은 팀장 등록 시 개별로 지정합니다."
						/>
						<TextField
							className={classes.field}
							label="기본 입찰 제한 시간 (초)"
							type="number"
							value={auction.bidDurationSeconds}
							onChange={handleAuctionChange('bidDurationSeconds')}
							variant="outlined"
							size="small"
							inputProps={{ min: 1 }}
							helperText="경매 중 모든 입찰의 제한 시간이 됩니다. 토너먼트 시작 후에는 변경할 수 없습니다."
						/>
						<div className={classes.switchRow}>
							<FormControlLabel
								control={
									<Switch
										checked={auction.allowNegative}
										onChange={(e) => setAuction(prev => ({ ...prev, allowNegative: e.target.checked }))}
									/>
								}
								label="잔여 예산이 마이너스로 가도 허용"
							/>
						</div>

						<div className={classes.auctionSectionTitle} style={{ marginTop: 8 }}>후보자 등록</div>
						<div className={classes.candidatesBlock}>
							{POSITIONS.map(p => renderPositionRow(p))}
						</div>
						{candidateHint && (
							<div className={cx(classes.hintText, candidateHint.cls)}>{candidateHint.text}</div>
						)}
					</div>
				)}

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
