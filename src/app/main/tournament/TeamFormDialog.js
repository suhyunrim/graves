import React, { useState, useMemo, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Autocomplete,
	Radio
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useDispatch, useSelector } from 'react-redux';
import { getProfileIconUrl } from 'app/main/challenge/ddragonUtils';
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';
import { POSITIONS, POSITION_LABELS } from './tournamentUtils';
import PositionIcon from './PositionIcon';

const useStyles = makeStyles()((theme) => ({
	paperWidth: {
		minWidth: 540,
		maxWidth: 620,
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 12
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
		}
	},
	memberRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		marginBottom: 12,
		[theme.breakpoints.down('sm')]: {
			gap: 6
		}
	},
	captainRadio: {
		color: 'rgba(255, 255, 255, 0.4)',
		padding: 6,
		'&.Mui-checked': {
			color: '#ffd700'
		}
	},
	positionCell: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 64,
		flexShrink: 0,
		gap: 6,
		[theme.breakpoints.down('sm')]: {
			width: 48
		}
	},
	positionIcon: {
		width: 26,
		height: 26,
		color: '#00d4ff'
	},
	positionFallback: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: '#00d4ff',
		fontWeight: 600
	},
	memberAutocomplete: {
		flex: 1,
		minWidth: 0,
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
	captainHint: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: '#ffd700',
		marginBottom: 8
	},
	sectionLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginBottom: 8,
		marginTop: 4
	},
	errorText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: '#ff6b6b',
		marginTop: 8
	}
}));

function makeEmptySlots() {
	return POSITIONS.map(p => ({ puuid: null, position: p }));
}

function TeamFormDialog({ open, onClose, onSuccess, tournamentId, groupId, team, allTeams, tournament }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();
	const dispatch = useDispatch();
	const activeMembers = useSelector(({ Tournament }) => Tournament.tournament.activeMembers);
	const isEdit = Boolean(team);
	const isAuctionCreate = !isEdit && tournament && tournament.type === 'auction';
	const auctionConfig = tournament && tournament.auctionConfig;

	// 각 puuid가 등록된 포지션을 룩업하기 위한 맵 (auction 모드 전용).
	const candidatePositionMap = useMemo(() => {
		const m = new Map();
		if (auctionConfig && auctionConfig.candidates) {
			Object.entries(auctionConfig.candidates).forEach(([pos, puuids]) => {
				(puuids || []).forEach(p => m.set(p, pos));
			});
		}
		return m;
	}, [auctionConfig]);

	const [auctionCaptain, setAuctionCaptain] = useState(null);
	const [auctionBudget, setAuctionBudget] = useState(1000);

	const heldAt = tournament ? tournament.heldAt : null;

	useEffect(() => {
		// 팀 후보 목록은 다이얼로그 열릴 때만 필요.
		// 페이지 진입 시 미리 부르지 않고 여기서 lazy 로 가져온다.
		if (groupId) {
			dispatch(Actions.getActiveMembers(groupId, heldAt));
		}
	}, [dispatch, groupId, heldAt]);

	const [name, setName] = useState(team ? team.name : '');
	const [members, setMembers] = useState(() => {
		if (!team) return makeEmptySlots();
		// 기존 팀 멤버를 포지션 슬롯 순서대로 채워넣는다 — 해당 포지션이 없으면 빈 슬롯에 폴백.
		const slots = makeEmptySlots();
		(team.members || []).forEach(m => {
			const idx = POSITIONS.indexOf(m.position);
			if (idx >= 0 && !slots[idx].puuid) {
				slots[idx] = { puuid: m.puuid, position: POSITIONS[idx] };
			}
		});
		(team.members || []).forEach(m => {
			if (slots.some(s => s.puuid === m.puuid)) return;
			const empty = slots.findIndex(s => !s.puuid);
			if (empty >= 0) slots[empty] = { puuid: m.puuid, position: POSITIONS[empty] };
		});
		return slots;
	});
	const [captainPuuid, setCaptainPuuid] = useState(team ? team.captainPuuid : null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const otherTeamPuuids = useMemo(() => {
		const s = new Set();
		(allTeams || []).forEach(t => {
			if (team && t.id === team.id) return;
			(t.members || []).forEach(m => s.add(m.puuid));
		});
		return s;
	}, [allTeams, team]);

	const memberMap = useMemo(() => {
		const m = new Map();
		(activeMembers || []).forEach(x => m.set(x.puuid, x));
		return m;
	}, [activeMembers]);

	const availableMembers = useMemo(
		() => (activeMembers || []).filter(m => !otherTeamPuuids.has(m.puuid)),
		[activeMembers, otherTeamPuuids]
	);

	// auction 모드: 후보 풀에 있는 사람 중 아직 어느 팀의 팀장도 아닌 사람만.
	const auctionCaptainCandidates = useMemo(() => {
		if (!isAuctionCreate) return [];
		return (activeMembers || []).filter(m =>
			candidatePositionMap.has(m.puuid) && !otherTeamPuuids.has(m.puuid)
		);
	}, [isAuctionCreate, activeMembers, candidatePositionMap, otherTeamPuuids]);

	const auctionCaptainPosition = auctionCaptain
		? candidatePositionMap.get(auctionCaptain.puuid)
		: null;

	function handleMemberChange(idx, member) {
		setMembers(prev => {
			const next = prev.slice();
			next[idx] = { puuid: member ? member.puuid : null, position: next[idx].position };
			// 같은 puuid가 다른 슬롯에 있으면 비움 (한 사람이 한 포지션만)
			if (member) {
				next.forEach((s, i) => {
					if (i !== idx && s.puuid === member.puuid) {
						next[i] = { puuid: null, position: s.position };
					}
				});
			}
			return next;
		});
		if (captainPuuid && (!member || member.puuid !== captainPuuid)) {
			const stillIn = members.some((s, i) => i !== idx && s.puuid === captainPuuid);
			const becomingCaptain = member && member.puuid === captainPuuid;
			if (!stillIn && !becomingCaptain) setCaptainPuuid(null);
		}
	}

	function validate() {
		if (!name.trim()) return '팀명을 입력하세요.';
		if (isAuctionCreate) {
			if (!auctionCaptain) return '팀장을 선택하세요.';
			if (!auctionCaptainPosition) return '선택한 사람이 후보 풀에 등록되어 있지 않습니다.';
			const budgetNum = Number(auctionBudget);
			if (!Number.isFinite(budgetNum) || budgetNum <= 0) return '예산은 1 이상이어야 합니다.';
			return null;
		}
		const filled = members.filter(m => m.puuid);
		if (filled.length !== 5) return '팀원 5명을 모두 선택하세요.';
		const puuidSet = new Set(filled.map(m => m.puuid));
		if (puuidSet.size !== 5) return '팀원이 중복됩니다.';
		if (!captainPuuid || !puuidSet.has(captainPuuid)) return '팀장을 선택하세요.';
		for (const m of filled) {
			if (!memberMap.has(m.puuid)) return '그룹에 등록되지 않은 유저가 포함되어 있습니다.';
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

		const body = isAuctionCreate
			? {
				name: name.trim(),
				captainPuuid: auctionCaptain.puuid,
				members: [{ puuid: auctionCaptain.puuid, position: auctionCaptainPosition }],
				budget: Number(auctionBudget)
			}
			: {
				name: name.trim(),
				captainPuuid,
				members: members.map(m => ({ puuid: m.puuid, position: m.position }))
			};

		const req = isEdit
			? Actions.updateTeam(tournamentId, team.id, body)
			: Actions.createTeam(tournamentId, body);

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

	function renderPositionCell(position) {
		return (
			<div className={classes.positionCell}>
				<PositionIcon position={position} className={classes.positionIcon} fallbackClassName={classes.positionFallback} />
			</div>
		);
	}

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>
				{isEdit ? '팀 수정' : (isAuctionCreate ? '팀장 등록' : '팀 등록')}
			</DialogTitle>
			<div className={dialogClasses.subtitle}>
				{isAuctionCreate
					? '팀장과 예산을 등록합니다 — 나머지 자리는 경매로 채워집니다'
					: '탑/정글/미드/원딜/서폿 — 팀장은 ★ 라디오로 지정'}
			</div>
			<DialogContent className={dialogClasses.contentPad}>
				<TextField
					className={classes.field}
					label="팀명"
					value={name}
					onChange={e => setName(e.target.value)}
					variant="outlined"
					fullWidth
					required
					autoFocus
					inputProps={{ maxLength: 40 }}
				/>
				{isAuctionCreate ? (
					<>
						<div className={classes.sectionLabel}>팀장</div>
						<div className={classes.memberRow}>
							{auctionCaptainPosition ? renderPositionCell(auctionCaptainPosition) : (
								<div className={classes.positionCell}>
									<span className={classes.positionFallback}>?</span>
								</div>
							)}
							<Autocomplete
								className={classes.memberAutocomplete}
								options={auctionCaptainCandidates}
								value={auctionCaptain}
								getOptionLabel={(o) => (o && o.name) || ''}
								isOptionEqualToValue={(o, v) => o.puuid === v.puuid}
								onChange={(_, value) => setAuctionCaptain(value)}
								renderOption={(props, option) => {
									const { key, ...rest } = props;
									const pos = candidatePositionMap.get(option.puuid);
									return (
										<li key={key} {...rest} className={classes.memberOption}>
											{option.profileIconId && (
												<img
													src={getProfileIconUrl(option.profileIconId)}
													alt=""
													className={classes.optionAvatar}
												/>
											)}
											<span className={classes.optionName}>
												{option.name}
												{pos && (
													<span style={{ color: '#00d4ff', marginLeft: 8 }}>
														{POSITION_LABELS[pos]}
													</span>
												)}
											</span>
										</li>
									);
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										variant="outlined"
										label="팀장 선택"
									/>
								)}
							/>
						</div>
						{auctionCaptainPosition && (
							<div className={classes.captainHint}>
								포지션: {POSITION_LABELS[auctionCaptainPosition]} (후보 풀 등록 기준)
							</div>
						)}
						<div className={classes.sectionLabel}>경매 예산</div>
						<TextField
							className={classes.field}
							label="예산"
							type="number"
							value={auctionBudget}
							onChange={(e) => setAuctionBudget(e.target.value)}
							variant="outlined"
							fullWidth
							inputProps={{ min: 1 }}
							helperText="이 팀장이 경매에서 사용할 총 예산 (팀장마다 다르게 줄 수 있음)"
						/>
					</>
				) : (
					<>
						<div className={classes.captainHint}>★ 표시 라디오로 팀장을 지정하세요</div>
						<div className={classes.sectionLabel}>팀원</div>
					</>
				)}
				{!isAuctionCreate && members.map((slot, idx) => {
					const selectedMember = slot.puuid ? memberMap.get(slot.puuid) : null;
					return (
						<div key={slot.position} className={classes.memberRow}>
							<Radio
								className={classes.captainRadio}
								checked={captainPuuid != null && captainPuuid === slot.puuid}
								disabled={!slot.puuid}
								onChange={() => slot.puuid && setCaptainPuuid(slot.puuid)}
							/>
							{renderPositionCell(slot.position)}
							<Autocomplete
								className={classes.memberAutocomplete}
								options={availableMembers}
								value={selectedMember || null}
								getOptionLabel={(o) => (o && o.name) || ''}
								isOptionEqualToValue={(o, v) => o.puuid === v.puuid}
								onChange={(_, value) => handleMemberChange(idx, value)}
								renderOption={(props, option) => {
									const { key, ...rest } = props;
									return (
										<li key={key} {...rest} className={classes.memberOption}>
											{option.profileIconId && (
												<img
													src={getProfileIconUrl(option.profileIconId)}
													alt=""
													className={classes.optionAvatar}
												/>
											)}
											<span className={classes.optionName}>{option.name}</span>
										</li>
									);
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										variant="outlined"
										label={POSITION_LABELS[slot.position]}
									/>
								)}
							/>
						</div>
					);
				})}
				{error && <div className={classes.errorText}>{error}</div>}
			</DialogContent>
			<DialogActions className={dialogClasses.actionsPad}>
				<Button className={dialogClasses.cancelBtn} onClick={onClose} disabled={loading}>
					취소
				</Button>
				<Button className={dialogClasses.saveBtn} onClick={handleSubmit} disabled={loading}>
					{loading ? '저장 중...' : isEdit ? '수정' : '등록'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default TeamFormDialog;
