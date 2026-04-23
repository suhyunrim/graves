import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService';
import * as Actions from './store/actions';

const fadeInUp = keyframes`
	0% { opacity: 0; transform: translateY(12px); }
	100% { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
	0% { background-position: -200% 0; }
	100% { background-position: 200% 0; }
`;

const useStyles = makeStyles()((theme) => ({
	container: {
		width: '100%'
	},
	// My rank card
	myRankCard: {
		position: 'relative',
		background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(0, 102, 255, 0.06) 100%)',
		border: '1px solid rgba(0, 212, 255, 0.4)',
		borderRadius: 20,
		padding: '22px 28px',
		marginBottom: 24,
		overflow: 'hidden',
		animation: `${fadeInUp} 0.5s ease`,
		'&::before': {
			content: '""',
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			height: 2,
			background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.8), transparent)',
			backgroundSize: '200% 100%',
			animation: `${shimmer} 3.5s linear infinite`
		},
		[theme.breakpoints.down('sm')]: {
			padding: '18px 18px'
		}
	},
	myRankPodium: {
		background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.14) 0%, rgba(255, 170, 51, 0.06) 100%)',
		border: '1px solid rgba(255, 215, 0, 0.45)'
	},
	myRankEmpty: {
		background: 'linear-gradient(135deg, rgba(255, 170, 51, 0.10) 0%, rgba(255, 100, 100, 0.04) 100%)',
		border: '1px solid rgba(255, 170, 51, 0.35)'
	},
	myRankRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 18,
		[theme.breakpoints.down('sm')]: {
			flexWrap: 'wrap',
			gap: 14
		}
	},
	myRankIcon: {
		fontSize: '2.8rem',
		lineHeight: 1,
		flexShrink: 0
	},
	myRankMain: {
		flex: 1,
		minWidth: 0
	},
	myRankLabel: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.08em',
		textTransform: 'uppercase',
		marginBottom: 4
	},
	myRankValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		color: '#fff',
		lineHeight: 1.1,
		display: 'flex',
		alignItems: 'baseline',
		gap: 6,
		flexWrap: 'wrap'
	},
	myRankUnit: {
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.4)',
		fontWeight: 400
	},
	myRankSub: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.65)',
		marginTop: 6
	},
	myRankUnlockCount: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#00d4ff',
		flexShrink: 0,
		textAlign: 'right',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.5rem',
			textAlign: 'left'
		}
	},
	// Search/filter
	filterBar: {
		display: 'flex',
		gap: 12,
		alignItems: 'center',
		marginBottom: 14,
		flexWrap: 'wrap'
	},
	searchField: {
		flex: 1,
		minWidth: 200,
		maxWidth: 320,
		'& .MuiOutlinedInput-root': {
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.05rem',
			color: '#fff',
			background: 'rgba(255, 255, 255, 0.03)',
			'& fieldset': {
				borderColor: 'rgba(255, 255, 255, 0.1)'
			},
			'&:hover fieldset': {
				borderColor: 'rgba(0, 212, 255, 0.3)'
			},
			'&.Mui-focused fieldset': {
				borderColor: '#00d4ff'
			}
		},
		'& .MuiInputBase-input::placeholder': {
			color: 'rgba(255, 255, 255, 0.35)',
			opacity: 1
		}
	},
	filterStats: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	// Podium
	podiumWrap: {
		marginBottom: 24,
		animation: `${fadeInUp} 0.6s ease`
	},
	podium: {
		display: 'grid',
		gridTemplateColumns: '1fr 1.15fr 1fr',
		gap: 14,
		alignItems: 'end',
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr',
			gap: 10
		}
	},
	podiumCard: {
		position: 'relative',
		borderRadius: 18,
		padding: '20px 16px',
		textAlign: 'center',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		textDecoration: 'none',
		color: 'inherit',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 10,
		transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
		overflow: 'hidden',
		'&:hover': {
			transform: 'translateY(-4px)',
			boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
		}
	},
	podium1: {
		background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.14) 0%, rgba(255, 170, 51, 0.05) 100%)',
		borderColor: 'rgba(255, 215, 0, 0.5)',
		minHeight: 230,
		[theme.breakpoints.down('sm')]: {
			minHeight: 180,
			order: 1
		}
	},
	podium2: {
		background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.12) 0%, rgba(160, 160, 160, 0.04) 100%)',
		borderColor: 'rgba(192, 192, 192, 0.45)',
		minHeight: 200,
		[theme.breakpoints.down('sm')]: {
			minHeight: 170,
			order: 2
		}
	},
	podium3: {
		background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.12) 0%, rgba(139, 69, 19, 0.04) 100%)',
		borderColor: 'rgba(205, 127, 50, 0.45)',
		minHeight: 180,
		[theme.breakpoints.down('sm')]: {
			minHeight: 160,
			order: 3
		}
	},
	podiumMedal: {
		fontSize: '3rem',
		lineHeight: 1,
		filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.4))'
	},
	podiumAvatar: {
		width: 56,
		height: 56,
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		border: '3px solid'
	},
	podiumAvatar1: {
		borderColor: '#FFD700',
		boxShadow: '0 0 16px rgba(255, 215, 0, 0.5)'
	},
	podiumAvatar2: {
		borderColor: '#C0C0C0',
		boxShadow: '0 0 14px rgba(192, 192, 192, 0.45)'
	},
	podiumAvatar3: {
		borderColor: '#CD7F32',
		boxShadow: '0 0 14px rgba(205, 127, 50, 0.45)'
	},
	podiumName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 700,
		color: '#fff',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		maxWidth: '100%',
		padding: '0 4px'
	},
	podiumCount: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff',
		lineHeight: 1
	},
	podiumCountSuffix: {
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		fontWeight: 400,
		marginLeft: 2
	},
	podiumRankLabel: {
		position: 'absolute',
		top: 10,
		left: 12,
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.85rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.4)',
		letterSpacing: '0.05em'
	},
	// List (rank 4+)
	listCard: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.18)',
		borderRadius: 18,
		overflow: 'hidden',
		animation: `${fadeInUp} 0.6s ease`
	},
	listHeader: {
		display: 'grid',
		gridTemplateColumns: '60px 1fr 100px',
		padding: '12px 20px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
		background: 'rgba(0, 212, 255, 0.04)',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '0.9rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.5)',
		letterSpacing: '0.08em',
		textTransform: 'uppercase',
		[theme.breakpoints.down('sm')]: {
			padding: '10px 14px',
			gridTemplateColumns: '48px 1fr 80px'
		}
	},
	row: {
		display: 'grid',
		gridTemplateColumns: '60px 1fr 100px',
		alignItems: 'center',
		padding: '12px 20px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
		textDecoration: 'none',
		transition: 'background 0.15s ease',
		'&:last-of-type': {
			borderBottom: 'none'
		},
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.05)'
		},
		[theme.breakpoints.down('sm')]: {
			padding: '10px 14px',
			gridTemplateColumns: '48px 1fr 80px'
		}
	},
	rowMe: {
		background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(0, 102, 255, 0.06) 100%)',
		boxShadow: 'inset 3px 0 0 #00d4ff',
		'&:hover': {
			background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.18) 0%, rgba(0, 102, 255, 0.1) 100%)'
		}
	},
	rowRank: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.35rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.5)',
		textAlign: 'center'
	},
	rowNameWrap: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		minWidth: 0
	},
	rowAvatar: {
		width: 32,
		height: 32,
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: '#fff',
		flexShrink: 0,
		border: '2px solid rgba(0, 0, 0, 0.25)'
	},
	rowName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: '#fff',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		minWidth: 0,
		flex: 1
	},
	meBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.8rem',
		fontWeight: 700,
		padding: '1px 6px',
		borderRadius: 4,
		background: 'rgba(0, 212, 255, 0.25)',
		border: '1px solid rgba(0, 212, 255, 0.5)',
		color: '#00d4ff',
		letterSpacing: '0.08em',
		flexShrink: 0,
		marginLeft: 6
	},
	rowCount: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#fff',
		textAlign: 'right'
	},
	rowCountZero: {
		color: 'rgba(255, 255, 255, 0.3)'
	},
	rowCountSuffix: {
		fontSize: '0.95rem',
		color: 'rgba(255, 255, 255, 0.4)',
		fontWeight: 400,
		marginLeft: 2
	},
	// Loading / empty
	loadingWrap: {
		display: 'flex',
		justifyContent: 'center',
		padding: '80px 0'
	},
	emptyState: {
		padding: '80px 20px',
		textAlign: 'center'
	},
	emptyIcon: {
		fontSize: '4rem',
		marginBottom: 16,
		opacity: 0.5
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.4)'
	}
}));

function getInitial(name) {
	if (!name) return '?';
	const clean = name.replace(/#.+$/, '').trim();
	return clean.charAt(0).toUpperCase();
}

function hashColor(key) {
	const palette = ['#00d4ff', '#ff7eb9', '#ffaa33', '#50c878', '#9b59b6', '#f1c40f', '#e74c3c', '#4dabf7'];
	let h = 0;
	for (let i = 0; i < key.length; i += 1) {
		h = (h * 31 + key.charCodeAt(i)) & 0xffff;
	}
	return palette[h % palette.length];
}

function AchievementUserRankingContent() {
	const { classes, cx } = useStyles();
	const dispatch = useDispatch();

	const user = useSelector(state => state.auth.user);
	const groupId = user?.reprGroup?.groupId;
	const myPuuid = camilleRiotAuthService.getPuuid();

	const userRanking = useSelector(
		({ AchievementDashboard }) => AchievementDashboard.achievementDashboard.userRanking
	);
	const loading = useSelector(
		({ AchievementDashboard }) => AchievementDashboard.achievementDashboard.userRankingLoading
	);

	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		if (groupId) {
			dispatch(Actions.getUserRanking(groupId));
		}
	}, [dispatch, groupId]);

	const myEntry = useMemo(() => {
		if (!userRanking?.rankings || !myPuuid) return null;
		return userRanking.rankings.find(r => r.puuid === myPuuid) || null;
	}, [userRanking, myPuuid]);

	const filteredRankings = useMemo(() => {
		const list = userRanking?.rankings || [];
		const q = searchText.trim().toLowerCase();
		if (!q) return list;
		return list.filter(r => r.name.toLowerCase().includes(q));
	}, [userRanking, searchText]);

	if (loading && !userRanking) {
		return (
			<div className={classes.container}>
				<div className={classes.loadingWrap}>
					<CircularProgress size={36} sx={{ color: '#00d4ff' }} />
				</div>
			</div>
		);
	}

	if (!userRanking || !userRanking.rankings) {
		return (
			<div className={classes.container}>
				<div className={classes.emptyState}>
					<div className={classes.emptyIcon}>
						<span role="img" aria-label="error">⚠️</span>
					</div>
					<div className={classes.emptyText}>랭킹 데이터를 불러오지 못했습니다</div>
				</div>
			</div>
		);
	}

	const { totalActiveUsers = 0, totalRanked = 0, rankings = [] } = userRanking;

	if (totalActiveUsers === 0) {
		return (
			<div className={classes.container}>
				<div className={classes.emptyState}>
					<div className={classes.emptyIcon}>
						<span role="img" aria-label="empty">👻</span>
					</div>
					<div className={classes.emptyText}>아직 그룹에 활성 멤버가 없습니다</div>
				</div>
			</div>
		);
	}

	const top1 = rankings.find(r => r.rank === 1);
	const top2 = rankings.find(r => r.rank === 2);
	const top3 = rankings.find(r => r.rank === 3);
	const restRankings = filteredRankings.filter(r => r.rank > 3);
	const showPodium = !searchText.trim();
	const podiumEmptyTop = !top1 || (top1.unlockCount || 0) === 0;

	const renderMyRankCard = () => {
		if (!myEntry || !myPuuid) return null;

		const isPodium = myEntry.rank <= 3 && myEntry.unlockCount > 0;
		const isZero = (myEntry.unlockCount || 0) === 0;
		const medal = myEntry.rank === 1 ? '🥇' : myEntry.rank === 2 ? '🥈' : myEntry.rank === 3 ? '🥉' : '🎯';
		const medalLabel =
			myEntry.rank === 1 ? 'first place' : myEntry.rank === 2 ? 'second place' : myEntry.rank === 3 ? 'third place' : 'target';

		if (isZero) {
			return (
				<div className={cx(classes.myRankCard, classes.myRankEmpty)}>
					<div className={classes.myRankRow}>
						<span role="img" aria-label="spark" className={classes.myRankIcon}>⚡</span>
						<div className={classes.myRankMain}>
							<div className={classes.myRankLabel}>내 순위</div>
							<div className={classes.myRankValue}>
								아직 업적이 없어요
							</div>
							<div className={classes.myRankSub}>첫 내전을 시작해보세요!</div>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className={cx(classes.myRankCard, isPodium && classes.myRankPodium)}>
				<div className={classes.myRankRow}>
					<span role="img" aria-label={medalLabel} className={classes.myRankIcon}>{medal}</span>
					<div className={classes.myRankMain}>
						<div className={classes.myRankLabel}>
							{isPodium ? `${myEntry.rank}위를 달성했어요!` : '내 순위'}
						</div>
						<div className={classes.myRankValue}>
							{myEntry.rank}
							<span className={classes.myRankUnit}>/ {totalActiveUsers}</span>
						</div>
					</div>
					<div className={classes.myRankUnlockCount}>
						{myEntry.unlockCount}
						<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
							{' '}개 해금
						</span>
					</div>
				</div>
			</div>
		);
	};

	const renderPodiumCard = (entry, rank) => {
		if (!entry) {
			return (
				<div className={cx(classes.podiumCard, classes[`podium${rank}`])}>
					<span className={classes.podiumRankLabel}>#{rank}</span>
					<span role="img" aria-label={`rank ${rank}`} className={classes.podiumMedal} style={{ opacity: 0.4 }}>
						{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
					</span>
					<div className={classes.podiumName} style={{ color: 'rgba(255,255,255,0.4)' }}>
						-
					</div>
				</div>
			);
		}
		const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
		const medalLabel = rank === 1 ? 'first place' : rank === 2 ? 'second place' : 'third place';
		const isMe = entry.puuid === myPuuid;
		return (
			<Link
				key={entry.puuid}
				to={`/userinfo/${entry.puuid}`}
				className={cx(classes.podiumCard, classes[`podium${rank}`])}
			>
				<span className={classes.podiumRankLabel}>#{rank}</span>
				<span role="img" aria-label={medalLabel} className={classes.podiumMedal}>
					{medal}
				</span>
				<div
					className={cx(classes.podiumAvatar, classes[`podiumAvatar${rank}`])}
					style={{
						background: `linear-gradient(135deg, ${hashColor(entry.puuid)}, ${hashColor(`${entry.puuid}x`)})`
					}}
				>
					{getInitial(entry.name)}
				</div>
				<div className={classes.podiumName}>
					{entry.name}
					{isMe && <span className={classes.meBadge}>ME</span>}
				</div>
				<div className={classes.podiumCount}>
					{entry.unlockCount}
					<span className={classes.podiumCountSuffix}>개</span>
				</div>
			</Link>
		);
	};

	return (
		<div className={classes.container}>
			{renderMyRankCard()}

			{/* Podium */}
			{showPodium && !podiumEmptyTop && (
				<div className={classes.podiumWrap}>
					<div className={classes.podium}>
						{renderPodiumCard(top2, 2)}
						{renderPodiumCard(top1, 1)}
						{renderPodiumCard(top3, 3)}
					</div>
				</div>
			)}

			{/* Filter bar */}
			<div className={classes.filterBar}>
				<TextField
					className={classes.searchField}
					placeholder="이름 검색"
					size="small"
					value={searchText}
					onChange={e => setSearchText(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }} />
							</InputAdornment>
						)
					}}
				/>
				<div className={classes.filterStats}>
					활성 멤버 {totalActiveUsers}명 · 1개 이상 해금 {totalRanked}명
				</div>
			</div>

			{/* Full list */}
			<div className={classes.listCard}>
				<div className={classes.listHeader}>
					<div style={{ textAlign: 'center' }}>순위</div>
					<div>이름</div>
					<div style={{ textAlign: 'right' }}>해금</div>
				</div>
				{totalRanked === 0 && !searchText ? (
					<div className={classes.emptyState}>
						<div className={classes.emptyIcon}>
							<span role="img" aria-label="empty">🏅</span>
						</div>
						<div className={classes.emptyText}>아직 업적을 해금한 멤버가 없어요</div>
					</div>
				) : (showPodium ? restRankings : filteredRankings).length === 0 ? (
					<div className={classes.emptyState}>
						<div className={classes.emptyText}>검색 결과가 없습니다</div>
					</div>
				) : (
					(showPodium ? restRankings : filteredRankings).map(r => {
						const isMe = r.puuid === myPuuid;
						const isZero = (r.unlockCount || 0) === 0;
						return (
							<Link
								key={r.puuid}
								to={`/userinfo/${r.puuid}`}
								className={cx(classes.row, isMe && classes.rowMe)}
							>
								<div className={classes.rowRank}>{r.rank}</div>
								<div className={classes.rowNameWrap}>
									<div
										className={classes.rowAvatar}
										style={{
											background: `linear-gradient(135deg, ${hashColor(r.puuid)}, ${hashColor(`${r.puuid}x`)})`
										}}
									>
										{getInitial(r.name)}
									</div>
									<span className={classes.rowName}>{r.name}</span>
									{isMe && <span className={classes.meBadge}>ME</span>}
								</div>
								<div className={cx(classes.rowCount, isZero && classes.rowCountZero)}>
									{r.unlockCount}
									<span className={classes.rowCountSuffix}>개</span>
								</div>
							</Link>
						);
					})
				)}
			</div>
		</div>
	);
}

export default AchievementUserRankingContent;
