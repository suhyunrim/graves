import React, { useEffect } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService';
import * as Actions from './store/actions';

const TIER_COLORS = {
	BRONZE: '#CD7F32',
	SILVER: '#C0C0C0',
	GOLD: '#FFD700',
	PLATINUM: '#00CED1',
	EMERALD: '#50C878',
	DIAMOND: '#B9F2FF',
	MASTER: '#9B59B6',
	GRANDMASTER: '#E74C3C',
	CHALLENGER: '#F1C40F'
};

const CATEGORY_LABELS = {
	match: '매치',
	games: '판수',
	streak: '연승/연패',
	tier: '티어 달성',
	voice: '보이스',
	challenge: '챌린지',
	underdog: '언더독',
	late_night: '야식'
};

const CATEGORY_ORDER = ['match', 'games', 'streak', 'tier', 'voice', 'challenge', 'underdog', 'late_night'];

function formatDate(dateStr) {
	if (!dateStr) return '';
	const d = new Date(dateStr);
	const y = String(d.getFullYear()).slice(-2);
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}.${m}.${day}`;
}

const useStyles = makeStyles(theme => ({
	container: {
		padding: 28,
		maxWidth: 1200,
		margin: '0 auto',
		width: '100%',
		[theme.breakpoints.down('sm')]: {
			padding: 16
		}
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		color: '#fff',
		marginBottom: 8
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 32
	},
	summary: {
		display: 'flex',
		gap: 16,
		marginBottom: 32,
		flexWrap: 'wrap'
	},
	summaryCard: {
		background: 'rgba(255, 255, 255, 0.04)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		borderRadius: 12,
		padding: '16px 24px',
		textAlign: 'center'
	},
	summaryValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		color: '#00d4ff'
	},
	summaryLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	categorySection: {
		marginBottom: 32
	},
	categoryTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.8)',
		marginBottom: 16,
		paddingBottom: 8,
		borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
		gap: 16,
		[theme.breakpoints.down('xs')]: {
			gridTemplateColumns: '1fr'
		}
	},
	card: {
		position: 'relative',
		borderRadius: 14,
		padding: 20,
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		transition: 'transform 0.2s ease, box-shadow 0.2s ease',
		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
		}
	},
	cardUnlocked: {
		borderColor: 'rgba(0, 212, 255, 0.3)',
		background: 'rgba(0, 212, 255, 0.04)'
	},
	cardLocked: {
		opacity: 0.45,
		filter: 'grayscale(0.6)'
	},
	cardHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		marginBottom: 12
	},
	emoji: {
		fontSize: '2.4rem',
		lineHeight: 1
	},
	cardInfo: {
		flex: 1,
		minWidth: 0
	},
	cardName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#fff'
	},
	cardDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginTop: 2
	},
	cardFooter: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 14,
		paddingTop: 10,
		borderTop: '1px solid rgba(255, 255, 255, 0.06)'
	},
	tierBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700,
		padding: '2px 10px',
		borderRadius: 6,
		background: 'rgba(255, 255, 255, 0.08)'
	},
	rate: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	unlockedDate: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginTop: 6,
		textAlign: 'right'
	},
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '80px 20px',
		textAlign: 'center'
	},
	emptyIcon: {
		fontSize: '5rem',
		marginBottom: 20,
		opacity: 0.5
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	tierEmblem: {
		width: 36,
		height: 36
	}
}));

function AchievementContent() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const { puuid: paramPuuid } = useParams();

	const user = useSelector(state => state.auth.user);
	const { achievements, loading } = useSelector(({ Achievement }) => Achievement.achievement);

	const puuid = paramPuuid || camilleRiotAuthService.getPuuid();
	const groupId = user?.reprGroup?.groupId;

	useEffect(() => {
		if (groupId && puuid) {
			dispatch(Actions.getAchievements(groupId, puuid));
		}
	}, [dispatch, groupId, puuid]);

	if (loading) {
		return <FuseLoading />;
	}

	if (!achievements || achievements.length === 0) {
		return (
			<div className={classes.container}>
				<div className={classes.emptyState}>
					<div className={classes.emptyIcon}>
						<span role="img" aria-label="trophy">
							🏆
						</span>
					</div>
					<div className={classes.emptyText}>업적 데이터가 없습니다</div>
				</div>
			</div>
		);
	}

	const unlocked = achievements.filter(a => a.unlocked);
	const total = achievements.length;

	const grouped = {};
	CATEGORY_ORDER.forEach(cat => {
		const items = achievements.filter(a => a.category === cat);
		if (items.length > 0) {
			grouped[cat] = items;
		}
	});

	return (
		<div className={classes.container}>
			<div className={classes.title}>
				<span role="img" aria-label="trophy">
					🏆
				</span>{' '}
				업적
			</div>
			<div className={classes.subtitle}>
				{unlocked.length} / {total} 달성
			</div>

			<div className={classes.summary}>
				{CATEGORY_ORDER.map(cat => {
					const items = grouped[cat];
					if (!items) return null;
					const catUnlocked = items.filter(a => a.unlocked).length;
					return (
						<div key={cat} className={classes.summaryCard}>
							<div className={classes.summaryValue}>
								{catUnlocked}/{items.length}
							</div>
							<div className={classes.summaryLabel}>{CATEGORY_LABELS[cat] || cat}</div>
						</div>
					);
				})}
			</div>

			{CATEGORY_ORDER.map(cat => {
				if (!grouped[cat]) return null;
				return (
					<div key={cat} className={classes.categorySection}>
						<div className={classes.categoryTitle}>{CATEGORY_LABELS[cat] || cat}</div>
						<div className={classes.grid}>
							{grouped[cat].map(achievement => {
								const tierColor = TIER_COLORS[achievement.tier] || '#fff';
								return (
									<div
										key={achievement.id}
										className={`${classes.card} ${achievement.unlocked ? classes.cardUnlocked : classes.cardLocked}`}
										style={
											achievement.unlocked
												? { borderColor: `${tierColor}40`, boxShadow: `0 0 12px ${tierColor}15` }
												: {}
										}
									>
										<div className={classes.cardHeader}>
											{achievement.category === 'tier' ? (
												<img
													className={classes.tierEmblem}
													src={`/assets/images/ranked-emblems/Emblem_${achievement.id.replace('TIER_', '')}.webp`}
													alt={achievement.name}
												/>
											) : (
												<span role="img" aria-label={achievement.name} className={classes.emoji}>
													{achievement.emoji}
												</span>
											)}
											<div className={classes.cardInfo}>
												<div className={classes.cardName}>{achievement.name}</div>
												<div className={classes.cardDesc}>{achievement.description}</div>
											</div>
										</div>
										<div className={classes.cardFooter}>
											<span className={classes.tierBadge} style={{ color: tierColor }}>
												{achievement.tier}
											</span>
											<span className={classes.rate}>{achievement.achievementRate}% 달성</span>
										</div>
										{achievement.unlocked && achievement.unlockedAt && (
											<div className={classes.unlockedDate}>{formatDate(achievement.unlockedAt)} 달성</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default AchievementContent;
