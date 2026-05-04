import React, { useState, useMemo } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Autocomplete,
	Radio,
	MenuItem
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { getProfileIconUrl } from 'app/main/challenge/ddragonUtils';
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';
import { POSITIONS, POSITION_LABELS } from './tournamentUtils';

const useStyles = makeStyles()((theme) => ({
	paperWidth: {
		minWidth: 560,
		maxWidth: 640,
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
		},
		'& .MuiSelect-icon': {
			color: 'rgba(255, 255, 255, 0.5)'
		}
	},
	memberRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginBottom: 12,
		[theme.breakpoints.down('sm')]: {
			flexWrap: 'wrap'
		}
	},
	captainRadio: {
		color: 'rgba(255, 255, 255, 0.4)',
		padding: 6,
		'&.Mui-checked': {
			color: '#ffd700'
		}
	},
	memberAutocomplete: {
		flex: 1,
		minWidth: 200,
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
	positionSelect: {
		minWidth: 110,
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

function TeamFormDialog({ open, onClose, onSuccess, tournamentId, team, allTeams, activeMembers }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();
	const isEdit = Boolean(team);

	const [name, setName] = useState(team ? team.name : '');
	const [members, setMembers] = useState(() => {
		if (!team) return makeEmptySlots();
		// 기존 팀 멤버를 포지션 순서대로 정렬해서 채움
		const slots = makeEmptySlots();
		(team.members || []).forEach(m => {
			const idx = POSITIONS.indexOf(m.position);
			if (idx >= 0 && !slots[idx].puuid) {
				slots[idx] = { puuid: m.puuid, position: m.position };
			}
		});
		// 포지션이 매핑 안된 멤버는 빈 슬롯에 배치
		(team.members || []).forEach(m => {
			if (POSITIONS.indexOf(m.position) < 0 || slots.some(s => s.puuid === m.puuid)) return;
			const empty = slots.findIndex(s => !s.puuid);
			if (empty >= 0) slots[empty] = { puuid: m.puuid, position: m.position };
		});
		return slots;
	});
	const [captainPuuid, setCaptainPuuid] = useState(team ? team.captainPuuid : null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	// 다른 팀에 등록된 puuid 집합 (현재 편집중인 팀은 제외)
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

	function handleMemberChange(idx, member) {
		setMembers(prev => {
			const next = prev.slice();
			next[idx] = { puuid: member ? member.puuid : null, position: next[idx].position };
			// 같은 puuid가 다른 슬롯에 있으면 비움
			if (member) {
				next.forEach((s, i) => {
					if (i !== idx && s.puuid === member.puuid) {
						next[i] = { puuid: null, position: s.position };
					}
				});
			}
			return next;
		});
		// 팀장이 빠지면 해제
		if (captainPuuid && (!member || member.puuid !== captainPuuid)) {
			const stillIn = members.some((s, i) => i !== idx && s.puuid === captainPuuid);
			const becomingCaptain = member && member.puuid === captainPuuid;
			if (!stillIn && !becomingCaptain) setCaptainPuuid(null);
		}
	}

	function handlePositionChange(idx, value) {
		setMembers(prev => {
			const next = prev.slice();
			next[idx] = { ...next[idx], position: value };
			return next;
		});
	}

	function validate() {
		if (!name.trim()) return '팀명을 입력하세요.';
		const filled = members.filter(m => m.puuid);
		if (filled.length !== 5) return '팀원 5명을 모두 선택하세요.';
		const puuidSet = new Set(filled.map(m => m.puuid));
		if (puuidSet.size !== 5) return '팀원이 중복됩니다.';
		if (!captainPuuid || !puuidSet.has(captainPuuid)) return '팀장을 선택하세요.';
		// 모든 puuid가 활성 멤버에 있는지 (드롭다운에서만 골랐으면 자동 통과)
		for (const m of filled) {
			if (!memberMap.has(m.puuid)) return '그룹에 등록되지 않은 유저가 포함되어 있습니다.';
		}
		// 다른 팀에 이미 등록된 puuid 검사
		for (const m of filled) {
			if (otherTeamPuuids.has(m.puuid)) {
				const u = memberMap.get(m.puuid);
				return `${u ? u.name : m.puuid} 님은 이미 다른 팀에 있습니다.`;
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

		const body = {
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

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>{isEdit ? '팀 수정' : '팀 등록'}</DialogTitle>
			<div className={dialogClasses.subtitle}>팀원 5명 + 팀장 지정</div>
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
				<div className={classes.captainHint}>★ 표시 라디오로 팀장을 지정하세요</div>
				<div className={classes.sectionLabel}>팀원</div>
				{members.map((slot, idx) => {
					const selectedMember = slot.puuid ? memberMap.get(slot.puuid) : null;
					return (
						<div key={idx} className={classes.memberRow}>
							<Radio
								className={classes.captainRadio}
								checked={captainPuuid != null && captainPuuid === slot.puuid}
								disabled={!slot.puuid}
								onChange={() => slot.puuid && setCaptainPuuid(slot.puuid)}
							/>
							<Autocomplete
								className={classes.memberAutocomplete}
								options={activeMembers || []}
								value={selectedMember || null}
								getOptionLabel={(o) => (o && o.name) || ''}
								isOptionEqualToValue={(o, v) => o.puuid === v.puuid}
								getOptionDisabled={(o) => {
									if (otherTeamPuuids.has(o.puuid)) return true;
									// 같은 팀에서 다른 슬롯에 이미 선택된 멤버 — disable 안하고
									// 선택 시 자동으로 해당 슬롯을 비우는 방식으로 처리
									return false;
								}}
								onChange={(_, value) => handleMemberChange(idx, value)}
								renderOption={(props, option) => {
									// MUI v9: key는 props에서 분리해서 직접 전달해야 함
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
										label={`멤버 ${idx + 1}`}
									/>
								)}
							/>
							<TextField
								className={classes.positionSelect}
								label="포지션"
								value={slot.position}
								onChange={e => handlePositionChange(idx, e.target.value)}
								variant="outlined"
								select
								size="small"
							>
								{POSITIONS.map(p => (
									<MenuItem key={p} value={p}>{POSITION_LABELS[p]}</MenuItem>
								))}
							</TextField>
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
