import React, { useEffect, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Chip,
	Select,
	MenuItem,
	useMediaQuery
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import FuseLoading from '@fuse/core/FuseLoading';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from './store/actions';

const TIER_THRESHOLDS = {
	IRON: 200,
	BRONZE: 300,
	SILVER: 400,
	GOLD: 500,
	PLATINUM: 600,
	EMERALD: 700,
	DIAMOND: 800,
	MASTER: 900,
	GRANDMASTER: 1000,
	CHALLENGER: 1150
};

const TIER_STEPS = ['IV', 'III', 'II', 'I'];

const TIER_COLORS = {
	IRON: '#5C5C5C',
	BRONZE: '#CD7F32',
	SILVER: '#C0C0C0',
	GOLD: '#FFD700',
	PLATINUM: '#00CED1',
	EMERALD: '#50C878',
	DIAMOND: '#B9F2FF',
	MASTER: '#9932CC',
	GRANDMASTER: '#FF4500',
	CHALLENGER: '#F0E68C'
};

function isNonStepTier(name) {
	return name === 'MASTER' || name === 'GRANDMASTER' || name === 'CHALLENGER';
}

function getTierName(rating) {
	const entries = Object.entries(TIER_THRESHOLDS).sort((a, b) => b[1] - a[1]);
	const match = entries.find(([, threshold]) => rating >= threshold);
	return match ? match[0] : 'IRON';
}

function getRatingTierName(rating) {
	const entries = Object.entries(TIER_THRESHOLDS).sort((a, b) => b[1] - a[1]);
	const match = entries.find(([, threshold]) => rating >= threshold);
	if (!match) return 'IRON IV';
	const [name, threshold] = match;
	if (isNonStepTier(name)) {
		const lp = Math.floor((rating - threshold) * 4);
		return `${name} ${lp}LP`;
	}
	return `${name} ${TIER_STEPS[Math.floor((rating - threshold) / 25)]}`;
}

// 약어 매핑 (API 전송용)
const TIER_ABBR = {
	IRON: 'I',
	BRONZE: 'B',
	SILVER: 'S',
	GOLD: 'G',
	PLATINUM: 'P',
	EMERALD: 'E',
	DIAMOND: 'D',
	MASTER: 'M',
	GRANDMASTER: 'GM',
	CHALLENGER: 'C'
};

// 티어 선택 옵션: rating = defaultRating 값, apiValue = 서버 전송용 약어
const TIER_OPTIONS = [];
['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND'].forEach(tier => {
	[0, 1, 2, 3].forEach(stepIdx => {
		const rating = TIER_THRESHOLDS[tier] + stepIdx * 25;
		const stepLabel = TIER_STEPS[stepIdx];
		const apiValue = `${TIER_ABBR[tier]}${4 - stepIdx}`;
		TIER_OPTIONS.push({ label: `${tier} ${stepLabel}`, tierName: tier, rating, apiValue });
	});
});
['MASTER', 'GRANDMASTER', 'CHALLENGER'].forEach(tier => {
	[0, 1, 2, 3].forEach(stepIdx => {
		const rating = TIER_THRESHOLDS[tier] + stepIdx * 25;
		const lp = stepIdx * 100;
		const apiValue = `${TIER_ABBR[tier]}${4 - stepIdx}`;
		TIER_OPTIONS.push({ label: `${tier} ${lp}LP`, tierName: tier, rating, apiValue });
	});
});

const useStyles = makeStyles(theme => ({
	root: {
		padding: '24px 28px',
		[theme.breakpoints.down('sm')]: {
			padding: '16px 12px'
		}
	},
	tableContainer: {
		borderRadius: 16,
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.06)',
		overflow: 'hidden'
	},
	tableHead: {
		background: 'rgba(0, 212, 255, 0.08)'
	},
	headCell: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.7)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
		padding: '14px 20px',
		letterSpacing: '0.05em'
	},
	bodyCell: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		color: 'rgba(255, 255, 255, 0.85)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
		padding: '12px 20px'
	},
	row: {
		transition: 'background 0.2s ease',
		'&:hover': {
			background: 'rgba(255, 255, 255, 0.03)'
		}
	},
	rowOutsider: {
		opacity: 0.5
	},
	chipMember: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		background: 'rgba(0, 255, 127, 0.15)',
		color: '#00ff7f',
		border: '1px solid rgba(0, 255, 127, 0.3)'
	},
	chipAdmin: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		background: 'rgba(0, 212, 255, 0.15)',
		color: '#00d4ff',
		border: '1px solid rgba(0, 212, 255, 0.3)'
	},
	chipOutsider: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		background: 'rgba(255, 107, 107, 0.15)',
		color: '#ff6b6b',
		border: '1px solid rgba(255, 107, 107, 0.3)'
	},
	blacklistBtn: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		borderRadius: 10,
		padding: '4px 16px',
		textTransform: 'none',
		background: 'rgba(255, 107, 107, 0.15)',
		color: '#ff6b6b',
		border: '1px solid rgba(255, 107, 107, 0.3)',
		'&:hover': {
			background: 'rgba(255, 107, 107, 0.3)'
		}
	},
	restoreBtn: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		borderRadius: 10,
		padding: '4px 16px',
		textTransform: 'none',
		background: 'rgba(0, 255, 127, 0.15)',
		color: '#00ff7f',
		border: '1px solid rgba(0, 255, 127, 0.3)',
		'&:hover': {
			background: 'rgba(0, 255, 127, 0.3)'
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
	dialogPaper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		borderRadius: 16,
		color: '#fff'
	},
	dialogTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		color: '#fff'
	},
	dialogText: {
		color: 'rgba(255, 255, 255, 0.7)'
	},
	tierCell: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6
	},
	tierEmblem: {
		width: 24,
		height: 24
	},
	tierText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600
	},
	statsText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	tierSelect: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: '#fff',
		background: 'rgba(255, 255, 255, 0.05)',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		borderRadius: 8,
		padding: '4px 8px',
		minWidth: 160,
		'&:before, &:after': {
			display: 'none'
		},
		'& .MuiSelect-icon': {
			color: 'rgba(255, 255, 255, 0.5)'
		}
	},
	tierMenuItem: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem'
	},
	// Mobile card styles
	cardList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12
	},
	card: {
		borderRadius: 14,
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.06)',
		padding: 16,
		transition: 'background 0.2s ease'
	},
	cardOutsider: {
		opacity: 0.5
	},
	cardHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12
	},
	cardName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#fff'
	},
	cardBody: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: '10px 16px'
	},
	cardField: {
		display: 'flex',
		flexDirection: 'column',
		gap: 2
	},
	cardLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	cardValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.8)'
	},
	cardTierRow: {
		gridColumn: '1 / -1'
	},
	cardActions: {
		marginTop: 12,
		display: 'flex',
		justifyContent: 'flex-end'
	},
	tierSelectMobile: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: '#fff',
		background: 'rgba(255, 255, 255, 0.05)',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		borderRadius: 8,
		padding: '2px 6px',
		width: '100%',
		'&:before, &:after': {
			display: 'none'
		},
		'& .MuiSelect-icon': {
			color: 'rgba(255, 255, 255, 0.5)'
		}
	}
}));

const ROLE_LABELS = {
	admin: '관리자',
	member: '멤버',
	outsider: '추방됨'
};

function GroupSettingsContent() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const user = useSelector(state => state.auth.user);
	const { members, loading, searchText } = useSelector(({ GroupSettings }) => GroupSettings.groupSettings);
	const [confirmDialog, setConfirmDialog] = useState(null);

	const groupId = user?.reprGroup?.groupId;
	const isAdmin = user?.reprGroup?.isAdmin;

	useEffect(() => {
		if (groupId && isAdmin) {
			dispatch(Actions.getMembers(groupId));
		}
	}, [dispatch, groupId, isAdmin]);

	if (!isAdmin) {
		return <div className={classes.noAdmin}>관리자 권한이 필요합니다.</div>;
	}

	if (loading) {
		return <FuseLoading />;
	}

	const filteredMembers = members.filter(m => m.name.toLowerCase().includes(searchText.toLowerCase()));

	function handleBlacklist(member) {
		setConfirmDialog({ type: 'blacklist', member });
	}

	function handleRestore(member) {
		setConfirmDialog({ type: 'restore', member });
	}

	function handleConfirm() {
		if (!confirmDialog) return;
		const { type, member } = confirmDialog;
		if (type === 'blacklist') {
			dispatch(Actions.addBlacklist(groupId, member.puuid));
		} else {
			dispatch(Actions.removeBlacklist(groupId, member.puuid));
		}
		setConfirmDialog(null);
	}

	function handleTierChange(puuid, rating) {
		const opt = TIER_OPTIONS.find(o => o.rating === rating);
		if (opt) {
			dispatch(Actions.changeDefaultTier(groupId, puuid, opt.apiValue));
		}
	}

	function renderTierOption(tierName, label) {
		const color = TIER_COLORS[tierName] || '#fff';
		return (
			<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
				<img
					style={{ width: 20, height: 20 }}
					src={`/assets/images/ranked-emblems/Emblem_${tierName}.png`}
					alt={tierName}
				/>
				<span style={{ color, fontFamily: '"Rajdhani", sans-serif', fontWeight: 600 }}>{label}</span>
			</div>
		);
	}

	function getRoleChip(role) {
		const chipClass =
			role === 'admin' ? classes.chipAdmin : role === 'outsider' ? classes.chipOutsider : classes.chipMember;
		return <Chip label={ROLE_LABELS[role] || role} className={chipClass} size="small" />;
	}

	function renderTier(rating) {
		const tierName = getTierName(rating);
		const fullTierName = getRatingTierName(rating);
		const color = TIER_COLORS[tierName] || '#fff';
		return (
			<div className={classes.tierCell}>
				<img
					className={classes.tierEmblem}
					src={`/assets/images/ranked-emblems/Emblem_${tierName}.png`}
					alt={tierName}
				/>
				<span className={classes.tierText} style={{ color }}>
					{fullTierName}
				</span>
			</div>
		);
	}

	function renderTierSelect(member, mobile) {
		return (
			<Select
				className={mobile ? classes.tierSelectMobile : classes.tierSelect}
				value={member.defaultRating}
				onChange={e => handleTierChange(member.puuid, e.target.value)}
				renderValue={val => renderTierOption(getTierName(val), getRatingTierName(val))}
				MenuProps={{
					PaperProps: {
						style: {
							background: '#1a1a2e',
							border: '1px solid rgba(0, 212, 255, 0.3)',
							color: '#fff',
							maxHeight: 300
						}
					}
				}}
			>
				{TIER_OPTIONS.map(opt => (
					<MenuItem key={opt.apiValue} value={opt.rating} className={classes.tierMenuItem}>
						{renderTierOption(opt.tierName, opt.label)}
					</MenuItem>
				))}
			</Select>
		);
	}

	function renderActionBtn(member) {
		if (member.role === 'admin') return null;
		if (member.role === 'outsider') {
			return (
				<Button className={classes.restoreBtn} size="small" onClick={() => handleRestore(member)}>
					복구
				</Button>
			);
		}
		return (
			<Button className={classes.blacklistBtn} size="small" onClick={() => handleBlacklist(member)}>
				추방
			</Button>
		);
	}

	function formatDate(dateStr) {
		if (!dateStr) return '-';
		const d = new Date(dateStr);
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}.${m}.${day}`;
	}

	function renderConfirmDialog() {
		return (
			<Dialog
				open={Boolean(confirmDialog)}
				onClose={() => setConfirmDialog(null)}
				PaperProps={{ className: classes.dialogPaper }}
			>
				{confirmDialog && (
					<>
						<DialogTitle className={classes.dialogTitle}>
							{confirmDialog.type === 'blacklist' ? '멤버 추방' : '멤버 복구'}
						</DialogTitle>
						<DialogContent>
							<DialogContentText className={classes.dialogText}>
								{confirmDialog.type === 'blacklist'
									? `"${confirmDialog.member.name}" 을(를) 추방하시겠습니까? 추방된 유저는 랭킹, 대시보드 등에서 제외됩니다.`
									: `"${confirmDialog.member.name}" 을(를) 복구하시겠습니까?`}
							</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => setConfirmDialog(null)} style={{ color: 'rgba(255,255,255,0.6)' }}>
								취소
							</Button>
							<Button
								onClick={handleConfirm}
								style={{
									color: confirmDialog.type === 'blacklist' ? '#ff6b6b' : '#00ff7f'
								}}
							>
								확인
							</Button>
						</DialogActions>
					</>
				)}
			</Dialog>
		);
	}

	if (isMobile) {
		return (
			<div className={classes.root}>
				<div className={classes.cardList}>
					{filteredMembers.map(member => {
						const totalRating = member.defaultRating + member.additionalRating;
						return (
							<div
								key={member.puuid}
								className={`${classes.card} ${member.role === 'outsider' ? classes.cardOutsider : ''}`}
							>
								<div className={classes.cardHeader}>
									<span className={classes.cardName}>{member.name}</span>
									{getRoleChip(member.role)}
								</div>
								<div className={classes.cardBody}>
									<div className={classes.cardField}>
										<span className={classes.cardLabel}>전적</span>
										<span className={classes.cardValue}>
											{member.win}W {member.lose}L
										</span>
									</div>
									<div className={classes.cardField}>
										<span className={classes.cardLabel}>현재 티어</span>
										{renderTier(totalRating)}
									</div>
									<div className={classes.cardField}>
										<span className={classes.cardLabel}>생성일</span>
										<span className={classes.cardValue}>{formatDate(member.createdAt)}</span>
									</div>
									<div className={classes.cardField}>
										<span className={classes.cardLabel}>최근 경기</span>
										<span className={classes.cardValue}>{formatDate(member.latestMatchDate)}</span>
									</div>
									<div className={`${classes.cardField} ${classes.cardTierRow}`}>
										<span className={classes.cardLabel}>기본 티어</span>
										{renderTierSelect(member, true)}
									</div>
								</div>
								<div className={classes.cardActions}>{renderActionBtn(member)}</div>
							</div>
						);
					})}
				</div>
				{renderConfirmDialog()}
			</div>
		);
	}

	return (
		<div className={classes.root}>
			<TableContainer className={classes.tableContainer}>
				<Table>
					<TableHead className={classes.tableHead}>
						<TableRow>
							<TableCell className={classes.headCell}>소환사명</TableCell>
							<TableCell className={classes.headCell}>상태</TableCell>
							<TableCell className={classes.headCell} align="center">
								전적
							</TableCell>
							<TableCell className={classes.headCell} align="center">
								기본 티어
							</TableCell>
							<TableCell className={classes.headCell} align="center">
								현재 티어
							</TableCell>
							<TableCell className={classes.headCell} align="center">
								생성일
							</TableCell>
							<TableCell className={classes.headCell} align="center">
								최근 경기
							</TableCell>
							<TableCell className={classes.headCell} align="center">
								관리
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredMembers.map(member => {
							const totalRating = member.defaultRating + member.additionalRating;
							return (
								<TableRow
									key={member.puuid}
									className={`${classes.row} ${member.role === 'outsider' ? classes.rowOutsider : ''}`}
								>
									<TableCell className={classes.bodyCell}>{member.name}</TableCell>
									<TableCell className={classes.bodyCell}>{getRoleChip(member.role)}</TableCell>
									<TableCell className={classes.bodyCell} align="center">
										<span className={classes.statsText}>
											{member.win}W {member.lose}L
										</span>
									</TableCell>
									<TableCell className={classes.bodyCell} align="center">
										{renderTierSelect(member, false)}
									</TableCell>
									<TableCell className={classes.bodyCell} align="center">
										{renderTier(totalRating)}
									</TableCell>
									<TableCell className={classes.bodyCell} align="center">
										<span className={classes.statsText}>{formatDate(member.createdAt)}</span>
									</TableCell>
									<TableCell className={classes.bodyCell} align="center">
										<span className={classes.statsText}>{formatDate(member.latestMatchDate)}</span>
									</TableCell>
									<TableCell className={classes.bodyCell} align="center">
										{renderActionBtn(member)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
			{renderConfirmDialog()}
		</div>
	);
}

export default GroupSettingsContent;
