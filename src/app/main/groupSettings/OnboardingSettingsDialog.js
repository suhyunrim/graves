import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	MenuItem,
	CircularProgress,
	Radio,
	RadioGroup,
	FormControlLabel
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from './store/actions';

const POSITIONS = [
	{ key: 'TOP', label: '탑' },
	{ key: 'JUNGLE', label: '정글' },
	{ key: 'MIDDLE', label: '미드' },
	{ key: 'BOTTOM', label: '원딜' },
	{ key: 'UTILITY', label: '서포터' }
];

const TIERS = [
	{ key: 'IRON', label: '아이언' },
	{ key: 'BRONZE', label: '브론즈' },
	{ key: 'SILVER', label: '실버' },
	{ key: 'GOLD', label: '골드' },
	{ key: 'PLATINUM', label: '플래티넘' },
	{ key: 'EMERALD', label: '에메랄드' },
	{ key: 'DIAMOND', label: '다이아몬드' },
	{ key: 'MASTER', label: '마스터' },
	{ key: 'GRANDMASTER', label: '그랜드마스터' },
	{ key: 'CHALLENGER', label: '챌린저' }
];

const NONE_VALUE = '__none__';

function getPositionIconUrl(positionKey) {
	const nameMap = {
		TOP: 'top',
		JUNGLE: 'jungle',
		MIDDLE: 'middle',
		BOTTOM: 'bottom',
		UTILITY: 'utility'
	};
	return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-${nameMap[positionKey]}.png`;
}

function getTierIconUrl(tierKey) {
	return `/assets/images/ranked-emblems/Emblem_${tierKey}.webp`;
}

const useStyles = makeStyles()((theme) => ({
	paper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		color: '#fff',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.3)',
		minWidth: 520,
		maxHeight: '80vh',
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 16,
			borderRadius: 16
		}
	},
	title: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.8rem',
		borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
		color: '#fff'
	},
	sectionTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.3rem',
		color: 'rgba(0, 212, 255, 0.9)',
		marginTop: 20,
		marginBottom: 12,
		'&:first-child': {
			marginTop: 8
		}
	},
	sectionDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginBottom: 12,
		lineHeight: 1.5
	},
	roleRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		marginBottom: 12,
		[theme.breakpoints.down('sm')]: {
			gap: 8
		}
	},
	selectorField: {
		flex: 1,
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.15rem'
		},
		'& .MuiSelect-root': {
			display: 'flex',
			alignItems: 'center'
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
	field: {
		marginBottom: 12,
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.15rem'
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
	menuItemIcon: {
		width: 20,
		height: 20,
		marginRight: 8,
		verticalAlign: 'middle',
		objectFit: 'contain'
	},
	tierIcon: {
		width: 24,
		height: 24,
		marginRight: 8,
		verticalAlign: 'middle',
		objectFit: 'contain'
	},
	roleColor: {
		display: 'inline-block',
		width: 12,
		height: 12,
		borderRadius: '50%',
		marginRight: 8,
		verticalAlign: 'middle'
	},
	radioGroup: {
		flexDirection: 'row',
		gap: 8
	},
	radioLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.85)',
		'& .MuiRadio-root': {
			color: 'rgba(255, 255, 255, 0.4)'
		},
		'& .MuiRadio-colorSecondary.Mui-checked': {
			color: '#00d4ff'
		}
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
	loadingWrap: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: 200
	},
	errorText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: '#ff6b6b',
		textAlign: 'center',
		padding: '40px 0'
	},
	menuItem: {
		fontFamily: '"Noto Sans KR", sans-serif',
		display: 'flex',
		alignItems: 'center'
	}
}));

function OnboardingSettingsDialog({ open, onClose, groupId }) {
	const { classes } = useStyles();
	const dispatch = useDispatch();
	const { info, discordRoles } = useSelector(({ GroupSettings }) => GroupSettings.groupInfo);

	const [roleId, setRoleId] = useState(null);
	const [selectedPosition, setSelectedPosition] = useState('TOP');
	const [positionRoles, setPositionRoles] = useState({});
	const [selectedTier, setSelectedTier] = useState('IRON');
	const [tierRoles, setTierRoles] = useState({});
	const [verifyMethod, setVerifyMethod] = useState('nickname');
	const [rolesLoading, setRolesLoading] = useState(true);
	const [rolesError, setRolesError] = useState('');
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (open && groupId) {
			setRolesLoading(true);
			setRolesError('');
			dispatch(Actions.getDiscordRoles(groupId))
				.then(() => setRolesLoading(false))
				.catch(err => {
					setRolesLoading(false);
					const msg = err.response?.data?.result || 'Discord 역할을 불러올 수 없습니다.';
					setRolesError(msg);
				});
		}
	}, [open, groupId, dispatch]);

	useEffect(() => {
		if (open && info?.settings) {
			setRoleId(info.settings.onboardingRoleId || null);
			setVerifyMethod(info.settings.onboardingVerifyMethod || 'nickname');
			const savedPos = info.settings.onboardingPositionRoles || {};
			const pr = {};
			POSITIONS.forEach(p => {
				pr[p.key] = savedPos[p.key] || null;
			});
			setPositionRoles(pr);
			const savedTier = info.settings.onboardingTierRoles || {};
			const tr = {};
			TIERS.forEach(t => {
				tr[t.key] = savedTier[t.key] || null;
			});
			setTierRoles(tr);
			setSelectedPosition('TOP');
			setSelectedTier('IRON');
		}
	}, [open, info]);

	function handleSave() {
		setSaving(true);
		const settings = {
			onboardingRoleId: roleId,
			onboardingPositionRoles: positionRoles,
			onboardingTierRoles: tierRoles,
			onboardingVerifyMethod: verifyMethod
		};
		dispatch(Actions.updateGroupSettings(groupId, settings))
			.then(() => {
				setSaving(false);
				onClose('온보딩 설정이 저장되었습니다.');
			})
			.catch(() => {
				setSaving(false);
			});
	}

	function renderRoleDropdown(value, onChange) {
		return (
			<TextField
				className={classes.selectorField}
				value={value || NONE_VALUE}
				onChange={e => onChange(e.target.value === NONE_VALUE ? null : e.target.value)}
				variant="outlined"
				fullWidth
				select
				size="small"
				label="역할"
			>
				<MenuItem value={NONE_VALUE} className={classes.menuItem}>
					없음
				</MenuItem>
				{discordRoles.map(role => (
					<MenuItem key={role.id} value={role.id} className={classes.menuItem}>
						<span className={classes.roleColor} style={{ backgroundColor: role.color || '#99aab5' }} />
						{role.name}
					</MenuItem>
				))}
			</TextField>
		);
	}

	return (
		<Dialog open={open} onClose={() => onClose()} PaperProps={{ className: classes.paper }}>
			<DialogTitle className={classes.title}>온보딩 설정</DialogTitle>
			<DialogContent>
				{rolesLoading && (
					<div className={classes.loadingWrap}>
						<CircularProgress style={{ color: '#00d4ff' }} />
					</div>
				)}
				{rolesError && <div className={classes.errorText}>{rolesError}</div>}
				{!rolesLoading && !rolesError && (
					<>
						{/* 계정 인증 방식 */}
						<div className={classes.sectionTitle}>계정 인증 방식</div>
						<RadioGroup
							className={classes.radioGroup}
							value={verifyMethod}
							onChange={e => setVerifyMethod(e.target.value)}
						>
							<FormControlLabel
								value="nickname"
								control={<Radio />}
								label="닉네임 입력"
								className={classes.radioLabel}
							/>
							<FormControlLabel
								value="riot"
								control={<Radio />}
								label="라이엇 계정 연동"
								className={classes.radioLabel}
							/>
						</RadioGroup>

						{/* 기본 인증 역할 */}
						<div className={classes.sectionTitle}>기본 인증 역할</div>
						{renderRoleDropdown(roleId, setRoleId)}

						{/* 포지션별 역할 */}
						<div className={classes.sectionTitle}>포지션별 역할</div>
						<div className={classes.roleRow}>
							<TextField
								className={classes.selectorField}
								value={selectedPosition}
								onChange={e => setSelectedPosition(e.target.value)}
								variant="outlined"
								fullWidth
								select
								size="small"
								label="포지션"
							>
								{POSITIONS.map(p => (
									<MenuItem key={p.key} value={p.key} className={classes.menuItem}>
										<img className={classes.menuItemIcon} src={getPositionIconUrl(p.key)} alt={p.label} />
										{p.label}
									</MenuItem>
								))}
							</TextField>
							{renderRoleDropdown(positionRoles[selectedPosition], v =>
								setPositionRoles(prev => ({ ...prev, [selectedPosition]: v }))
							)}
						</div>

						{/* 티어별 역할 */}
						<div className={classes.sectionTitle}>티어별 역할</div>
						<div className={classes.roleRow}>
							<TextField
								className={classes.selectorField}
								value={selectedTier}
								onChange={e => setSelectedTier(e.target.value)}
								variant="outlined"
								fullWidth
								select
								size="small"
								label="티어"
							>
								{TIERS.map(t => (
									<MenuItem key={t.key} value={t.key} className={classes.menuItem}>
										<img className={classes.tierIcon} src={getTierIconUrl(t.key)} alt={t.label} />
										{t.label}
									</MenuItem>
								))}
							</TextField>
							{renderRoleDropdown(tierRoles[selectedTier], v => setTierRoles(prev => ({ ...prev, [selectedTier]: v })))}
						</div>
					</>
				)}
			</DialogContent>
			<DialogActions>
				<Button className={classes.cancelBtn} onClick={() => onClose()}>
					취소
				</Button>
				<Button
					className={classes.submitBtn}
					onClick={handleSave}
					disabled={saving || rolesLoading || Boolean(rolesError)}
				>
					{saving ? '저장 중...' : '저장'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default OnboardingSettingsDialog;
