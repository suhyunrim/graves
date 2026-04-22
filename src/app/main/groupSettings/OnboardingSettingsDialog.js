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
	FormControlLabel,
	Tabs,
	Tab
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useDispatch, useSelector } from 'react-redux';
import SaveButton from '../components/SaveButton';
import useSaveAction from '../components/useSaveAction';
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

const ONBOARDING_MESSAGE_KEYS = [
	{
		key: 'welcome',
		label: '1. 환영',
		title: '🎮 {서버명}에 오신 것을 환영합니다!',
		description: '내전 참가를 위해 간단한 등록을 진행합니다.\n먼저 **주 포지션**을 선택해주세요.'
	},
	{
		key: 'tierCategory',
		label: '2. 티어 카테고리',
		title: '🎮 티어를 선택해주세요',
		description: '포지션: {포지션이모지} **{포지션}**\n\n자신의 티어를 선택해주세요.'
	},
	{
		key: 'tierStep',
		label: '3. 티어 세부',
		title: '{티어이모지} {티어} · 단계를 선택해주세요',
		description: '포지션: {포지션이모지} **{포지션}**\n티어: {티어이모지} **{티어}**'
	},
	{
		key: 'nameInput',
		label: '4. 닉네임 입력',
		title: '🎮 거의 다 됐어요!',
		description: '포지션: {포지션이모지} **{포지션}**\n티어: {티어이모지} **{티어}**\n\n아래 버튼을 눌러 롤 닉네임을 입력해주세요.'
	},
	{
		key: 'complete',
		label: '5. 완료',
		title: '✅ 등록 완료!',
		description: '{등록결과메시지}\n\n포지션: {포지션이모지} **{포지션}**\n티어: {티어이모지} **{티어}**\n\n내전에서 만나요! 🎮'
	}
];

const PREVIEW_SAMPLE = {
	positionKey: 'TOP',
	positionLabel: 'TOP',
	tierKey: 'GOLD',
	tierLabel: 'GOLD II',
	resultMsg: '새 계정이 등록되었습니다.'
};

const TOKEN_RE = /(\{서버명\}|\{포지션이모지\}|\{포지션\}|\{티어이모지\}|\{티어\}|\{등록결과메시지\}|\*\*[^*]+\*\*)/g;

function renderPreview(text, serverName, iconClass) {
	const parts = text.split(TOKEN_RE).filter(Boolean);
	return parts.map((part, idx) => {
		switch (part) {
			case '{서버명}':
				return <React.Fragment key={idx}>{serverName || '우리 서버'}</React.Fragment>;
			case '{포지션이모지}':
				return (
					<img
						key={idx}
						className={iconClass}
						src={getPositionIconUrl(PREVIEW_SAMPLE.positionKey)}
						alt=""
					/>
				);
			case '{포지션}':
				return <React.Fragment key={idx}>{PREVIEW_SAMPLE.positionLabel}</React.Fragment>;
			case '{티어이모지}':
				return (
					<img
						key={idx}
						className={iconClass}
						src={getTierIconUrl(PREVIEW_SAMPLE.tierKey)}
						alt=""
					/>
				);
			case '{티어}':
				return <React.Fragment key={idx}>{PREVIEW_SAMPLE.tierLabel}</React.Fragment>;
			case '{등록결과메시지}':
				return <React.Fragment key={idx}>{PREVIEW_SAMPLE.resultMsg}</React.Fragment>;
			default:
				if (part.startsWith('**') && part.endsWith('**')) {
					return <strong key={idx}>{part.slice(2, -2)}</strong>;
				}
				return <React.Fragment key={idx}>{part}</React.Fragment>;
		}
	});
}

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
		borderRadius: 16,
		border: '1px solid rgba(0, 212, 255, 0.3)',
		minWidth: 520,
		maxHeight: '80vh',
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 16
		}
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.8rem',
		letterSpacing: '0.05em',
		color: '#fff'
	},
	sectionTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.5rem',
		color: 'rgba(0, 212, 255, 0.9)',
		letterSpacing: '0.05em',
		marginTop: 20,
		marginBottom: 12,
		paddingBottom: 10,
		borderBottom: '1px solid rgba(0, 212, 255, 0.15)',
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
	},
	messageTabs: {
		minHeight: 40,
		marginBottom: 12,
		borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
		'& .MuiTabs-indicator': {
			backgroundColor: '#00d4ff',
			height: 2
		},
		'& .MuiTab-root': {
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '0.92rem',
			fontWeight: 500,
			color: 'rgba(255, 255, 255, 0.5)',
			textTransform: 'none',
			minHeight: 40,
			minWidth: 0,
			padding: '6px 14px'
		},
		'& .MuiTab-root.Mui-selected': {
			color: '#00d4ff',
			fontWeight: 700
		},
		'& .MuiTabScrollButton-root': {
			color: 'rgba(255, 255, 255, 0.5)',
			width: 28
		},
		'& .MuiTabScrollButton-root.Mui-disabled': {
			opacity: 0.25
		}
	},
	messageBlock: {
		marginBottom: 4
	},
	previewInlineIcon: {
		width: 18,
		height: 18,
		verticalAlign: 'middle',
		marginRight: 2,
		objectFit: 'contain',
		display: 'inline-block'
	},
	previewBox: {
		background: 'rgba(47, 49, 54, 0.55)',
		borderLeft: '4px solid rgba(0, 212, 255, 0.45)',
		borderRadius: 4,
		padding: '10px 14px'
	},
	previewTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.9rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 6
	},
	previewDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(255, 255, 255, 0.72)',
		whiteSpace: 'pre-line',
		lineHeight: 1.55
	},
	previewHint: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.82rem',
		color: 'rgba(0, 212, 255, 0.6)',
		textAlign: 'center',
		margin: '4px 0'
	},
	messageField: {
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1rem',
			lineHeight: 1.5
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
	const [messages, setMessages] = useState({
		welcome: '',
		tierCategory: '',
		tierStep: '',
		nameInput: '',
		complete: ''
	});
	const [activeMessageTab, setActiveMessageTab] = useState(0);
	const [rolesLoading, setRolesLoading] = useState(true);
	const [rolesError, setRolesError] = useState('');
	const [saveState, runSave, isPending] = useSaveAction(async (settings) => {
		await dispatch(Actions.updateGroupSettings(groupId, settings));
	});

	useEffect(() => {
		if (saveState.success) {
			onClose('온보딩 설정이 저장되었습니다.');
		}
	}, [saveState.nonce, saveState.success, onClose]);

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
			const savedMessages = info.settings.onboardingMessages || {};
			setMessages({
				welcome: savedMessages.welcome || '',
				tierCategory: savedMessages.tierCategory || '',
				tierStep: savedMessages.tierStep || '',
				nameInput: savedMessages.nameInput || '',
				complete: savedMessages.complete || ''
			});
			setActiveMessageTab(0);
		}
	}, [open, info]);

	function handleSave() {
		const trimmedMessages = {};
		ONBOARDING_MESSAGE_KEYS.forEach(({ key }) => {
			trimmedMessages[key] = (messages[key] || '').trim();
		});
		runSave({
			onboardingRoleId: roleId,
			onboardingPositionRoles: positionRoles,
			onboardingTierRoles: tierRoles,
			onboardingVerifyMethod: verifyMethod,
			onboardingMessages: trimmedMessages
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

						{/* 추가 안내 문구 */}
						<div className={classes.sectionTitle}>추가 안내 문구</div>
						<div className={classes.sectionDesc}>
							각 온보딩 DM 화면의 기본 안내 아래에 덧붙일 문구를 입력하세요. 비워두면 기본 문구만 표시됩니다.
						</div>
						<Tabs
							className={classes.messageTabs}
							value={activeMessageTab}
							onChange={(_, v) => setActiveMessageTab(v)}
							variant="scrollable"
							scrollButtons="auto"
							allowScrollButtonsMobile
						>
							{ONBOARDING_MESSAGE_KEYS.map(spec => (
								<Tab key={spec.key} label={spec.label} />
							))}
						</Tabs>
						{(() => {
							const spec = ONBOARDING_MESSAGE_KEYS[activeMessageTab];
							return (
								<div className={classes.messageBlock}>
									<div className={classes.previewBox}>
										<div className={classes.previewTitle}>
											{renderPreview(spec.title, info?.name, classes.previewInlineIcon)}
										</div>
										<div className={classes.previewDesc}>
											{renderPreview(spec.description, info?.name, classes.previewInlineIcon)}
										</div>
									</div>
									<div className={classes.previewHint}>↓ 이 아래에 추가됩니다</div>
									<TextField
										className={classes.messageField}
										value={messages[spec.key]}
										onChange={e => setMessages(prev => ({ ...prev, [spec.key]: e.target.value }))}
										variant="outlined"
										fullWidth
										multiline
										rows={2}
										size="small"
										placeholder="(선택) 이 문구 아래에 덧붙일 안내 메시지"
									/>
								</div>
							);
						})()}
					</>
				)}
			</DialogContent>
			{saveState.error && (
				<div style={{ padding: '0 24px 8px', color: '#ff6b6b', fontFamily: '"Noto Sans KR", sans-serif', fontSize: '1.05rem', textAlign: 'right' }}>
					{saveState.error}
				</div>
			)}
			<DialogActions>
				<Button className={classes.cancelBtn} onClick={() => onClose()}>
					취소
				</Button>
				<SaveButton
					className={classes.submitBtn}
					onClick={handleSave}
					isPending={isPending}
					disabled={rolesLoading || Boolean(rolesError)}
				/>
			</DialogActions>
		</Dialog>
	);
}

export default OnboardingSettingsDialog;
