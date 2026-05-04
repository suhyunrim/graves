import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from 'tss-react/mui';
import {
	Typography,
	Button,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Tooltip,
	Tabs,
	Tab,
	FormControlLabel,
	Switch
} from '@mui/material';
import useToast from 'app/utility/useToast';
import { getProfileIconUrl } from 'app/main/challenge/ddragonUtils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import useDialogStyles from '../components/dialogStyles';
import reducer from './store/reducers';
import * as Actions from './store/actions';
import {
	STATUS,
	STATUS_LABELS,
	STATUS_COLORS,
	checkIsAdmin,
	bracketSizeForTeamCount,
	getTierName,
	getTierLabel,
	getTierShortLabel,
	getTierEmblemUrl
} from './tournamentUtils';
import PositionIcon from './PositionIcon';
import TournamentBracket from './TournamentBracket';
import TeamFormDialog from './TeamFormDialog';
import SlotMappingDialog from './SlotMappingDialog';
import MatchResultDialog from './MatchResultDialog';
import ScrimContent from './ScrimContent';

const useStyles = makeStyles()((theme) => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	},
	headerRoot: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		padding: '20px 28px 18px',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		[theme.breakpoints.down('sm')]: {
			padding: '14px 16px 12px'
		}
	},
	backRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginBottom: 8
	},
	backBtn: {
		color: 'rgba(255, 255, 255, 0.5)',
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.08)'
		}
	},
	titleRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 14,
		flexWrap: 'wrap'
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '3.2rem',
		color: '#fff',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
		margin: 0,
		[theme.breakpoints.down('md')]: {
			fontSize: '2.4rem'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '2rem',
			letterSpacing: '0.02em'
		}
	},
	statusBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		padding: '4px 14px',
		borderRadius: 20,
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.05rem',
			padding: '3px 10px'
		}
	},
	metaRow: {
		display: 'flex',
		gap: 14,
		marginTop: 10,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.55)',
		flexWrap: 'wrap',
		[theme.breakpoints.down('sm')]: {
			gap: 6,
			fontSize: '1.15rem'
		}
	},
	metaPill: {
		background: 'rgba(0, 212, 255, 0.08)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		borderRadius: 16,
		padding: '3px 12px',
		[theme.breakpoints.down('sm')]: {
			padding: '2px 9px',
			borderRadius: 12
		}
	},
	championBanner: {
		marginTop: 14,
		padding: '14px 18px',
		background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.18) 0%, rgba(255, 215, 0, 0.06) 100%)',
		border: '1px solid rgba(255, 215, 0, 0.4)',
		borderRadius: 14,
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: '#ffd700',
		fontWeight: 700,
		letterSpacing: '0.03em',
		[theme.breakpoints.down('sm')]: {
			padding: '10px 14px',
			fontSize: '1.35rem',
			gap: 8,
			borderRadius: 12
		}
	},
	championIcon: {
		fontSize: '2.4rem',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.8rem'
		}
	},
	container: {
		padding: '24px 28px',
		maxWidth: 1400,
		margin: '0 auto',
		width: '100%',
		minWidth: 0,
		[theme.breakpoints.down('sm')]: {
			padding: '16px'
		}
	},
	section: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 16,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		padding: '24px 28px',
		marginBottom: 24,
		// 안의 가로 스크롤 영역(브래킷 등)이 페이지로 새지 않도록 격리
		minWidth: 0,
		overflow: 'hidden',
		[theme.breakpoints.down('sm')]: {
			padding: '18px 20px',
			borderRadius: 14
		}
	},
	sectionHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 18,
		gap: 12,
		flexWrap: 'wrap'
	},
	sectionTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.04em',
		textTransform: 'uppercase',
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		'&::before': {
			content: '""',
			display: 'inline-block',
			width: 4,
			height: 22,
			borderRadius: 2,
			background: 'linear-gradient(180deg, #00d4ff, #0066ff)'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.5rem',
			gap: 10,
			'&::before': { height: 18 }
		}
	},
	primaryBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.15rem',
		padding: '6px 16px',
		borderRadius: 10,
		textTransform: 'none',
		boxShadow: '0 4px 14px rgba(0, 212, 255, 0.2)',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)'
		},
		'&.Mui-disabled': {
			background: 'rgba(255, 255, 255, 0.08)',
			color: 'rgba(255, 255, 255, 0.3)',
			boxShadow: 'none'
		}
	},
	dangerBtn: {
		background: 'rgba(255, 107, 107, 0.12)',
		color: '#ff6b6b',
		border: '1px solid rgba(255, 107, 107, 0.3)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 600,
		fontSize: '1.1rem',
		padding: '4px 12px',
		borderRadius: 10,
		textTransform: 'none',
		'&:hover': {
			background: 'rgba(255, 107, 107, 0.22)'
		}
	},
	teamGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
		gap: 14,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr',
			gap: 12
		}
	},
	teamCard: {
		background: 'rgba(0, 0, 0, 0.25)',
		border: '1px solid rgba(0, 212, 255, 0.15)',
		borderRadius: 12,
		padding: '14px 16px',
		[theme.breakpoints.down('sm')]: {
			padding: '12px 14px'
		}
	},
	teamCardHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
		gap: 8
	},
	teamName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: '#00d4ff',
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.35rem'
		}
	},
	teamActions: {
		display: 'flex',
		gap: 4,
		flexShrink: 0
	},
	teamActionBtn: {
		color: 'rgba(255, 255, 255, 0.5)',
		padding: 4,
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.08)'
		}
	},
	teamActionBtnDanger: {
		color: 'rgba(255, 255, 255, 0.5)',
		padding: 4,
		'&:hover': {
			color: '#ff6b6b',
			background: 'rgba(255, 107, 107, 0.08)'
		}
	},
	memberList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 6
	},
	memberRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		padding: '4px 0',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.85)',
		[theme.breakpoints.down('sm')]: {
			gap: 8,
			fontSize: '1.1rem'
		}
	},
	memberPositionCell: {
		width: 22,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0
	},
	memberPositionIcon: {
		width: 20,
		height: 20,
		color: '#00d4ff'
	},
	memberPositionFallback: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(0, 212, 255, 0.7)',
		fontWeight: 600
	},
	memberAvatar: {
		width: 24,
		height: 24,
		borderRadius: 6,
		flexShrink: 0
	},
	memberAvatarPlaceholder: {
		width: 24,
		height: 24,
		borderRadius: 6,
		background: 'rgba(0, 212, 255, 0.15)',
		flexShrink: 0
	},
	memberName: {
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	captainStar: {
		fontSize: '1.2rem',
		color: '#ffd700'
	},
	memberTier: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4,
		flexShrink: 0
	},
	memberTierEmblem: {
		width: 18,
		height: 18,
		opacity: 0.9
	},
	memberTierShort: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.05rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.7)',
		letterSpacing: '0.02em',
		minWidth: 18,
		textAlign: 'right'
	},
	teamTierBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 6,
		marginTop: 2,
		marginBottom: 10,
		padding: '4px 10px',
		borderRadius: 20,
		background: 'rgba(0, 0, 0, 0.3)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 600,
		letterSpacing: '0.02em',
		color: 'rgba(255, 255, 255, 0.85)',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.05rem',
			padding: '3px 9px'
		}
	},
	teamTierEmblem: {
		width: 22,
		height: 22
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: 40
	},
	loadingWrapper: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: 60
	},
	tabs: {
		marginBottom: 20,
		'& .MuiTabs-indicator': {
			background: '#00d4ff'
		}
	},
	tab: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.5)',
		textTransform: 'none',
		minWidth: 100,
		'&.Mui-selected': {
			color: '#00d4ff'
		}
	},
	verboseToggle: {
		marginRight: 0,
		'& .MuiFormControlLabel-label': {
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.15rem',
			color: 'rgba(255, 255, 255, 0.6)'
		},
		'& .MuiSwitch-switchBase.Mui-checked': {
			color: '#00d4ff'
		},
		'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
			backgroundColor: '#00d4ff'
		},
		[theme.breakpoints.down('sm')]: {
			'& .MuiFormControlLabel-label': {
				fontSize: '1.05rem'
			}
		}
	},
	headerActions: {
		marginTop: 14,
		display: 'flex',
		gap: 10,
		flexWrap: 'wrap'
	},
	teamCount: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginLeft: 4
	}
}));

function TournamentDetail() {
	const { classes } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { tournamentId } = useParams();
	const toast = useToast();

	const detail = useSelector(({ Tournament }) => Tournament.tournament.detail);
	const teams = useSelector(({ Tournament }) => Tournament.tournament.teams);
	const matches = useSelector(({ Tournament }) => Tournament.tournament.matches);
	const scrims = useSelector(({ Tournament }) => Tournament.tournament.scrims);
	const roundLabels = useSelector(({ Tournament }) => Tournament.tournament.roundLabels);
	const loadingDetail = useSelector(({ Tournament }) => Tournament.tournament.loadingDetail);
	const activeMembers = useSelector(({ Tournament }) => Tournament.tournament.activeMembers);
	const user = useSelector(state => state.auth.user);
	const isAdmin = checkIsAdmin(user);

	const [teamFormOpen, setTeamFormOpen] = useState(false);
	const [editingTeam, setEditingTeam] = useState(null);
	const [deleteTeamTarget, setDeleteTeamTarget] = useState(null);
	const [slotMappingOpen, setSlotMappingOpen] = useState(false);
	const [matchEditTarget, setMatchEditTarget] = useState(null);
	const [deleteTournamentOpen, setDeleteTournamentOpen] = useState(false);
	const [activeTab, setActiveTab] = useState(0);
	const [bracketVerbose, setBracketVerbose] = useState(false);

	const teamMap = useMemo(() => {
		const m = new Map();
		teams.forEach(t => m.set(t.id, t));
		return m;
	}, [teams]);

	const memberMap = useMemo(() => {
		const m = new Map();
		(activeMembers || []).forEach(am => m.set(am.puuid, am));
		return m;
	}, [activeMembers]);

	const championTeam = detail && detail.championTeamId ? teamMap.get(detail.championTeamId) : null;

	function reload() {
		dispatch(Actions.getTournamentDetail(tournamentId));
	}

	useEffect(() => {
		dispatch(Actions.getTournamentDetail(tournamentId));
		return () => {
			dispatch(Actions.clearTournamentDetail());
		};
	}, [dispatch, tournamentId]);

	useEffect(() => {
		// 멤버 닉네임/아이콘/티어 매핑용. 권한 없는 사용자는 silentError 로 흡수.
		if (detail && detail.groupId) {
			dispatch(Actions.getActiveMembers(detail.groupId));
		}
	}, [dispatch, detail]);

	function handleTeamCreate() {
		setEditingTeam(null);
		setTeamFormOpen(true);
	}

	function handleTeamEdit(team) {
		setEditingTeam(team);
		setTeamFormOpen(true);
	}

	function handleTeamFormSuccess() {
		setTeamFormOpen(false);
		setEditingTeam(null);
		toast.success('팀이 저장되었습니다.');
		reload();
	}

	function handleTeamDelete() {
		const target = deleteTeamTarget;
		if (!target) return;
		Actions.deleteTeam(tournamentId, target.id)
			.then(() => {
				setDeleteTeamTarget(null);
				toast.success('팀이 삭제되었습니다.');
				reload();
			})
			.catch(err => {
				const msg = err.response && err.response.data ? err.response.data.result : '삭제 실패';
				toast.error(msg);
			});
	}

	function handleStartSuccess() {
		setSlotMappingOpen(false);
		toast.success('토너먼트가 시작되었습니다.');
		reload();
	}

	function handleMatchResultSuccess() {
		setMatchEditTarget(null);
		toast.success('매치 결과가 저장되었습니다.');
		reload();
	}

	function handleTournamentDelete() {
		Actions.deleteTournament(tournamentId)
			.then(() => {
				toast.success('토너먼트가 삭제되었습니다.');
				navigate('/tournament');
			})
			.catch(err => {
				setDeleteTournamentOpen(false);
				const msg = err.response && err.response.data ? err.response.data.result : '삭제 실패';
				toast.error(msg);
			});
	}

	if (loadingDetail && !detail) {
		return (
			<FusePageSimple
				classes={{ root: classes.layoutRoot }}
				content={<div className={classes.loadingWrapper}>불러오는 중...</div>}
			/>
		);
	}

	if (!detail) {
		return (
			<FusePageSimple
				classes={{ root: classes.layoutRoot }}
				content={<div className={classes.emptyText}>토너먼트를 찾을 수 없습니다.</div>}
			/>
		);
	}

	const statusColor = STATUS_COLORS[detail.status] || '#868e96';
	const isPreparing = detail.status === STATUS.PREPARING;
	const isInProgress = detail.status === STATUS.IN_PROGRESS;
	const isFinished = detail.status === STATUS.FINISHED;
	const teamCount = teams.length;
	const canStart = isAdmin && isPreparing && teamCount >= 2;
	// preparation 단계에선 detail.bracketSize/teamCount 가 null. 시작 시점에 등록된 팀 수로 산출한다.
	const computedBracketSize = bracketSizeForTeamCount(teamCount);

	return (
		<FusePageSimple
			classes={{ root: classes.layoutRoot }}
			header={
				<div className={classes.headerRoot}>
					<div className={classes.backRow}>
						<IconButton className={classes.backBtn} onClick={() => navigate('/tournament')} size="small">
							<ArrowBackIcon />
						</IconButton>
					</div>
					<div className={classes.titleRow}>
						<Typography className={classes.title} variant="h4">{detail.name}</Typography>
						<span
							className={classes.statusBadge}
							style={{
								background: `${statusColor}20`,
								color: statusColor,
								border: `1px solid ${statusColor}40`
							}}
						>
							{STATUS_LABELS[detail.status] || detail.status}
						</span>
					</div>
					<div className={classes.metaRow}>
						<span className={classes.metaPill}>
							{detail.bracketSize != null
								? `${detail.teamCount}팀 · ${detail.bracketSize}강`
								: `${teamCount}팀 등록됨`}
						</span>
						<span className={classes.metaPill}>BO{detail.defaultBestOf}</span>
						<span className={classes.metaPill}>결승 BO{detail.finalBestOf}</span>
					</div>
					{championTeam && (
						<div className={classes.championBanner}>
							<EmojiEventsIcon className={classes.championIcon} />
							우승 — {championTeam.name}
						</div>
					)}
					{isAdmin && (
						<div className={classes.headerActions}>
							{isPreparing && (
								<Tooltip title={canStart ? '' : '팀이 2개 이상 등록되어야 시작할 수 있습니다.'} arrow>
									<span>
										<Button
											className={classes.primaryBtn}
											startIcon={<PlayArrowIcon />}
											onClick={() => setSlotMappingOpen(true)}
											disabled={!canStart}
										>
											브래킷 배치 & 시작
										</Button>
									</span>
								</Tooltip>
							)}
							<Button
								className={classes.dangerBtn}
								startIcon={<DeleteIcon />}
								onClick={() => setDeleteTournamentOpen(true)}
							>
								토너먼트 삭제
							</Button>
						</div>
					)}
				</div>
			}
			content={
				<div className={classes.container}>
					{(isInProgress || isFinished) && (
						<Tabs
							value={activeTab}
							onChange={(_, v) => setActiveTab(v)}
							className={classes.tabs}
						>
							<Tab label="대진표" className={classes.tab} />
							<Tab label="스크림" className={classes.tab} />
						</Tabs>
					)}

					{(isInProgress || isFinished) && activeTab === 0 && (
						<div className={classes.section}>
							<div className={classes.sectionHeader}>
								<div className={classes.sectionTitle}>대진표</div>
								<FormControlLabel
									className={classes.verboseToggle}
									control={
										<Switch
											size="small"
											checked={bracketVerbose}
											onChange={e => setBracketVerbose(e.target.checked)}
										/>
									}
									label="자세히 보기"
								/>
							</div>
							<TournamentBracket
								matches={matches}
								teams={teams}
								roundLabels={roundLabels}
								championTeamId={detail.championTeamId}
								canEdit={isAdmin && isInProgress}
								onEditMatch={(m) => setMatchEditTarget(m)}
								verbose={bracketVerbose}
								activeMembers={activeMembers}
							/>
						</div>
					)}

					{(isInProgress || isFinished) && activeTab === 1 && (
						<ScrimContent
							tournamentId={tournamentId}
							teams={teams}
							scrims={scrims}
							onMutated={reload}
						/>
					)}

					{(isPreparing || activeTab === 0) && (
					<div className={classes.section}>
						<div className={classes.sectionHeader}>
							<div className={classes.sectionTitle}>
								참가팀
								<span className={classes.teamCount}>({teamCount})</span>
							</div>
							{isAdmin && isPreparing && (
								<Button
									className={classes.primaryBtn}
									startIcon={<AddIcon />}
									onClick={handleTeamCreate}
								>
									팀 등록
								</Button>
							)}
						</div>
						{teams.length === 0 ? (
							<div className={classes.emptyText}>등록된 팀이 없습니다</div>
						) : (
							<div className={classes.teamGrid}>
								{teams.map(t => {
									const avgRating = t.avgRating;
									const tierName = getTierName(avgRating);
									const tierLabel = getTierLabel(avgRating);
									const tierEmblem = getTierEmblemUrl(tierName);
									return (
										<div key={t.id} className={classes.teamCard}>
											<div className={classes.teamCardHeader}>
												<span className={classes.teamName}>{t.name}</span>
												{isAdmin && isPreparing && (
													<div className={classes.teamActions}>
														<IconButton
															className={classes.teamActionBtn}
															onClick={() => handleTeamEdit(t)}
															size="small"
														>
															<EditIcon fontSize="small" />
														</IconButton>
														<IconButton
															className={classes.teamActionBtnDanger}
															onClick={() => setDeleteTeamTarget(t)}
															size="small"
														>
															<DeleteIcon fontSize="small" />
														</IconButton>
													</div>
												)}
											</div>
											{tierLabel && (
												<div className={classes.teamTierBadge}>
													{tierEmblem && (
														<img src={tierEmblem} alt={tierName} className={classes.teamTierEmblem} />
													)}
													팀 평균 {tierLabel}
												</div>
											)}
											<div className={classes.memberList}>
												{(t.members || []).map(m => {
													const memberInfo = memberMap.get(m.puuid);
													const displayName = memberInfo ? memberInfo.name : `${m.puuid.slice(0, 8)}…`;
													const avatarUrl = memberInfo
														? getProfileIconUrl(memberInfo.profileIconId)
														: null;
													const memberRating = memberInfo ? memberInfo.rating : null;
													const memberTierName = getTierName(memberRating);
													const memberTierLabel = getTierLabel(memberRating);
													const memberTierShort = getTierShortLabel(memberRating);
													const memberTierEmblem = getTierEmblemUrl(memberTierName);
													const isCaptain = t.captainPuuid === m.puuid;
													return (
														<div key={m.puuid} className={classes.memberRow}>
															<div className={classes.memberPositionCell}>
																<PositionIcon
																	position={m.position}
																	className={classes.memberPositionIcon}
																	fallbackClassName={classes.memberPositionFallback}
																/>
															</div>
															{avatarUrl ? (
																<img src={avatarUrl} alt="" className={classes.memberAvatar} />
															) : (
																<div className={classes.memberAvatarPlaceholder} />
															)}
															<span className={classes.memberName}>{displayName}</span>
															{isCaptain && <StarIcon className={classes.captainStar} />}
															{memberTierShort && (
																<span className={classes.memberTier} title={memberTierLabel}>
																	{memberTierEmblem && (
																		<img
																			src={memberTierEmblem}
																			alt=""
																			className={classes.memberTierEmblem}
																		/>
																	)}
																	<span className={classes.memberTierShort}>{memberTierShort}</span>
																</span>
															)}
														</div>
													);
												})}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
					)}

					{teamFormOpen && (
						<TeamFormDialog
							open={teamFormOpen}
							onClose={() => {
								setTeamFormOpen(false);
								setEditingTeam(null);
							}}
							onSuccess={handleTeamFormSuccess}
							tournamentId={tournamentId}
							team={editingTeam}
							allTeams={teams}
							activeMembers={activeMembers}
						/>
					)}
					{slotMappingOpen && (
						<SlotMappingDialog
							open={slotMappingOpen}
							onClose={() => setSlotMappingOpen(false)}
							onSuccess={handleStartSuccess}
							tournamentId={tournamentId}
							teams={teams}
							bracketSize={computedBracketSize}
						/>
					)}
					{matchEditTarget && (
						<MatchResultDialog
							open={Boolean(matchEditTarget)}
							onClose={() => setMatchEditTarget(null)}
							onSuccess={handleMatchResultSuccess}
							match={matchEditTarget}
							team1={teamMap.get(matchEditTarget.team1Id)}
							team2={teamMap.get(matchEditTarget.team2Id)}
						/>
					)}
					{deleteTeamTarget && (
						<Dialog
							open={Boolean(deleteTeamTarget)}
							onClose={() => setDeleteTeamTarget(null)}
							slotProps={{ paper: { className: dialogClasses.paperDestructive } }}
						>
							<DialogTitle className={dialogClasses.titleDestructive}>팀 삭제</DialogTitle>
							<DialogContent>
								<DialogContentText className={dialogClasses.contentText}>
									‘{deleteTeamTarget.name}’ 팀을 삭제하시겠습니까?
								</DialogContentText>
							</DialogContent>
							<DialogActions>
								<Button
									className={dialogClasses.destructiveCancelBtn}
									onClick={() => setDeleteTeamTarget(null)}
								>
									취소
								</Button>
								<Button
									className={dialogClasses.destructiveConfirmBtn}
									onClick={handleTeamDelete}
								>
									삭제
								</Button>
							</DialogActions>
						</Dialog>
					)}
					{deleteTournamentOpen && (
						<Dialog
							open={deleteTournamentOpen}
							onClose={() => setDeleteTournamentOpen(false)}
							slotProps={{ paper: { className: dialogClasses.paperDestructive } }}
						>
							<DialogTitle className={dialogClasses.titleDestructive}>토너먼트 삭제</DialogTitle>
							<DialogContent>
								<DialogContentText className={dialogClasses.contentText}>
									‘{detail.name}’ 토너먼트와 모든 팀/매치 정보가 삭제됩니다. 계속하시겠습니까?
								</DialogContentText>
							</DialogContent>
							<DialogActions>
								<Button
									className={dialogClasses.destructiveCancelBtn}
									onClick={() => setDeleteTournamentOpen(false)}
								>
									취소
								</Button>
								<Button
									className={dialogClasses.destructiveConfirmBtn}
									onClick={handleTournamentDelete}
								>
									삭제
								</Button>
							</DialogActions>
						</Dialog>
					)}
				</div>
			}
		/>
	);
}

export default withReducer('Tournament', reducer)(TournamentDetail);
