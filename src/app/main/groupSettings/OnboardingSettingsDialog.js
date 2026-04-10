import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	MenuItem,
	CircularProgress
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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

const useStyles = makeStyles(theme => ({
	paper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		color: '#fff',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.3)',
		minWidth: 480,
		maxHeight: '80vh',
		[theme.breakpoints.down('xs')]: {
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
	roleColor: {
		display: 'inline-block',
		width: 12,
		height: 12,
		borderRadius: '50%',
		marginRight: 8,
		verticalAlign: 'middle'
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
		fontFamily: '"Noto Sans KR", sans-serif'
	}
}));

function buildInitialPositionRoles(settings) {
	const saved = settings?.onboardingPositionRoles || {};
	const result = {};
	POSITIONS.forEach(p => {
		result[p.key] = saved[p.key] || null;
	});
	return result;
}

function buildInitialTierRoles(settings) {
	const saved = settings?.onboardingTierRoles || {};
	const result = {};
	TIERS.forEach(t => {
		result[t.key] = saved[t.key] || null;
	});
	return result;
}

function OnboardingSettingsDialog({ open, onClose, groupId }) {
	const classes = useStyles();
	const dispatch = useDispatch();
	const { info, discordRoles } = useSelector(({ GroupSettings }) => GroupSettings.groupInfo);

	const [roleId, setRoleId] = useState(info?.settings?.onboardingRoleId || null);
	const [positionRoles, setPositionRoles] = useState(() => buildInitialPositionRoles(info?.settings));
	const [tierRoles, setTierRoles] = useState(() => buildInitialTierRoles(info?.settings));
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
			setPositionRoles(buildInitialPositionRoles(info.settings));
			setTierRoles(buildInitialTierRoles(info.settings));
		}
	}, [open, info]);

	function handlePositionChange(key, value) {
		setPositionRoles(prev => ({ ...prev, [key]: value === NONE_VALUE ? null : value }));
	}

	function handleTierChange(key, value) {
		setTierRoles(prev => ({ ...prev, [key]: value === NONE_VALUE ? null : value }));
	}

	function handleSave() {
		setSaving(true);
		const settings = {
			onboardingRoleId: roleId,
			onboardingPositionRoles: positionRoles,
			onboardingTierRoles: tierRoles
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

	function renderRoleSelect(label, value, onChange) {
		return (
			<TextField
				className={classes.field}
				label={label}
				value={value || NONE_VALUE}
				onChange={e => onChange(e.target.value === NONE_VALUE ? null : e.target.value)}
				variant="outlined"
				fullWidth
				select
				size="small"
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
						<div className={classes.sectionTitle}>기본 인증 역할</div>
						{renderRoleSelect('온보딩 완료 시 부여할 역할', roleId, setRoleId)}

						<div className={classes.sectionTitle}>포지션별 역할</div>
						{POSITIONS.map(p => renderRoleSelect(p.label, positionRoles[p.key], v => handlePositionChange(p.key, v)))}

						<div className={classes.sectionTitle}>티어별 역할</div>
						{TIERS.map(t => renderRoleSelect(t.label, tierRoles[t.key], v => handleTierChange(t.key, v)))}
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
