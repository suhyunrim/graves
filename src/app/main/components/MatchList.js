import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from 'tss-react/mui';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RevealGroup } from './Reveal';
import PositionIcon from '../tournament/PositionIcon';
import { getChampionIcon } from '../challenge/ddragonUtils';
import MatchDetail from './MatchDetail';

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

// Riot 표준 포지션 키(대문자) → PositionIcon용 키(소문자).
// 표시/정렬은 항상 탑 → 정글 → 미드 → 원딜 → 서폿 순서 고정 (RankingHeader/MyInfo 와 동일).
const POSITIONS = [
	{ key: 'TOP', icon: 'top' },
	{ key: 'JUNGLE', icon: 'jungle' },
	{ key: 'MIDDLE', icon: 'mid' },
	{ key: 'BOTTOM', icon: 'adc' },
	{ key: 'UTILITY', icon: 'support' }
];

const POSITION_ORDER = POSITIONS.reduce((acc, pos, i) => {
	acc[pos.key] = i;
	return acc;
}, {});

const POSITION_ICON_KEY = POSITIONS.reduce((acc, pos) => {
	acc[pos.key] = pos.icon;
	return acc;
}, {});

// 포지션 지정 플레이어를 먼저(탑→서폿 순), 미지정(null/undefined)은 뒤에서 레이팅 내림차순(기존 동작 유지).
const sortPlayers = players =>
	[...players].sort((a, b) => {
		const ao = POSITION_ORDER[a.position];
		const bo = POSITION_ORDER[b.position];
		const aHas = ao !== undefined;
		const bHas = bo !== undefined;
		if (aHas && bHas) return ao - bo;
		if (aHas !== bHas) return aHas ? -1 : 1;
		return b.rating - a.rating;
	});

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

// 닉네임의 라이엇 태그(#KR1 등)는 목록에선 숨긴다 (hover title로만 노출)
const stripTag = name => (name || '').split('#')[0];

// 날짜 문자열을 날짜/시간으로 분리.
const formatDateParts = utcDateString => {
	const date = new Date(utcDateString);
	const year = String(date.getFullYear()).slice(-2);
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return { day: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
};

const useStyles = makeStyles()(theme => ({
	container: {
		padding: '28px',
		maxWidth: 1200,
		margin: '0 auto',
		width: '100%',
		[theme.breakpoints.down('sm')]: {
			padding: '16px'
		}
	},
	cardList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 14
	},
	matchCard: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 16,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		overflow: 'hidden',
		transition: 'border-color 0.2s ease'
	},
	matchCardClickable: {
		cursor: 'pointer',
		'&:hover': {
			borderColor: 'rgba(0, 212, 255, 0.45)'
		}
	},
	cardHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		padding: '10px 16px',
		background: 'rgba(0, 0, 0, 0.25)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
		[theme.breakpoints.down('sm')]: {
			padding: '8px 12px'
		}
	},
	dateDay: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.85)',
		whiteSpace: 'nowrap'
	},
	dateTime: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.45)',
		whiteSpace: 'nowrap'
	},
	perspResult: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 700
	},
	headerRight: {
		marginLeft: 'auto',
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	expandHint: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.35)',
		[theme.breakpoints.down('sm')]: {
			display: 'none'
		}
	},
	expandIcon: {
		color: 'rgba(255, 255, 255, 0.35)',
		transition: 'transform 0.25s ease',
		flexShrink: 0
	},
	expandIconOpen: {
		transform: 'rotate(180deg)'
	},
	teamsGrid: {
		display: 'grid',
		gridTemplateColumns: '1fr auto 1fr',
		alignItems: 'stretch',
		[theme.breakpoints.down('md')]: {
			gridTemplateColumns: '1fr'
		}
	},
	vsDivider: {
		alignSelf: 'center',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.18)',
		padding: '0 14px',
		[theme.breakpoints.down('md')]: {
			textAlign: 'center',
			padding: '2px 0'
		}
	},
	teamBlock: {
		padding: '12px 16px',
		borderLeft: '4px solid transparent',
		[theme.breakpoints.down('sm')]: {
			padding: '10px 12px'
		}
	},
	teamBlockWin: {
		borderLeftColor: '#00c853',
		background: 'rgba(0, 200, 83, 0.07)'
	},
	teamBlockLose: {
		borderLeftColor: '#ff5252',
		background: 'rgba(255, 82, 82, 0.06)'
	},
	teamHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginBottom: 8
	},
	teamEmoji: {
		fontSize: '1.3rem'
	},
	teamName: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.5)',
		textTransform: 'uppercase',
		letterSpacing: '0.06em'
	},
	resultWin: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.35rem',
		fontWeight: 700,
		color: '#00e676'
	},
	resultLose: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.35rem',
		fontWeight: 700,
		color: '#ff5252'
	},
	lpChange: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600
	},
	ratingUp: {
		color: '#00e676'
	},
	ratingDown: {
		color: '#ff5252'
	},
	ratingNeutral: {
		color: 'rgba(255, 255, 255, 0.5)'
	},
	playerList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 4
	},
	playerRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '3px 0'
	},
	// position 없는 플레이어도 빈 슬롯을 차지해 이름/티어 세로 정렬이 흔들리지 않게 함.
	positionSlot: {
		width: 18,
		height: 18,
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0
	},
	positionIcon: {
		width: 18,
		height: 18,
		objectFit: 'contain'
	},
	positionFallback: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.9rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.55)'
	},
	tierIcon: {
		width: 22,
		height: 22,
		flexShrink: 0
	},
	// 티어 짧은 라벨: 배경 칩 없이 컬러 텍스트만 (시각적 노이즈 축소)
	tierShort: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700,
		minWidth: 26,
		flexShrink: 0,
		textAlign: 'center'
	},
	// LCU 수집 매치: 플레이한 챔피언 아이콘. 팀 내 일부만 스탯이 있어도 정렬 유지용 빈 슬롯 렌더.
	champIcon: {
		width: 24,
		height: 24,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		flexShrink: 0
	},
	champSlot: {
		width: 24,
		height: 24,
		flexShrink: 0
	},
	// 긴 닉네임은 두 줄로 깨지지 않게 한 줄 말줄임(…). 이름만 줄어들도록 minWidth:0.
	playerName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 500,
		color: 'rgba(255, 255, 255, 0.92)',
		cursor: 'pointer',
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		'&:hover': {
			color: '#00d4ff'
		}
	},
	playerNameHighlight: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700,
		color: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.15)',
		padding: '2px 8px',
		borderRadius: 4,
		textShadow: '0 0 8px rgba(0, 212, 255, 0.5)',
		cursor: 'pointer',
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
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
	},
	pagination: {
		color: 'rgba(255, 255, 255, 0.7)',
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
	emptyPanel: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 16,
		border: '1px solid rgba(0, 212, 255, 0.15)'
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
	}
}));

/**
 * 매치 목록(카드 리스트 + 페이지네이션 + empty state) 공용 컴포넌트.
 * 매치 카드: 헤더(날짜 · 관리자 메뉴) + Team 1 | VS | Team 2 로스터(모바일은 세로 스택).
 * LCU 수집 매치는 카드 클릭 시 상세(MatchDetail)가 펼쳐진다.
 *
 * props:
 *  - matches, total, page(1-base), rowsPerPage, onPageChange(nextPage 1-base)
 *  - isAdmin, onMenuOpen(e, match): 관리자 설정(복제/취소) 버튼. 미지정 시 버튼 숨김
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
	const { classes, cx } = useStyles();
	const navigate = useNavigate();
	const [expandedIds, setExpandedIds] = useState(() => new Set());

	const showAdmin = Boolean(isAdmin && onMenuOpen);

	const isPlayerHighlighted = player =>
		(isHighlighted && isHighlighted(player)) || (perspectivePuuid && player.puuid === perspectivePuuid);

	const matchHasDetail = match =>
		match.team1.players.some(p => p.stat) || match.team2.players.some(p => p.stat);

	const toggleExpand = gameId => {
		setExpandedIds(prev => {
			const next = new Set(prev);
			if (next.has(gameId)) next.delete(gameId);
			else next.add(gameId);
			return next;
		});
	};

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

	const renderLpSpan = lp => {
		if (lp > 0) return <span className={`${classes.lpChange} ${classes.ratingUp}`}>+{lp} LP</span>;
		if (lp < 0) return <span className={`${classes.lpChange} ${classes.ratingDown}`}>{lp} LP</span>;
		return <span className={`${classes.lpChange} ${classes.ratingNeutral}`}>0 LP</span>;
	};

	// {포지션}{티어아이콘}{티어}{플레이챔프(LCU 수집 시)}{닉네임(태그 제외)}
	const renderPlayers = players => {
		const sortedPlayers = sortPlayers(players);
		const hasChamps = players.some(p => p.stat && p.stat.championName);
		return sortedPlayers.map(player => {
			const posIconKey = POSITION_ICON_KEY[player.position];
			const champName = player.stat && player.stat.championName;
			return (
				<div key={player.puuid} className={classes.playerRow}>
					<span className={classes.positionSlot}>
						{posIconKey && (
							<PositionIcon
								position={posIconKey}
								className={classes.positionIcon}
								fallbackClassName={classes.positionFallback}
							/>
						)}
					</span>
					<img
						className={classes.tierIcon}
						src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(player.tier)}.webp`}
						alt={player.tier}
					/>
					<span className={classes.tierShort} style={{ color: getTierColor(player.tier) }}>
						{getTierShortName(player.tier)}
					</span>
					{hasChamps &&
						(champName ? (
							<img
								className={classes.champIcon}
								src={getChampionIcon(champName)}
								alt={(player.stat && player.stat.championKoName) || champName}
								title={(player.stat && player.stat.championKoName) || champName}
								onError={e => {
									e.currentTarget.style.visibility = 'hidden';
								}}
							/>
						) : (
							<span className={classes.champSlot} />
						))}
					<span
						className={isPlayerHighlighted(player) ? classes.playerNameHighlight : classes.playerName}
						title={player.name}
						onClick={e => {
							e.stopPropagation();
							navigate(`/userinfo/${player.puuid}`);
						}}
					>
						{stripTag(player.name)}
					</span>
				</div>
			);
		});
	};

	const renderTeamBlock = (match, teamNo) => {
		const team = teamNo === 1 ? match.team1 : match.team2;
		const won = match.winTeam === teamNo;
		return (
			<div className={cx(classes.teamBlock, won ? classes.teamBlockWin : classes.teamBlockLose)}>
				<div className={classes.teamHeader}>
					<span role="img" aria-label={teamNo === 1 ? 'dog' : 'cat'} className={classes.teamEmoji}>
						{teamNo === 1 ? '🐶' : '🐱'}
					</span>
					<span className={classes.teamName}>Team {teamNo}</span>
					<span className={won ? classes.resultWin : classes.resultLose}>{won ? 'WIN' : 'LOSE'}</span>
					{renderLpSpan(team.ratingChange * 4)}
				</div>
				<div className={classes.playerList}>{renderPlayers(team.players)}</div>
			</div>
		);
	};

	return (
		<div className={classes.container}>
			{matches && matches.length > 0 ? (
				<>
					<RevealGroup className={classes.cardList} distance={16}>
						{matches.map(match => {
							const persp = getPerspective(match);
							const dateParts = formatDateParts(match.createdAt);
							const detailAvailable = matchHasDetail(match);
							const expanded = detailAvailable && expandedIds.has(match.gameId);
							return (
								<div
									key={match.gameId}
									className={cx(classes.matchCard, detailAvailable && classes.matchCardClickable)}
									onClick={detailAvailable ? () => toggleExpand(match.gameId) : undefined}
								>
									<div className={classes.cardHeader}>
										<span className={classes.dateDay}>{dateParts.day}</span>
										<span className={classes.dateTime}>{dateParts.time}</span>
										{persp && (
											<>
												<span
													className={cx(classes.perspResult, persp.won ? classes.resultWin : classes.resultLose)}
												>
													{persp.won ? 'WIN' : 'LOSE'}
												</span>
												{persp.myLp != null && renderLpSpan(persp.myLp)}
											</>
										)}
										<div className={classes.headerRight}>
											{detailAvailable && (
												<>
													<span className={classes.expandHint}>상세</span>
													<ExpandMoreIcon
														className={cx(classes.expandIcon, expanded && classes.expandIconOpen)}
													/>
												</>
											)}
											{showAdmin && (
												<IconButton
													className={classes.settingsBtn}
													size="small"
													onClick={e => {
														e.stopPropagation();
														onMenuOpen(e, match);
													}}
												>
													<SettingsIcon className={classes.settingsIcon} />
												</IconButton>
											)}
										</div>
									</div>
									<div className={classes.teamsGrid}>
										{renderTeamBlock(match, 1)}
										<div className={classes.vsDivider}>VS</div>
										{renderTeamBlock(match, 2)}
									</div>
									{expanded && <MatchDetail match={match} perspectivePuuid={perspectivePuuid} />}
								</div>
							);
						})}
					</RevealGroup>
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
				<div className={classes.emptyPanel}>
					<div className={classes.emptyState}>
						<div className={classes.emptyIcon}>
							<span role="img" aria-label="scroll">
								📜
							</span>
						</div>
						<div className={classes.emptyText}>매치 기록이 없습니다</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default MatchList;
