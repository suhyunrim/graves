import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from 'tss-react/mui';
import { Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { ChallengeDetailSkeleton } from '../components/SkeletonLoaders';
import reducer from './store/reducers';
import * as Actions from './store/actions';
import { formatShortDateTime } from './challengeUtils';
import {
	getChampionIcon,
	getItemIcon,
	getSpellIcon,
	getKeystoneIcon,
	formatKDA,
	formatCS,
	formatGold,
	formatDamage,
	formatGameDuration,
	getMultiKillBadge
} from './ddragonUtils';

const PAGE_SIZE = 20;

const tierColors = {
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

function getTierIconName(tier) {
	if (!tier) return null;
	return tier.split(' ')[0];
}

function getTierColor(tier) {
	if (!tier) return null;
	return tierColors[tier.split(' ')[0]] || null;
}

function getTierShortName(tier) {
	if (!tier) return '';
	const parts = tier.split(' ');
	const tierMap = { IRON: 'I', BRONZE: 'B', SILVER: 'S', GOLD: 'G', PLATINUM: 'P', EMERALD: 'E', DIAMOND: 'D', MASTER: 'M', GRANDMASTER: 'GM', CHALLENGER: 'C' };
	const rankMap = { I: '1', II: '2', III: '3', IV: '4' };
	return `${tierMap[parts[0]] || parts[0].charAt(0)}${rankMap[parts[1]] || ''}`;
}

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
	backLink: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)',
		textDecoration: 'none',
		marginBottom: 12,
		display: 'inline-block',
		'&:hover': { color: '#00d4ff' }
	},
	// User summary header
	summaryCard: {
		display: 'flex',
		alignItems: 'center',
		gap: 20,
		flexWrap: 'wrap',
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			alignItems: 'flex-start'
		}
	},
	summaryChampIcon: {
		width: 72,
		height: 72,
		borderRadius: 16,
		border: '3px solid rgba(0, 212, 255, 0.4)',
		[theme.breakpoints.down('sm')]: {
			width: 56,
			height: 56
		}
	},
	summaryInfo: {
		flex: 1
	},
	summaryName: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '2.8rem',
		color: '#fff',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
		lineHeight: 1.1,
		[theme.breakpoints.down('md')]: {
			fontSize: '2.2rem'
		}
	},
	summaryTier: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		marginTop: 6
	},
	summaryTierIcon: {
		width: 24,
		height: 24
	},
	summaryTierText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700
	},
	summaryStats: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.7)',
		marginTop: 6,
		display: 'flex',
		gap: 16,
		flexWrap: 'wrap',
		alignItems: 'center'
	},
	summaryWin: { color: '#4dabf7' },
	summaryLose: { color: '#ff6b6b' },
	summaryStreak: {
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		color: '#ff6b00'
	},
	// Container
	container: {
		padding: '28px',
		maxWidth: 1000,
		margin: '0 auto',
		width: '100%'
	},
	// Match card
	matchCard: {
		borderRadius: 16,
		marginBottom: 12,
		border: '1px solid',
		overflow: 'hidden',
		cursor: 'pointer',
		transition: 'border-color 0.2s ease'
	},
	matchWin: {
		background: 'linear-gradient(135deg, rgba(77, 171, 247, 0.08) 0%, rgba(77, 171, 247, 0.02) 100%)',
		borderColor: 'rgba(77, 171, 247, 0.25)',
		'&:hover': { borderColor: 'rgba(77, 171, 247, 0.5)' }
	},
	matchLose: {
		background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.08) 0%, rgba(255, 107, 107, 0.02) 100%)',
		borderColor: 'rgba(255, 107, 107, 0.25)',
		'&:hover': { borderColor: 'rgba(255, 107, 107, 0.5)' }
	},
	// Match card main row
	matchMain: {
		display: 'flex',
		alignItems: 'center',
		padding: '14px 20px',
		gap: 14,
		[theme.breakpoints.down('sm')]: {
			flexWrap: 'wrap',
			gap: 10,
			padding: '12px 14px'
		}
	},
	// Result indicator bar
	resultBar: {
		width: 4,
		height: 60,
		borderRadius: 2,
		flexShrink: 0,
		[theme.breakpoints.down('sm')]: {
			width: '100%',
			height: 3
		}
	},
	resultBarWin: { background: '#4dabf7' },
	resultBarLose: { background: '#ff6b6b' },
	// Champion + spells + runes block
	champBlock: {
		display: 'flex',
		alignItems: 'center',
		gap: 4,
		flexShrink: 0
	},
	champIconWrapper: {
		position: 'relative'
	},
	champIcon: {
		width: 52,
		height: 52,
		borderRadius: 12,
		border: '2px solid rgba(255, 255, 255, 0.15)',
		[theme.breakpoints.down('sm')]: {
			width: 44,
			height: 44,
			borderRadius: 10
		}
	},
	champLevel: {
		position: 'absolute',
		bottom: -2,
		left: -2,
		background: 'rgba(0, 0, 0, 0.8)',
		color: '#fff',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		fontWeight: 700,
		width: 20,
		height: 20,
		borderRadius: 6,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	spellRuneCol: {
		display: 'flex',
		flexDirection: 'column',
		gap: 2
	},
	spellRow: {
		display: 'flex',
		gap: 2
	},
	spellIcon: {
		width: 22,
		height: 22,
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.1)'
	},
	runeIcon: {
		width: 22,
		height: 22,
		borderRadius: '50%',
		background: 'rgba(255, 255, 255, 0.1)'
	},
	// KDA block
	kdaBlock: {
		minWidth: 100,
		textAlign: 'center',
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			textAlign: 'left'
		}
	},
	kdaText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: '#fff'
	},
	kdaKill: { color: '#fff' },
	kdaDeath: { color: '#ff6b6b' },
	kdaAssist: { color: 'rgba(255, 255, 255, 0.6)' },
	kdaRatio: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.5)'
	},
	kdaRatioGood: { color: '#00ff7f' },
	kdaRatioPerfect: { color: '#ffd700' },
	multiKillBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.9rem',
		fontWeight: 600,
		padding: '1px 6px',
		borderRadius: 4,
		background: 'rgba(255, 68, 68, 0.2)',
		color: '#ff4444',
		display: 'inline-block',
		marginTop: 2
	},
	// Stats block
	statsBlock: {
		display: 'flex',
		gap: 16,
		flex: 1,
		justifyContent: 'center',
		[theme.breakpoints.down('sm')]: {
			gap: 10,
			justifyContent: 'flex-start',
			flexWrap: 'wrap'
		}
	},
	statItem: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 1
	},
	statLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.85rem',
		color: 'rgba(255, 255, 255, 0.35)'
	},
	statValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.8)',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.1rem'
		}
	},
	// Items block
	itemsBlock: {
		display: 'flex',
		alignItems: 'center',
		gap: 2,
		flexShrink: 0,
		[theme.breakpoints.down('sm')]: {
			display: 'none'
		}
	},
	itemIcon: {
		width: 26,
		height: 26,
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.06)',
		border: '1px solid rgba(255, 255, 255, 0.08)'
	},
	itemEmpty: {
		width: 26,
		height: 26,
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.04)',
		border: '1px solid rgba(255, 255, 255, 0.06)'
	},
	itemTrinket: {
		width: 26,
		height: 26,
		borderRadius: '50%',
		background: 'rgba(255, 255, 255, 0.06)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		marginLeft: 4
	},
	// Meta (time, date)
	metaBlock: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-end',
		gap: 2,
		flexShrink: 0,
		minWidth: 80,
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'row',
			gap: 8,
			alignItems: 'center',
			minWidth: 'auto'
		}
	},
	metaText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.35)'
	},
	// Group members row
	groupMembersRow: {
		display: 'flex',
		gap: 10,
		flexWrap: 'wrap',
		padding: '8px 20px 12px',
		borderTop: '1px solid rgba(255, 255, 255, 0.05)'
	},
	memberChip: {
		display: 'flex',
		alignItems: 'center',
		gap: 4,
		padding: '2px 8px',
		borderRadius: 6,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		textDecoration: 'none',
		cursor: 'pointer',
		transition: 'filter 0.2s ease',
		'&:hover': {
			filter: 'brightness(1.3)'
		}
	},
	allyChip: {
		background: 'rgba(77, 171, 247, 0.1)',
		color: '#4dabf7'
	},
	enemyChip: {
		background: 'rgba(255, 107, 107, 0.1)',
		color: '#ff6b6b'
	},
	memberIcon: {
		width: 18,
		height: 18,
		borderRadius: 3
	},
	// Expand indicator
	expandRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '4px',
		borderTop: '1px solid rgba(255, 255, 255, 0.05)',
		color: 'rgba(255, 255, 255, 0.3)',
		fontSize: '1rem',
		fontFamily: '"Noto Sans KR", sans-serif',
		'& svg': { fontSize: '1.2rem' }
	},
	// Expanded team tables
	expandedContent: {
		borderTop: '1px solid rgba(255, 255, 255, 0.08)',
		padding: '12px 16px'
	},
	teamSection: {
		marginBottom: 12,
		'&:last-child': { marginBottom: 0 }
	},
	teamHeader: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		padding: '6px 8px',
		borderRadius: 6,
		marginBottom: 6
	},
	teamBlue: {
		color: '#4dabf7',
		background: 'rgba(77, 171, 247, 0.08)'
	},
	teamRed: {
		color: '#ff6b6b',
		background: 'rgba(255, 107, 107, 0.08)'
	},
	teamRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '5px 8px',
		borderRadius: 6,
		'&:hover': {
			background: 'rgba(255, 255, 255, 0.03)'
		}
	},
	teamRowHighlight: {
		background: 'rgba(0, 212, 255, 0.06) !important',
		border: '1px solid rgba(0, 212, 255, 0.15)',
		borderRadius: 8
	},
	teamRowGroup: {
		background: 'rgba(255, 255, 255, 0.02)'
	},
	teamChampIcon: {
		width: 28,
		height: 28,
		borderRadius: 6
	},
	teamSpellIcon: {
		width: 16,
		height: 16,
		borderRadius: 3
	},
	teamName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 500,
		color: '#fff',
		minWidth: 100,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		[theme.breakpoints.down('sm')]: {
			minWidth: 70,
			fontSize: '1rem'
		}
	},
	teamNameBold: {
		fontWeight: 700,
		color: '#00d4ff'
	},
	teamNameLink: {
		color: 'inherit',
		textDecoration: 'none',
		cursor: 'pointer',
		'&:hover': {
			textDecoration: 'underline'
		}
	},
	teamKda: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.8)',
		minWidth: 70,
		textAlign: 'center'
	},
	teamStat: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.6)',
		minWidth: 50,
		textAlign: 'center',
		[theme.breakpoints.down('sm')]: {
			display: 'none'
		}
	},
	teamItems: {
		display: 'flex',
		gap: 2,
		[theme.breakpoints.down('sm')]: {
			display: 'none'
		}
	},
	teamItemIcon: {
		width: 22,
		height: 22,
		borderRadius: 3,
		background: 'rgba(255, 255, 255, 0.06)'
	},
	teamItemEmpty: {
		width: 22,
		height: 22,
		borderRadius: 3,
		background: 'rgba(255, 255, 255, 0.03)'
	},
	groupBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.8rem',
		padding: '0 4px',
		borderRadius: 3,
		background: 'rgba(0, 212, 255, 0.15)',
		color: '#00d4ff',
		marginLeft: 4
	},
	// Load more
	loadMoreWrapper: {
		display: 'flex',
		justifyContent: 'center',
		padding: '20px 0'
	},
	loadMoreBtn: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 600,
		fontSize: '1.2rem',
		color: '#00d4ff',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		borderRadius: 12,
		padding: '10px 32px',
		textTransform: 'none',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.1)'
		}
	},
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
	loadingWrapper: {
		display: 'flex',
		justifyContent: 'center',
		padding: 60
	}
}));

function findMyParticipant(match, puuid) {
	if (!match.participants) return null;
	// targetPuuid: 백엔드에서 해당 매치의 실제 플레이어 puuid 제공
	const target = match.targetPuuid || puuid;
	return match.participants.find(p => p.puuid === target) || null;
}

function ChallengeUserMatches() {
	const { classes } = useStyles();
	const dispatch = useDispatch();
	const { challengeId, puuid } = useParams();
	const userMatches = useSelector(({ Challenge }) => Challenge.challenge.userMatches);
	const detail = useSelector(({ Challenge }) => Challenge.challenge.detail);
	const leaderboard = useSelector(({ Challenge }) => Challenge.challenge.leaderboard);
	const user = useSelector(state => state.auth.user);
	const groupId = user && user.reprGroup ? user.reprGroup.groupId : null;

	const [expandedMatches, setExpandedMatches] = useState({});
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	useEffect(() => {
		if (groupId) {
			dispatch(Actions.getUserMatches(groupId, challengeId, puuid));
			dispatch(Actions.getChallengeDetail(groupId, challengeId));
			dispatch(Actions.getLeaderboard(groupId, challengeId));
		}
	}, [dispatch, groupId, challengeId, puuid]);

	// Find this user's stats from leaderboard
	const userStats = useMemo(() => {
		if (!leaderboard) return null;
		return leaderboard.find(p => p.puuid === puuid) || null;
	}, [leaderboard, puuid]);

	// Find most played champion from matches
	const topChampion = useMemo(() => {
		if (!userMatches || userMatches.length === 0) return null;
		const counts = {};
		userMatches.forEach(m => {
			const me = findMyParticipant(m, puuid);
			const champ = me ? me.championName : m.championName;
			counts[champ] = (counts[champ] || 0) + 1;
		});
		return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
	}, [userMatches, puuid]);

	// Average KDA from match data
	const avgKDA = useMemo(() => {
		if (!userMatches || userMatches.length === 0) return null;
		let totalK = 0;
		let totalD = 0;
		let totalA = 0;
		userMatches.forEach(m => {
			const me = findMyParticipant(m, puuid);
			totalK += me ? me.kills : (m.kills || 0);
			totalD += me ? me.deaths : (m.deaths || 0);
			totalA += me ? me.assists : (m.assists || 0);
		});
		return formatKDA(totalK, totalD, totalA);
	}, [userMatches, puuid]);

	// Group member puuids for highlighting
	const groupMemberPuuids = useMemo(() => {
		if (!userMatches) return new Set();
		const set = new Set();
		userMatches.forEach(m => {
			if (m.groupMembers) {
				m.groupMembers.forEach(gm => set.add(gm.puuid));
			}
		});
		return set;
	}, [userMatches]);

	function toggleExpand(matchId) {
		setExpandedMatches(prev => ({ ...prev, [matchId]: !prev[matchId] }));
	}

	function renderItems(participant) {
		const items = [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5];
		return (
			<>
				{items.map((itemId, i) => {
					const src = getItemIcon(itemId);
					return src ? (
						<img key={i} className={classes.itemIcon} src={src} alt="" />
					) : (
						<div key={i} className={classes.itemEmpty} />
					);
				})}
				{participant.item6 ? (
					<img className={classes.itemTrinket} src={getItemIcon(participant.item6)} alt="" />
				) : (
					<div className={classes.itemTrinket} />
				)}
			</>
		);
	}

	function renderTeamTable(participants, teamId, teamWin, targetPuuid) {
		const team = participants.filter(p => p.teamId === teamId);
		const isBlue = teamId === 100;

		return (
			<div className={classes.teamSection}>
				<div className={`${classes.teamHeader} ${isBlue ? classes.teamBlue : classes.teamRed}`}>
					{isBlue ? '블루팀' : '레드팀'} ({teamWin ? '승리' : '패배'})
				</div>
				{team.map(p => {
					const isMe = p.puuid === (targetPuuid || puuid);
					const isGroupMember = groupMemberPuuids.has(p.puuid) && !isMe;
					const cs = (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0);
					let rowClass = classes.teamRow;
					if (isMe) rowClass += ` ${classes.teamRowHighlight}`;
					else if (isGroupMember) rowClass += ` ${classes.teamRowGroup}`;

					return (
						<div key={p.puuid} className={rowClass}>
							<img className={classes.teamChampIcon} src={getChampionIcon(p.championName)} alt={p.championName} />
							<img className={classes.teamSpellIcon} src={getSpellIcon(p.summoner1Id)} alt="" />
							<img className={classes.teamSpellIcon} src={getSpellIcon(p.summoner2Id)} alt="" />
							<span className={`${classes.teamName} ${isMe ? classes.teamNameBold : ''}`}>
								{isMe || isGroupMember ? (
									<Link to={`/userinfo/${p.puuid}`} className={classes.teamNameLink}>
										{p.riotIdGameName || p.summonerName}
									</Link>
								) : (
									p.riotIdGameName || p.summonerName
								)}
								{isGroupMember && <span className={classes.groupBadge}>G</span>}
							</span>
							<span className={classes.teamKda}>{p.kills}/{p.deaths}/{p.assists}</span>
							<span className={classes.teamStat}>{formatDamage(p.totalDamageDealtToChampions)}</span>
							<span className={classes.teamStat}>{cs}</span>
							<span className={classes.teamStat}>{p.visionScore}</span>
							<div className={classes.teamItems}>
								{[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].map((itemId, i) => {
									const src = getItemIcon(itemId);
									return src ? (
										<img key={i} className={classes.teamItemIcon} src={src} alt="" />
									) : (
										<div key={i} className={classes.teamItemEmpty} />
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		);
	}

	if (!groupId) {
		return (
			<FusePageSimple
				classes={{ root: classes.layoutRoot }}
				content={<ChallengeDetailSkeleton />}
			/>
		);
	}

	const visibleMatches = userMatches ? userMatches.slice(0, visibleCount) : null;
	const hasMore = userMatches && visibleCount < userMatches.length;

	return (
		<FusePageSimple
			classes={{ root: classes.layoutRoot }}
			header={
				<div className={classes.headerRoot}>
					<Link to={`/challenge/${challengeId}`} className={classes.backLink}>
						&#8592; 리더보드로 돌아가기
					</Link>
					<div className={classes.summaryCard}>
						{topChampion && (
							<img className={classes.summaryChampIcon} src={getChampionIcon(topChampion)} alt={topChampion} />
						)}
						<div className={classes.summaryInfo}>
							<div className={classes.summaryName}>
								{userStats ? userStats.name : (detail ? detail.title : 'Challenge')}
							</div>
							{userStats && userStats.tier && (
								<div className={classes.summaryTier}>
									<img
										className={classes.summaryTierIcon}
										src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(userStats.tier)}.webp`}
										alt={userStats.tier}
										style={{ filter: `drop-shadow(0 0 4px ${getTierColor(userStats.tier)}40)` }}
									/>
									<span className={classes.summaryTierText} style={{ color: getTierColor(userStats.tier) }}>
										{getTierShortName(userStats.tier)}
									</span>
								</div>
							)}
							{userStats && (
								<div className={classes.summaryStats}>
									<span>
										<span className={classes.summaryWin}>{userStats.wins}승</span>
										{' '}
										<span className={classes.summaryLose}>{userStats.losses}패</span>
										{' '}({userStats.winRate}%)
									</span>
									{avgKDA && <span>KDA {avgKDA === 'Perfect' ? 'Perfect' : `${avgKDA}:1`}</span>}
									{userStats.bestWinStreak > 0 && <span>최고 연승: {userStats.bestWinStreak}</span>}
									{userStats.currentWinStreak > 0 && (
										<span className={classes.summaryStreak}>
											<span role="img" aria-label="fire">&#x1F525;</span> {userStats.currentWinStreak}연승 중
										</span>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			}
			content={
				<div className={classes.container}>
					{!userMatches ? (
						<ChallengeDetailSkeleton />
					) : userMatches.length === 0 ? (
						<div className={classes.emptyState}><div className={classes.emptyText}>매치 기록이 없습니다</div></div>
					) : (
						<>
							{visibleMatches.map(match => {
								const me = findMyParticipant(match, puuid);
								const expanded = expandedMatches[match.matchId];
								const champName = me ? me.championName : match.championName;
								const kills = me ? me.kills : match.kills;
								const deaths = me ? me.deaths : match.deaths;
								const assists = me ? me.assists : match.assists;
								const champLevel = me ? me.champLevel : null;
								const spell1Icon = me ? getSpellIcon(me.summoner1Id) : null;
								const spell2Icon = me ? getSpellIcon(me.summoner2Id) : null;
								const kdaRatio = formatKDA(kills, deaths, assists);
								const multiKill = me ? getMultiKillBadge(me) : null;
								const cs = me ? formatCS(me.totalMinionsKilled, me.neutralMinionsKilled, me.timePlayed) : null;
								const damage = me ? formatDamage(me.totalDamageDealtToChampions) : '-';
								const vision = me ? me.visionScore : '-';
								const gold = me ? formatGold(me.goldEarned) : '-';
								const duration = me ? formatGameDuration(me.timePlayed) : '-';

								// Team kills for kill participation
								const myTeam = match.participants ? match.participants.filter(p => p.teamId === (me ? me.teamId : 100)) : [];
								const teamKills = myTeam.reduce((sum, p) => sum + p.kills, 0);
								const killParticipation = teamKills > 0 ? Math.round(((kills + assists) / teamKills) * 100) : 0;

								// Determine team results
								const blueWin = match.participants ? match.participants.find(p => p.teamId === 100 && p.win) !== undefined : match.win;

								return (
									<div
										key={match.matchId}
										className={`${classes.matchCard} ${match.win ? classes.matchWin : classes.matchLose}`}
									>
										{/* Main row */}
										<div className={classes.matchMain} onClick={() => match.participants && toggleExpand(match.matchId)}>
											<div className={`${classes.resultBar} ${match.win ? classes.resultBarWin : classes.resultBarLose}`} />

											{/* Champion + Spells */}
											<div className={classes.champBlock}>
												<div className={classes.champIconWrapper}>
													<img className={classes.champIcon} src={getChampionIcon(champName)} alt={champName} />
													{champLevel && <span className={classes.champLevel}>{champLevel}</span>}
												</div>
												{me && (
													<div className={classes.spellRuneCol}>
														<div className={classes.spellRow}>
															{spell1Icon && <img className={classes.spellIcon} src={spell1Icon} alt="" />}
															{spell2Icon && <img className={classes.spellIcon} src={spell2Icon} alt="" />}
														</div>
														<div className={classes.spellRow}>
															{me.perks && me.perks.styles && me.perks.styles[0] && (
																<img className={classes.runeIcon} src={getKeystoneIcon(me.perks.styles[0].selections[0].perk)} alt="" style={{ background: 'rgba(0,0,0,0.5)' }} />
															)}
														</div>
													</div>
												)}
											</div>

											{/* KDA */}
											<div className={classes.kdaBlock}>
												<div className={classes.kdaText}>
													<span className={classes.kdaKill}>{kills}</span>
													{' / '}
													<span className={classes.kdaDeath}>{deaths}</span>
													{' / '}
													<span className={classes.kdaAssist}>{assists}</span>
												</div>
												<div className={`${classes.kdaRatio} ${kdaRatio === 'Perfect' ? classes.kdaRatioPerfect : parseFloat(kdaRatio) >= 4 ? classes.kdaRatioGood : ''}`}>
													{kdaRatio === 'Perfect' ? 'Perfect' : `${kdaRatio}:1`}
													{me && teamKills > 0 && ` (${killParticipation}%)`}
												</div>
												{multiKill && <span className={classes.multiKillBadge}>{multiKill}</span>}
											</div>

											{/* Stats */}
											<div className={classes.statsBlock}>
												{cs && (
													<div className={classes.statItem}>
														<span className={classes.statLabel}>CS</span>
														<span className={classes.statValue}>{cs.total} ({cs.perMin})</span>
													</div>
												)}
												<div className={classes.statItem}>
													<span className={classes.statLabel}>피해량</span>
													<span className={classes.statValue}>{damage}</span>
												</div>
												<div className={classes.statItem}>
													<span className={classes.statLabel}>시야</span>
													<span className={classes.statValue}>{vision}</span>
												</div>
												<div className={classes.statItem}>
													<span className={classes.statLabel}>골드</span>
													<span className={classes.statValue}>{gold}</span>
												</div>
											</div>

											{/* Items */}
											{me && (
												<div className={classes.itemsBlock}>
													{renderItems(me)}
												</div>
											)}

											{/* Meta */}
											<div className={classes.metaBlock}>
												<span className={classes.metaText}>{duration}</span>
												<span className={classes.metaText}>{formatShortDateTime(match.gameCreation)}</span>
											</div>
										</div>

										{/* Group members */}
										{match.groupMembers && match.groupMembers.length > 0 && !expanded && (
											<div className={classes.groupMembersRow}>
												{match.groupMembers.map(member => (
													<Link
														key={member.puuid}
														to={`/userinfo/${member.puuid}`}
														className={`${classes.memberChip} ${member.sameTeam ? classes.allyChip : classes.enemyChip}`}
													>
														<img className={classes.memberIcon} src={getChampionIcon(member.championName)} alt="" />
														{member.name}
													</Link>
												))}
											</div>
										)}

										{/* Expand indicator */}
										{match.participants && (
											<div className={classes.expandRow} onClick={() => toggleExpand(match.matchId)}>
												{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
											</div>
										)}

										{/* Expanded: 10 player table */}
										{expanded && match.participants && (
											<div className={classes.expandedContent}>
												{renderTeamTable(match.participants, 100, blueWin, match.targetPuuid)}
												{renderTeamTable(match.participants, 200, !blueWin, match.targetPuuid)}
											</div>
										)}
									</div>
								);
							})}

							{hasMore && (
								<div className={classes.loadMoreWrapper}>
									<Button className={classes.loadMoreBtn} onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}>
										더 보기 ({userMatches.length - visibleCount}경기 남음)
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			}
		/>
	);
}

export default withReducer('Challenge', reducer)(ChallengeUserMatches);
