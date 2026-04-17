import React, { useEffect, useState, useTransition, useOptimistic } from 'react';
import {
	TextField,
	Switch,
	Snackbar,
	IconButton,
	Button,
	ToggleButton,
	ToggleButtonGroup,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { DatePicker } from '@mui/x-date-pickers';
import { format as dfFormat, parse as dfParse, startOfMonth } from 'date-fns';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import { useDispatch, useSelector } from 'react-redux';
import { SettingsSkeleton } from '../components/SkeletonLoaders';
import * as Actions from './store/actions';
import OnboardingSettingsDialog from './OnboardingSettingsDialog';

const VOTE_MODE_LABELS = {
	off: '사용 안 함',
	normal: '일반 투표',
	blind: '블라인드 투표'
};

const VOTE_MODE_DESCRIPTIONS = {
	off: '매칭 생성 시 플랜을 바로 선택합니다.',
	normal: '참가자 투표로 플랜을 결정합니다. 투표 현황이 실시간 공개됩니다.',
	blind: '참가자 투표로 플랜을 결정합니다. 투표 현황은 확정 후 공개됩니다.'
};

const useStyles = makeStyles()((theme) => ({
	root: {
		padding: '24px 28px',
		maxWidth: 720,
		[theme.breakpoints.down('md')]: {
			padding: '16px 12px'
		}
	},
	noAdmin: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: 300,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	section: {
		borderRadius: 16,
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.06)',
		padding: '24px 28px',
		marginBottom: 20,
		[theme.breakpoints.down('md')]: {
			padding: '18px 16px'
		}
	},
	sectionTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.5rem',
		color: 'rgba(0, 212, 255, 0.9)',
		letterSpacing: '0.05em',
		marginBottom: 20,
		paddingBottom: 10,
		borderBottom: '1px solid rgba(0, 212, 255, 0.15)'
	},
	guildRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		marginBottom: 24,
		[theme.breakpoints.down('md')]: {
			gap: 12
		}
	},
	guildIcon: {
		width: 56,
		height: 56,
		borderRadius: '50%',
		border: '2px solid rgba(0, 212, 255, 0.3)',
		[theme.breakpoints.down('md')]: {
			width: 44,
			height: 44
		}
	},
	guildName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		[theme.breakpoints.down('md')]: {
			fontSize: '1.35rem'
		}
	},
	infoRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '12px 0',
		borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
		'&:last-child': {
			borderBottom: 'none'
		}
	},
	infoLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	infoValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.85)'
	},
	nameEditRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	nameText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: '#fff'
	},
	editBtn: {
		color: 'rgba(255, 255, 255, 0.4)',
		padding: 6,
		'&:hover': {
			color: '#00d4ff'
		}
	},
	nameInput: {
		'& .MuiInputBase-root': {
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.25rem',
			color: '#fff',
			background: 'rgba(255, 255, 255, 0.05)',
			borderRadius: 8
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.4)'
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.6)'
		}
	},
	confirmBtn: {
		color: '#00ff7f',
		padding: 6
	},
	cancelBtn: {
		color: '#ff6b6b',
		padding: 6
	},
	statsGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(4, 1fr)',
		gap: 12,
		marginBottom: 16,
		[theme.breakpoints.down('md')]: {
			gridTemplateColumns: 'repeat(2, 1fr)',
			gap: 8
		}
	},
	statCard: {
		borderRadius: 12,
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.06)',
		padding: '14px 16px',
		textAlign: 'center'
	},
	statValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '2rem',
		fontWeight: 700,
		color: '#fff',
		lineHeight: 1.2
	},
	statLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginTop: 2
	},
	settingRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '14px 0',
		borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
		'&:last-child': {
			borderBottom: 'none'
		}
	},
	settingInfo: {
		flex: 1,
		marginRight: 16
	},
	settingLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.85)'
	},
	settingDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginTop: 4,
		lineHeight: 1.5
	},
	settingRight: {
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	settingBtn: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		fontWeight: 600,
		color: '#00d4ff',
		borderColor: 'rgba(0, 212, 255, 0.4)',
		borderRadius: 8,
		padding: '4px 12px',
		textTransform: 'none',
		minWidth: 'auto',
		'&:hover': {
			borderColor: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.08)'
		},
		'&.Mui-disabled': {
			color: 'rgba(255, 255, 255, 0.2)',
			borderColor: 'rgba(255, 255, 255, 0.08)'
		}
	},
	switch: {
		'& .MuiSwitch-switchBase.Mui-checked': {
			color: '#00d4ff'
		},
		'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
			backgroundColor: '#00d4ff'
		}
	},
	voteModeRow: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
		padding: '14px 0',
		borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
	},
	voteModeGroup: {
		alignSelf: 'flex-start',
		background: 'rgba(255, 255, 255, 0.03)',
		borderRadius: 10,
		'& .MuiToggleButtonGroup-grouped': {
			border: '1px solid rgba(255, 255, 255, 0.1)',
			color: 'rgba(255, 255, 255, 0.6)',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.1rem',
			fontWeight: 600,
			padding: '6px 14px',
			textTransform: 'none',
			'&.Mui-selected': {
				color: '#00d4ff',
				background: 'rgba(0, 212, 255, 0.12)',
				borderColor: 'rgba(0, 212, 255, 0.4)',
				'&:hover': {
					background: 'rgba(0, 212, 255, 0.18)'
				}
			},
			'&:hover': {
				background: 'rgba(255, 255, 255, 0.05)'
			},
			'&.Mui-disabled': {
				color: 'rgba(255, 255, 255, 0.2)'
			}
		},
		[theme.breakpoints.down('md')]: {
			alignSelf: 'stretch',
			'& .MuiToggleButtonGroup-grouped': {
				flex: 1,
				fontSize: '1rem',
				padding: '6px 8px'
			}
		}
	},
	seasonControls: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		flexWrap: 'wrap',
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Rajdhani", sans-serif',
			fontSize: '1.2rem',
			background: 'rgba(255, 255, 255, 0.04)',
			borderRadius: 8
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.3)'
		},
		'& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.5)'
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: '#00d4ff'
		},
		'& .MuiIconButton-root': {
			color: 'rgba(255, 255, 255, 0.5)'
		}
	},
	seasonBtn: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		fontWeight: 600,
		textTransform: 'none',
		minWidth: 'auto',
		padding: '4px 12px',
		borderRadius: 8
	},
	seasonClearBtn: {
		color: 'rgba(255, 255, 255, 0.5)',
		borderColor: 'rgba(255, 255, 255, 0.2)',
		'&:hover': {
			color: '#fff',
			borderColor: 'rgba(255, 255, 255, 0.4)',
			background: 'rgba(255, 255, 255, 0.05)'
		}
	},
	seasonResetBtn: {
		color: '#ff6b6b',
		borderColor: 'rgba(255, 107, 107, 0.4)',
		'&:hover': {
			borderColor: '#ff6b6b',
			background: 'rgba(255, 107, 107, 0.08)'
		}
	},
	confirmDialogPaper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		color: '#fff',
		borderRadius: 16,
		border: '1px solid rgba(255, 107, 107, 0.3)',
		minWidth: 360
	},
	confirmDialogTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		color: '#ff6b6b'
	},
	confirmDialogText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.75)',
		lineHeight: 1.6
	},
	snackbar: {
		'& .MuiSnackbarContent-root': {
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.15rem',
			background: '#1a1a2e',
			border: '1px solid rgba(0, 212, 255, 0.3)'
		}
	}
}));

function GroupInfoContent() {
	const { classes } = useStyles();
	const dispatch = useDispatch();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const user = useSelector(state => state.auth.user);
	const { info, loading } = useSelector(({ GroupSettings }) => GroupSettings.groupInfo);

	const [editingName, setEditingName] = useState(false);
	const [nameValue, setNameValue] = useState('');
	const [snackMsg, setSnackMsg] = useState('');
	const [onboardingDialogOpen, setOnboardingDialogOpen] = useState(false);
	const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
	const [isSaving, startSaveTransition] = useTransition();
	const [isToggling, startToggleTransition] = useTransition();
	const [isResetting, startResetTransition] = useTransition();
	const [optimisticSettings, applyOptimisticSettings] = useOptimistic(
		info?.settings,
		(current, patch) => ({ ...current, ...patch })
	);

	const groupId = user?.reprGroup?.groupId;
	const isAdmin = user?.reprGroup?.isAdmin;

	useEffect(() => {
		if (groupId && isAdmin) {
			dispatch(Actions.getGroupInfo(groupId));
		}
	}, [dispatch, groupId, isAdmin]);

	if (!isAdmin) {
		return <div className={classes.noAdmin}>관리자 권한이 필요합니다.</div>;
	}

	if (loading || !info) {
		return <SettingsSkeleton />;
	}

	function startEditName() {
		setNameValue(info.groupName);
		setEditingName(true);
	}

	function cancelEditName() {
		setEditingName(false);
	}

	function saveName() {
		if (!nameValue.trim() || nameValue.trim() === info.groupName) {
			setEditingName(false);
			return;
		}
		startSaveTransition(async () => {
			try {
				await dispatch(Actions.updateGroupName(groupId, nameValue.trim()));
				setSnackMsg('방 이름이 변경되었습니다.');
				setEditingName(false);
			} catch {
				setSnackMsg('변경에 실패했습니다.');
			}
		});
	}

	function handleNameKeyDown(e) {
		if (e.key === 'Enter') saveName();
		if (e.key === 'Escape') cancelEditName();
	}

	function handleToggleOnboarding() {
		const next = !optimisticSettings.onboardingEnabled;
		startToggleTransition(async () => {
			applyOptimisticSettings({ onboardingEnabled: next });
			try {
				await dispatch(Actions.updateGroupSettings(groupId, { onboardingEnabled: next }));
				setSnackMsg(next ? '온보딩이 활성화되었습니다.' : '온보딩이 비활성화되었습니다.');
			} catch {
				setSnackMsg('설정 변경에 실패했습니다.');
			}
		});
	}

	function handleOnboardingDialogClose(msg) {
		setOnboardingDialogOpen(false);
		if (msg) setSnackMsg(msg);
	}

	function handleChangeVoteMode(_event, nextMode) {
		if (!nextMode || nextMode === optimisticSettings.matchVoteMode) return;
		startToggleTransition(async () => {
			applyOptimisticSettings({ matchVoteMode: nextMode });
			try {
				await dispatch(Actions.updateGroupSettings(groupId, { matchVoteMode: nextMode }));
				setSnackMsg(`매칭 투표 모드가 '${VOTE_MODE_LABELS[nextMode]}'(으)로 변경되었습니다.`);
			} catch {
				setSnackMsg('설정 변경에 실패했습니다.');
			}
		});
	}

	function handleChangeSeasonEndMonth(date) {
		if (!date || Number.isNaN(date.getTime())) return;
		const next = dfFormat(date, 'yyyy-MM');
		if (next === optimisticSettings.seasonEndMonth) return;
		startToggleTransition(async () => {
			applyOptimisticSettings({ seasonEndMonth: next });
			try {
				await dispatch(Actions.updateGroupSettings(groupId, { seasonEndMonth: next }));
				setSnackMsg(`시즌 자동 종료가 ${next}로 설정되었습니다.`);
			} catch {
				setSnackMsg('설정 변경에 실패했습니다.');
			}
		});
	}

	function handleClearSeasonEndMonth() {
		if (!optimisticSettings.seasonEndMonth) return;
		startToggleTransition(async () => {
			applyOptimisticSettings({ seasonEndMonth: null });
			try {
				await dispatch(Actions.updateGroupSettings(groupId, { seasonEndMonth: null }));
				setSnackMsg('시즌 자동 종료가 해제되었습니다.');
			} catch {
				setSnackMsg('설정 변경에 실패했습니다.');
			}
		});
	}

	function handleConfirmReset() {
		startResetTransition(async () => {
			try {
				await dispatch(Actions.resetSeason(groupId));
				setSnackMsg('시즌이 리셋되었습니다.');
				setResetConfirmOpen(false);
			} catch {
				setSnackMsg('시즌 리셋에 실패했습니다.');
			}
		});
	}

	function formatDate(dateStr) {
		const d = new Date(dateStr);
		return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
	}

	return (
		<div className={classes.root}>
			{/* 방 정보 */}
			<div className={classes.section}>
				<div className={classes.sectionTitle}>방 정보</div>

				<div className={classes.guildRow}>
					{info.discordGuildIcon && <img className={classes.guildIcon} src={info.discordGuildIcon} alt="guild icon" />}
					<span className={classes.guildName}>{info.discordGuildName}</span>
				</div>

				<div className={classes.infoRow}>
					<span className={classes.infoLabel}>방 이름</span>
					{editingName ? (
						<div className={classes.nameEditRow}>
							<TextField
								className={classes.nameInput}
								variant="outlined"
								size="small"
								value={nameValue}
								onChange={e => setNameValue(e.target.value)}
								onKeyDown={handleNameKeyDown}
								autoFocus
								style={{ width: isMobile ? 160 : 220 }}
							/>
							<IconButton className={classes.confirmBtn} onClick={saveName} size="small" disabled={isSaving}>
								<CheckIcon fontSize="small" />
							</IconButton>
							<IconButton className={classes.cancelBtn} onClick={cancelEditName} size="small">
								<CloseIcon fontSize="small" />
							</IconButton>
						</div>
					) : (
						<div className={classes.nameEditRow}>
							<span className={classes.nameText}>{info.groupName}</span>
							<IconButton className={classes.editBtn} onClick={startEditName} size="small">
								<EditIcon fontSize="small" />
							</IconButton>
						</div>
					)}
				</div>

				<div className={classes.infoRow}>
					<span className={classes.infoLabel}>총 매치</span>
					<span className={classes.infoValue}>{info.totalMatches}게임</span>
				</div>

				<div className={classes.infoRow}>
					<span className={classes.infoLabel}>생성일</span>
					<span className={classes.infoValue}>{formatDate(info.createdAt)}</span>
				</div>
			</div>

			{/* 멤버 통계 */}
			<div className={classes.section}>
				<div className={classes.sectionTitle}>멤버 현황</div>
				<div className={classes.statsGrid}>
					<div className={classes.statCard}>
						<div className={classes.statValue}>{info.members.total}</div>
						<div className={classes.statLabel}>전체</div>
					</div>
					<div className={classes.statCard}>
						<div className={classes.statValue} style={{ color: '#00ff7f' }}>
							{info.members.active}
						</div>
						<div className={classes.statLabel}>활성</div>
					</div>
					<div className={classes.statCard}>
						<div className={classes.statValue} style={{ color: '#ff6b6b' }}>
							{info.members.blacklisted}
						</div>
						<div className={classes.statLabel}>블랙리스트</div>
					</div>
					<div className={classes.statCard}>
						<div className={classes.statValue} style={{ color: '#ffa500' }}>
							{info.members.leftGuild}
						</div>
						<div className={classes.statLabel}>서버 탈퇴</div>
					</div>
				</div>
			</div>

			{/* 방 설정 */}
			<div className={classes.section}>
				<div className={classes.sectionTitle}>방 설정</div>
				<div className={classes.voteModeRow}>
					<div className={classes.settingInfo}>
						<div className={classes.settingLabel}>매칭 투표 모드</div>
						<div className={classes.settingDesc}>
							{VOTE_MODE_DESCRIPTIONS[optimisticSettings?.matchVoteMode] || VOTE_MODE_DESCRIPTIONS.off}
						</div>
					</div>
					<ToggleButtonGroup
						className={classes.voteModeGroup}
						value={optimisticSettings?.matchVoteMode || 'off'}
						exclusive
						onChange={handleChangeVoteMode}
						disabled={isToggling}
						size="small"
					>
						<ToggleButton value="off">{VOTE_MODE_LABELS.off}</ToggleButton>
						<ToggleButton value="normal">{VOTE_MODE_LABELS.normal}</ToggleButton>
						<ToggleButton value="blind">{VOTE_MODE_LABELS.blind}</ToggleButton>
					</ToggleButtonGroup>
				</div>
				<div className={classes.voteModeRow}>
					<div className={classes.settingInfo}>
						<div className={classes.settingLabel}>시즌 자동 종료</div>
						<div className={classes.settingDesc}>
							지정한 월의 다음 달 1일 새벽(00:05 KST)에 자동으로 시즌이 리셋됩니다. 리셋 시 모든 유저가
							시즌 동안 쌓은 레이팅이 절반으로 줄어듭니다 (기본 티어 점수는 유지). 리셋 후에는 자동 종료가
							해제되며, 다음 시즌 종료월을 다시 지정해야 합니다.
						</div>
					</div>
					<div className={classes.seasonControls}>
						<DatePicker
							views={['year', 'month']}
							format="yyyy-MM"
							minDate={startOfMonth(new Date())}
							value={
								optimisticSettings?.seasonEndMonth
									? dfParse(optimisticSettings.seasonEndMonth, 'yyyy-MM', new Date())
									: null
							}
							onChange={handleChangeSeasonEndMonth}
							disabled={isToggling}
							slotProps={{
								textField: { size: 'small', placeholder: 'YYYY-MM', variant: 'outlined' }
							}}
						/>
						{optimisticSettings?.seasonEndMonth && (
							<Button
								className={`${classes.seasonBtn} ${classes.seasonClearBtn}`}
								variant="outlined"
								size="small"
								onClick={handleClearSeasonEndMonth}
								disabled={isToggling}
							>
								해제
							</Button>
						)}
						<Button
							className={`${classes.seasonBtn} ${classes.seasonResetBtn}`}
							variant="outlined"
							size="small"
							onClick={() => setResetConfirmOpen(true)}
							disabled={isResetting}
						>
							지금 리셋
						</Button>
					</div>
				</div>
				<div className={classes.settingRow}>
					<div className={classes.settingInfo}>
						<div className={classes.settingLabel}>온보딩</div>
						<div className={classes.settingDesc}>
							신규 유저가 서버 입장 시 봇이 DM으로 포지션/티어/닉네임 등록을 진행하고, 완료 시 Discord 역할을 자동
							부여합니다.
						</div>
					</div>
					<div className={classes.settingRight}>
						<Button
							className={classes.settingBtn}
							variant="outlined"
							size="small"
							disabled={!optimisticSettings?.onboardingEnabled}
							onClick={() => setOnboardingDialogOpen(true)}
							startIcon={<SettingsIcon style={{ fontSize: 16 }} />}
						>
							설정
						</Button>
						<Switch
							className={classes.switch}
							checked={Boolean(optimisticSettings?.onboardingEnabled)}
							onChange={handleToggleOnboarding}
							disabled={isToggling}
						/>
					</div>
				</div>
			</div>

			<OnboardingSettingsDialog open={onboardingDialogOpen} onClose={handleOnboardingDialogClose} groupId={groupId} />

			<Dialog
				open={resetConfirmOpen}
				onClose={() => !isResetting && setResetConfirmOpen(false)}
				slotProps={{ paper: { className: classes.confirmDialogPaper } }}
			>
				<DialogTitle className={classes.confirmDialogTitle}>시즌을 지금 리셋할까요?</DialogTitle>
				<DialogContent>
					<DialogContentText className={classes.confirmDialogText}>
						모든 유저가 시즌 동안 쌓은 레이팅이 절반으로 줄어듭니다. 기본 티어 점수는 유지되지만 이 작업은
						되돌릴 수 없습니다.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setResetConfirmOpen(false)} disabled={isResetting} style={{ color: 'rgba(255,255,255,0.6)' }}>
						취소
					</Button>
					<Button
						onClick={handleConfirmReset}
						disabled={isResetting}
						style={{ color: '#ff6b6b', fontWeight: 700 }}
					>
						{isResetting ? '리셋 중...' : '리셋'}
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				className={classes.snackbar}
				open={Boolean(snackMsg)}
				autoHideDuration={2000}
				onClose={() => setSnackMsg('')}
				message={snackMsg}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			/>
		</div>
	);
}

export default GroupInfoContent;
