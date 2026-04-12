import React, { useEffect, useState } from 'react';
import { TextField, Switch, Snackbar, IconButton, Button, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import SettingsIcon from '@material-ui/icons/Settings';
import { useDispatch, useSelector } from 'react-redux';
import { SettingsSkeleton } from '../components/SkeletonLoaders';
import * as Actions from './store/actions';
import OnboardingSettingsDialog from './OnboardingSettingsDialog';

const useStyles = makeStyles(theme => ({
	root: {
		padding: '24px 28px',
		maxWidth: 720,
		[theme.breakpoints.down('sm')]: {
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
		[theme.breakpoints.down('sm')]: {
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
		[theme.breakpoints.down('sm')]: {
			gap: 12
		}
	},
	guildIcon: {
		width: 56,
		height: 56,
		borderRadius: '50%',
		border: '2px solid rgba(0, 212, 255, 0.3)',
		[theme.breakpoints.down('sm')]: {
			width: 44,
			height: 44
		}
	},
	guildName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		[theme.breakpoints.down('sm')]: {
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
		[theme.breakpoints.down('sm')]: {
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
	const classes = useStyles();
	const dispatch = useDispatch();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const user = useSelector(state => state.auth.user);
	const { info, loading } = useSelector(({ GroupSettings }) => GroupSettings.groupInfo);

	const [editingName, setEditingName] = useState(false);
	const [nameValue, setNameValue] = useState('');
	const [snackMsg, setSnackMsg] = useState('');
	const [onboardingDialogOpen, setOnboardingDialogOpen] = useState(false);

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
		dispatch(Actions.updateGroupName(groupId, nameValue.trim()))
			.then(() => {
				setSnackMsg('방 이름이 변경되었습니다.');
				setEditingName(false);
			})
			.catch(() => setSnackMsg('변경에 실패했습니다.'));
	}

	function handleNameKeyDown(e) {
		if (e.key === 'Enter') saveName();
		if (e.key === 'Escape') cancelEditName();
	}

	function handleToggleOnboarding() {
		const next = !info.settings.onboardingEnabled;
		dispatch(Actions.updateGroupSettings(groupId, { onboardingEnabled: next }))
			.then(() => setSnackMsg(next ? '온보딩이 활성화되었습니다.' : '온보딩이 비활성화되었습니다.'))
			.catch(() => setSnackMsg('설정 변경에 실패했습니다.'));
	}

	function handleOnboardingDialogClose(msg) {
		setOnboardingDialogOpen(false);
		if (msg) setSnackMsg(msg);
	}

	function handleToggleVoteMode() {
		const next = !info.settings.matchVoteMode;
		dispatch(Actions.updateGroupSettings(groupId, { matchVoteMode: next }))
			.then(() => setSnackMsg(next ? '매칭 투표가 활성화되었습니다.' : '매칭 투표가 비활성화되었습니다.'))
			.catch(() => setSnackMsg('설정 변경에 실패했습니다.'));
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
							<IconButton className={classes.confirmBtn} onClick={saveName} size="small">
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
				<div className={classes.settingRow}>
					<div className={classes.settingInfo}>
						<div className={classes.settingLabel}>매칭 투표</div>
						<div className={classes.settingDesc}>
							매칭 생성 시 플랜을 바로 선택하는 대신, 참가자 10명이 투표로 결정합니다.
						</div>
					</div>
					<Switch
						className={classes.switch}
						checked={Boolean(info.settings?.matchVoteMode)}
						onChange={handleToggleVoteMode}
					/>
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
							disabled={!info.settings?.onboardingEnabled}
							onClick={() => setOnboardingDialogOpen(true)}
							startIcon={<SettingsIcon style={{ fontSize: 16 }} />}
						>
							설정
						</Button>
						<Switch
							className={classes.switch}
							checked={Boolean(info.settings?.onboardingEnabled)}
							onChange={handleToggleOnboarding}
						/>
					</div>
				</div>
			</div>

			<OnboardingSettingsDialog open={onboardingDialogOpen} onClose={handleOnboardingDialogClose} groupId={groupId} />

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
