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
	Tooltip
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
	STATUS_LABELS,
	STATUS_COLORS,
	POSITION_LABELS,
	checkIsAdmin,
	bracketSizeForTeamCount
} from './tournamentUtils';
import TournamentBracket from './TournamentBracket';
import TeamFormDialog from './TeamFormDialog';
import SlotMappingDialog from './SlotMappingDialog';
import MatchResultDialog from './MatchResultDialog';

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
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
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
		}
	},
	statusBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		padding: '4px 14px',
		borderRadius: 20
	},
	metaRow: {
		display: 'flex',
		gap: 14,
		marginTop: 10,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.55)',
		flexWrap: 'wrap'
	},
	metaPill: {
		background: 'rgba(0, 212, 255, 0.08)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		borderRadius: 16,
		padding: '3px 12px'
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
		letterSpacing: '0.03em'
	},
	championIcon: {
		fontSize: '2.4rem'
	},
	container: {
		padding: '24px 28px',
		maxWidth: 1400,
		margin: '0 auto',
		width: '100%',
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
		gap: 14
	},
	teamCard: {
		background: 'rgba(0, 0, 0, 0.25)',
		border: '1px solid rgba(0, 212, 255, 0.15)',
		borderRadius: 12,
		padding: '14px 16px'
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
		whiteSpace: 'nowrap'
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
		color: 'rgba(255, 255, 255, 0.85)'
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
	memberPosition: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		background: 'rgba(255, 255, 255, 0.05)',
		padding: '2px 8px',
		borderRadius: 8
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

	const teamMap = useMemo(() => {
		const m = new Map();
		teams.forEach(t => m.set(t.id, t));
		return m;
	}, [teams]);

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
		// 어드민이고 토너먼트가 그룹에 묶여 있을 때만 멤버 풀 미리 받아둔다 (팀 등록 모달용)
		if (isAdmin && detail && detail.groupId) {
			dispatch(Actions.getActiveMembers(detail.groupId));
		}
	}, [dispatch, isAdmin, detail]);

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
	const isPreparing = detail.status === 'preparing';
	const isInProgress = detail.status === 'in_progress';
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
					{(isInProgress || detail.status === 'finished') && (
						<div className={classes.section}>
							<div className={classes.sectionHeader}>
								<div className={classes.sectionTitle}>대진표</div>
							</div>
							<TournamentBracket
								matches={matches}
								teams={teams}
								roundLabels={roundLabels}
								championTeamId={detail.championTeamId}
								canEdit={isAdmin && isInProgress}
								onEditMatch={(m) => setMatchEditTarget(m)}
							/>
						</div>
					)}

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
								{teams.map(t => (
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
										<div className={classes.memberList}>
											{(t.members || []).map(m => {
												const memberInfo = activeMembers.find(am => am.puuid === m.puuid);
												const displayName = memberInfo ? memberInfo.name : `${m.puuid.slice(0, 8)}…`;
												const avatarUrl = memberInfo
													? getProfileIconUrl(memberInfo.profileIconId)
													: null;
												const isCaptain = t.captainPuuid === m.puuid;
												return (
													<div key={m.puuid} className={classes.memberRow}>
														{avatarUrl ? (
															<img src={avatarUrl} alt="" className={classes.memberAvatar} />
														) : (
															<div className={classes.memberAvatarPlaceholder} />
														)}
														<span className={classes.memberName}>{displayName}</span>
														{isCaptain && <StarIcon className={classes.captainStar} />}
														<span className={classes.memberPosition}>
															{POSITION_LABELS[m.position] || m.position}
														</span>
													</div>
												);
											})}
										</div>
									</div>
								))}
							</div>
						)}
					</div>

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
