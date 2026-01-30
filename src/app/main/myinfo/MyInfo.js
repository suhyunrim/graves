import React, { useEffect } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
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
		margin: '0 auto'
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
		animation: '$fadeIn 0.5s ease'
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
		marginBottom: 6
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
		marginBottom: 32
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
		textShadow: '0 2px 10px currentColor'
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
	ratingPoints: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.9rem',
		fontWeight: 700,
		color: '#00d4ff',
		marginTop: 14,
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	ratingBreakdown: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)'
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
	}
}));

function MyInfoPage(props) {
	const classes = useStyles(props);
	const dispatch = useDispatch();

	const user = useSelector(state => state.auth.user);
	const scoreInfo = useSelector(({ MyInfo }) => MyInfo.myInfo.scoreInfo);
	const summonerInfo = useSelector(({ MyInfo }) => MyInfo.myInfo.summonerInfo);

	const getSoloRankTierName = () => {
		const tier = summonerInfo.rankTier;
		if (!tier || tier === 'UNRANKED') return 'UNRANKED';
		return tier.split(' ')[0];
	};

	const getRatingTierName = () => {
		return scoreInfo.ratingTier.split(' ')[0];
	};

	const getProfileIconURI = () => {
		return `https://ddragon.leagueoflegends.com/cdn/${getLatesetRiotDataVersion()}/img/profileicon/${summonerInfo.profileIconId}.png`;
	};

	const getTierColor = (tierName) => {
		return tierColors[tierName] || tierColors.UNRANKED;
	};

	const getWinRateClass = (winRate) => {
		if (winRate >= 55) return classes.winRateHigh;
		if (winRate >= 45) return classes.winRateMid;
		return classes.winRateLow;
	};

	const calculateWinRate = (wins, losses) => {
		const total = wins + losses;
		if (total === 0) return 0;
		return Math.round((wins / total) * 100);
	};

	useEffect(() => {
		dispatch(Actions.getMyInfo(user.reprGroup.groupId));
	}, [dispatch, user]);

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
			header={<MyInfoHeader />}
			content={
				<div className={classes.container}>
					{/* 프로필 섹션 */}
					<div className={classes.profileSection}>
						<img
							className={classes.profileIcon}
							src={getProfileIconURI()}
							alt="Profile Icon"
						/>
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
									<div
										className={classes.tierText}
										style={{ color: soloTierColor.primary }}
									>
										{summonerInfo.rankTier}
									</div>
								</div>
							</div>
							<div className={classes.statsRow}>
								<span className={classes.statItem}>
									{summonerInfo.rankWin}승 {summonerInfo.rankLose}패
								</span>
								{(summonerInfo.rankWin + summonerInfo.rankLose) > 0 && (
									<span className={`${classes.winRate} ${getWinRateClass(soloWinRate)}`}>
										{soloWinRate}%
									</span>
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
									<div
										className={classes.tierText}
										style={{ color: ratingTierColor.primary }}
									>
										{scoreInfo.ratingTier}
									</div>
								</div>
							</div>
							<div className={classes.ratingPoints}>
								{scoreInfo.defaultRating + scoreInfo.additionalRating}p
								<span className={classes.ratingBreakdown}>
									({scoreInfo.defaultRating} {scoreInfo.additionalRating >= 0 ? '+' : '-'} {Math.abs(scoreInfo.additionalRating)})
								</span>
							</div>
							<div className={classes.statsRow}>
								<span className={classes.statItem}>
									{scoreInfo.win}승 {scoreInfo.lose}패
								</span>
								{(scoreInfo.win + scoreInfo.lose) > 0 && (
									<span className={`${classes.winRate} ${getWinRateClass(customWinRate)}`}>
										{customWinRate}%
									</span>
								)}
							</div>
							<div className={classes.decorLine} style={{ color: '#00d4ff' }} />
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
