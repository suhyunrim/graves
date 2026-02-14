import React, { useEffect } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import withReducer from 'app/store/withReducer';
import getLatesetRiotDataVersion from 'app/utility/getLatesetRiotDataVersion';
import MyInfoHeader from './MyInfoHeader';
import RatingChart from './RatingChart';
import reducer from './store/reducers';
import * as Actions from './store/actions';

const tierColors = {
	IRON: { primary: '#5C5C5C', glow: 'rgba(92, 92, 92, 0.4)' },
	BRONZE: { primary: '#CD7F32', glow: 'rgba(205, 127, 50, 0.4)' },
	SILVER: { primary: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.4)' },
	GOLD: { primary: '#FFD700', glow: 'rgba(255, 215, 0, 0.4)' },
	PLATINUM: { primary: '#00CED1', glow: 'rgba(0, 206, 209, 0.4)' },
	EMERALD: { primary: '#50C878', glow: 'rgba(80, 200, 120, 0.4)' },
	DIAMOND: { primary: '#B9F2FF', glow: 'rgba(185, 242, 255, 0.4)' },
	MASTER: { primary: '#9932CC', glow: 'rgba(153, 50, 204, 0.4)' },
	GRANDMASTER: { primary: '#FF4500', glow: 'rgba(255, 69, 0, 0.4)' },
	CHALLENGER: { primary: '#F0E68C', glow: 'rgba(240, 230, 140, 0.4)' },
	UNRANKED: { primary: '#888888', glow: 'rgba(136, 136, 136, 0.3)' }
};

const useStyles = makeStyles(theme => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	},
	container: {
		padding: '28px',
		maxWidth: 1400,
		margin: '0 auto',
		[theme.breakpoints.down('xs')]: {
			padding: '16px'
		}
	},
	statsSection: {
		marginBottom: 32
	},
	profileSection: {
		display: 'flex',
		alignItems: 'center',
		gap: 24,
		marginBottom: 32,
		padding: 24,
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 16,
		border: '1px solid rgba(0, 212, 255, 0.2)',
		animation: '$fadeIn 0.5s ease',
		[theme.breakpoints.down('xs')]: {
			gap: 16,
			padding: 16
		}
	},
	'@keyframes fadeIn': {
		'0%': { opacity: 0, transform: 'translateY(20px)' },
		'100%': { opacity: 1, transform: 'translateY(0)' }
	},
	profileIcon: {
		width: 120,
		height: 120,
		borderRadius: 16,
		border: '3px solid rgba(0, 212, 255, 0.5)',
		boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)',
		transition: 'transform 0.3s ease, box-shadow 0.3s ease',
		'&:hover': {
			transform: 'scale(1.05)',
			boxShadow: '0 0 40px rgba(0, 212, 255, 0.5)'
		},
		[theme.breakpoints.down('xs')]: {
			width: 80,
			height: 80,
			borderRadius: 12
		}
	},
	profileInfo: {
		flex: 1
	},
	summonerName: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '3.2rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.02em',
		textShadow: '0 2px 20px rgba(0, 212, 255, 0.3)',
		marginBottom: 6,
		[theme.breakpoints.down('xs')]: {
			fontSize: '2.2rem'
		}
	},
	summonerLevel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.5)',
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	levelBadge: {
		background: 'rgba(0, 212, 255, 0.15)',
		padding: '6px 16px',
		borderRadius: 20,
		fontSize: '1.3rem',
		color: '#00d4ff',
		fontWeight: 600
	},
	cardsGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
		gap: 24,
		marginBottom: 32,
		[theme.breakpoints.down('xs')]: {
			gridTemplateColumns: '1fr',
			gap: 16
		}
	},
	rankCard: {
		position: 'relative',
		borderRadius: 20,
		padding: 28,
		overflow: 'hidden',
		transition: 'transform 0.3s ease, box-shadow 0.3s ease',
		animation: '$fadeInUp 0.6s ease forwards',
		opacity: 0,
		'&:hover': {
			transform: 'translateY(-6px) scale(1.02)'
		},
		[theme.breakpoints.down('xs')]: {
			padding: 20,
			borderRadius: 16
		}
	},
	'@keyframes fadeInUp': {
		'0%': { opacity: 0, transform: 'translateY(30px)' },
		'100%': { opacity: 1, transform: 'translateY(0)' }
	},
	soloRankCard: {
		background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
		border: '1px solid rgba(99, 102, 241, 0.3)',
		animationDelay: '0.1s',
		'&:hover': {
			boxShadow: '0 20px 50px rgba(99, 102, 241, 0.25)'
		}
	},
	customRatingCard: {
		background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		animationDelay: '0.2s',
		'&:hover': {
			boxShadow: '0 20px 50px rgba(0, 212, 255, 0.25)'
		}
	},
	cardHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 20,
		marginBottom: 20
	},
	emblemContainer: {
		position: 'relative'
	},
	emblem: {
		width: 100,
		height: 100,
		filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))',
		transition: 'transform 0.3s ease',
		'&:hover': {
			transform: 'scale(1.1) rotate(5deg)'
		},
		[theme.breakpoints.down('xs')]: {
			width: 72,
			height: 72
		}
	},
	cardTitleWrapper: {
		flex: 1
	},
	cardLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 8
	},
	tierText: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		letterSpacing: '0.03em',
		textShadow: '0 2px 10px currentColor',
		[theme.breakpoints.down('xs')]: {
			fontSize: '1.8rem'
		}
	},
	statsRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		marginTop: 18,
		flexWrap: 'wrap'
	},
	statItem: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.45rem',
		color: 'rgba(255, 255, 255, 0.8)'
	},
	winRate: {
		fontWeight: 700,
		padding: '6px 16px',
		borderRadius: 8,
		fontSize: '1.4rem'
	},
	winRateHigh: {
		background: 'rgba(0, 255, 127, 0.2)',
		color: '#00ff7f'
	},
	winRateMid: {
		background: 'rgba(255, 215, 0, 0.2)',
		color: '#ffd700'
	},
	winRateLow: {
		background: 'rgba(255, 107, 107, 0.2)',
		color: '#ff6b6b'
	},
	decorLine: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: 4,
		background: 'linear-gradient(90deg, transparent, currentColor, transparent)',
		opacity: 0.6
	},
	sectionTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff',
		marginBottom: 20,
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		'&::before': {
			content: '""',
			width: 4,
			height: 28,
			background: 'linear-gradient(180deg, #00d4ff, #0066ff)',
			borderRadius: 2
		}
	},
	// 새로운 통계 섹션 스타일
	statsGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
		gap: 16,
		marginBottom: 24,
		[theme.breakpoints.down('xs')]: {
			gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
			gap: 12
		}
	},
	statCard: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 16,
		padding: '20px 24px',
		border: '1px solid rgba(0, 212, 255, 0.15)',
		animation: '$fadeInUp 0.5s ease forwards',
		opacity: 0,
		'&:nth-child(1)': { animationDelay: '0.1s' },
		'&:nth-child(2)': { animationDelay: '0.15s' },
		'&:nth-child(3)': { animationDelay: '0.2s' },
		'&:nth-child(4)': { animationDelay: '0.25s' }
	},
	statLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 8
	},
	statValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		color: '#fff'
	},
	statSubValue: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginTop: 4
	},
	recentWinRateHigh: {
		color: '#00ff7f'
	},
	recentWinRateMid: {
		color: '#ffd700'
	},
	recentWinRateLow: {
		color: '#ff6b6b'
	},
	streakWin: {
		color: '#00d4ff'
	},
	streakLose: {
		color: '#ff6b6b'
	},
	// 팀원/상대 카드 섹션
	relationSection: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
		gap: 24,
		marginBottom: 32,
		[theme.breakpoints.down('xs')]: {
			gridTemplateColumns: '1fr',
			gap: 16
		}
	},
	relationCard: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 20,
		padding: 24,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		animation: '$fadeInUp 0.6s ease forwards',
		opacity: 0,
		'&:nth-child(1)': { animationDelay: '0.2s' },
		'&:nth-child(2)': { animationDelay: '0.3s' },
		[theme.breakpoints.down('xs')]: {
			padding: 16,
			borderRadius: 16
		}
	},
	relationTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		marginBottom: 20,
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	relationTitleIcon: {
		fontSize: '1.4rem'
	},
	relationList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12
	},
	relationItem: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '12px 16px',
		background: 'rgba(0, 0, 0, 0.2)',
		borderRadius: 12,
		transition: 'background 0.2s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.1)'
		},
		[theme.breakpoints.down('xs')]: {
			flexWrap: 'wrap',
			gap: 4,
			padding: '10px 12px'
		}
	},
	relationRank: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.4)',
		width: 28
	},
	relationName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.35rem',
		color: '#fff',
		flex: 1,
		marginLeft: 12
	},
	relationStats: {
		display: 'flex',
		alignItems: 'center',
		gap: 16
	},
	relationGames: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.6)'
	},
	relationWinRate: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.35rem',
		fontWeight: 700,
		padding: '4px 12px',
		borderRadius: 6
	},
	// 베스트/워스트 카드
	highlightSection: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
		gap: 16,
		marginBottom: 32,
		[theme.breakpoints.down('xs')]: {
			gridTemplateColumns: '1fr',
			gap: 12
		}
	},
	highlightCard: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 16,
		padding: '20px 24px',
		border: '1px solid rgba(0, 212, 255, 0.15)',
		animation: '$fadeInUp 0.5s ease forwards',
		opacity: 0,
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		'&:nth-child(1)': { animationDelay: '0.3s' },
		'&:nth-child(2)': { animationDelay: '0.35s' },
		'&:nth-child(3)': { animationDelay: '0.4s' }
	},
	highlightIcon: {
		fontSize: '2.2rem',
		width: 48,
		height: 48,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 12,
		background: 'rgba(0, 0, 0, 0.3)'
	},
	highlightContent: {
		flex: 1
	},
	highlightLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 4
	},
	highlightName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 600,
		color: '#fff'
	},
	highlightStat: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		marginTop: 2
	},
	highlightBest: {
		color: '#00ff7f'
	},
	highlightWorst: {
		color: '#ff6b6b'
	},
	noData: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: '20px 0'
	}
}));

function MyInfoPage(props) {
	const classes = useStyles(props);
	const dispatch = useDispatch();

	const { puuid } = useParams();
	const myPuuid = localStorage.getItem('camille_riot_puuid');
	const isOtherUser = puuid && puuid !== myPuuid;
	const user = useSelector(state => state.auth.user);
	const scoreInfo = useSelector(({ MyInfo }) => MyInfo.myInfo.scoreInfo);
	const summonerInfo = useSelector(({ MyInfo }) => MyInfo.myInfo.summonerInfo);
	const topTeammates = useSelector(({ MyInfo }) => MyInfo.myInfo.topTeammates);
	const topOpponents = useSelector(({ MyInfo }) => MyInfo.myInfo.topOpponents);
	const bestTeammate = useSelector(({ MyInfo }) => MyInfo.myInfo.bestTeammate);
	const recentGames = useSelector(({ MyInfo }) => MyInfo.myInfo.recentGames);
	const recentWins = useSelector(({ MyInfo }) => MyInfo.myInfo.recentWins);
	const recentWinRate = useSelector(({ MyInfo }) => MyInfo.myInfo.recentWinRate);
	const maxWinStreak = useSelector(({ MyInfo }) => MyInfo.myInfo.maxWinStreak);
	const maxLoseStreak = useSelector(({ MyInfo }) => MyInfo.myInfo.maxLoseStreak);
	const bestOpponent = useSelector(({ MyInfo }) => MyInfo.myInfo.bestOpponent);
	const worstOpponent = useSelector(({ MyInfo }) => MyInfo.myInfo.worstOpponent);

	const getSoloRankTierName = () => {
		const tier = summonerInfo.rankTier;
		if (!tier || tier === 'UNRANKED') return 'UNRANKED';
		return tier.split(' ')[0];
	};

	const getRatingTierName = () => {
		return scoreInfo.ratingTier.split(' ')[0];
	};

	const getRatingLP = () => {
		const rating = scoreInfo.defaultRating + scoreInfo.additionalRating;
		const bases = [
			['CHALLENGER', 1150], ['GRANDMASTER', 1000], ['MASTER', 900],
			['DIAMOND', 800], ['EMERALD', 700], ['PLATINUM', 600],
			['GOLD', 500], ['SILVER', 400], ['BRONZE', 300], ['IRON', 200]
		];
		for (const [name, base] of bases) {
			if (rating >= base) {
				if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(name)) {
					return Math.floor((rating - base) * 4);
				}
				return Math.floor((rating - base) % 25 * 4);
			}
		}
		return 0;
	};

	const getProfileIconURI = () => {
		return `https://ddragon.leagueoflegends.com/cdn/${getLatesetRiotDataVersion()}/img/profileicon/${
			summonerInfo.profileIconId
		}.png`;
	};

	const getTierColor = tierName => {
		return tierColors[tierName] || tierColors.UNRANKED;
	};

	const getWinRateClass = winRate => {
		if (winRate >= 55) return classes.winRateHigh;
		if (winRate >= 45) return classes.winRateMid;
		return classes.winRateLow;
	};

	const getRecentWinRateClass = winRate => {
		if (winRate >= 55) return classes.recentWinRateHigh;
		if (winRate >= 45) return classes.recentWinRateMid;
		return classes.recentWinRateLow;
	};

	const calculateWinRate = (wins, losses) => {
		const total = wins + losses;
		if (total === 0) return 0;
		return Math.round((wins / total) * 100);
	};

	useEffect(() => {
		dispatch(Actions.getMyInfo(user.reprGroup.groupId, puuid));
	}, [dispatch, user, puuid]);

	if (!scoreInfo) {
		return <FuseLoading />;
	}

	const soloTierName = getSoloRankTierName();
	const ratingTierName = getRatingTierName();
	const soloTierColor = getTierColor(soloTierName);
	const ratingTierColor = getTierColor(ratingTierName);
	const soloWinRate = calculateWinRate(summonerInfo.rankWin, summonerInfo.rankLose);
	const customWinRate = calculateWinRate(scoreInfo.win, scoreInfo.lose);

	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot
			}}
			header={<MyInfoHeader title={puuid ? 'Player Info' : undefined} subtitle={puuid ? '소환사 정보 및 내전 기록' : undefined} showBack={isOtherUser} />}
			content={
				<div className={classes.container}>
					{/* 프로필 섹션 */}
					<div className={classes.profileSection}>
						<img className={classes.profileIcon} src={getProfileIconURI()} alt="Profile Icon" />
						<div className={classes.profileInfo}>
							<div className={classes.summonerName}>{summonerInfo.name}</div>
							<div className={classes.summonerLevel}>
								<span className={classes.levelBadge}>Lv. {summonerInfo.summonerLevel}</span>
							</div>
						</div>
					</div>

					{/* 랭크 카드들 */}
					<div className={classes.cardsGrid}>
						{/* 솔로 랭크 카드 */}
						<div className={`${classes.rankCard} ${classes.soloRankCard}`}>
							<div className={classes.cardHeader}>
								<div className={classes.emblemContainer}>
									<img
										className={classes.emblem}
										src={`/assets/images/ranked-emblems/Emblem_${soloTierName}.png`}
										alt={soloTierName}
										style={{ filter: `drop-shadow(0 0 20px ${soloTierColor.glow})` }}
									/>
								</div>
								<div className={classes.cardTitleWrapper}>
									<div className={classes.cardLabel}>Solo Rank</div>
									<div className={classes.tierText} style={{ color: soloTierColor.primary }}>
										{summonerInfo.rankTier}
									</div>
								</div>
							</div>
							<div className={classes.statsRow}>
								<span className={classes.statItem}>
									{summonerInfo.rankWin}승 {summonerInfo.rankLose}패
								</span>
								{summonerInfo.rankWin + summonerInfo.rankLose > 0 && (
									<span className={`${classes.winRate} ${getWinRateClass(soloWinRate)}`}>{soloWinRate}%</span>
								)}
							</div>
							<div className={classes.decorLine} style={{ color: soloTierColor.primary }} />
						</div>

						{/* 커스텀 레이팅 카드 */}
						<div className={`${classes.rankCard} ${classes.customRatingCard}`}>
							<div className={classes.cardHeader}>
								<div className={classes.emblemContainer}>
									<img
										className={classes.emblem}
										src={`/assets/images/ranked-emblems/Emblem_${ratingTierName}.png`}
										alt={ratingTierName}
										style={{ filter: `drop-shadow(0 0 20px ${ratingTierColor.glow})` }}
									/>
								</div>
								<div className={classes.cardTitleWrapper}>
									<div className={classes.cardLabel}>Custom Rating</div>
									<div className={classes.tierText} style={{ color: ratingTierColor.primary }}>
										{scoreInfo.ratingTier} {getRatingLP()}LP
									</div>
								</div>
							</div>
							<div className={classes.statsRow}>
								<span className={classes.statItem}>
									{scoreInfo.win}승 {scoreInfo.lose}패
								</span>
								{scoreInfo.win + scoreInfo.lose > 0 && (
									<span className={`${classes.winRate} ${getWinRateClass(customWinRate)}`}>{customWinRate}%</span>
								)}
							</div>
							<div className={classes.decorLine} style={{ color: '#00d4ff' }} />
						</div>
					</div>

					{/* 최근 전적 & 연승/연패 통계 */}
					<div className={classes.statsSection}>
						<div className={classes.statsGrid}>
							<div className={classes.statCard}>
								<div className={classes.statLabel}>최근 10경기</div>
								<div className={`${classes.statValue} ${getRecentWinRateClass(recentWinRate)}`}>{recentWinRate}%</div>
								<div className={classes.statSubValue}>
									{recentWins}승 {recentGames - recentWins}패
								</div>
							</div>
							<div className={classes.statCard}>
								<div className={classes.statLabel}>최다 연승</div>
								<div className={`${classes.statValue} ${classes.streakWin}`}>{maxWinStreak}연승</div>
							</div>
							<div className={classes.statCard}>
								<div className={classes.statLabel}>최다 연패</div>
								<div className={`${classes.statValue} ${classes.streakLose}`}>{maxLoseStreak}연패</div>
							</div>
						</div>
					</div>

					{/* 베스트/워스트 하이라이트 */}
					<div className={classes.highlightSection}>
						{bestTeammate && (
							<div className={classes.highlightCard}>
								<div className={classes.highlightIcon}>
									<span role="img" aria-label="best teammate">
										🤝
									</span>
								</div>
								<div className={classes.highlightContent}>
									<div className={classes.highlightLabel}>함께하면 승률 최고</div>
									<div className={classes.highlightName}>{bestTeammate.name}</div>
									<div className={`${classes.highlightStat} ${classes.highlightBest}`}>
										{bestTeammate.games}판 ({bestTeammate.wins}승 {bestTeammate.losses}패) {bestTeammate.winRate}%
									</div>
								</div>
							</div>
						)}
						{bestOpponent && (
							<div className={classes.highlightCard}>
								<div className={classes.highlightIcon}>
									<span role="img" aria-label="best opponent">
										💪
									</span>
								</div>
								<div className={classes.highlightContent}>
									<div className={classes.highlightLabel}>상대 전적 최고</div>
									<div className={classes.highlightName}>{bestOpponent.name}</div>
									<div className={`${classes.highlightStat} ${classes.highlightBest}`}>
										{bestOpponent.games}판 ({bestOpponent.myWins}승 {bestOpponent.myLosses}패) {bestOpponent.winRate}%
									</div>
								</div>
							</div>
						)}
						{worstOpponent && (
							<div className={classes.highlightCard}>
								<div className={classes.highlightIcon}>
									<span role="img" aria-label="worst opponent">
										😰
									</span>
								</div>
								<div className={classes.highlightContent}>
									<div className={classes.highlightLabel}>상대 전적 최악</div>
									<div className={classes.highlightName}>{worstOpponent.name}</div>
									<div className={`${classes.highlightStat} ${classes.highlightWorst}`}>
										{worstOpponent.games}판 ({worstOpponent.myWins}승 {worstOpponent.myLosses}패){' '}
										{worstOpponent.winRate}%
									</div>
								</div>
							</div>
						)}
					</div>

					{/* 자주 함께한 팀원 / 자주 맞선 상대 */}
					<div className={classes.relationSection}>
						<div className={classes.relationCard}>
							<div className={classes.relationTitle}>
								<span role="img" aria-label="teammates" className={classes.relationTitleIcon}>
									👥
								</span>
								자주 함께한 팀원 Top 5
							</div>
							{topTeammates && topTeammates.length > 0 ? (
								<div className={classes.relationList}>
									{topTeammates.map((teammate, index) => (
										<div key={teammate.puuid} className={classes.relationItem}>
											<span className={classes.relationRank}>{index + 1}</span>
											<span className={classes.relationName}>{teammate.name}</span>
											<div className={classes.relationStats}>
												<span className={classes.relationGames}>
													{teammate.games}판 ({teammate.wins}승 {teammate.games - teammate.wins}패)
												</span>
												<span className={`${classes.relationWinRate} ${getWinRateClass(teammate.winRate)}`}>
													{teammate.winRate}%
												</span>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className={classes.noData}>데이터가 없습니다</div>
							)}
						</div>

						<div className={classes.relationCard}>
							<div className={classes.relationTitle}>
								<span role="img" aria-label="opponents" className={classes.relationTitleIcon}>
									⚔️
								</span>
								자주 맞선 상대 Top 5
							</div>
							{topOpponents && topOpponents.length > 0 ? (
								<div className={classes.relationList}>
									{topOpponents.map((opponent, index) => (
										<div key={opponent.puuid} className={classes.relationItem}>
											<span className={classes.relationRank}>{index + 1}</span>
											<span className={classes.relationName}>{opponent.name}</span>
											<div className={classes.relationStats}>
												<span className={classes.relationGames}>
													{opponent.games}판 ({opponent.myWins}승 {opponent.myLosses}패)
												</span>
												<span className={`${classes.relationWinRate} ${getWinRateClass(opponent.winRate)}`}>
													{opponent.winRate}%
												</span>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className={classes.noData}>데이터가 없습니다</div>
							)}
						</div>
					</div>

					{/* 레이팅 차트 */}
					<RatingChart />
				</div>
			}
		/>
	);
}

export default withReducer('MyInfo', reducer)(MyInfoPage);
