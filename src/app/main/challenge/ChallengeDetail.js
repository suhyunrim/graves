import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from '@material-ui/core/styles';
import {
	Typography,
	Button,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	CircularProgress,
	Snackbar,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions
} from '@material-ui/core';
import SyncIcon from '@material-ui/icons/Sync';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import reducer from './store/reducers';
import * as Actions from './store/actions';
import ChallengeFormDialog from './ChallengeFormDialog';
import {
	gameTypeLabels,
	scoringTypeLabels,
	statusLabels,
	statusColors,
	formatDateRange,
	getDday,
	formatTimeAgo
} from './challengeUtils';

const useStyles = makeStyles(theme => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	},
	headerRoot: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		padding: '24px 28px 20px',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
	},
	backLink: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)',
		textDecoration: 'none',
		marginBottom: 8,
		display: 'inline-block',
		'&:hover': {
			color: '#00d4ff'
		}
	},
	titleRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		flexWrap: 'wrap'
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '3.2rem',
		color: '#fff',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
		margin: 0,
		[theme.breakpoints.down('sm')]: {
			fontSize: '2.2rem'
		}
	},
	statusBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		padding: '4px 14px',
		borderRadius: 20
	},
	infoRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		marginTop: 12,
		flexWrap: 'wrap'
	},
	infoBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.6)'
	},
	gameTypeBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 500,
		padding: '3px 10px',
		borderRadius: 8,
		background: 'rgba(0, 212, 255, 0.15)',
		color: '#00d4ff'
	},
	description: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.7)',
		marginTop: 12,
		lineHeight: 1.6
	},
	actionRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		marginTop: 16,
		flexWrap: 'wrap'
	},
	joinBtn: {
		background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.2rem',
		padding: '8px 24px',
		borderRadius: 12,
		textTransform: 'none',
		'&:hover': {
			background: 'linear-gradient(135deg, #40c057 0%, #2f9e44 100%)'
		}
	},
	leaveBtn: {
		background: 'rgba(255, 107, 107, 0.2)',
		color: '#ff6b6b',
		border: '1px solid rgba(255, 107, 107, 0.4)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.2rem',
		padding: '8px 24px',
		borderRadius: 12,
		textTransform: 'none',
		'&:hover': {
			background: 'rgba(255, 107, 107, 0.3)'
		}
	},
	syncBtn: {
		background: 'rgba(0, 212, 255, 0.15)',
		color: '#00d4ff',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 600,
		fontSize: '1.1rem',
		padding: '6px 16px',
		borderRadius: 12,
		textTransform: 'none',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.25)'
		}
	},
	adminBtn: {
		background: 'rgba(255, 255, 255, 0.08)',
		color: 'rgba(255, 255, 255, 0.7)',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 600,
		fontSize: '1.1rem',
		padding: '6px 16px',
		borderRadius: 12,
		textTransform: 'none',
		'&:hover': {
			background: 'rgba(255, 255, 255, 0.15)'
		}
	},
	cancelChallengeBtn: {
		background: 'rgba(255, 107, 107, 0.15)',
		color: '#ff6b6b',
		border: '1px solid rgba(255, 107, 107, 0.3)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 600,
		fontSize: '1.1rem',
		padding: '6px 16px',
		borderRadius: 12,
		textTransform: 'none',
		'&:hover': {
			background: 'rgba(255, 107, 107, 0.25)'
		}
	},
	syncInfo: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	container: {
		padding: '28px',
		maxWidth: 1400,
		margin: '0 auto',
		width: '100%'
	},
	myStatsCard: {
		background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 153, 204, 0.05) 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.3)',
		padding: '20px 28px',
		marginBottom: 24,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		flexWrap: 'wrap',
		gap: 16
	},
	myStatsLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: '#00d4ff',
		fontWeight: 600
	},
	myStatsValues: {
		display: 'flex',
		gap: 24,
		flexWrap: 'wrap'
	},
	myStatItem: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 2
	},
	myStatLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	myStatValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff'
	},
	tableWrapper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.2)',
		overflow: 'hidden'
	},
	tableHead: {
		background: 'rgba(0, 212, 255, 0.08)'
	},
	th: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.7)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
		padding: '14px 20px',
		whiteSpace: 'nowrap'
	},
	td: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: '#fff',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		padding: '14px 20px'
	},
	rankCell: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		minWidth: 40,
		textAlign: 'center'
	},
	rankTop1: { color: '#FFD700', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' },
	rankTop2: { color: '#C0C0C0', textShadow: '0 0 10px rgba(192, 192, 192, 0.5)' },
	rankTop3: { color: '#CD7F32', textShadow: '0 0 10px rgba(205, 127, 50, 0.5)' },
	rankNormal: { color: 'rgba(255, 255, 255, 0.7)' },
	playerLink: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: '#fff',
		textDecoration: 'none',
		'&:hover': {
			color: '#00d4ff'
		}
	},
	highlightRow: {
		background: 'rgba(0, 212, 255, 0.08) !important'
	},
	statWin: { color: '#4dabf7' },
	statLose: { color: '#ff6b6b' },
	winRateHigh: { color: '#00ff7f' },
	winRateMid: { color: '#ffd700' },
	winRateLow: { color: '#ff6b6b' },
	ddayText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#00d4ff'
	},
	streakFire: { color: '#ff6b00' },
	streakSkull: { color: '#868e96' },
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '60px 20px',
		textAlign: 'center'
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	snackbar: {
		'& .MuiSnackbarContent-root': {
			fontFamily: '"Noto Sans KR", sans-serif',
			fontWeight: 600,
			fontSize: '1.2rem'
		}
	},
	snackSuccess: {
		'& .MuiSnackbarContent-root': {
			background: '#51cf66',
			color: '#000'
		}
	},
	snackError: {
		'& .MuiSnackbarContent-root': {
			background: '#ff6b6b',
			color: '#fff'
		}
	},
	loadingWrapper: {
		display: 'flex',
		justifyContent: 'center',
		padding: 60
	},
	// Mobile leaderboard cards
	mobileCardList: {
		padding: '16px',
		[theme.breakpoints.up('md')]: {
			display: 'none'
		}
	},
	mobileCard: {
		background: 'rgba(255, 255, 255, 0.03)',
		borderRadius: 16,
		padding: '14px 16px',
		marginBottom: 10,
		border: '1px solid rgba(255, 255, 255, 0.08)'
	},
	mobileCardTop: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		marginBottom: 10
	},
	mobileRank: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		width: 36,
		height: 36,
		borderRadius: 10,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		background: 'rgba(255, 255, 255, 0.1)'
	},
	mobileRankTop1: { background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000' },
	mobileRankTop2: { background: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', color: '#000' },
	mobileRankTop3: { background: 'linear-gradient(135deg, #CD7F32, #8B4513)', color: '#fff' },
	mobileName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: '#fff',
		textDecoration: 'none',
		flex: 1,
		'&:hover': { color: '#00d4ff' }
	},
	mobileStats: {
		display: 'flex',
		justifyContent: 'space-between',
		paddingTop: 10,
		borderTop: '1px solid rgba(255, 255, 255, 0.08)'
	},
	mobileStatItem: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 2
	},
	mobileStatLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.85rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	mobileStatValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700,
		color: '#fff'
	},
	desktopOnly: {
		[theme.breakpoints.down('sm')]: {
			display: 'none'
		}
	}
}));

function ChallengeDetail() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const { challengeId } = useParams();
	const detail = useSelector(({ Challenge }) => Challenge.challenge.detail);
	const leaderboard = useSelector(({ Challenge }) => Challenge.challenge.leaderboard);
	const myStats = useSelector(({ Challenge }) => Challenge.challenge.myStats);
	const syncMessage = useSelector(({ Challenge }) => Challenge.challenge.syncMessage);
	const syncStatus = useSelector(({ Challenge }) => Challenge.challenge.syncStatus);
	const syncProgress = useSelector(({ Challenge }) => Challenge.challenge.syncProgress);
	const user = useSelector(state => state.auth.user);
	const groupId = user && user.reprGroup ? user.reprGroup.groupId : null;
	const isLoggedIn = Boolean(user && user.reprGroup);
	const isAdmin = user && user.role && user.role.includes('admin');
	const myPuuid = localStorage.getItem('camille_riot_puuid');

	const [editOpen, setEditOpen] = useState(false);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [snack, setSnack] = useState({ open: false, message: '', type: 'success' });
	const [syncComplete, setSyncComplete] = useState(false);

	const loadData = useCallback(() => {
		if (!groupId) return;
		dispatch(Actions.getChallengeDetail(groupId, challengeId));
		dispatch(Actions.getLeaderboard(groupId, challengeId));
		if (isLoggedIn) {
			dispatch(Actions.getMyStats(groupId, challengeId));
		}
	}, [dispatch, groupId, challengeId, isLoggedIn]);

	useEffect(() => {
		loadData();
		return () => {
			dispatch(Actions.clearChallengeDetail());
		};
	}, [loadData, dispatch]);

	// Handle sync request result
	useEffect(() => {
		if (!syncMessage) return;
		if (syncMessage.type === 'success') {
			setSnack({ open: true, message: '전적 갱신을 요청했습니다.', type: 'success' });
		} else if (syncMessage.type === 'error') {
			const { status, message } = syncMessage.data || {};
			if (status === 409) {
				setSnack({ open: true, message: message || '이미 갱신 중입니다.', type: 'error' });
			} else if (status === 429) {
				setSnack({ open: true, message: message || '잠시 후 다시 시도해주세요.', type: 'error' });
			}
		}
	}, [syncMessage]);

	// Poll sync-status when syncing
	useEffect(() => {
		const isSyncing = syncStatus === 'syncing' || (detail && detail.syncStatus === 'syncing');
		if (!isSyncing || !groupId) return;
		const interval = setInterval(() => {
			dispatch(Actions.getSyncStatus(groupId, challengeId));
		}, 10000);
		return () => clearInterval(interval);
	}, [syncStatus, detail, groupId, challengeId, dispatch]);

	// Start polling on 409 (someone else started sync)
	useEffect(() => {
		if (syncMessage && syncMessage.type === 'error' && syncMessage.data && syncMessage.data.status === 409 && groupId) {
			dispatch(Actions.getSyncStatus(groupId, challengeId));
		}
	}, [syncMessage, groupId, challengeId, dispatch]);

	// When sync finishes (syncing → idle), refresh data
	const prevSyncStatus = React.useRef(null);
	useEffect(() => {
		if (prevSyncStatus.current === 'syncing' && syncStatus === 'idle') {
			setSyncComplete(true);
			setSnack({ open: true, message: '전적 갱신이 완료되었습니다.', type: 'success' });
			dispatch(Actions.getChallengeDetail(groupId, challengeId));
			dispatch(Actions.getLeaderboard(groupId, challengeId));
			if (isLoggedIn) dispatch(Actions.getMyStats(groupId, challengeId));
			setTimeout(() => setSyncComplete(false), 2000);
		}
		prevSyncStatus.current = syncStatus;
	}, [syncStatus, dispatch, groupId, challengeId, isLoggedIn]);

	function handleJoin() {
		dispatch(Actions.joinChallenge(groupId, challengeId)).then(() => {
			if (isLoggedIn) dispatch(Actions.getMyStats(groupId, challengeId));
		});
	}

	function handleLeave() {
		dispatch(Actions.leaveChallenge(groupId, challengeId));
	}

	function handleSync() {
		dispatch(Actions.syncChallenge(groupId, challengeId));
	}

	function handleCancelChallenge() {
		setCancelDialogOpen(false);
		Actions.cancelChallenge(groupId, challengeId)
			.then(() => {
				setSnack({ open: true, message: '챌린지가 취소되었습니다.', type: 'success' });
				dispatch(Actions.getChallengeDetail(groupId, challengeId));
			})
			.catch(() => {
				setSnack({ open: true, message: '챌린지 취소에 실패했습니다.', type: 'error' });
			});
	}

	function handleEditSuccess() {
		setEditOpen(false);
		setSnack({ open: true, message: '챌린지가 수정되었습니다.', type: 'success' });
		dispatch(Actions.getChallengeDetail(groupId, challengeId));
	}

	function getRankClass(rank) {
		if (rank === 1) return classes.rankTop1;
		if (rank === 2) return classes.rankTop2;
		if (rank === 3) return classes.rankTop3;
		return classes.rankNormal;
	}

	function getMobileRankClass(rank) {
		if (rank === 1) return classes.mobileRankTop1;
		if (rank === 2) return classes.mobileRankTop2;
		if (rank === 3) return classes.mobileRankTop3;
		return '';
	}

	function getWinRateClass(rate) {
		if (rate >= 55) return classes.winRateHigh;
		if (rate >= 45) return classes.winRateMid;
		return classes.winRateLow;
	}

	if (!detail) {
		return (
			<FusePageSimple
				classes={{ root: classes.layoutRoot }}
				content={
					<div className={classes.loadingWrapper}>
						<CircularProgress style={{ color: '#00d4ff' }} />
					</div>
				}
			/>
		);
	}

	const statusColor = statusColors[detail.status] || '#868e96';
	const dday = detail.status === 'active' ? getDday(detail.endAt) : null;
	const isParticipant = myStats !== null;
	const canJoin = isLoggedIn && (detail.status === 'scheduled' || detail.status === 'active');

	return (
		<FusePageSimple
			classes={{ root: classes.layoutRoot }}
			header={
				<div className={classes.headerRoot}>
					<Link to="/challenge" className={classes.backLink}>
						&#8592; 챌린지 목록
					</Link>
					<div className={classes.titleRow}>
						<Typography className={classes.title} variant="h4">
							{detail.title}
						</Typography>
						<span
							className={classes.statusBadge}
							style={{
								background: `${statusColor}20`,
								color: statusColor,
								border: `1px solid ${statusColor}40`
							}}
						>
							{statusLabels[detail.status] || detail.status}
						</span>
						{dday && (
							<span className={classes.ddayText}>
								{dday}
							</span>
						)}
					</div>
					<div className={classes.infoRow}>
						<span className={classes.gameTypeBadge}>{gameTypeLabels[detail.gameType] || detail.gameType}</span>
						<span className={classes.infoBadge}>{formatDateRange(detail.startAt, detail.endAt)}</span>
						<span className={classes.infoBadge}>{detail.participantCount}명 참가</span>
						<span className={classes.infoBadge}>{scoringTypeLabels[detail.scoringType] || detail.scoringType}</span>
					</div>
					{detail.description && <div className={classes.description}>{detail.description}</div>}
					<div className={classes.actionRow}>
						{canJoin && !isParticipant && (
							<Button className={classes.joinBtn} onClick={handleJoin}>
								참가하기
							</Button>
						)}
						{canJoin && isParticipant && (
							<Button className={classes.leaveBtn} onClick={handleLeave}>
								참가 취소
							</Button>
						)}
						{isLoggedIn && (syncStatus === 'syncing' || detail.syncStatus === 'syncing') && (
							<span className={classes.syncBtn} style={{ cursor: 'default', display: 'inline-flex', alignItems: 'center' }}>
								<CircularProgress size={16} style={{ color: '#00d4ff', marginRight: 8 }} />
								{syncProgress ? `${syncProgress.done}/${syncProgress.total}명 갱신 중...` : '갱신 중...'}
							</span>
						)}
						{isLoggedIn && syncComplete && syncStatus !== 'syncing' && (
							<span className={classes.syncBtn} style={{ cursor: 'default', color: '#51cf66', borderColor: 'rgba(81, 207, 102, 0.3)' }}>
								갱신 완료!
							</span>
						)}
						{isLoggedIn && !syncComplete && syncStatus !== 'syncing' && detail.syncStatus !== 'syncing' && (
							<Button className={classes.syncBtn} onClick={handleSync} startIcon={<SyncIcon />}>
								전적 갱신
							</Button>
						)}
						{isLoggedIn && (
							<span className={classes.syncInfo}>
								마지막 갱신: {formatTimeAgo(detail.lastSyncAt)}
							</span>
						)}
						{isAdmin && detail.status !== 'canceled' && (
							<>
								<Button className={classes.adminBtn} onClick={() => setEditOpen(true)}>
									수정
								</Button>
								<Button className={classes.cancelChallengeBtn} onClick={() => setCancelDialogOpen(true)}>
									취소(중단)
								</Button>
							</>
						)}
					</div>
				</div>
			}
			content={
				<div className={classes.container}>
					{/* My Stats */}
					{myStats && (
						<div className={classes.myStatsCard}>
							<span className={classes.myStatsLabel}>
								내 순위: {myStats.rank}위
							</span>
							<div className={classes.myStatsValues}>
								<div className={classes.myStatItem}>
									<span className={classes.myStatLabel}>판수</span>
									<span className={classes.myStatValue}>{myStats.totalGames}</span>
								</div>
								<div className={classes.myStatItem}>
									<span className={classes.myStatLabel}>승</span>
									<span className={`${classes.myStatValue} ${classes.statWin}`}>{myStats.wins}</span>
								</div>
								<div className={classes.myStatItem}>
									<span className={classes.myStatLabel}>패</span>
									<span className={`${classes.myStatValue} ${classes.statLose}`}>{myStats.losses}</span>
								</div>
								<div className={classes.myStatItem}>
									<span className={classes.myStatLabel}>승률</span>
									<span className={`${classes.myStatValue} ${getWinRateClass(myStats.winRate)}`}>{myStats.winRate}%</span>
								</div>
								<div className={classes.myStatItem}>
									<span className={classes.myStatLabel}>포인트</span>
									<span className={classes.myStatValue}>{myStats.points}</span>
								</div>
							</div>
						</div>
					)}

					{/* Leaderboard */}
					<div className={classes.tableWrapper}>
						{leaderboard && leaderboard.length > 0 ? (
							<>
								{/* Desktop */}
								<div className={classes.desktopOnly}>
									<Table>
										<TableHead className={classes.tableHead}>
											<TableRow>
												<TableCell className={classes.th}>순위</TableCell>
												<TableCell className={classes.th}>소환사명</TableCell>
												<TableCell className={classes.th}>판수</TableCell>
												<TableCell className={classes.th}>승</TableCell>
												<TableCell className={classes.th}>패</TableCell>
												<TableCell className={classes.th}>승률</TableCell>
												<TableCell className={classes.th}>포인트</TableCell>
												<TableCell className={classes.th}>연승</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{leaderboard.map(row => {
												const isMe = myPuuid && row.puuid === myPuuid;
												return (
													<TableRow key={row.puuid} className={isMe ? classes.highlightRow : ''}>
														<TableCell className={classes.td}>
															<span className={`${classes.rankCell} ${getRankClass(row.rank)}`}>{row.rank}</span>
														</TableCell>
														<TableCell className={classes.td}>
															<Link to={`/challenge/${challengeId}/user/${row.puuid}`} className={classes.playerLink}>
																{row.name}
															</Link>
														</TableCell>
														<TableCell className={classes.td}>{row.totalGames}</TableCell>
														<TableCell className={`${classes.td} ${classes.statWin}`}>{row.wins}</TableCell>
														<TableCell className={`${classes.td} ${classes.statLose}`}>{row.losses}</TableCell>
														<TableCell className={`${classes.td} ${getWinRateClass(row.winRate)}`}>
															{row.winRate}%
														</TableCell>
														<TableCell className={classes.td}>{row.points}</TableCell>
														<TableCell className={classes.td}>
															{row.currentWinStreak > 0 && (
																<span className={classes.streakFire}>
																	<span role="img" aria-label="fire">&#x1F525;</span>
																	{row.currentWinStreak}
																</span>
															)}
															{row.currentLoseStreak > 0 && (
																<span className={classes.streakSkull}>
																	<span role="img" aria-label="skull">&#x1F480;</span>
																	{row.currentLoseStreak}
																</span>
															)}
														</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								</div>

								{/* Mobile */}
								<div className={classes.mobileCardList}>
									{leaderboard.map(row => {
										const isMe = myPuuid && row.puuid === myPuuid;
										return (
											<div key={row.puuid} className={classes.mobileCard} style={isMe ? { borderColor: 'rgba(0, 212, 255, 0.4)', background: 'rgba(0, 212, 255, 0.05)' } : {}}>
												<div className={classes.mobileCardTop}>
													<div className={`${classes.mobileRank} ${getMobileRankClass(row.rank)}`}>{row.rank}</div>
													<Link to={`/challenge/${challengeId}/user/${row.puuid}`} className={classes.mobileName}>
														{row.name}
													</Link>
													{row.currentWinStreak > 0 && (
														<span className={classes.streakFire}>
															<span role="img" aria-label="fire">&#x1F525;</span>
															{row.currentWinStreak}
														</span>
													)}
												</div>
												<div className={classes.mobileStats}>
													<div className={classes.mobileStatItem}>
														<span className={classes.mobileStatLabel}>판수</span>
														<span className={classes.mobileStatValue}>{row.totalGames}</span>
													</div>
													<div className={classes.mobileStatItem}>
														<span className={classes.mobileStatLabel}>승</span>
														<span className={`${classes.mobileStatValue} ${classes.statWin}`}>{row.wins}</span>
													</div>
													<div className={classes.mobileStatItem}>
														<span className={classes.mobileStatLabel}>패</span>
														<span className={`${classes.mobileStatValue} ${classes.statLose}`}>{row.losses}</span>
													</div>
													<div className={classes.mobileStatItem}>
														<span className={classes.mobileStatLabel}>승률</span>
														<span className={`${classes.mobileStatValue} ${getWinRateClass(row.winRate)}`}>{row.winRate}%</span>
													</div>
													<div className={classes.mobileStatItem}>
														<span className={classes.mobileStatLabel}>PT</span>
														<span className={classes.mobileStatValue}>{row.points}</span>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</>
						) : (
							<div className={classes.emptyState}>
								<div className={classes.emptyText}>아직 리더보드 데이터가 없습니다</div>
							</div>
						)}
					</div>

					{/* Edit Dialog */}
					{editOpen && (
						<ChallengeFormDialog
							open={editOpen}
							onClose={() => setEditOpen(false)}
							onSuccess={handleEditSuccess}
							groupId={groupId}
							challenge={detail}
						/>
					)}

					{/* Cancel Confirm Dialog */}
					<Dialog
						open={cancelDialogOpen}
						onClose={() => setCancelDialogOpen(false)}
						PaperProps={{
							style: {
								background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
								color: '#fff',
								border: '1px solid rgba(255, 107, 107, 0.3)',
								borderRadius: 16
							}
						}}
					>
						<DialogTitle style={{ fontFamily: '"Noto Sans KR", sans-serif', color: '#ff6b6b' }}>
							챌린지 취소
						</DialogTitle>
						<DialogContent>
							<DialogContentText style={{ fontFamily: '"Noto Sans KR", sans-serif', color: 'rgba(255, 255, 255, 0.7)' }}>
								정말로 이 챌린지를 취소(중단)하시겠습니까? 이 작업은 되돌릴 수 없습니다.
							</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => setCancelDialogOpen(false)} style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: '"Noto Sans KR", sans-serif' }}>
								돌아가기
							</Button>
							<Button onClick={handleCancelChallenge} style={{ color: '#ff6b6b', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 700 }}>
								취소하기
							</Button>
						</DialogActions>
					</Dialog>

					{/* Snackbar */}
					<Snackbar
						className={`${classes.snackbar} ${snack.type === 'success' ? classes.snackSuccess : classes.snackError}`}
						open={snack.open}
						autoHideDuration={3000}
						onClose={() => setSnack(prev => ({ ...prev, open: false }))}
						message={snack.message}
					/>
				</div>
			}
		/>
	);
}

export default withReducer('Challenge', reducer)(ChallengeDetail);
