import React, { useEffect } from 'react';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService';
import * as Actions from './store/actions';
import { CATEGORY_LABELS, TIER_COLORS } from './constants';

const fadeInUp = keyframes`
	0% { opacity: 0; transform: translateY(12px); }
	100% { opacity: 1; transform: translateY(0); }
`;

const useStyles = makeStyles()((theme) => ({
	container: {
		padding: 28,
		maxWidth: 1000,
		margin: '0 auto',
		width: '100%',
		[theme.breakpoints.down('md')]: {
			padding: 16
		}
	},
	backLink: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 6,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.5)',
		textDecoration: 'none',
		marginBottom: 14,
		cursor: 'pointer',
		background: 'none',
		border: 'none',
		padding: 0,
		transition: 'color 0.2s ease',
		'&:hover': {
			color: '#00d4ff'
		}
	},
	heroCard: {
		position: 'relative',
		background: 'linear-gradient(135deg, #181830 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		borderRadius: 20,
		padding: '28px 32px',
		marginBottom: 24,
		overflow: 'hidden',
		animation: `${fadeInUp} 0.5s ease`,
		[theme.breakpoints.down('sm')]: {
			padding: '20px 18px'
		}
	},
	heroTop: {
		display: 'flex',
		alignItems: 'center',
		gap: 20,
		marginBottom: 18,
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			alignItems: 'flex-start',
			gap: 12
		}
	},
	heroIconWrap: {
		width: 84,
		height: 84,
		borderRadius: 20,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
		background: 'rgba(0, 0, 0, 0.4)',
		border: '1px solid rgba(255, 255, 255, 0.08)'
	},
	heroEmoji: {
		fontSize: '3.2rem',
		lineHeight: 1
	},
	heroEmblem: {
		width: 64,
		height: 64
	},
	heroTextCol: {
		flex: 1,
		minWidth: 0
	},
	heroCategory: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.08em',
		textTransform: 'uppercase',
		marginBottom: 4,
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	heroName: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		color: '#fff',
		lineHeight: 1.1,
		marginBottom: 6,
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		flexWrap: 'wrap'
	},
	heroTierBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		fontWeight: 700,
		padding: '4px 12px',
		borderRadius: 8,
		background: 'rgba(0, 0, 0, 0.3)',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		display: 'inline-flex',
		alignItems: 'center',
		gap: 6,
		letterSpacing: '0.05em'
	},
	heroTierEmblem: {
		width: 18,
		height: 18
	},
	heroDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.7)'
	},
	heroStats: {
		display: 'grid',
		gridTemplateColumns: 'repeat(3, 1fr)',
		gap: 12,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr'
		}
	},
	heroStat: {
		padding: '12px 16px',
		borderRadius: 12,
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.06)'
	},
	heroStatLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(255, 255, 255, 0.45)',
		marginBottom: 4
	},
	heroStatValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	heroStatSub: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.9rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginTop: 2
	},
	section: {
		marginBottom: 22,
		animation: `${fadeInUp} 0.6s ease`
	},
	sectionTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		marginBottom: 12,
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	listCard: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.18)',
		borderRadius: 16,
		overflow: 'hidden'
	},
	row: {
		display: 'grid',
		gridTemplateColumns: '72px 1fr auto',
		alignItems: 'center',
		gap: 12,
		padding: '14px 20px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		textDecoration: 'none',
		transition: 'background 0.15s ease',
		'&:last-of-type': {
			borderBottom: 'none'
		},
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.04)'
		},
		[theme.breakpoints.down('sm')]: {
			padding: '12px 14px',
			gridTemplateColumns: '48px 1fr auto',
			gap: 8
		}
	},
	rowMe: {
		background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(0, 102, 255, 0.06) 100%)',
		'&:hover': {
			background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.18) 0%, rgba(0, 102, 255, 0.1) 100%)'
		}
	},
	rank: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		textAlign: 'center',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	rankTop1: {
		fontSize: '1.8rem',
		color: '#FFD700',
		textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
	},
	rankTop2: {
		fontSize: '1.8rem',
		color: '#C0C0C0',
		textShadow: '0 0 10px rgba(192, 192, 192, 0.5)'
	},
	rankTop3: {
		fontSize: '1.8rem',
		color: '#CD7F32',
		textShadow: '0 0 10px rgba(205, 127, 50, 0.5)'
	},
	rowPlayer: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: '#fff',
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	meBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.85rem',
		fontWeight: 700,
		padding: '1px 6px',
		borderRadius: 4,
		background: 'rgba(0, 212, 255, 0.2)',
		border: '1px solid rgba(0, 212, 255, 0.4)',
		color: '#00d4ff',
		letterSpacing: '0.08em'
	},
	rowRight: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.5)',
		textAlign: 'right',
		whiteSpace: 'nowrap'
	},
	progressRow: {
		display: 'grid',
		gridTemplateColumns: '1fr 120px 80px',
		alignItems: 'center',
		gap: 12,
		padding: '12px 20px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		textDecoration: 'none',
		'&:last-of-type': {
			borderBottom: 'none'
		},
		[theme.breakpoints.down('sm')]: {
			padding: '12px 14px',
			gridTemplateColumns: '1fr 80px 56px',
			gap: 8
		}
	},
	progressName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: '#fff',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	progressBar: {
		height: 10,
		borderRadius: 5,
		background: 'rgba(255, 255, 255, 0.06)',
		overflow: 'hidden'
	},
	progressBarInner: {
		height: '100%',
		background: 'linear-gradient(90deg, #00d4ff, #0066ff)',
		transition: 'width 0.5s ease'
	},
	progressBarNear: {
		background: 'linear-gradient(90deg, #ffd700, #ffaa33)',
		boxShadow: '0 0 10px rgba(255, 215, 0, 0.35)'
	},
	progressValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700,
		color: '#fff',
		textAlign: 'right'
	},
	progressNearLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.85rem',
		color: '#ffaa33',
		marginLeft: 4,
		fontWeight: 600
	},
	loading: {
		display: 'flex',
		justifyContent: 'center',
		padding: '80px 0'
	},
	emptyHint: {
		padding: 24,
		textAlign: 'center',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	noProgressNotice: {
		padding: '10px 0',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.35)',
		fontStyle: 'italic'
	}
}));

function formatAbsolute(iso) {
	if (!iso) return '';
	const d = new Date(iso);
	const y = String(d.getFullYear()).slice(-2);
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	const hh = String(d.getHours()).padStart(2, '0');
	const mm = String(d.getMinutes()).padStart(2, '0');
	return `${y}.${m}.${day} ${hh}:${mm}`;
}

function formatRelative(iso) {
	if (!iso) return '';
	const now = Date.now();
	const t = new Date(iso).getTime();
	const diff = Math.max(0, now - t);
	const sec = Math.floor(diff / 1000);
	if (sec < 60) return '방금';
	const min = Math.floor(sec / 60);
	if (min < 60) return `${min}분 전`;
	const hr = Math.floor(min / 60);
	if (hr < 24) return `${hr}시간 전`;
	const day = Math.floor(hr / 24);
	if (day < 30) return `${day}일 전`;
	const mo = Math.floor(day / 30);
	if (mo < 12) return `${mo}개월 전`;
	const yr = Math.floor(mo / 12);
	return `${yr}년 전`;
}

function AchievementRankingContent() {
	const { classes, cx } = useStyles();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { achievementId } = useParams();

	const user = useSelector(state => state.auth.user);
	const groupId = user?.reprGroup?.groupId;
	const myPuuid = camilleRiotAuthService.getPuuid();

	const ranking = useSelector(({ AchievementDashboard }) => AchievementDashboard.achievementDashboard.ranking);
	const loading = useSelector(({ AchievementDashboard }) => AchievementDashboard.achievementDashboard.rankingLoading);

	useEffect(() => {
		if (groupId && achievementId) {
			dispatch(Actions.getAchievementRanking(groupId, achievementId));
		}
	}, [dispatch, groupId, achievementId]);

	if (loading && !ranking) {
		return (
			<div className={classes.container}>
				<div className={classes.loading}>
					<CircularProgress size={40} sx={{ color: '#00d4ff' }} />
				</div>
			</div>
		);
	}

	if (!ranking || !ranking.achievement) {
		return (
			<div className={classes.container}>
				<button type="button" className={classes.backLink} onClick={() => navigate('/achievement-dashboard')}>
					<span>←</span> 대시보드로 돌아가기
				</button>
				<div className={classes.emptyHint}>업적 정보를 불러오지 못했습니다</div>
			</div>
		);
	}

	const { achievement, unlockers, topProgress, hasProgress } = ranking;
	const tierColor = TIER_COLORS[achievement.tier] || '#fff';
	const isTierCat = achievement.category === 'tier';
	const categoryLabel = CATEGORY_LABELS[achievement.category]?.label || achievement.category;
	const categoryIcon = CATEGORY_LABELS[achievement.category]?.icon;

	const iconNode = isTierCat ? (
		<img
			className={classes.heroEmblem}
			src={`/assets/images/ranked-emblems/Emblem_${String(achievement.id).replace('TIER_', '')}.webp`}
			alt={achievement.name}
		/>
	) : (
		<span role="img" aria-label={achievement.name} className={classes.heroEmoji}>
			{achievement.emoji || '🏆'}
		</span>
	);

	function getRankClass(rank) {
		if (rank === 1) return classes.rankTop1;
		if (rank === 2) return classes.rankTop2;
		if (rank === 3) return classes.rankTop3;
		return null;
	}

	function getRankDisplay(rank) {
		if (rank === 1) {
			return <span role="img" aria-label="first place">🥇</span>;
		}
		if (rank === 2) {
			return <span role="img" aria-label="second place">🥈</span>;
		}
		if (rank === 3) {
			return <span role="img" aria-label="third place">🥉</span>;
		}
		return rank;
	}

	return (
		<div className={classes.container}>
			<button type="button" className={classes.backLink} onClick={() => navigate('/achievement-dashboard')}>
				<span>←</span> 대시보드로 돌아가기
			</button>

			{/* Hero */}
			<div className={classes.heroCard} style={{ boxShadow: `0 0 32px ${tierColor}15` }}>
				<div className={classes.heroTop}>
					<div className={classes.heroIconWrap} style={{ boxShadow: `0 0 24px ${tierColor}30` }}>
						{iconNode}
					</div>
					<div className={classes.heroTextCol}>
						<div className={classes.heroCategory}>
							{categoryIcon && (
								<span role="img" aria-label={categoryLabel}>
									{categoryIcon}
								</span>
							)}
							<span>{categoryLabel}</span>
						</div>
						<div className={classes.heroName}>
							<span>{achievement.name}</span>
							<span className={classes.heroTierBadge} style={{ color: tierColor, borderColor: `${tierColor}50` }}>
								<img
									className={classes.heroTierEmblem}
									src={`/assets/images/ranked-emblems/Emblem_${achievement.tier}.webp`}
									alt={achievement.tier}
								/>
								{achievement.tier}
							</span>
						</div>
						<div className={classes.heroDesc}>{achievement.description}</div>
					</div>
				</div>

				<div className={classes.heroStats}>
					<div className={classes.heroStat}>
						<div className={classes.heroStatLabel}>달성자</div>
						<div className={classes.heroStatValue}>
							{achievement.unlockedCount}
							<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }}>명</span>
						</div>
						<div className={classes.heroStatSub}>{achievement.unlockRate?.toFixed(1)}% 달성</div>
					</div>
					<div className={classes.heroStat}>
						<div className={classes.heroStatLabel}>
							<span role="img" aria-label="first">🥇</span> 최초 달성
						</div>
						{achievement.firstUnlocker ? (
							<>
								<div className={classes.heroStatValue}>
									<Link
										to={`/userinfo/${achievement.firstUnlocker.puuid}`}
										style={{ color: '#fff', textDecoration: 'none' }}
									>
										{achievement.firstUnlocker.name}
									</Link>
								</div>
								<Tooltip title={formatAbsolute(achievement.firstUnlocker.unlockedAt)} arrow placement="top">
									<div className={classes.heroStatSub}>{formatRelative(achievement.firstUnlocker.unlockedAt)}</div>
								</Tooltip>
							</>
						) : (
							<div className={classes.heroStatValue} style={{ color: 'rgba(255,255,255,0.4)' }}>
								-
							</div>
						)}
					</div>
					<div className={classes.heroStat}>
						<div className={classes.heroStatLabel}>
							<span role="img" aria-label="recent">🕓</span> 최근 달성
						</div>
						{achievement.latestUnlocker ? (
							<>
								<div className={classes.heroStatValue}>
									<Link
										to={`/userinfo/${achievement.latestUnlocker.puuid}`}
										style={{ color: '#fff', textDecoration: 'none' }}
									>
										{achievement.latestUnlocker.name}
									</Link>
								</div>
								<Tooltip title={formatAbsolute(achievement.latestUnlocker.unlockedAt)} arrow placement="top">
									<div className={classes.heroStatSub}>{formatRelative(achievement.latestUnlocker.unlockedAt)}</div>
								</Tooltip>
							</>
						) : (
							<div className={classes.heroStatValue} style={{ color: 'rgba(255,255,255,0.4)' }}>
								-
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Unlockers */}
			<div className={classes.section}>
				<div className={classes.sectionTitle}>
					<span role="img" aria-label="trophy">🏆</span>
					<span>달성자 랭킹</span>
					<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
						빠른 순 · {unlockers?.length || 0}명
					</span>
				</div>
				<div className={classes.listCard}>
					{unlockers && unlockers.length > 0 ? (
						unlockers.map(u => {
							const isMe = u.puuid === myPuuid;
							const rankDisplay = getRankDisplay(u.rank);
							const rankCls = getRankClass(u.rank);
							return (
								<Link
									key={u.puuid}
									to={`/userinfo/${u.puuid}`}
									className={cx(classes.row, isMe && classes.rowMe)}
								>
									<div className={cx(classes.rank, rankCls)}>{rankDisplay}</div>
									<div className={classes.rowPlayer}>
										<span>{u.name}</span>
										{isMe && <span className={classes.meBadge}>ME</span>}
									</div>
									<Tooltip title={formatAbsolute(u.unlockedAt)} arrow placement="top">
										<div className={classes.rowRight}>{formatRelative(u.unlockedAt)}</div>
									</Tooltip>
								</Link>
							);
						})
					) : (
						<div className={classes.emptyHint}>아직 달성한 사람이 없어요</div>
					)}
				</div>
			</div>

			{/* Top Progress */}
			<div className={classes.section}>
				<div className={classes.sectionTitle}>
					<span role="img" aria-label="chart">📈</span>
					<span>미달성자 진행도 TOP 10</span>
				</div>
				<div className={classes.listCard}>
					{!hasProgress ? (
						<div className={classes.noProgressNotice} style={{ padding: 20 }}>
							이 업적은 진행도 추적을 지원하지 않습니다
						</div>
					) : topProgress && topProgress.length > 0 ? (
						topProgress.map(p => {
							const isMe = p.puuid === myPuuid;
							const near = (p.goal - p.currentValue) === 1;
							return (
								<Link
									key={p.puuid}
									to={`/userinfo/${p.puuid}`}
									className={cx(classes.progressRow, isMe && classes.rowMe)}
									style={{ textDecoration: 'none' }}
								>
									<div className={classes.progressName}>
										<span>{p.name}</span>
										{isMe && <span className={classes.meBadge}>ME</span>}
										{near && <span className={classes.progressNearLabel}>한 판 남음!</span>}
									</div>
									<div className={classes.progressBar}>
										<div
											className={cx(classes.progressBarInner, near && classes.progressBarNear)}
											style={{ width: `${Math.min(100, p.progressRate || 0)}%` }}
										/>
									</div>
									<div className={classes.progressValue}>
										{p.currentValue}/{p.goal}
									</div>
								</Link>
							);
						})
					) : (
						<div className={classes.emptyHint}>진행 중인 유저가 없어요</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default AchievementRankingContent;
