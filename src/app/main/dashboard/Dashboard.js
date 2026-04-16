import React, { useEffect, useState, useCallback } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useDispatch, useSelector } from 'react-redux';
import withReducer from 'app/store/withReducer';
import { DashboardSkeleton } from '../components/SkeletonLoaders';
import DashboardHeader from './DashboardHeader';
import reducer from './store/reducers';
import * as Actions from './store/actions';

const fadeInUp = keyframes({
	'0%': { opacity: 0, transform: 'translateY(30px)' },
	'100%': { opacity: 1, transform: 'translateY(0)' }
});

const pulse = keyframes({
	'0%, 100%': { transform: 'scale(1)' },
	'50%': { transform: 'scale(1.05)' }
});

const useStyles = makeStyles()((theme) => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	},
	container: {
		padding: '24px',
		maxWidth: 1400,
		margin: '0 auto'
	},
	monthBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 8,
		background: 'rgba(0, 212, 255, 0.1)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		borderRadius: 8,
		padding: '4px 8px 4px 4px',
		marginBottom: 24
	},
	monthNavBtn: {
		color: '#00d4ff',
		padding: 4,
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.15)'
		},
		'&.Mui-disabled': {
			color: 'rgba(0, 212, 255, 0.2)'
		}
	},
	monthText: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.7rem',
		fontWeight: 600,
		color: '#00d4ff',
		letterSpacing: '0.05em'
	},
	totalMatches: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
		gap: 20
	},
	card: {
		position: 'relative',
		borderRadius: 16,
		padding: 28,
		overflow: 'hidden',
		transition: 'transform 0.3s ease, box-shadow 0.3s ease',
		animation: `${fadeInUp} 0.6s ease forwards`,
		opacity: 0,
		'&:hover': {
			transform: 'translateY(-4px) scale(1.02)',
			boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
		}
	},
	cardMostGames: {
		background: 'linear-gradient(135deg, #1f2535 0%, #121828 100%)',
		border: '1px solid rgba(77, 171, 247, 0.3)',
		animationDelay: '0.2s',
		'&:hover': {
			boxShadow: '0 20px 40px rgba(77, 171, 247, 0.2)'
		}
	},
	cardBestWinRate: {
		background: 'linear-gradient(135deg, #2d2a1f 0%, #1a1812 100%)',
		border: '1px solid rgba(255, 215, 0, 0.3)',
		animationDelay: '0.3s',
		'&:hover': {
			boxShadow: '0 20px 40px rgba(255, 215, 0, 0.2)'
		}
	},
	cardWinStreak: {
		background: 'linear-gradient(135deg, #2d1f1f 0%, #1a1210 100%)',
		border: '1px solid rgba(255, 140, 0, 0.3)',
		animationDelay: '0.4s',
		'&:hover': {
			boxShadow: '0 20px 40px rgba(255, 140, 0, 0.2)'
		}
	},
	cardBestDuo: {
		background: 'linear-gradient(135deg, #2d1f2a 0%, #1a1218 100%)',
		border: '1px solid rgba(255, 105, 180, 0.3)',
		animationDelay: '0.5s',
		'&:hover': {
			boxShadow: '0 20px 40px rgba(255, 105, 180, 0.2)'
		}
	},
	cardRivalry: {
		background: 'linear-gradient(135deg, #1f1f2d 0%, #12121a 100%)',
		border: '1px solid rgba(138, 43, 226, 0.3)',
		animationDelay: '0.6s',
		'&:hover': {
			boxShadow: '0 20px 40px rgba(138, 43, 226, 0.2)'
		}
	},
	cardNewcomer: {
		background: 'linear-gradient(135deg, #1f2d1f 0%, #121a12 100%)',
		border: '1px solid rgba(0, 255, 127, 0.3)',
		animationDelay: '0.7s',
		'&:hover': {
			boxShadow: '0 20px 40px rgba(0, 255, 127, 0.2)'
		}
	},
	cardRatingRiser: {
		background: 'linear-gradient(135deg, #1f2a2d 0%, #121a1c 100%)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		animationDelay: '0.8s',
		'&:hover': {
			boxShadow: '0 20px 40px rgba(0, 212, 255, 0.2)'
		}
	},
	cardNightOwl: {
		background: 'linear-gradient(135deg, #1a1f2d 0%, #0f1220 100%)',
		border: '1px solid rgba(75, 0, 130, 0.3)',
		animationDelay: '0.9s',
		'&:hover': {
			boxShadow: '0 20px 40px rgba(75, 0, 130, 0.2)'
		}
	},
	cardDarkHorse: {
		background: 'linear-gradient(135deg, #2d2d1f 0%, #1a1a12 100%)',
		border: '1px solid rgba(184, 134, 11, 0.3)',
		animationDelay: '1.0s',
		'&:hover': {
			boxShadow: '0 20px 40px rgba(184, 134, 11, 0.2)'
		}
	},
	cardHonorKing: {
		background: 'linear-gradient(135deg, #2d2a1f 0%, #1a1710 100%)',
		border: '1px solid rgba(255, 193, 7, 0.3)',
		animationDelay: '0.1s',
		'&:hover': {
			boxShadow: '0 20px 40px rgba(255, 193, 7, 0.2)'
		}
	},
	cardEmpty: {
		background: 'linear-gradient(135deg, #1a1a1a 0%, #121212 100%)',
		border: '1px solid rgba(255, 255, 255, 0.1)'
	},
	cardHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		marginBottom: 16
	},
	emoji: {
		fontSize: '3rem',
		filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
	},
	cardTitleWrapper: {
		flex: 1
	},
	cardLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 4,
		letterSpacing: '0.02em'
	},
	cardTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.7rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.03em'
	},
	cardContent: {
		marginTop: 8
	},
	playerName: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2.6rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.02em',
		textShadow: '0 2px 10px rgba(0,0,0,0.3)',
		marginBottom: 14
	},
	duoNames: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2.2rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.02em',
		marginBottom: 14,
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		flexWrap: 'wrap'
	},
	heart: {
		color: '#ff69b4',
		fontSize: '1.8rem',
		animation: `${pulse} 1.5s ease infinite`
	},
	versus: {
		color: '#8a2be2',
		fontSize: '1.6rem',
		fontWeight: 600
	},
	stats: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.35rem',
		color: 'rgba(255, 255, 255, 0.8)',
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		flexWrap: 'wrap'
	},
	statHighlight: {
		fontWeight: 700,
		padding: '5px 14px',
		borderRadius: 6,
		fontSize: '1.35rem'
	},
	highlightRed: {
		background: 'rgba(77, 171, 247, 0.2)',
		color: '#4dabf7'
	},
	highlightGold: {
		background: 'rgba(255, 215, 0, 0.2)',
		color: '#ffd700'
	},
	highlightOrange: {
		background: 'rgba(255, 140, 0, 0.2)',
		color: '#ff8c00'
	},
	highlightPink: {
		background: 'rgba(255, 105, 180, 0.2)',
		color: '#ff69b4'
	},
	highlightPurple: {
		background: 'rgba(138, 43, 226, 0.2)',
		color: '#8a2be2'
	},
	highlightGreen: {
		background: 'rgba(0, 255, 127, 0.2)',
		color: '#00ff7f'
	},
	highlightIndigo: {
		background: 'rgba(75, 0, 130, 0.2)',
		color: '#9370db'
	},
	highlightDarkGold: {
		background: 'rgba(184, 134, 11, 0.2)',
		color: '#daa520'
	},
	streakNumber: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '4rem',
		fontWeight: 700,
		color: '#ff8c00',
		textShadow: '0 0 30px rgba(255, 140, 0, 0.5)',
		lineHeight: 1
	},
	streakLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginLeft: 8
	},
	rivalryScore: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		marginTop: 14
	},
	rivalryWins: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '2.1rem',
		fontWeight: 700
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: '28px 0'
	},
	decorLine: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: 3,
		background: 'linear-gradient(90deg, transparent, currentColor, transparent)',
		opacity: 0.5
	},
	firstMatchDate: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginTop: 10
	},
	tierBadge: {
		display: 'flex',
		alignItems: 'center',
		gap: 4
	},
	tierEmblemSmall: {
		width: 28,
		height: 28
	},
	tierShortName: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: '#fff'
	},
	tierArrow: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.4)'
	}
}));

function Dashboard() {
	const { classes } = useStyles();
	const dispatch = useDispatch();

	const user = useSelector(state => state.auth.user);
	const { data, loading } = useSelector(({ Dashboard: db }) => db.dashboard);

	const getCurrentMonth = () => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
	};

	const [month, setMonth] = useState(getCurrentMonth);

	useEffect(() => {
		if (user?.reprGroup?.groupId) {
			dispatch(Actions.getDashboard(user.reprGroup.groupId, month));
		}
	}, [dispatch, user, month]);

	const handlePrevMonth = useCallback(() => {
		setMonth(prev => {
			const [y, m] = prev.split('-').map(Number);
			const d = new Date(y, m - 2, 1);
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
		});
	}, []);

	const handleNextMonth = useCallback(() => {
		setMonth(prev => {
			const [y, m] = prev.split('-').map(Number);
			const d = new Date(y, m, 1);
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
		});
	}, []);

	const isCurrentMonth = month === getCurrentMonth();

	if (loading || !data) {
		return (
			<FusePageSimple
				classes={{ root: classes.layoutRoot }}
				header={<DashboardHeader />}
				content={<DashboardSkeleton />}
			/>
		);
	}

	const formatMonth = (monthStr) => {
		if (!monthStr) return '';
		const [year, month] = monthStr.split('-');
		return `${year}년 ${parseInt(month, 10)}월`;
	};

	const renderMostGames = () => {
		const item = data.mostGames;
		return (
			<div className={`${classes.card} ${item ? classes.cardMostGames : classes.cardEmpty}`}>
				<div className={classes.cardHeader}>
					<span role="img" aria-label="alarm" className={classes.emoji}>🚨</span>
					<div className={classes.cardTitleWrapper}>
						<div className={classes.cardLabel}>최다 판수</div>
						<div className={classes.cardTitle}>현생.. 괜찮죠..?</div>
					</div>
				</div>
				{item ? (
					<div className={classes.cardContent}>
						<div className={classes.playerName}>{item.name}</div>
						<div className={classes.stats}>
							<span className={`${classes.statHighlight} ${classes.highlightRed}`}>{item.games}판</span>
							<span>{item.wins}승 {item.losses}패</span>
							<span>({item.winRate}%)</span>
						</div>
					</div>
				) : (
					<div className={classes.emptyText}>데이터가 없습니다</div>
				)}
				<div className={classes.decorLine} style={{ color: '#4dabf7' }} />
			</div>
		);
	};

	const renderBestWinRate = () => {
		const item = data.bestWinRate;
		return (
			<div className={`${classes.card} ${item ? classes.cardBestWinRate : classes.cardEmpty}`}>
				<div className={classes.cardHeader}>
					<span role="img" aria-label="bus" className={classes.emoji}>🚍</span>
					<div className={classes.cardTitleWrapper}>
						<div className={classes.cardLabel}>{item?.minGames || 5}판 이상 최고 승률</div>
						<div className={classes.cardTitle}>버스 기사 등장</div>
					</div>
				</div>
				{item ? (
					<div className={classes.cardContent}>
						<div className={classes.playerName}>{item.name}</div>
						<div className={classes.stats}>
							<span className={`${classes.statHighlight} ${classes.highlightGold}`}>{item.winRate}%</span>
							<span>{item.games}판</span>
							<span>{item.wins}승 {item.losses}패</span>
						</div>
					</div>
				) : (
					<div className={classes.emptyText}>데이터가 없습니다</div>
				)}
				<div className={classes.decorLine} style={{ color: '#ffd700' }} />
			</div>
		);
	};

	const renderWinStreak = () => {
		const item = data.longestWinStreak;
		return (
			<div className={`${classes.card} ${item ? classes.cardWinStreak : classes.cardEmpty}`}>
				<div className={classes.cardHeader}>
					<span role="img" aria-label="fire" className={classes.emoji}>🔥</span>
					<div className={classes.cardTitleWrapper}>
						<div className={classes.cardLabel}>최다 연승</div>
						<div className={classes.cardTitle}>헬퍼 사용자</div>
					</div>
				</div>
				{item ? (
					<div className={classes.cardContent}>
						<div className={classes.playerName}>{item.name}</div>
						<div className={classes.stats}>
							<span className={classes.streakNumber}>{item.streak}</span>
							<span className={classes.streakLabel}>연승</span>
						</div>
					</div>
				) : (
					<div className={classes.emptyText}>데이터가 없습니다</div>
				)}
				<div className={classes.decorLine} style={{ color: '#ff8c00' }} />
			</div>
		);
	};

	const renderBestDuo = () => {
		const item = data.bestDuo;
		return (
			<div className={`${classes.card} ${item ? classes.cardBestDuo : classes.cardEmpty}`}>
				<div className={classes.cardHeader}>
					<span role="img" aria-label="hearts" className={classes.emoji}>💕</span>
					<div className={classes.cardTitleWrapper}>
						<div className={classes.cardLabel}>{item?.minGames || 3}판 이상 듀오 최고 승률</div>
						<div className={classes.cardTitle}>전생에 부부</div>
					</div>
				</div>
				{item ? (
					<div className={classes.cardContent}>
						<div className={classes.duoNames}>
							<span>{item.name1}</span>
							<span className={classes.heart}>♥</span>
							<span>{item.name2}</span>
						</div>
						<div className={classes.stats}>
							<span className={`${classes.statHighlight} ${classes.highlightPink}`}>{item.winRate}%</span>
							<span>{item.games}판</span>
							<span>{item.wins}승 {item.losses}패</span>
						</div>
					</div>
				) : (
					<div className={classes.emptyText}>데이터가 없습니다</div>
				)}
				<div className={classes.decorLine} style={{ color: '#ff69b4' }} />
			</div>
		);
	};

	const renderRivalry = () => {
		const item = data.mostRivalry;
		return (
			<div className={`${classes.card} ${item ? classes.cardRivalry : classes.cardEmpty}`}>
				<div className={classes.cardHeader}>
					<span role="img" aria-label="swords" className={classes.emoji}>⚔️</span>
					<div className={classes.cardTitleWrapper}>
						<div className={classes.cardLabel}>상대 전적 최다 판수</div>
						<div className={classes.cardTitle}>톰과 제리</div>
					</div>
				</div>
				{item ? (
					<div className={classes.cardContent}>
						<div className={classes.duoNames}>
							<span>{item.name1}</span>
							<span className={classes.versus}>↔</span>
							<span>{item.name2}</span>
						</div>
						<div className={classes.stats}>
							<span className={`${classes.statHighlight} ${classes.highlightPurple}`}>{item.games}판</span>
							<span className={classes.rivalryWins} style={{ color: '#4dabf7' }}>{item.player1Wins}승</span>
							<span style={{ color: 'rgba(255,255,255,0.3)' }}>vs</span>
							<span className={classes.rivalryWins} style={{ color: '#ff6b6b' }}>{item.player2Wins}승</span>
						</div>
					</div>
				) : (
					<div className={classes.emptyText}>데이터가 없습니다</div>
				)}
				<div className={classes.decorLine} style={{ color: '#8a2be2' }} />
			</div>
		);
	};

	const renderRatingRiser = () => {
		const item = data.topRatingRiser;
		const tierBases = [
			['CHALLENGER', 1150], ['GRANDMASTER', 1000], ['MASTER', 900],
			['DIAMOND', 800], ['EMERALD', 700], ['PLATINUM', 600],
			['GOLD', 500], ['SILVER', 400], ['BRONZE', 300], ['IRON', 200]
		];
		const divisionNames = ['IV', 'III', 'II', 'I'];
		const highTiers = ['MASTER', 'GRANDMASTER', 'CHALLENGER'];
		const tierShortNames = {
			IRON: 'I', BRONZE: 'B', SILVER: 'S', GOLD: 'G',
			PLATINUM: 'P', EMERALD: 'E', DIAMOND: 'D',
			MASTER: 'M', GRANDMASTER: 'GM', CHALLENGER: 'C'
		};

		const getTierInfo = (rating) => {
			for (const [name, base] of tierBases) {
				if (rating >= base) {
					if (highTiers.includes(name)) {
						return { tier: name, short: tierShortNames[name], division: '' };
					}
					const divIdx = Math.min(Math.floor((rating - base) / 25), 3);
					return { tier: name, short: tierShortNames[name], division: divisionNames[divIdx] };
				}
			}
			return { tier: 'IRON', short: 'I', division: 'IV' };
		};

		const divisionToNum = (div) => {
			const map = { IV: '4', III: '3', II: '2', I: '1' };
			return map[div] || '';
		};

		const renderTierBadge = (rating) => {
			const info = getTierInfo(rating);
			const label = info.division ? `${info.short}${divisionToNum(info.division)}` : info.short;
			return (
				<span className={classes.tierBadge}>
					<img
						className={classes.tierEmblemSmall}
						src={`/assets/images/ranked-emblems/Emblem_${info.tier}.webp`}
						alt={info.tier}
					/>
					<span className={classes.tierShortName}>{label}</span>
				</span>
			);
		};

		return (
			<div className={`${classes.card} ${item ? classes.cardRatingRiser : classes.cardEmpty}`}>
				<div className={classes.cardHeader}>
					<span role="img" aria-label="sparkles" className={classes.emoji}>✨</span>
					<div className={classes.cardTitleWrapper}>
						<div className={classes.cardLabel}>레이팅 상승 1등</div>
						<div className={classes.cardTitle}>깨달은 자</div>
					</div>
				</div>
				{item ? (
					<div className={classes.cardContent}>
						<div className={classes.playerName}>{item.name}</div>
						<div className={classes.stats}>
							{renderTierBadge(item.startRating)}
							<span className={classes.tierArrow}>→</span>
							{renderTierBadge(item.endRating)}
							<span>{item.games}판</span>
						</div>
					</div>
				) : (
					<div className={classes.emptyText}>데이터가 없습니다</div>
				)}
				<div className={classes.decorLine} style={{ color: '#00d4ff' }} />
			</div>
		);
	};

	const renderNightOwl = () => {
		const item = data.nightOwl;
		return (
			<div className={`${classes.card} ${item ? classes.cardNightOwl : classes.cardEmpty}`}>
				<div className={classes.cardHeader}>
					<span role="img" aria-label="crescent moon" className={classes.emoji}>🌙</span>
					<div className={classes.cardTitleWrapper}>
						<div className={classes.cardLabel}>새벽 경기 비율 1등</div>
						<div className={classes.cardTitle}>새벽 전사</div>
					</div>
				</div>
				{item ? (
					<div className={classes.cardContent}>
						<div className={classes.playerName}>{item.name}</div>
						<div className={classes.stats}>
							<span className={`${classes.statHighlight} ${classes.highlightIndigo}`}>{item.lateNightRate}%</span>
							<span>{item.games}판 중 {item.lateNightGames}판</span>
						</div>
					</div>
				) : (
					<div className={classes.emptyText}>데이터가 없습니다</div>
				)}
				<div className={classes.decorLine} style={{ color: '#4b0082' }} />
			</div>
		);
	};

	const renderHonorKing = () => {
		const item = data.honorKing;
		return (
			<div className={`${classes.card} ${item ? classes.cardHonorKing : classes.cardEmpty}`} style={{ animationDelay: '0.1s' }}>
				<div className={classes.cardHeader}>
					<span role="img" aria-label="trophy" className={classes.emoji}>
						🏆
					</span>
					<div className={classes.cardTitleWrapper}>
						<div className={classes.cardLabel}>이달의 MVP 투표 1등</div>
						<div className={classes.cardTitle}>명예왕</div>
					</div>
				</div>
				{item ? (
					<div className={classes.cardContent}>
						<div className={classes.playerName}>{item.name}</div>
						<div className={classes.stats}>
							<span className={`${classes.statHighlight} ${classes.highlightGold}`}>{item.votes}표</span>
						{item.title && (
							<span>
								<span role="img" aria-label="title badge">{item.title.emoji}</span>
								{' '}{item.title.title}
							</span>
						)}
						</div>
					</div>
				) : (
					<div className={classes.emptyText}>데이터가 없습니다</div>
				)}
				<div className={classes.decorLine} style={{ color: '#ffc107' }} />
			</div>
		);
	};

	const renderDarkHorse = () => {
		const item = data.darkHorse;
		return (
			<div className={`${classes.card} ${item ? classes.cardDarkHorse : classes.cardEmpty}`}>
				<div className={classes.cardHeader}>
					<span role="img" aria-label="horse" className={classes.emoji}>🐴</span>
					<div className={classes.cardTitleWrapper}>
						<div className={classes.cardLabel}>팀내 최저 레이팅 승리 횟수 1등</div>
						<div className={classes.cardTitle}>다크호스</div>
					</div>
				</div>
				{item ? (
					<div className={classes.cardContent}>
						<div className={classes.playerName}>{item.name}</div>
						<div className={classes.stats}>
							<span className={`${classes.statHighlight} ${classes.highlightDarkGold}`}>{item.darkHorseWinRate}%</span>
							<span>총 {item.games}판 중 {item.darkHorseGames}판 최저 레이팅 / {item.darkHorseWins}승 {item.darkHorseGames - item.darkHorseWins}패</span>
						</div>
					</div>
				) : (
					<div className={classes.emptyText}>데이터가 없습니다</div>
				)}
				<div className={classes.decorLine} style={{ color: '#b8860b' }} />
			</div>
		);
	};

	const renderNewcomer = () => {
		const item = data.topNewcomer;
		const formatDate = (dateStr) => {
			if (!dateStr) return '';
			const date = new Date(dateStr);
			return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
		};

		return (
			<div className={`${classes.card} ${item ? classes.cardNewcomer : classes.cardEmpty}`}>
				<div className={classes.cardHeader}>
					<span role="img" aria-label="baby" className={classes.emoji}>👶</span>
					<div className={classes.cardTitleWrapper}>
						<div className={classes.cardLabel}>신규 유저 최다 판수</div>
						<div className={classes.cardTitle}>고인물 예약</div>
					</div>
				</div>
				{item ? (
					<div className={classes.cardContent}>
						<div className={classes.playerName}>{item.name}</div>
						<div className={classes.stats}>
							<span className={`${classes.statHighlight} ${classes.highlightGreen}`}>{item.games}판</span>
							<span>첫 내전: {formatDate(item.firstMatchDate)}</span>
						</div>
					</div>
				) : (
					<div className={classes.emptyText}>데이터가 없습니다</div>
				)}
				<div className={classes.decorLine} style={{ color: '#00ff7f' }} />
			</div>
		);
	};

	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot
			}}
			header={<DashboardHeader />}
			content={
				<div className={classes.container}>
					<div className={classes.monthBadge}>
						<IconButton className={classes.monthNavBtn} onClick={handlePrevMonth} size="small">
							<ChevronLeftIcon />
						</IconButton>
						<span className={classes.monthText}>{formatMonth(data.month)}</span>
						<span className={classes.totalMatches}>총 {data.totalMatches}판</span>
						<IconButton className={classes.monthNavBtn} onClick={handleNextMonth} size="small" disabled={isCurrentMonth}>
							<ChevronRightIcon />
						</IconButton>
					</div>
					<div className={classes.grid}>
						{renderHonorKing()}
						{renderMostGames()}
						{renderBestWinRate()}
						{renderWinStreak()}
						{renderBestDuo()}
						{renderRivalry()}
						{renderNewcomer()}
						{renderRatingRiser()}
						{renderNightOwl()}
						{renderDarkHorse()}
					</div>
				</div>
			}
		/>
	);
}

export default withReducer('Dashboard', reducer)(Dashboard);
