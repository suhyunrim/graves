import React, { useEffect, useState } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import { makeStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
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

const TIER_RANK = {
	CHALLENGER: 9,
	GRANDMASTER: 8,
	MASTER: 7,
	DIAMOND: 6,
	EMERALD: 5,
	PLATINUM: 4,
	GOLD: 3,
	SILVER: 2,
	BRONZE: 1
};

const CATEGORY_LABELS = {
	match: '매치',
	games: '판수',
	streak_win: '연승',
	streak_lose: '연패',
	tier: '티어 달성',
	voice: '보이스',
	challenge: '챌린지',
	underdog: '언더독',
	late_night: '야식'
};

const CATEGORY_ORDER = [
	'match',
	'games',
	'streak_win',
	'streak_lose',
	'tier',
	'voice',
	'challenge',
	'underdog',
	'late_night'
];

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
		gap: 12,
		marginBottom: 32,
		flexWrap: 'wrap',
		alignItems: 'center'
	},
	summaryEmblem: {
		width: 32,
		height: 32
	},
	categorySection: {
		marginBottom: 32
	},
	categorySectionCompact: {
		marginBottom: 20
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
		background: 'rgba(255, 255, 255, 0.08)',
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4
	},
	tierBadgeEmblem: {
		width: 18,
		height: 18
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
	},
	toggleWrap: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginBottom: 24
	},
	toggleLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.6)',
		cursor: 'pointer'
	},
	navRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	navArrow: {
		background: 'none',
		border: 'none',
		color: 'rgba(255, 255, 255, 0.5)',
		fontSize: '1.4rem',
		cursor: 'pointer',
		padding: '0 4px',
		lineHeight: 1,
		'&:hover': {
			color: '#fff'
		},
		'&:disabled': {
			opacity: 0.2,
			cursor: 'default'
		}
	},
	wideCard: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		padding: '16px 24px',
		[theme.breakpoints.down('xs')]: {
			flexDirection: 'column',
			alignItems: 'stretch',
			gap: 0,
			padding: 16
		}
	},
	wideCardHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		flex: 1,
		minWidth: 0,
		[theme.breakpoints.down('xs')]: {
			marginBottom: 12
		}
	},
	wideCardFooter: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		flexShrink: 0,
		[theme.breakpoints.down('xs')]: {
			justifyContent: 'space-between',
			paddingTop: 10,
			borderTop: '1px solid rgba(255, 255, 255, 0.06)'
		}
	},
	wideDate: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		flexShrink: 0
	}
}));

function AchievementContent() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const { puuid: paramPuuid } = useParams();

	const user = useSelector(state => state.auth.user);
	const { achievements, loading } = useSelector(({ Achievement }) => Achievement.achievement);

	const [highestOnly, setHighestOnly] = useState(true);
	const [catIndex, setCatIndex] = useState({});

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
		if (items.length === 0) return;
		if (cat === 'streak') {
			const wins = items.filter(a => a.id.includes('WIN'));
			const losses = items.filter(a => !a.id.includes('WIN'));
			if (wins.length > 0) grouped.streak_win = wins;
			if (losses.length > 0) grouped.streak_lose = losses;
		} else {
			grouped[cat] = items;
		}
	});

	function getDefaultIndex(cat) {
		const items = grouped[cat];
		if (!items) return 0;
		for (let i = items.length - 1; i >= 0; i -= 1) {
			if (items[i].unlocked) return i;
		}
		return 0;
	}

	function getCurrentIndex(cat) {
		return catIndex[cat] !== undefined ? catIndex[cat] : getDefaultIndex(cat);
	}

	function setCurrentIndex(cat, idx) {
		setCatIndex(prev => ({ ...prev, [cat]: idx }));
	}

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

			<div className={classes.toggleWrap}>
				<FormControlLabel
					control={
						<Switch checked={highestOnly} onChange={() => setHighestOnly(prev => !prev)} color="primary" size="small" />
					}
					label="달성한 최고 업적만 보기"
					classes={{ label: classes.toggleLabel }}
				/>
			</div>

			<div className={classes.summary}>
				{CATEGORY_ORDER.map(cat => {
					const items = grouped[cat];
					if (!items) return null;
					const highest = [...items].reverse().find(a => a.unlocked);
					if (!highest) return null;
					return highest;
				})
					.filter(Boolean)
					.sort((a, b) => (TIER_RANK[b.tier] || 0) - (TIER_RANK[a.tier] || 0))
					.map(a => {
						const tierColor = TIER_COLORS[a.tier] || '#fff';
						return (
							<Tooltip key={a.id} title={a.name} arrow placement="top">
								<img
									className={classes.summaryEmblem}
									src={`/assets/images/ranked-emblems/Emblem_${a.tier}.webp`}
									alt={a.name}
									style={{ filter: `drop-shadow(0 0 6px ${tierColor}50)` }}
								/>
							</Tooltip>
						);
					})}
			</div>

			{CATEGORY_ORDER.map(cat => {
				if (!grouped[cat]) return null;
				const allItems = grouped[cat];
				let displayItems = allItems;
				const idx = getCurrentIndex(cat);
				if (highestOnly) {
					displayItems = [allItems[idx]];
				}
				return (
					<div key={cat} className={highestOnly ? classes.categorySectionCompact : classes.categorySection}>
						{!highestOnly && <div className={classes.categoryTitle}>{CATEGORY_LABELS[cat] || cat}</div>}
						<div className={highestOnly ? undefined : classes.grid}>
							{displayItems.map(achievement => {
								const tierColor = TIER_COLORS[achievement.tier] || '#fff';
								const icon =
									achievement.category === 'tier' ? (
										<img
											className={classes.tierEmblem}
											src={`/assets/images/ranked-emblems/Emblem_${achievement.id.replace('TIER_', '')}.webp`}
											alt={achievement.name}
										/>
									) : (
										<span role="img" aria-label={achievement.name} className={classes.emoji}>
											{achievement.emoji}
										</span>
									);
								const tierBadge =
									highestOnly && allItems.length > 1 ? (
										<div className={classes.navRow}>
											<button
												type="button"
												className={classes.navArrow}
												disabled={idx <= 0}
												onClick={() => setCurrentIndex(cat, idx - 1)}
											>
												◀
											</button>
											<span className={classes.tierBadge} style={{ color: tierColor }}>
												<img
													className={classes.tierBadgeEmblem}
													src={`/assets/images/ranked-emblems/Emblem_${achievement.tier}.webp`}
													alt={achievement.tier}
												/>
												{achievement.tier}
											</span>
											<button
												type="button"
												className={classes.navArrow}
												disabled={idx >= allItems.length - 1}
												onClick={() => setCurrentIndex(cat, idx + 1)}
											>
												▶
											</button>
										</div>
									) : (
										<span className={classes.tierBadge} style={{ color: tierColor }}>
											{achievement.tier}
										</span>
									);

								if (highestOnly) {
									return (
										<div
											key={achievement.id}
											className={`${classes.card} ${classes.wideCard} ${
												achievement.unlocked ? classes.cardUnlocked : classes.cardLocked
											}`}
											style={
												achievement.unlocked
													? { borderColor: `${tierColor}40`, boxShadow: `0 0 12px ${tierColor}15` }
													: {}
											}
										>
											<div className={classes.wideCardHeader}>
												{icon}
												<div className={classes.cardInfo}>
													<div className={classes.cardName}>{achievement.name}</div>
													<div className={classes.cardDesc}>{achievement.description}</div>
												</div>
											</div>
											<div className={classes.wideCardFooter}>
												{tierBadge}
												<span className={classes.rate}>{achievement.achievementRate}%의 유저가 달성</span>
												{achievement.unlocked && achievement.unlockedAt && (
													<span className={classes.wideDate}>{formatDate(achievement.unlockedAt)}</span>
												)}
											</div>
										</div>
									);
								}

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
											{icon}
											<div className={classes.cardInfo}>
												<div className={classes.cardName}>{achievement.name}</div>
												<div className={classes.cardDesc}>{achievement.description}</div>
											</div>
										</div>
										<div className={classes.cardFooter}>
											{tierBadge}
											<span className={classes.rate}>{achievement.achievementRate}%의 유저가 달성</span>
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
