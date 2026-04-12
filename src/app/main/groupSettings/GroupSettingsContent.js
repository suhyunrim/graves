import React, { useEffect, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Chip,
	Select,
	MenuItem,
	Checkbox,
	ListItemText,
	useMediaQuery
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import { SettingsSkeleton } from '../components/SkeletonLoaders';
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

const TIER_RANK_MAP = { IV: '4', III: '3', II: '2', I: '1' };

function getRatingTierShort(rating) {
	const entries = Object.entries(TIER_THRESHOLDS).sort((a, b) => b[1] - a[1]);
	const match = entries.find(([, threshold]) => rating >= threshold);
	if (!match) return 'I4';
	const [name, threshold] = match;
	const abbr = TIER_ABBR[name] || name.charAt(0);
	if (isNonStepTier(name)) {
		const lp = Math.floor((rating - threshold) * 4);
		return `${abbr} ${lp}LP`;
	}
	const step = TIER_STEPS[Math.floor((rating - threshold) / 25)];
	return `${abbr}${TIER_RANK_MAP[step] || ''}`;
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
		const apiValue = `${TIER_ABBR[tier]}${4 - stepIdx}`;
		TIER_OPTIONS.push({ label: `${TIER_ABBR[tier]}${4 - stepIdx}`, tierName: tier, rating, apiValue });
	});
});
['MASTER', 'GRANDMASTER', 'CHALLENGER'].forEach(tier => {
	[0, 1, 2, 3].forEach(stepIdx => {
		const rating = TIER_THRESHOLDS[tier] + stepIdx * 25;
		const lp = stepIdx * 100;
		const apiValue = `${TIER_ABBR[tier]}${4 - stepIdx}`;
		TIER_OPTIONS.push({ label: `${TIER_ABBR[tier]} ${lp}LP`, tierName: tier, rating, apiValue });
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
		padding: '14px 12px',
		letterSpacing: '0.05em',
		whiteSpace: 'nowrap'
	},
	bodyCell: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		color: 'rgba(255, 255, 255, 0.85)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
		padding: '12px 12px'
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
	chipLeftGuild: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		fontWeight: 600,
		background: 'rgba(255, 165, 0, 0.15)',
		color: '#ffa500',
		border: '1px solid rgba(255, 165, 0, 0.3)'
	},
	rowLeftGuild: {
		opacity: 0.55
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
	statusFilterSelect: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.7)',
		fontWeight: 700,
		letterSpacing: '0.05em',
		'&:before, &:after': { display: 'none' },
		'& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.4)' },
		'& .MuiSelect-select': { paddingRight: 24 }
	},
	statusMenuItem: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		padding: '4px 12px'
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
		gap: '10px 16px',
		[theme.breakpoints.down('xs')]: {
			gridTemplateColumns: '1fr',
			gap: 8
		}
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
	sortLabel: {
		'& .MuiTableSortLabel-icon': {
			color: 'rgba(255, 255, 255, 0.4) !important'
		}
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

function GroupSettingsContent() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const user = useSelector(state => state.auth.user);
	const { members, loading, searchText } = useSelector(({ GroupSettings }) => GroupSettings.groupSettings);
	const [confirmDialog, setConfirmDialog] = useState(null);
	const [sortKey, setSortKey] = useState(null);
	const [sortDir, setSortDir] = useState('asc');
	const [statusFilter, setStatusFilter] = useState(['admin', 'member', 'outsider', 'leftGuild']);

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
		return <SettingsSkeleton />;
	}

	const handleSort = key => {
		if (sortKey === key) {
			setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
		} else {
			setSortKey(key);
			setSortDir('asc');
		}
	};

	const getSortValue = (member, key) => {
		switch (key) {
			case 'name':
				return member.name.toLowerCase();
			case 'rating':
				return member.defaultRating + member.additionalRating;
			case 'voice':
				return member.lastVoiceJoinedAt ? new Date(member.lastVoiceJoinedAt).getTime() : 0;
			case 'latestMatch':
				return member.latestMatchDate ? new Date(member.latestMatchDate).getTime() : 0;
			case 'created':
				return member.createdAt ? new Date(member.createdAt).getTime() : 0;
			default:
				return 0;
		}
	};

	function getStatusKeys(member) {
		if (member.role === 'outsider') return ['outsider'];
		if (member.leftGuildAt) return ['leftGuild'];
		return [member.role];
	}

	function getStatusPriority(member) {
		if (member.role === 'admin') return 1;
		if (member.role === 'outsider') return 4;
		if (member.leftGuildAt) return 3;
		return 2;
	}

	const filteredMembers = members
		.filter(m => m.name.toLowerCase().includes(searchText.toLowerCase()))
		.filter(m => getStatusKeys(m).some(k => statusFilter.includes(k)));

	const sortedMembers = [...filteredMembers].sort((a, b) => {
		if (sortKey) {
			const aVal = getSortValue(a, sortKey);
			const bVal = getSortValue(b, sortKey);
			if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
		}
		return getStatusPriority(a) - getStatusPriority(b);
	});

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
					src={`/assets/images/ranked-emblems/Emblem_${tierName}.webp`}
					alt={tierName}
				/>
				<span style={{ color, fontFamily: '"Rajdhani", sans-serif', fontWeight: 600 }}>{label}</span>
			</div>
		);
	}

	function renderStatus(member) {
		const chips = [];
		if (member.role === 'admin') {
			chips.push(<Chip key="admin" label="관리자" className={classes.chipAdmin} size="small" />);
		}
		if (member.role === 'outsider') {
			chips.push(<Chip key="outsider" label="추방됨" className={classes.chipOutsider} size="small" />);
		}
		if (member.leftGuildAt) {
			chips.push(<Chip key="left" label="서버 탈퇴" className={classes.chipLeftGuild} size="small" />);
		}
		if (chips.length === 0) {
			return <span className={classes.statsText}>-</span>;
		}
		return <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{chips}</div>;
	}

	function renderTier(rating) {
		const tierName = getTierName(rating);
		const color = TIER_COLORS[tierName] || '#fff';
		return (
			<div className={classes.tierCell}>
				<img
					className={classes.tierEmblem}
					src={`/assets/images/ranked-emblems/Emblem_${tierName}.webp`}
					alt={tierName}
				/>
				<span className={classes.tierText} style={{ color }}>
					{getRatingTierShort(rating)}
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
				renderValue={val => renderTierOption(getTierName(val), getRatingTierShort(val))}
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
		const y = String(d.getFullYear()).slice(-2);
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}.${m}.${day}`;
	}

	function formatRelativeTime(dateStr) {
		if (!dateStr) return null;
		const now = new Date();
		const d = new Date(dateStr);
		const diffMs = now - d;
		const diffMin = Math.floor(diffMs / 60000);
		const diffHour = Math.floor(diffMin / 60);
		const diffDay = Math.floor(diffHour / 24);

		if (diffMin < 1) return '방금 전';
		if (diffMin < 60) return `${diffMin}분 전`;
		if (diffHour < 24) return `${diffHour}시간 전`;
		if (diffDay < 30) return `${diffDay}일 전`;
		if (diffDay < 365) return `${Math.floor(diffDay / 30)}개월 전`;
		return `${Math.floor(diffDay / 365)}년 전`;
	}

	function renderVoiceStatus(dateStr) {
		if (!dateStr) {
			return <span className={classes.statsText}>-</span>;
		}
		return <span className={classes.statsText}>{formatRelativeTime(dateStr)}</span>;
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
					{sortedMembers.map(member => {
						const totalRating = member.defaultRating + member.additionalRating;
						return (
							<div
								key={member.puuid}
								className={`${classes.card} ${member.role === 'outsider' ? classes.cardOutsider : ''} ${
									member.leftGuildAt ? classes.rowLeftGuild : ''
								}`}
							>
								<div className={classes.cardHeader}>
									<span className={classes.cardName}>{member.name}</span>
									{renderStatus(member)}
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
									<div className={classes.cardField}>
										<span className={classes.cardLabel}>보이스 접속</span>
										{renderVoiceStatus(member.lastVoiceJoinedAt)}
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
							<TableCell className={classes.headCell}>
								<TableSortLabel
									className={classes.sortLabel}
									active={sortKey === 'name'}
									direction={sortKey === 'name' ? sortDir : 'asc'}
									onClick={() => handleSort('name')}
								>
									소환사명
								</TableSortLabel>
							</TableCell>
							<TableCell className={classes.headCell}>
								<Select
									className={classes.statusFilterSelect}
									multiple
									value={statusFilter}
									onChange={e => setStatusFilter(e.target.value)}
									renderValue={() => `상태${statusFilter.length < 4 ? ` (${statusFilter.length})` : ''}`}
									MenuProps={{
										PaperProps: {
											style: {
												background: '#1a1a2e',
												border: '1px solid rgba(0, 212, 255, 0.3)',
												color: '#fff'
											}
										}
									}}
								>
									{[
										{ value: 'admin', label: '관리자' },
										{ value: 'member', label: '멤버' },
										{ value: 'outsider', label: '추방됨' },
										{ value: 'leftGuild', label: '서버 탈퇴' }
									].map(opt => (
										<MenuItem key={opt.value} value={opt.value} className={classes.statusMenuItem}>
											<Checkbox checked={statusFilter.includes(opt.value)} size="small" style={{ color: '#00d4ff' }} />
											<ListItemText primary={opt.label} />
										</MenuItem>
									))}
								</Select>
							</TableCell>
							<TableCell className={classes.headCell} align="center">
								전적
							</TableCell>
							<TableCell className={classes.headCell} align="center">
								기본 티어
							</TableCell>
							<TableCell className={classes.headCell} align="center">
								<TableSortLabel
									className={classes.sortLabel}
									active={sortKey === 'rating'}
									direction={sortKey === 'rating' ? sortDir : 'asc'}
									onClick={() => handleSort('rating')}
								>
									현재 티어
								</TableSortLabel>
							</TableCell>
							<TableCell className={classes.headCell} align="center">
								<TableSortLabel
									className={classes.sortLabel}
									active={sortKey === 'created'}
									direction={sortKey === 'created' ? sortDir : 'asc'}
									onClick={() => handleSort('created')}
								>
									생성일
								</TableSortLabel>
							</TableCell>
							<TableCell className={classes.headCell} align="center">
								<TableSortLabel
									className={classes.sortLabel}
									active={sortKey === 'latestMatch'}
									direction={sortKey === 'latestMatch' ? sortDir : 'asc'}
									onClick={() => handleSort('latestMatch')}
								>
									최근 경기
								</TableSortLabel>
							</TableCell>
							<TableCell className={classes.headCell} align="center">
								<TableSortLabel
									className={classes.sortLabel}
									active={sortKey === 'voice'}
									direction={sortKey === 'voice' ? sortDir : 'asc'}
									onClick={() => handleSort('voice')}
								>
									보이스 접속
								</TableSortLabel>
							</TableCell>
							<TableCell className={classes.headCell} align="center">
								관리
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{sortedMembers.map(member => {
							const totalRating = member.defaultRating + member.additionalRating;
							return (
								<TableRow
									key={member.puuid}
									className={`${classes.row} ${member.role === 'outsider' ? classes.rowOutsider : ''} ${
										member.leftGuildAt ? classes.rowLeftGuild : ''
									}`}
								>
									<TableCell className={classes.bodyCell}>{member.name}</TableCell>
									<TableCell className={classes.bodyCell}>{renderStatus(member)}</TableCell>
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
										{renderVoiceStatus(member.lastVoiceJoinedAt)}
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
