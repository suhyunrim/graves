import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from 'tss-react/mui';
import { Typography, Button } from '@mui/material';
import useToast from 'app/utility/useToast';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProfileIconUrl } from 'app/main/challenge/ddragonUtils';
import reducer from './store/reducers';
import * as Actions from './store/actions';
import TournamentCreateDialog from './TournamentCreateDialog';
import PositionIcon from './PositionIcon';
import { STATUS_LABELS, STATUS_COLORS, checkIsAdmin } from './tournamentUtils';

const useStyles = makeStyles()((theme) => ({
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
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '4rem',
		color: '#fff',
		textTransform: 'uppercase',
		letterSpacing: '0.15em',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
		margin: 0,
		[theme.breakpoints.down('md')]: {
			fontSize: '2.75rem',
			letterSpacing: '0.08em'
		}
	},
	subtitleRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 10,
		gap: 12,
		flexWrap: 'wrap'
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.6)',
		letterSpacing: '0.05em',
		[theme.breakpoints.down('md')]: {
			fontSize: '1.35rem'
		}
	},
	createBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.2rem',
		padding: '8px 20px',
		borderRadius: 12,
		textTransform: 'none',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1rem',
			padding: '6px 14px'
		}
	},
	container: {
		padding: '28px',
		maxWidth: 1400,
		margin: '0 auto',
		width: '100%',
		[theme.breakpoints.down('sm')]: {
			padding: '16px'
		}
	},
	cardGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
		gap: 20,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr',
			gap: 14
		}
	},
	card: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.2)',
		padding: '24px',
		transition: 'all 0.3s ease',
		textDecoration: 'none',
		display: 'block',
		'&:hover': {
			borderColor: 'rgba(0, 212, 255, 0.5)',
			transform: 'translateY(-4px)',
			boxShadow: '0 8px 30px rgba(0, 212, 255, 0.15)'
		},
		[theme.breakpoints.down('sm')]: {
			padding: '18px',
			borderRadius: 16
		}
	},
	cardHeader: {
		display: 'flex',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		marginBottom: 12,
		gap: 12
	},
	cardTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff',
		lineHeight: 1.3,
		flex: 1,
		minWidth: 0,
		wordBreak: 'break-word',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.55rem'
		}
	},
	statusBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		padding: '4px 12px',
		borderRadius: 20,
		whiteSpace: 'nowrap',
		flexShrink: 0
	},
	cardMeta: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)',
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		marginBottom: 6
	},
	cardChampion: {
		marginTop: 12,
		paddingTop: 12,
		borderTop: '1px solid rgba(255, 255, 255, 0.08)'
	},
	championHead: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#ffd700',
		letterSpacing: '0.02em',
		marginBottom: 8
	},
	championMembers: {
		display: 'flex',
		flexDirection: 'column',
		gap: 4
	},
	championMemberRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.85)'
	},
	championPositionCell: {
		width: 18,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0
	},
	championPositionIcon: {
		width: 16,
		height: 16,
		color: '#00d4ff'
	},
	championPositionFallback: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.9rem',
		color: 'rgba(0, 212, 255, 0.7)',
		fontWeight: 600
	},
	championAvatar: {
		width: 20,
		height: 20,
		borderRadius: 4,
		flexShrink: 0
	},
	championAvatarPlaceholder: {
		width: 20,
		height: 20,
		borderRadius: 4,
		background: 'rgba(0, 212, 255, 0.15)',
		flexShrink: 0
	},
	championMemberName: {
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	championCaptainStar: {
		fontSize: '1rem',
		color: '#ffd700'
	},
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '80px 20px',
		textAlign: 'center'
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	loadingWrapper: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: 60
	}
}));

function TournamentList() {
	const { classes } = useStyles();
	const dispatch = useDispatch();
	const list = useSelector(({ Tournament }) => Tournament.tournament.list);
	const loadingList = useSelector(({ Tournament }) => Tournament.tournament.loadingList);
	const activeMembers = useSelector(({ Tournament }) => Tournament.tournament.activeMembers);
	const user = useSelector(state => state.auth.user);
	const groupId = user && user.reprGroup ? user.reprGroup.groupId : null;
	const isAdmin = checkIsAdmin(user);
	const [createOpen, setCreateOpen] = useState(false);
	const toast = useToast();

	useEffect(() => {
		if (groupId) {
			dispatch(Actions.getTournamentList(groupId));
			// 우승팀 멤버 닉네임/아이콘 매핑용
			dispatch(Actions.getActiveMembers(groupId));
		}
	}, [dispatch, groupId]);

	const memberMap = useMemo(() => {
		const m = new Map();
		(activeMembers || []).forEach(am => m.set(am.puuid, am));
		return m;
	}, [activeMembers]);

	function handleCreateSuccess() {
		setCreateOpen(false);
		toast.success('토너먼트가 생성되었습니다.');
		if (groupId) {
			dispatch(Actions.getTournamentList(groupId));
		}
	}

	return (
		<FusePageSimple
			classes={{ root: classes.layoutRoot }}
			header={
				<div className={classes.headerRoot}>
					<Typography className={classes.title} variant="h4">
						Tournament
					</Typography>
					<div className={classes.subtitleRow}>
						<Typography className={classes.subtitle}>커스텀 토너먼트</Typography>
						{isAdmin && (
							<Button
								className={classes.createBtn}
								onClick={() => setCreateOpen(true)}
								startIcon={<AddIcon />}
							>
								토너먼트 생성
							</Button>
						)}
					</div>
				</div>
			}
			content={
				<div className={classes.container}>
					{loadingList ? (
						<div className={classes.loadingWrapper}>불러오는 중...</div>
					) : list && list.length > 0 ? (
						<div className={classes.cardGrid}>
							{list.map(t => {
								const statusColor = STATUS_COLORS[t.status] || '#868e96';
								return (
									<Link key={t.id} to={`/tournament/${t.id}`} className={classes.card}>
										<div className={classes.cardHeader}>
											<span className={classes.cardTitle}>{t.name}</span>
											<span
												className={classes.statusBadge}
												style={{
													background: `${statusColor}20`,
													color: statusColor,
													border: `1px solid ${statusColor}40`
												}}
											>
												{STATUS_LABELS[t.status] || t.status}
											</span>
										</div>
										{t.teamCount != null && t.bracketSize != null && (
											<div className={classes.cardMeta}>
												<GroupIcon style={{ fontSize: '1.4rem' }} />
												{t.teamCount}팀 / {t.bracketSize}강 브래킷
											</div>
										)}
										<div className={classes.cardMeta}>
											BO{t.defaultBestOf} (결승 BO{t.finalBestOf})
										</div>
										{t.championTeam && (
											<div className={classes.cardChampion}>
												<div className={classes.championHead}>
													<EmojiEventsIcon style={{ fontSize: '1.6rem' }} />
													우승 — {t.championTeam.name}
												</div>
												<div className={classes.championMembers}>
													{(t.championTeam.members || []).map(m => {
														const info = memberMap.get(m.puuid);
														const displayName = info ? info.name : `${m.puuid.slice(0, 8)}…`;
														const avatarUrl = info ? getProfileIconUrl(info.profileIconId) : null;
														const isCaptain = t.championTeam.captainPuuid === m.puuid;
														return (
															<div key={m.puuid} className={classes.championMemberRow}>
																<div className={classes.championPositionCell}>
																	<PositionIcon
																		position={m.position}
																		className={classes.championPositionIcon}
																		fallbackClassName={classes.championPositionFallback}
																	/>
																</div>
																{avatarUrl ? (
																	<img src={avatarUrl} alt="" className={classes.championAvatar} />
																) : (
																	<div className={classes.championAvatarPlaceholder} />
																)}
																<span className={classes.championMemberName}>{displayName}</span>
																{isCaptain && <StarIcon className={classes.championCaptainStar} />}
															</div>
														);
													})}
												</div>
											</div>
										)}
									</Link>
								);
							})}
						</div>
					) : (
						<div className={classes.emptyState}>
							<div className={classes.emptyText}>등록된 토너먼트가 없습니다</div>
						</div>
					)}
					{createOpen && (
						<TournamentCreateDialog
							open={createOpen}
							onClose={() => setCreateOpen(false)}
							onSuccess={handleCreateSuccess}
							groupId={groupId}
						/>
					)}
				</div>
			}
		/>
	);
}

export default withReducer('Tournament', reducer)(TournamentList);
