import React, { useEffect, useState, useCallback } from 'react';
import { Select, MenuItem, TextField, Chip, IconButton, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import LanguageIcon from '@material-ui/icons/Language';
import FuseLoading from '@fuse/core/FuseLoading';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from './store/actions';

const ACTION_LABELS = {
	'match.create': '매치 생성',
	'match.confirm': '승패 처리',
	'match.cancel': '매치 취소',
	'match.duplicate': '매치 복제',
	'user.blacklist': '블랙리스트 등록',
	'user.unblacklist': '블랙리스트 해제',
	'user.rating_change': '레이팅 변경',
	'challenge.create': '챌린지 생성',
	'challenge.update': '챌린지 수정',
	'challenge.cancel': '챌린지 취소',
	'generator.create': '생성기 등록',
	'generator.update': '생성기 수정',
	'generator.delete': '생성기 해제'
};

const CATEGORY_LABELS = {
	all: '전체',
	match: '매치',
	user: '유저',
	challenge: '챌린지',
	generator: '생성기'
};

const ACTION_COLORS = {
	match: '#00d4ff',
	user: '#ff9f43',
	challenge: '#a55eea',
	generator: '#00ff7f'
};

function getActionCategory(action) {
	return action.split('.')[0];
}

function formatDetails(action, details) {
	if (!details) return '';
	const parts = [];
	switch (action) {
		case 'match.create':
			if (details.gameId) parts.push(`게임 #${details.gameId}`);
			break;
		case 'match.confirm':
			if (details.gameId) parts.push(`게임 #${details.gameId}`);
			if (details.winTeam != null) parts.push(`승리팀: ${details.winTeam}`);
			if (details.previousWinTeam != null) parts.push(`이전 승리팀: ${details.previousWinTeam}`);
			break;
		case 'match.cancel':
			if (details.gameId) parts.push(`게임 #${details.gameId}`);
			if (details.matchId) parts.push(`매치 #${details.matchId}`);
			if (details.previousWinTeam != null) parts.push(`이전 승리팀: ${details.previousWinTeam}`);
			break;
		case 'match.duplicate':
			if (details.originalMatchId) parts.push(`원본 #${details.originalMatchId}`);
			if (details.date) parts.push(details.date);
			if (details.winTeam != null) parts.push(`승리팀: ${details.winTeam}`);
			break;
		case 'user.blacklist':
		case 'user.unblacklist':
			if (details.puuid) parts.push(`PUUID: ${details.puuid.slice(0, 8)}...`);
			if (details.previousRole) parts.push(`이전: ${details.previousRole}`);
			break;
		case 'user.rating_change':
			if (details.tier) parts.push(`티어: ${details.tier}`);
			if (details.before != null && details.after != null) parts.push(`${details.before} → ${details.after}`);
			break;
		case 'challenge.create':
			if (details.title) parts.push(details.title);
			if (details.gameType) parts.push(details.gameType);
			break;
		case 'challenge.update':
			if (details.challengeId) parts.push(`챌린지 #${details.challengeId}`);
			break;
		case 'challenge.cancel':
			if (details.challengeId) parts.push(`챌린지 #${details.challengeId}`);
			break;
		case 'generator.create':
		case 'generator.update':
			if (details.channelName) parts.push(details.channelName);
			if (details.defaultName) parts.push(`패턴: ${details.defaultName}`);
			if (details.defaultUserLimit != null)
				parts.push(`인원: ${details.defaultUserLimit === 0 ? '무제한' : details.defaultUserLimit}`);
			break;
		case 'generator.delete':
			if (details.channelName) parts.push(details.channelName);
			break;
		default:
			return JSON.stringify(details);
	}
	return parts.join(' / ');
}

function formatDate(dateStr) {
	const d = new Date(dateStr);
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	const hours = String(d.getHours()).padStart(2, '0');
	const mins = String(d.getMinutes()).padStart(2, '0');
	return `${month}.${day} ${hours}:${mins}`;
}

function getDefaultDates() {
	const end = new Date();
	const start = new Date();
	start.setDate(start.getDate() - 7);
	return {
		startDate: start.toISOString().split('T')[0],
		endDate: end.toISOString().split('T')[0]
	};
}

const useStyles = makeStyles(theme => ({
	root: {
		padding: '24px 28px',
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
	filters: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		marginBottom: 20,
		flexWrap: 'wrap',
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			alignItems: 'stretch'
		}
	},
	dateField: {
		'& .MuiInputBase-root': {
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.2rem',
			color: '#fff',
			background: 'rgba(255, 255, 255, 0.05)',
			borderRadius: 8
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(255, 255, 255, 0.15)'
		},
		'& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.4)'
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.6)'
		},
		'& .MuiInputBase-input': {
			padding: '10px 14px'
		},
		'& input[type="date"]::-webkit-calendar-picker-indicator': {
			filter: 'invert(1) brightness(0.7)'
		}
	},
	dateSeparator: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.4)',
		[theme.breakpoints.down('sm')]: {
			display: 'none'
		}
	},
	categorySelect: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: '#fff',
		background: 'rgba(255, 255, 255, 0.05)',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		borderRadius: 8,
		padding: '6px 12px',
		minWidth: 120,
		'&:before, &:after': { display: 'none' },
		'& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.5)' },
		[theme.breakpoints.down('sm')]: {
			width: '100%'
		}
	},
	categoryMenuItem: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem'
	},
	logList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 8
	},
	logItem: {
		borderRadius: 12,
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.06)',
		padding: '14px 20px',
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		transition: 'background 0.2s ease',
		'&:hover': {
			background: 'rgba(255, 255, 255, 0.05)'
		},
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			alignItems: 'flex-start',
			gap: 8,
			padding: '14px 14px'
		}
	},
	logTime: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.4)',
		minWidth: 100,
		whiteSpace: 'nowrap'
	},
	logActor: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 700,
		color: '#fff',
		minWidth: 100,
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto'
		}
	},
	logAction: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 600
	},
	logDetails: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.5)',
		flex: 1,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		[theme.breakpoints.down('sm')]: {
			whiteSpace: 'normal'
		}
	},
	logSource: {
		display: 'flex',
		alignItems: 'center',
		minWidth: 32
	},
	sourceIcon: {
		width: 20,
		height: 20
	},
	webIcon: {
		fontSize: 20,
		color: 'rgba(255, 255, 255, 0.4)'
	},
	pagination: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		marginTop: 24
	},
	pageBtn: {
		color: 'rgba(255, 255, 255, 0.5)',
		'&:hover': {
			color: '#00d4ff'
		},
		'&.Mui-disabled': {
			color: 'rgba(255, 255, 255, 0.15)'
		}
	},
	pageInfo: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.6)',
		minWidth: 100,
		textAlign: 'center'
	},
	emptyState: {
		textAlign: 'center',
		padding: '60px 20px',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	mobileLogHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%'
	},
	mobileLogLeft: {
		display: 'flex',
		alignItems: 'center',
		gap: 8
	}
}));

function AuditLogContent() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const user = useSelector(state => state.auth.user);
	const { logs, total, page, limit, loading } = useSelector(({ GroupSettings }) => GroupSettings.auditLog);

	const defaults = getDefaultDates();
	const [startDate, setStartDate] = useState(defaults.startDate);
	const [endDate, setEndDate] = useState(defaults.endDate);
	const [category, setCategory] = useState('all');

	const groupId = user?.reprGroup?.groupId;
	const isAdmin = user?.reprGroup?.isAdmin;

	const fetchLogs = useCallback(
		(p = 1) => {
			if (!groupId || !isAdmin) return;
			const params = { page: p, limit: 50 };
			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;
			if (category !== 'all') params.action = category;
			dispatch(Actions.getAuditLogs(groupId, params));
		},
		[dispatch, groupId, isAdmin, startDate, endDate, category]
	);

	useEffect(() => {
		fetchLogs(1);
	}, [fetchLogs]);

	if (!isAdmin) {
		return <div className={classes.noAdmin}>관리자 권한이 필요합니다.</div>;
	}

	if (loading) {
		return <FuseLoading />;
	}

	const totalPages = Math.ceil(total / limit) || 1;

	function renderSourceIcon(source) {
		if (source === 'discord') {
			return (
				<img
					className={classes.sourceIcon}
					src="/assets/images/logos/discord-mark-white.svg"
					alt="Discord"
					title="Discord"
				/>
			);
		}
		return <LanguageIcon className={classes.webIcon} titleAccess="Web" />;
	}

	function renderLogItem(log) {
		const cat = getActionCategory(log.action);
		const color = ACTION_COLORS[cat] || '#fff';
		const label = ACTION_LABELS[log.action] || log.action;
		const details = formatDetails(log.action, log.details);

		if (isMobile) {
			return (
				<div key={log.id} className={classes.logItem}>
					<div className={classes.mobileLogHeader}>
						<div className={classes.mobileLogLeft}>
							<span className={classes.logTime}>{formatDate(log.createdAt)}</span>
							<div className={classes.logSource}>{renderSourceIcon(log.source)}</div>
						</div>
						<Chip
							label={label}
							size="small"
							style={{
								background: `${color}22`,
								color,
								border: `1px solid ${color}44`,
								fontFamily: '"Noto Sans KR", sans-serif',
								fontSize: '1rem',
								fontWeight: 600
							}}
						/>
					</div>
					<div>
						<span className={classes.logActor}>{log.actorName}</span>
					</div>
					{details && <div className={classes.logDetails}>{details}</div>}
				</div>
			);
		}

		return (
			<div key={log.id} className={classes.logItem}>
				<span className={classes.logTime}>{formatDate(log.createdAt)}</span>
				<div className={classes.logSource}>{renderSourceIcon(log.source)}</div>
				<span className={classes.logActor}>{log.actorName}</span>
				<Chip
					label={label}
					size="small"
					style={{
						background: `${color}22`,
						color,
						border: `1px solid ${color}44`,
						fontFamily: '"Noto Sans KR", sans-serif',
						fontSize: '1rem',
						fontWeight: 600
					}}
				/>
				<span className={classes.logDetails}>{details || '-'}</span>
			</div>
		);
	}

	return (
		<div className={classes.root}>
			<div className={classes.filters}>
				<TextField
					className={classes.dateField}
					type="date"
					variant="outlined"
					value={startDate}
					onChange={e => setStartDate(e.target.value)}
					inputProps={{ 'aria-label': '시작일' }}
				/>
				<span className={classes.dateSeparator}>~</span>
				<TextField
					className={classes.dateField}
					type="date"
					variant="outlined"
					value={endDate}
					onChange={e => setEndDate(e.target.value)}
					inputProps={{ 'aria-label': '종료일' }}
				/>
				<Select
					className={classes.categorySelect}
					value={category}
					onChange={e => setCategory(e.target.value)}
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
					{Object.entries(CATEGORY_LABELS).map(([key, lbl]) => (
						<MenuItem key={key} value={key} className={classes.categoryMenuItem}>
							{lbl}
						</MenuItem>
					))}
				</Select>
			</div>

			{logs.length === 0 ? (
				<div className={classes.emptyState}>로그가 없습니다.</div>
			) : (
				<>
					<div className={classes.logList}>{logs.map(log => renderLogItem(log))}</div>
					<div className={classes.pagination}>
						<IconButton className={classes.pageBtn} disabled={page <= 1} onClick={() => fetchLogs(page - 1)}>
							<NavigateBeforeIcon />
						</IconButton>
						<span className={classes.pageInfo}>
							{page} / {totalPages}
						</span>
						<IconButton className={classes.pageBtn} disabled={page >= totalPages} onClick={() => fetchLogs(page + 1)}>
							<NavigateNextIcon />
						</IconButton>
					</div>
				</>
			)}
		</div>
	);
}

export default AuditLogContent;
