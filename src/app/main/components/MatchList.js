import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import { makeStyles, withStyles } from 'tss-react/mui';
import { fadeInUp } from './Reveal';
import React from 'react';
import { useNavigate } from 'react-router-dom';

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

const tierThresholds = {
	IRON: 200,
	BRONZE: 300,
	SILVER: 400,
	GOLD: 500,
	PLATINUM: 600,
	EMERALD: 700,
	DIAMOND: 800,
	MASTER: 900,
	GRANDMASTER: 1000,
	CHALLENGER: 1150
};

const tierSteps = ['IV', 'III', 'II', 'I'];


// 다이얼로그 프리뷰 등 외부에서도 재사용하는 tier 헬퍼
export const getTierShortName = tier => {
	if (!tier) return '';
	const parts = tier.split(' ');
	const tierName = parts[0];
	const tierRank = parts[1];

	const tierMap = {
		IRON: 'I',
		BRONZE: 'B',
		SILVER: 'S',
		GOLD: 'G',
		PLATINUM: 'P',
		EMERALD: 'E',
		DIAMOND: 'D',
		MASTER: 'M',
		GRANDMASTER: 'GM',
		CHALLENGER: 'C'
	};

	const rankMap = {
		I: '1',
		II: '2',
		III: '3',
		IV: '4'
	};

	const shortTier = tierMap[tierName] || tierName.charAt(0);
	const shortRank = rankMap[tierRank] || '';

	return `${shortTier}${shortRank}`;
};

export const getTierIconName = tier => {
	if (!tier) return 'UNRANKED';
	return tier.split(' ')[0];
};

export const getTierColor = tier => {
	if (!tier) return '#fff';
	const tierName = tier.split(' ')[0];
	return tierColors[tierName] || '#fff';
};

const isNonStepTier = tierName => {
	return tierName === 'MASTER' || tierName === 'GRANDMASTER' || tierName === 'CHALLENGER';
};

const getTierNameFromRating = rating => {
	const entries = Object.entries(tierThresholds).sort((a, b) => b[1] - a[1]);
	const found = entries.find(([, tierRating]) => rating >= tierRating);
	return found ? found[0] : 'IRON';
};

const getRatingTierName = rating => {
	const entries = Object.entries(tierThresholds).sort((a, b) => b[1] - a[1]);
	const found = entries.find(([, tierRating]) => rating >= tierRating);
	if (!found) return 'IRON IV';
	const [name, tierRating] = found;
	if (isNonStepTier(name)) {
		return name;
	}
	return `${name} ${tierSteps[Math.floor((rating - tierRating) / 25)]}`;
};

const formatDate = utcDateString => {
	const date = new Date(utcDateString);
	const year = String(date.getFullYear()).slice(-2);
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const useStyles = makeStyles()(() => ({
	container: {
		padding: '28px',
		maxWidth: 1600,
		margin: '0 auto',
		width: '100%'
	},
	tableWrapper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.2)',
		overflow: 'hidden',
		'--reveal-distance': '20px',
		animation: `${fadeInUp} 0.6s ease`
	},
	headerCell: {
		backgroundColor: 'rgba(0, 212, 255, 0.08)',
		color: 'rgba(255, 255, 255, 0.9)',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		textTransform: 'uppercase',
		letterSpacing: '0.08em',
		borderBottom: '2px solid rgba(0, 212, 255, 0.3)',
		padding: '20px 16px'
	},
	winTeamCell: {
		borderLeft: '5px solid #00c853',
		backgroundColor: 'rgba(0, 200, 83, 0.35) !important'
	},
	loseTeamCell: {
		borderLeft: '5px solid #ff5252',
		backgroundColor: 'rgba(255, 82, 82, 0.3) !important'
	},
	winBadge: {
		display: 'inline-block',
		padding: '4px 12px',
		borderRadius: 6,
		background: 'linear-gradient(135deg, #00c853 0%, #00e676 100%)',
		color: '#fff',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700,
		textTransform: 'uppercase',
		letterSpacing: '0.05em',
		marginBottom: 8,
		boxShadow: '0 2px 8px rgba(0, 200, 83, 0.4)'
	},
	loseBadge: {
		display: 'inline-block',
		padding: '4px 12px',
		borderRadius: 6,
		background: 'linear-gradient(135deg, #ff5252 0%, #ff1744 100%)',
		color: '#fff',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700,
		textTransform: 'uppercase',
		letterSpacing: '0.05em',
		marginBottom: 8,
		boxShadow: '0 2px 8px rgba(255, 82, 82, 0.4)'
	},
	matchIdCell: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#00d4ff',
		textAlign: 'center',
		minWidth: 60
	},
	dateCell: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.7)',
		whiteSpace: 'nowrap'
	},
	// 본인 관점(perspective) 승/패 배지 + 내 LP 칩
	perspectiveRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginTop: 8
	},
	avgRatingWrapper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 6
	},
	avgTierDisplay: {
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	avgTierIcon: {
		width: 32,
		height: 32,
		transition: 'transform 0.2s ease',
		'&:hover': {
			transform: 'scale(1.15)'
		}
	},
	avgTierBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700,
		minWidth: 48,
		textAlign: 'center',
		padding: '3px 8px',
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.1)'
	},
	lpChange: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		marginTop: 2
	},
	ratingChange: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600
	},
	ratingUp: {
		color: '#00e676',
		textShadow: '0 0 8px rgba(0, 230, 118, 0.5)'
	},
	ratingDown: {
		color: '#ff5252',
		textShadow: '0 0 8px rgba(255, 82, 82, 0.5)'
	},
	ratingNeutral: {
		color: 'rgba(255, 255, 255, 0.5)'
	},
	playerList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 8
	},
	playerRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		padding: '4px 0'
	},
	tierIcon: {
		width: 28,
		height: 28,
		transition: 'transform 0.2s ease',
		'&:hover': {
			transform: 'scale(1.2)'
		}
	},
	tierBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		minWidth: 40,
		textAlign: 'center',
		padding: '2px 6px',
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.1)'
	},
	playerName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 500,
		color: '#fff',
		cursor: 'pointer'
	},
	playerNameHighlight: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.15)',
		padding: '2px 8px',
		borderRadius: 4,
		textShadow: '0 0 8px rgba(0, 212, 255, 0.5)',
		cursor: 'pointer'
	},
	teamLabel: {
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	teamEmoji: {
		fontSize: '1.6rem'
	},
	vsCell: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.3)',
		textAlign: 'center',
		padding: '0 8px'
	},
	pagination: {
		color: 'rgba(255, 255, 255, 0.7)',
		borderTop: '1px solid rgba(255, 255, 255, 0.1)',
		'& .MuiTablePagination-selectIcon': {
			color: 'rgba(255, 255, 255, 0.5)'
		},
		'& .MuiIconButton-root': {
			color: 'rgba(255, 255, 255, 0.5)'
		},
		'& .MuiIconButton-root.Mui-disabled': {
			color: 'rgba(255, 255, 255, 0.2)'
		},
		'& .MuiSelect-icon': {
			color: 'rgba(255, 255, 255, 0.5)'
		}
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
	// Mobile card styles
	mobileCardList: {
		padding: '16px'
	},
	mobileCard: {
		background: 'rgba(255, 255, 255, 0.03)',
		borderRadius: 16,
		marginBottom: 16,
		border: '1px solid rgba(255, 255, 255, 0.08)',
		overflow: 'hidden'
	},
	mobileCardHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: '12px 16px',
		background: 'rgba(0, 212, 255, 0.08)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
	},
	mobileMatchId: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#00d4ff'
	},
	mobileDate: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.6)'
	},
	mobileTeamSection: {
		padding: '12px 16px'
	},
	mobileTeamWin: {
		borderLeft: '4px solid #00c853',
		background: 'rgba(0, 200, 83, 0.08)'
	},
	mobileTeamLose: {
		borderLeft: '4px solid #ff5252',
		background: 'rgba(255, 82, 82, 0.05)'
	},
	mobileTeamHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10
	},
	mobileTeamInfo: {
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	mobileTeamEmoji: {
		fontSize: '1.4rem'
	},
	mobileTeamName: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.8)'
	},
	mobileBadgeWin: {
		padding: '3px 10px',
		borderRadius: 4,
		background: 'linear-gradient(135deg, #00c853 0%, #00e676 100%)',
		color: '#fff',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		fontWeight: 700,
		textTransform: 'uppercase'
	},
	mobileBadgeLose: {
		padding: '3px 10px',
		borderRadius: 4,
		background: 'linear-gradient(135deg, #ff5252 0%, #ff1744 100%)',
		color: '#fff',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		fontWeight: 700,
		textTransform: 'uppercase'
	},
	mobileRatingInfo: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-end',
		gap: 2
	},
	mobileAvgTierRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 4
	},
	mobileAvgTierIcon: {
		width: 20,
		height: 20
	},
	mobileAvgTierBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		fontWeight: 700,
		padding: '2px 6px',
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.1)'
	},
	mobileLpChange: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 600
	},
	mobileRatingChange: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600
	},
	mobilePlayerList: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: 6
	},
	mobilePlayerChip: {
		display: 'flex',
		alignItems: 'center',
		gap: 4,
		padding: '4px 8px',
		background: 'rgba(255, 255, 255, 0.06)',
		borderRadius: 6
	},
	mobilePlayerTierIcon: {
		width: 18,
		height: 18
	},
	mobilePlayerTier: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.9rem',
		fontWeight: 700
	},
	mobilePlayerName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: '#fff',
		cursor: 'pointer'
	},
	mobilePlayerNameHighlight: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		fontWeight: 700,
		color: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.15)',
		padding: '1px 6px',
		borderRadius: 4,
		textShadow: '0 0 6px rgba(0, 212, 255, 0.5)',
		cursor: 'pointer'
	},
	mobileVsDivider: {
		textAlign: 'center',
		padding: '6px 0',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.2)',
		background: 'rgba(0, 0, 0, 0.2)'
	},
	settingsBtn: {
		color: 'rgba(255, 255, 255, 0.4)',
		padding: 6,
		'&:hover': {
			color: '#00d4ff',
			backgroundColor: 'rgba(0, 212, 255, 0.1)'
		}
	},
	settingsIcon: {
		fontSize: '1.6rem'
	}
}));

const StyledTableCell = withStyles(TableCell, () => ({
	body: {
		backgroundColor: 'transparent',
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		padding: '16px'
	}
}));

const StyledTableRow = withStyles(TableRow, () => ({
	root: {
		transition: 'background-color 0.2s ease',
		'&:hover': {
			backgroundColor: 'rgba(0, 212, 255, 0.05)'
		}
	}
}));

/**
 * 매치 목록(데스크탑 테이블 + 모바일 카드 + 페이지네이션 + empty state) 공용 컴포넌트.
 *
 * props:
 *  - matches, total, page(1-base), rowsPerPage, onPageChange(nextPage 1-base)
 *  - isAdmin, onMenuOpen(e, match): 관리자 설정(복제/취소) 버튼. 미지정 시 버튼/컬럼 숨김
 *  - isHighlighted(player) => boolean: 강조할 플레이어 판별(선택, 예: 검색어 매칭)
 *  - perspectivePuuid: 지정 시 그 유저 이름 강조 + 매치별 승/패 배지 + 내 LP 칩 표시
 */
function MatchList({
	matches,
	total,
	page,
	rowsPerPage,
	onPageChange,
	isAdmin,
	onMenuOpen,
	isHighlighted,
	perspectivePuuid
}) {
	const { classes } = useStyles();
	const navigate = useNavigate();

	const showAdmin = Boolean(isAdmin && onMenuOpen);

	const isPlayerHighlighted = player =>
		(isHighlighted && isHighlighted(player)) || (perspectivePuuid && player.puuid === perspectivePuuid);

	// 본인 관점 승/패 + 내 LP 계산 (perspectivePuuid 있을 때만)
	const getPerspective = match => {
		if (!perspectivePuuid) return null;
		const inT1 = match.team1.players.some(p => p.puuid === perspectivePuuid);
		const inT2 = !inT1 && match.team2.players.some(p => p.puuid === perspectivePuuid);
		const myTeam = inT1 ? 1 : inT2 ? 2 : null;
		if (!myTeam) return null;
		const myTeamObj = myTeam === 1 ? match.team1 : match.team2;
		const myLp = myTeamObj.ratingChange == null ? null : myTeamObj.ratingChange * 4;
		return { won: match.winTeam === myTeam, myLp };
	};

	const renderLpSpan = (lp, cls) => {
		if (lp > 0) return <span className={`${cls} ${classes.ratingUp}`}>+{lp} LP</span>;
		if (lp < 0) return <span className={`${cls} ${classes.ratingDown}`}>{lp} LP</span>;
		return <span className={`${cls} ${classes.ratingNeutral}`}>0 LP</span>;
	};

	const renderPlayers = players => {
		const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
		return sortedPlayers.map(player => (
			<div key={player.puuid} className={classes.playerRow}>
				<img
					className={classes.tierIcon}
					src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(player.tier)}.webp`}
					alt={player.tier}
					style={{ filter: `drop-shadow(0 0 4px ${getTierColor(player.tier)}40)` }}
				/>
				<span className={classes.tierBadge} style={{ color: getTierColor(player.tier) }}>
					{getTierShortName(player.tier)}
				</span>
				<span
					className={isPlayerHighlighted(player) ? classes.playerNameHighlight : classes.playerName}
					onClick={() => navigate(`/userinfo/${player.puuid}`)}
				>
					{player.name}
				</span>
			</div>
		));
	};

	const renderMobilePlayers = players => {
		const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
		return sortedPlayers.map(player => (
			<div key={player.puuid} className={classes.mobilePlayerChip}>
				<img
					className={classes.mobilePlayerTierIcon}
					src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(player.tier)}.webp`}
					alt={player.tier}
				/>
				<span className={classes.mobilePlayerTier} style={{ color: getTierColor(player.tier) }}>
					{getTierShortName(player.tier)}
				</span>
				<span
					className={isPlayerHighlighted(player) ? classes.mobilePlayerNameHighlight : classes.mobilePlayerName}
					onClick={() => navigate(`/userinfo/${player.puuid}`)}
				>
					{player.name}
				</span>
			</div>
		));
	};

	const getDisplayId = index => total - ((page - 1) * rowsPerPage + index);

	return (
		<div className={classes.container}>
			<div className={classes.tableWrapper}>
				{matches && matches.length > 0 ? (
					<>
						{/* Desktop Table View */}
						<Box sx={{ display: { xs: 'none', md: 'block' } }}>
							<FuseScrollbars className="flex-grow overflow-x-auto">
								<Table>
									<TableHead>
										<TableRow>
											<TableCell className={classes.headerCell} align="center">
												#
											</TableCell>
											<TableCell className={classes.headerCell}>날짜</TableCell>
											<TableCell className={classes.headerCell} align="center">
												평균
											</TableCell>
											<TableCell className={classes.headerCell}>
												<span className={classes.teamLabel}>
													<span role="img" aria-label="dog" className={classes.teamEmoji}>
														🐶
													</span>{' '}
													Team 1
												</span>
											</TableCell>
											<TableCell className={classes.headerCell} align="center">
												평균
											</TableCell>
											<TableCell className={classes.headerCell}>
												<span className={classes.teamLabel}>
													<span role="img" aria-label="cat" className={classes.teamEmoji}>
														🐱
													</span>{' '}
													Team 2
												</span>
											</TableCell>
											{showAdmin && <TableCell className={classes.headerCell} style={{ width: 48 }} />}
										</TableRow>
									</TableHead>
									<TableBody>
										{matches.map((match, index) => {
											const isTeam1Win = match.winTeam === 1;
											const displayId = getDisplayId(index);
											const persp = getPerspective(match);
											return (
												<StyledTableRow key={match.gameId}>
													<StyledTableCell>
														<span className={classes.matchIdCell}>{displayId}</span>
													</StyledTableCell>
													<StyledTableCell>
														<span className={classes.dateCell}>{formatDate(match.createdAt)}</span>
														{persp && (
															<div className={classes.perspectiveRow}>
																<span
																	className={persp.won ? classes.winBadge : classes.loseBadge}
																	style={{ marginBottom: 0 }}
																>
																	{persp.won ? 'WIN' : 'LOSE'}
																</span>
																{persp.myLp != null && renderLpSpan(persp.myLp, classes.lpChange)}
															</div>
														)}
													</StyledTableCell>
													<StyledTableCell
														align="center"
														className={isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}
													>
														<div className={classes.avgRatingWrapper}>
															<div className={classes.avgTierDisplay}>
																<img
																	className={classes.avgTierIcon}
																	src={`/assets/images/ranked-emblems/Emblem_${getTierNameFromRating(
																		match.team1.avgRating
																	)}.webp`}
																	alt={getRatingTierName(match.team1.avgRating)}
																	style={{
																		filter: `drop-shadow(0 0 4px ${
																			tierColors[getTierNameFromRating(match.team1.avgRating)]
																		}40)`
																	}}
																/>
																<span
																	className={classes.avgTierBadge}
																	style={{ color: tierColors[getTierNameFromRating(match.team1.avgRating)] }}
																>
																	{getTierShortName(getRatingTierName(match.team1.avgRating))}
																</span>
															</div>
															{renderLpSpan(match.team1.ratingChange * 4, classes.lpChange)}
														</div>
													</StyledTableCell>
													<StyledTableCell className={isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}>
														<div>
															<span className={isTeam1Win ? classes.winBadge : classes.loseBadge}>
																{isTeam1Win ? 'WIN' : 'LOSE'}
															</span>
														</div>
														<div className={classes.playerList}>{renderPlayers(match.team1.players)}</div>
													</StyledTableCell>
													<StyledTableCell
														align="center"
														className={!isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}
													>
														<div className={classes.avgRatingWrapper}>
															<div className={classes.avgTierDisplay}>
																<img
																	className={classes.avgTierIcon}
																	src={`/assets/images/ranked-emblems/Emblem_${getTierNameFromRating(
																		match.team2.avgRating
																	)}.webp`}
																	alt={getRatingTierName(match.team2.avgRating)}
																	style={{
																		filter: `drop-shadow(0 0 4px ${
																			tierColors[getTierNameFromRating(match.team2.avgRating)]
																		}40)`
																	}}
																/>
																<span
																	className={classes.avgTierBadge}
																	style={{ color: tierColors[getTierNameFromRating(match.team2.avgRating)] }}
																>
																	{getTierShortName(getRatingTierName(match.team2.avgRating))}
																</span>
															</div>
															{renderLpSpan(match.team2.ratingChange * 4, classes.lpChange)}
														</div>
													</StyledTableCell>
													<StyledTableCell className={!isTeam1Win ? classes.winTeamCell : classes.loseTeamCell}>
														<div>
															<span className={!isTeam1Win ? classes.winBadge : classes.loseBadge}>
																{!isTeam1Win ? 'WIN' : 'LOSE'}
															</span>
														</div>
														<div className={classes.playerList}>{renderPlayers(match.team2.players)}</div>
													</StyledTableCell>
													{showAdmin && (
														<StyledTableCell align="center" style={{ padding: '8px 4px' }}>
															<IconButton
																className={classes.settingsBtn}
																size="small"
																onClick={e => onMenuOpen(e, match)}
															>
																<SettingsIcon className={classes.settingsIcon} />
															</IconButton>
														</StyledTableCell>
													)}
												</StyledTableRow>
											);
										})}
									</TableBody>
								</Table>
							</FuseScrollbars>
						</Box>

						{/* Mobile Card View */}
						<Box sx={{ display: { md: 'none' } }}>
							<div className={classes.mobileCardList}>
								{matches.map((match, index) => {
									const isTeam1Win = match.winTeam === 1;
									const displayId = getDisplayId(index);
									const persp = getPerspective(match);
									return (
										<div key={match.gameId} className={classes.mobileCard}>
											<div className={classes.mobileCardHeader}>
												<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
													<span className={classes.mobileMatchId}>#{displayId}</span>
													{persp && (
														<>
															<span className={persp.won ? classes.mobileBadgeWin : classes.mobileBadgeLose}>
																{persp.won ? 'WIN' : 'LOSE'}
															</span>
															{persp.myLp != null && renderLpSpan(persp.myLp, classes.mobileLpChange)}
														</>
													)}
												</div>
												<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
													<span className={classes.mobileDate}>{formatDate(match.createdAt)}</span>
													{showAdmin && (
														<IconButton
															className={classes.settingsBtn}
															size="small"
															onClick={e => onMenuOpen(e, match)}
														>
															<SettingsIcon className={classes.settingsIcon} />
														</IconButton>
													)}
												</div>
											</div>
											{/* Team 1 */}
											<div
												className={`${classes.mobileTeamSection} ${
													isTeam1Win ? classes.mobileTeamWin : classes.mobileTeamLose
												}`}
											>
												<div className={classes.mobileTeamHeader}>
													<div className={classes.mobileTeamInfo}>
														<span role="img" aria-label="dog" className={classes.mobileTeamEmoji}>
															🐶
														</span>
														<span className={classes.mobileTeamName}>Team 1</span>
														<span className={isTeam1Win ? classes.mobileBadgeWin : classes.mobileBadgeLose}>
															{isTeam1Win ? 'WIN' : 'LOSE'}
														</span>
													</div>
													<div className={classes.mobileRatingInfo}>
														<div className={classes.mobileAvgTierRow}>
															<img
																className={classes.mobileAvgTierIcon}
																src={`/assets/images/ranked-emblems/Emblem_${getTierNameFromRating(
																	match.team1.avgRating
																)}.webp`}
																alt={getRatingTierName(match.team1.avgRating)}
															/>
															<span
																className={classes.mobileAvgTierBadge}
																style={{ color: tierColors[getTierNameFromRating(match.team1.avgRating)] }}
															>
																{getTierShortName(getRatingTierName(match.team1.avgRating))}
															</span>
														</div>
														{renderLpSpan(match.team1.ratingChange * 4, classes.mobileLpChange)}
													</div>
												</div>
												<div className={classes.mobilePlayerList}>{renderMobilePlayers(match.team1.players)}</div>
											</div>
											{/* VS Divider */}
											<div className={classes.mobileVsDivider}>VS</div>
											{/* Team 2 */}
											<div
												className={`${classes.mobileTeamSection} ${
													!isTeam1Win ? classes.mobileTeamWin : classes.mobileTeamLose
												}`}
											>
												<div className={classes.mobileTeamHeader}>
													<div className={classes.mobileTeamInfo}>
														<span role="img" aria-label="cat" className={classes.mobileTeamEmoji}>
															🐱
														</span>
														<span className={classes.mobileTeamName}>Team 2</span>
														<span className={!isTeam1Win ? classes.mobileBadgeWin : classes.mobileBadgeLose}>
															{!isTeam1Win ? 'WIN' : 'LOSE'}
														</span>
													</div>
													<div className={classes.mobileRatingInfo}>
														<div className={classes.mobileAvgTierRow}>
															<img
																className={classes.mobileAvgTierIcon}
																src={`/assets/images/ranked-emblems/Emblem_${getTierNameFromRating(
																	match.team2.avgRating
																)}.webp`}
																alt={getRatingTierName(match.team2.avgRating)}
															/>
															<span
																className={classes.mobileAvgTierBadge}
																style={{ color: tierColors[getTierNameFromRating(match.team2.avgRating)] }}
															>
																{getTierShortName(getRatingTierName(match.team2.avgRating))}
															</span>
														</div>
														{renderLpSpan(match.team2.ratingChange * 4, classes.mobileLpChange)}
													</div>
												</div>
												<div className={classes.mobilePlayerList}>{renderMobilePlayers(match.team2.players)}</div>
											</div>
										</div>
									);
								})}
							</div>
						</Box>

						<TablePagination
							className={classes.pagination}
							component="div"
							count={total}
							rowsPerPage={rowsPerPage}
							rowsPerPageOptions={[]}
							page={page - 1}
							backIconButtonProps={{ 'aria-label': 'Previous Page' }}
							nextIconButtonProps={{ 'aria-label': 'Next Page' }}
							onPageChange={(event, newPage) => onPageChange(newPage + 1)}
						/>
					</>
				) : (
					<div className={classes.emptyState}>
						<div className={classes.emptyIcon}>
							<span role="img" aria-label="scroll">
								📜
							</span>
						</div>
						<div className={classes.emptyText}>매치 기록이 없습니다</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default MatchList;
