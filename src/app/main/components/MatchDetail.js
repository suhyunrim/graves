import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import { getChampionIcon, loadChampionKeysById } from 'app/main/challenge/ddragonUtils';
import {
	getTierShortName,
	getTierIconName,
	getTierColor,
	POSITION_ICON_KEY,
	getPlayerPosition,
	sortPlayers,
	kdaRatioColor,
	getKdaRatio,
	formatK,
	getKillParticipation,
	usePerkIcons,
	SpellRuneGrid,
	ItemsRow
} from './matchStatUtils';
import PositionIcon from '../tournament/PositionIcon';

// 팀 아이덴티티 컬러 (VS 비교의 A/B 컬러와 동일 계열)
const TEAM_COLORS = { 1: '#00d4ff', 2: '#ff6b9a' };

// 팀 오브젝트 표시 순서
const OBJECTIVE_DEFS = [
	['baronKills', '바론'],
	['dragonKills', '용'],
	['riftHeraldKills', '전령'],
	['hordeKills', '유충'],
	['towerKills', '타워'],
	['inhibitorKills', '억제기']
];

const useStyles = makeStyles()(() => ({
	detailWrap: {
		borderTop: '1px solid rgba(255, 255, 255, 0.08)',
		background: 'rgba(0, 0, 0, 0.3)',
		cursor: 'default'
	},
	teamTableWrap: {
		overflowX: 'auto',
		// 테이블 minWidth(880)가 조상 flex의 min-width로 전파돼 페이지 폭을 밀어올리는 것 차단
		contain: 'inline-size'
	},
	teamTable: {
		width: '100%',
		minWidth: 880,
		borderCollapse: 'collapse'
	},
	teamHeadRow: {
		'& th': {
			fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
			fontSize: '1.05rem',
			fontWeight: 700,
			color: 'rgba(255, 255, 255, 0.45)',
			textTransform: 'uppercase',
			letterSpacing: '0.05em',
			padding: '8px 10px',
			textAlign: 'center',
			whiteSpace: 'nowrap',
			borderBottom: '1px solid rgba(255, 255, 255, 0.07)'
		}
	},
	teamNameTh: {
		textAlign: 'left !important',
		fontSize: '1.2rem !important'
	},
	teamResultWin: { color: '#00e676' },
	teamResultLose: { color: '#ff5252' },
	td: {
		padding: '6px 10px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
		textAlign: 'center',
		whiteSpace: 'nowrap',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.75)'
	},
	playerCell: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		minWidth: 190
	},
	detailChampImg: {
		width: 30,
		height: 30,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		flexShrink: 0
	},
	tierIcon: {
		width: 22,
		height: 22,
		flexShrink: 0
	},
	tierBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.02rem',
		fontWeight: 700,
		minWidth: 30,
		flexShrink: 0,
		textAlign: 'center',
		padding: '1px 4px',
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.1)'
	},
	playerName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.18rem',
		color: '#fff',
		cursor: 'pointer',
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		textAlign: 'left'
	},
	playerNameHighlight: {
		fontWeight: 700,
		color: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.15)',
		padding: '1px 6px',
		borderRadius: 4
	},
	kdaCell: {
		display: 'flex',
		flexDirection: 'column',
		gap: 0,
		alignItems: 'center'
	},
	kdaCellMain: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.18rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.85)'
	},
	kdaCellSub: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.02rem',
		fontWeight: 700
	},
	kdaDeath: {
		color: '#ff5252'
	},
	kpText: {
		color: 'rgba(255, 255, 255, 0.45)',
		fontWeight: 600
	},
	dmgCell: {
		display: 'flex',
		flexDirection: 'column',
		gap: 3,
		minWidth: 110
	},
	dmgRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	dmgNum: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.02rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.6)',
		minWidth: 42,
		textAlign: 'right'
	},
	dmgBarTrack: {
		flex: 1,
		height: 5,
		borderRadius: 3,
		background: 'rgba(255, 255, 255, 0.08)',
		overflow: 'hidden'
	},
	dmgBarDealt: {
		height: '100%',
		borderRadius: 3,
		background: '#ff6b6b'
	},
	dmgBarTaken: {
		height: '100%',
		borderRadius: 3,
		background: 'rgba(255, 255, 255, 0.35)'
	},
	csCell: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center'
	},
	csSub: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.98rem',
		color: 'rgba(255, 255, 255, 0.45)'
	},
	detailChampWrap: {
		position: 'relative',
		flexShrink: 0,
		display: 'inline-flex'
	},
	detailChampLevel: {
		position: 'absolute',
		right: -4,
		bottom: -4,
		minWidth: 15,
		height: 15,
		borderRadius: 8,
		background: 'rgba(0, 0, 0, 0.85)',
		border: '1px solid rgba(255, 255, 255, 0.25)',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.8rem',
		fontWeight: 700,
		color: '#fff',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '0 2px'
	},
	detailSpellRuneGrid: {
		display: 'grid',
		gridTemplateColumns: '14px 14px',
		gridAutoRows: 14,
		gap: 1,
		flexShrink: 0
	},
	detailSpellRuneIcon: {
		width: 14,
		height: 14,
		borderRadius: 3,
		objectFit: 'cover',
		background: 'rgba(0, 0, 0, 0.4)'
	},
	detailSpellRuneEmpty: {
		width: 14,
		height: 14,
		borderRadius: 3,
		background: 'rgba(255, 255, 255, 0.06)'
	},
	itemsRow: {
		display: 'flex',
		gap: 3,
		alignItems: 'center'
	},
	detailItemImg: {
		width: 20,
		height: 20,
		borderRadius: 4,
		objectFit: 'cover',
		border: '1px solid rgba(255, 255, 255, 0.12)'
	},
	detailItemEmpty: {
		width: 20,
		height: 20,
		borderRadius: 4,
		background: 'rgba(255, 255, 255, 0.06)'
	},
	trinketGap: {
		marginLeft: 4
	},
	wardSub: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.98rem',
		color: 'rgba(255, 255, 255, 0.45)'
	},
	// ===== 모바일 컴팩트 상세 (md 미만: 테이블 대신 플레이어별 세로 스택) =====
	mTeamBlock: {
		padding: '10px 12px 6px'
	},
	mTeamHeader: {
		display: 'flex',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 6,
		marginBottom: 4,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		textTransform: 'uppercase',
		letterSpacing: '0.05em'
	},
	mPlayer: {
		padding: '7px 0',
		borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
		'&:last-of-type': {
			borderBottom: 'none'
		}
	},
	mPlayerTop: {
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	mPlayerName: {
		flex: 1,
		// nowrap 이름의 min-content 폭이 카드 폭을 밀지 않게 차단 (넘치면 ellipsis)
		width: 0,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: '#fff',
		cursor: 'pointer',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	mKda: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-end',
		flexShrink: 0
	},
	mPlayerBottom: {
		display: 'flex',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 8,
		rowGap: 4,
		padding: '5px 0 0 28px'
	},
	mStatText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	bansRow: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 3,
		marginLeft: 12
	},
	banLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.4)',
		marginRight: 2
	},
	banImg: {
		width: 18,
		height: 18,
		borderRadius: 4,
		objectFit: 'cover',
		filter: 'grayscale(0.7) brightness(0.8)'
	},
	objRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	objText: {
		flex: 1,
		// nowrap 텍스트의 min-content 폭이 카드/페이지 폭을 밀어올리는 것 차단 (flex:1이 실제 폭 배분, 넘치면 ellipsis)
		width: 0,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.02rem',
		fontWeight: 600,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	objCenter: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.35)',
		textTransform: 'uppercase',
		letterSpacing: '0.06em',
		flexShrink: 0
	},
	// 팀 합계 스트립 (Total Kill / Total Gold)
	summaryStrip: {
		display: 'flex',
		flexDirection: 'column',
		gap: 6,
		padding: '10px 16px',
		borderTop: '1px solid rgba(255, 255, 255, 0.07)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
		background: 'rgba(0, 0, 0, 0.25)'
	},
	summaryRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	summaryValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		minWidth: 52,
		color: 'rgba(255, 255, 255, 0.85)'
	},
	summaryBarTrack: {
		flex: 1,
		height: 14,
		borderRadius: 7,
		overflow: 'hidden',
		display: 'flex',
		position: 'relative'
	},
	summaryLabel: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '0.98rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.9)',
		textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
		pointerEvents: 'none'
	},
	// 스탯 없는 매치 폴백 로스터
	simpleTeams: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr'
	},
	simpleTeamsMobile: {
		gridTemplateColumns: '1fr'
	},
	simpleTeamBlock: {
		padding: '12px 16px'
	},
	simpleTeamHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginBottom: 10,
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.8)'
	},
	simplePlayerRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '3px 0'
	},
	posSlot: {
		width: 22,
		height: 22,
		flexShrink: 0,
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	posIcon: {
		width: 22,
		height: 22,
		objectFit: 'contain'
	},
	posFallback: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.55)'
	},
	noDetail: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.3)'
	}
}));

/**
 * 매치 펼침 상세 공용 컴포넌트.
 * - LCU 수집 매치: 팀별 상세 테이블(KDA/피해량 바/시야/CS/골드/아이템) + 팀 합계 스트립,
 *   md 미만에서는 플레이어별 세로 스택으로 대체 (한쪽 뷰만 렌더)
 * - 미수집 매치: 단순 로스터(포지션/티어/이름) 폴백
 * 내정보 내전 기록(InternalMatchList)과 내전 기록 페이지(MatchList)에서 공유한다.
 */
function MatchDetail({ match, perspectivePuuid }) {
	const { classes, cx } = useStyles();
	const navigate = useNavigate();
	const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
	const getPerkIcon = usePerkIcons();
	// 밴 목록(championId 숫자)의 아이콘 렌더용 id → DDragon 키 맵
	const [champKeys, setChampKeys] = useState({});

	useEffect(() => {
		let alive = true;
		loadChampionKeysById().then(map => {
			if (alive) setChampKeys(map);
		});
		return () => {
			alive = false;
		};
	}, []);

	const allPlayers = [...match.team1.players, ...match.team2.players];
	const hasAnyStats = allPlayers.some(p => p.stat);
	const maxDealt = Math.max(...allPlayers.map(p => (p.stat ? p.stat.damageToChampions || 0 : 0)));
	const maxTaken = Math.max(...allPlayers.map(p => (p.stat ? p.stat.damageTaken || 0 : 0)));
	const firstWithStat = allPlayers.find(p => p.stat);
	const durationSec = match.gameDurationSec || (firstWithStat && firstWithStat.stat.gameDurationSec) || null;
	const durationMin = durationSec ? durationSec / 60 : null;

	const goUser = (e, p) => {
		e.stopPropagation();
		navigate(`/userinfo/${p.puuid}`);
	};

	const getTeamCtx = teamNo => {
		const team = teamNo === 1 ? match.team1 : match.team2;
		const teamStat = match.teamStats ? match.teamStats[`team${teamNo}`] : null;
		return {
			team,
			won: match.winTeam === teamNo,
			players: sortPlayers(team.players),
			bans: (teamStat && teamStat.bans) || []
		};
	};

	// "🐶 Team N WIN/LOSE + 밴 목록" — 테이블 헤더/모바일 헤더/단순 폴백 공용
	const renderTeamHeaderContent = (teamNo, won, bans) => (
		<>
			<span role="img" aria-label={teamNo === 1 ? 'dog' : 'cat'}>
				{teamNo === 1 ? '🐶' : '🐱'}
			</span>{' '}
			Team {teamNo}{' '}
			<span className={won ? classes.teamResultWin : classes.teamResultLose}>{won ? 'WIN' : 'LOSE'}</span>
			{bans.length > 0 && (
				<span className={classes.bansRow}>
					<span className={classes.banLabel}>밴</span>
					{bans.map(b => {
						const key = champKeys[b.championId];
						return key ? (
							<img key={`${b.championId}-${b.pickTurn}`} className={classes.banImg} src={getChampionIcon(key)} alt="" title={key} />
						) : null;
					})}
				</span>
			)}
		</>
	);

	// "포지션 + 챔프(레벨) + 스펠/룬 + 티어 + 이름" — 테이블/모바일/단순 폴백 공용
	const renderPlayerIdentity = (player, nameClass) => {
		const posIconKey = POSITION_ICON_KEY[getPlayerPosition(player)];
		const { stat } = player;
		const isMe = player.puuid === perspectivePuuid;
		return (
			<>
				<span className={classes.posSlot}>
					{posIconKey && (
						<PositionIcon position={posIconKey} className={classes.posIcon} fallbackClassName={classes.posFallback} />
					)}
				</span>
				{stat && (
					<>
						<span className={classes.detailChampWrap}>
							<img
								className={classes.detailChampImg}
								src={getChampionIcon(stat.championName)}
								alt={stat.championKoName || stat.championName}
								title={stat.championKoName || stat.championName}
								onError={e => {
									e.currentTarget.style.visibility = 'hidden';
								}}
							/>
							{stat.champLevel != null && <span className={classes.detailChampLevel}>{stat.champLevel}</span>}
						</span>
						<SpellRuneGrid
							stat={stat}
							getPerkIcon={getPerkIcon}
							gridClass={classes.detailSpellRuneGrid}
							iconClass={classes.detailSpellRuneIcon}
							emptyClass={classes.detailSpellRuneEmpty}
						/>
					</>
				)}
				<img
					className={classes.tierIcon}
					src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(player.tier)}.webp`}
					alt={player.tier}
				/>
				<span className={classes.tierBadge} style={{ color: getTierColor(player.tier) }}>
					{getTierShortName(player.tier)}
				</span>
				<span
					className={cx(nameClass, isMe && classes.playerNameHighlight)}
					title={player.name}
					onClick={e => goUser(e, player)}
				>
					{player.name}
				</span>
			</>
		);
	};

	// "K / D / A (킬관여%) + 평점" — 테이블/모바일 공용
	const renderKda = (stat, kp, ratio) => (
		<>
			<span className={classes.kdaCellMain}>
				{stat.kills} / <span className={classes.kdaDeath}>{stat.deaths}</span> / {stat.assists}
				{kp != null && <span className={classes.kpText}> ({kp}%)</span>}
			</span>
			<span className={classes.kdaCellSub} style={{ color: kdaRatioColor(ratio) }}>
				{ratio == null ? 'Perfect' : `${ratio.toFixed(2)}:1`}
			</span>
		</>
	);

	// 펼침(md 이상): 팀별 상세 테이블 (KDA / 피해량 / 시야 / CS / 골드)
	const renderTeamTable = teamNo => {
		const { team, won, players, bans } = getTeamCtx(teamNo);
		return (
			<div className={classes.teamTableWrap}>
				<table className={classes.teamTable}>
					<thead>
						<tr className={classes.teamHeadRow}>
							<th className={classes.teamNameTh} style={{ color: TEAM_COLORS[teamNo] }}>
								{renderTeamHeaderContent(teamNo, won, bans)}
							</th>
							<th>KDA</th>
							<th>피해량 (가한/받은)</th>
							<th title="시야점수 · 제어와드 / 설치 / 제거">와드</th>
							<th>CS</th>
							<th>골드</th>
							<th>아이템</th>
						</tr>
					</thead>
					<tbody>
						{players.map(player => {
							const { stat } = player;
							const ratio = stat ? getKdaRatio(stat) : null;
							const kp = stat ? getKillParticipation(stat, team.players) : null;
							const hasItems = stat && (stat.items || stat.trinket != null);
							return (
								<tr key={player.puuid}>
									<td className={classes.td}>
										<div className={classes.playerCell}>{renderPlayerIdentity(player, classes.playerName)}</div>
									</td>
									{stat ? (
										<>
											<td className={classes.td}>
												<div className={classes.kdaCell}>{renderKda(stat, kp, ratio)}</div>
											</td>
											<td className={classes.td}>
												<div className={classes.dmgCell}>
													<div className={classes.dmgRow}>
														<span className={classes.dmgNum}>{formatK(stat.damageToChampions)}</span>
														<div className={classes.dmgBarTrack}>
															<div
																className={classes.dmgBarDealt}
																style={{ width: `${maxDealt > 0 ? (stat.damageToChampions / maxDealt) * 100 : 0}%` }}
															/>
														</div>
													</div>
													<div className={classes.dmgRow}>
														<span className={classes.dmgNum}>{formatK(stat.damageTaken)}</span>
														<div className={classes.dmgBarTrack}>
															<div
																className={classes.dmgBarTaken}
																style={{
																	width: `${
																		maxTaken > 0 && stat.damageTaken != null
																			? (stat.damageTaken / maxTaken) * 100
																			: 0
																	}%`
																}}
															/>
														</div>
													</div>
												</div>
											</td>
											<td className={classes.td}>
												<div className={classes.csCell} title="시야점수 · 제어와드 / 설치 / 제거">
													<span>{stat.visionScore != null ? stat.visionScore : '-'}</span>
													{stat.wardsPlaced != null && (
														<span className={classes.wardSub}>
															{stat.controlWardsBought != null ? stat.controlWardsBought : 0} /{' '}
															{stat.wardsPlaced} / {stat.wardsKilled != null ? stat.wardsKilled : 0}
														</span>
													)}
												</div>
											</td>
											<td className={classes.td}>
												<div className={classes.csCell}>
													<span>{stat.cs}</span>
													{durationMin && <span className={classes.csSub}>분당 {(stat.cs / durationMin).toFixed(1)}</span>}
												</div>
											</td>
											<td className={classes.td}>{formatK(stat.goldEarned)}</td>
											<td className={classes.td}>
												{hasItems ? (
													<ItemsRow
														stat={stat}
														rowClass={classes.itemsRow}
														imgClass={classes.detailItemImg}
														emptyClass={classes.detailItemEmpty}
														gapClass={classes.trinketGap}
													/>
												) : (
													'-'
												)}
											</td>
										</>
									) : (
										<td className={classes.td} colSpan={6}>
											<span className={classes.noDetail}>-</span>
										</td>
									)}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	};

	// 펼침(md 미만): 테이블 대신 플레이어별 2줄 세로 스택 — 가로 스크롤 없이 전체 정보 표시
	const renderTeamMobile = teamNo => {
		const { team, won, players, bans } = getTeamCtx(teamNo);
		return (
			<div className={classes.mTeamBlock}>
				<div className={classes.mTeamHeader} style={{ color: TEAM_COLORS[teamNo] }}>
					{renderTeamHeaderContent(teamNo, won, bans)}
				</div>
				{players.map(player => {
					const { stat } = player;
					const ratio = stat ? getKdaRatio(stat) : null;
					const kp = stat ? getKillParticipation(stat, team.players) : null;
					return (
						<div key={player.puuid} className={classes.mPlayer}>
							<div className={classes.mPlayerTop}>
								{renderPlayerIdentity(player, classes.mPlayerName)}
								{stat && <div className={classes.mKda}>{renderKda(stat, kp, ratio)}</div>}
							</div>
							{stat && (
								<div className={classes.mPlayerBottom}>
									<ItemsRow
										stat={stat}
										rowClass={classes.itemsRow}
										imgClass={classes.detailItemImg}
										emptyClass={classes.detailItemEmpty}
										gapClass={classes.trinketGap}
									/>
									<span className={classes.mStatText}>
										딜 {formatK(stat.damageToChampions)} · 받 {formatK(stat.damageTaken)} · CS {stat.cs}
										{durationMin ? ` (${(stat.cs / durationMin).toFixed(1)})` : ''} · 골드{' '}
										{formatK(stat.goldEarned)}
										{stat.visionScore != null ? ` · 시야 ${stat.visionScore}` : ''}
									</span>
								</div>
							)}
						</div>
					);
				})}
			</div>
		);
	};

	// 팀 합계 스트립 (Total Kill / Total Gold — 팀 컬러 비율 바)
	const renderSummaryStrip = () => {
		const sum = (team, key) => team.players.reduce((s, p) => s + (p.stat ? p.stat[key] || 0 : 0), 0);
		const rows = [
			{ label: 'Total Kill', t1: sum(match.team1, 'kills'), t2: sum(match.team2, 'kills'), fmt: v => v },
			{ label: 'Total Gold', t1: sum(match.team1, 'goldEarned'), t2: sum(match.team2, 'goldEarned'), fmt: formatK }
		];
		const ts = match.teamStats;
		const objText = team =>
			OBJECTIVE_DEFS.filter(([k]) => team[k] != null)
				.map(([k, label]) => `${label} ${team[k]}`)
				.join(' · ');
		return (
			<div className={classes.summaryStrip}>
				{rows.map(r => {
					const totalVal = r.t1 + r.t2;
					const pct1 = totalVal > 0 ? (r.t1 / totalVal) * 100 : 50;
					return (
						<div key={r.label} className={classes.summaryRow}>
							<span className={classes.summaryValue} style={{ color: TEAM_COLORS[1], textAlign: 'right' }}>
								{r.fmt(r.t1)}
							</span>
							<div className={classes.summaryBarTrack}>
								<div style={{ width: `${pct1}%`, background: 'rgba(0, 212, 255, 0.55)' }} />
								<div style={{ width: `${100 - pct1}%`, background: 'rgba(255, 107, 154, 0.55)' }} />
								<span className={classes.summaryLabel}>{r.label}</span>
							</div>
							<span className={classes.summaryValue} style={{ color: TEAM_COLORS[2] }}>
								{r.fmt(r.t2)}
							</span>
						</div>
					);
				})}
				{ts && ts.team1 && ts.team2 && (
					<div className={classes.objRow}>
						<span className={classes.objText} style={{ color: TEAM_COLORS[1], textAlign: 'right' }}>
							{objText(ts.team1)}
						</span>
						<span className={classes.objCenter}>오브젝트</span>
						<span className={classes.objText} style={{ color: TEAM_COLORS[2] }}>
							{objText(ts.team2)}
						</span>
					</div>
				)}
			</div>
		);
	};

	// 스탯 없는 매치 폴백: 단순 로스터 (포지션/티어/이름)
	const renderSimpleTeam = teamNo => {
		const { won, players, bans } = getTeamCtx(teamNo);
		return (
			<div className={classes.simpleTeamBlock}>
				<div className={classes.simpleTeamHeader}>{renderTeamHeaderContent(teamNo, won, bans)}</div>
				{players.map(player => (
					<div key={player.puuid} className={classes.simplePlayerRow}>
						{renderPlayerIdentity(player, classes.playerName)}
					</div>
				))}
			</div>
		);
	};

	const renderTeams = teamNo => (isMobile ? renderTeamMobile(teamNo) : renderTeamTable(teamNo));

	return (
		<div className={classes.detailWrap} onClick={e => e.stopPropagation()}>
			{hasAnyStats ? (
				<>
					{renderTeams(1)}
					{renderSummaryStrip()}
					{renderTeams(2)}
				</>
			) : (
				<div className={cx(classes.simpleTeams, isMobile && classes.simpleTeamsMobile)}>
					{renderSimpleTeam(1)}
					{renderSimpleTeam(2)}
				</div>
			)}
		</div>
	);
}

export default MatchDetail;
