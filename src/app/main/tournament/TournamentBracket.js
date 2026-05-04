import React from 'react';
import { makeStyles } from 'tss-react/mui';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import { getProfileIconUrl } from 'app/main/challenge/ddragonUtils';
import {
	groupMatchesByRound,
	isByeMatch,
	isEmptyMatch,
	getTierName,
	getTierShortLabel,
	getTierEmblemUrl,
	BRACKET_LINE_COLOR,
	BRACKET_LINE_COLOR_FINISHED
} from './tournamentUtils';
import PositionIcon from './PositionIcon';
import useBracketLines, { buildLinePath } from './useBracketLines';

const useStyles = makeStyles()((theme) => ({
	root: {
		overflowX: 'auto',
		paddingBottom: 8
	},
	scroll: {
		display: 'flex',
		gap: 56,
		minWidth: 'min-content',
		padding: '4px 4px 8px',
		position: 'relative'
	},
	linesSvg: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		pointerEvents: 'none',
		zIndex: 0,
		overflow: 'visible'
	},
	column: {
		display: 'flex',
		flexDirection: 'column',
		gap: 16,
		minWidth: 240,
		flexShrink: 0,
		position: 'relative',
		zIndex: 1
	},
	columnVerbose: {
		minWidth: 320
	},
	columnTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.05em',
		textTransform: 'uppercase',
		textShadow: '0 0 12px rgba(0, 212, 255, 0.3)',
		marginBottom: 4,
		paddingBottom: 8,
		borderBottom: '1px solid rgba(0, 212, 255, 0.25)',
		textAlign: 'center'
	},
	matchList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
		justifyContent: 'space-around',
		flex: 1
	},
	match: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		borderRadius: 12,
		overflow: 'hidden',
		transition: 'border-color 0.2s ease',
		'&:hover': {
			borderColor: 'rgba(0, 212, 255, 0.4)'
		}
	},
	matchClickable: {
		cursor: 'pointer'
	},
	matchHeader: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		padding: '6px 12px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	matchHeaderBO: {
		color: 'rgba(0, 212, 255, 0.6)',
		fontWeight: 600
	},
	editIcon: {
		fontSize: '1.2rem',
		color: 'rgba(0, 212, 255, 0.7)'
	},
	teamRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '10px 14px',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.85)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		'&:last-child': {
			borderBottom: 'none'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.2rem',
			padding: '8px 12px'
		}
	},
	teamRowWinner: {
		color: '#00ff7f',
		background: 'rgba(0, 255, 127, 0.05)',
		fontWeight: 700
	},
	teamRowLoser: {
		color: 'rgba(255, 255, 255, 0.4)'
	},
	teamRowTBD: {
		color: 'rgba(255, 255, 255, 0.3)',
		fontStyle: 'italic'
	},
	teamName: {
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	score: {
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		fontSize: '1.5rem',
		marginLeft: 12,
		minWidth: 24,
		textAlign: 'right'
	},
	championBadge: {
		fontSize: '1.4rem',
		color: '#ffd700'
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: 40
	},
	teamFullDetails: {
		padding: '8px 14px 10px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		display: 'flex',
		flexDirection: 'column',
		gap: 6
	},
	teamTierBadgeMini: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 5,
		padding: '2px 8px',
		borderRadius: 14,
		background: 'rgba(0, 0, 0, 0.3)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.85)',
		alignSelf: 'flex-start'
	},
	teamTierEmblemMini: {
		width: 14,
		height: 14
	},
	memberLine: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.85)'
	},
	memberLinePosIcon: {
		width: 14,
		height: 14,
		color: '#00d4ff',
		flexShrink: 0
	},
	memberLinePosFallback: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.85rem',
		color: 'rgba(0, 212, 255, 0.7)',
		fontWeight: 600
	},
	memberLineAvatar: {
		width: 18,
		height: 18,
		borderRadius: 4,
		flexShrink: 0
	},
	memberLinePlaceholder: {
		width: 18,
		height: 18,
		borderRadius: 4,
		background: 'rgba(0, 212, 255, 0.15)',
		flexShrink: 0
	},
	memberLineName: {
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	memberLineCaptain: {
		fontSize: '1rem',
		color: '#ffd700'
	},
	memberLineTier: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.55)',
		minWidth: 18,
		textAlign: 'right'
	},
	teamScrimSummary: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.55)',
		marginTop: 2,
		'& > .win': { color: '#00ff7f', fontFamily: '"Rajdhani", sans-serif', fontWeight: 700 },
		'& > .loss': { color: '#ff6b6b', fontFamily: '"Rajdhani", sans-serif', fontWeight: 700 },
		'& > .sep': { color: 'rgba(255, 255, 255, 0.3)', margin: '0 3px' }
	},
	detailSection: {
		padding: '10px 14px',
		background: 'rgba(0, 0, 0, 0.25)',
		borderTop: '1px solid rgba(0, 212, 255, 0.1)'
	},
	detailSectionLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(0, 212, 255, 0.6)',
		fontWeight: 600,
		letterSpacing: '0.05em',
		textTransform: 'uppercase',
		marginBottom: 6
	},
	detailSectionRow: {
		display: 'grid',
		gridTemplateColumns: '1fr auto 1fr',
		alignItems: 'center',
		gap: 8
	},
	detailTeamLeft: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: '#fff',
		textAlign: 'right',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	detailTeamRight: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: '#fff',
		textAlign: 'left',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	detailScore: {
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		fontSize: '1.5rem',
		display: 'inline-flex',
		alignItems: 'baseline',
		gap: 4,
		color: '#fff',
		'& > .win': { color: '#00ff7f' },
		'& > .loss': { color: '#ff6b6b' },
		'& > .cyan': { color: '#00d4ff' },
		'& > .sep': { color: 'rgba(255, 255, 255, 0.4)' }
	},
	detailSubRow: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginTop: 4,
		textAlign: 'center'
	},
	detailEmpty: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.35)',
		fontStyle: 'italic',
		textAlign: 'center'
	}
}));

function TournamentBracket({
	matches,
	teams,
	roundLabels,
	championTeamId,
	canEdit,
	onEditMatch,
	verbose,
	activeMembers
}) {
	const { classes, cx } = useStyles();

	const teamMap = React.useMemo(() => {
		const m = new Map();
		teams.forEach(t => m.set(t.id, t));
		return m;
	}, [teams]);

	const memberMap = React.useMemo(() => {
		const m = new Map();
		(activeMembers || []).forEach(am => m.set(am.puuid, am));
		return m;
	}, [activeMembers]);

	const grouped = React.useMemo(() => groupMatchesByRound(matches), [matches]);

	// 매치 → 다음 라운드 매치(승자 진출처) 라인 좌표 계산.
	// 한쪽이 BYE 인 R1 매치는 visibleMatches 에 없어 ref 가 없으므로 자동으로 라인이 안 그려진다
	// (다음 라운드 매치엔 한쪽 라인만 들어가는 게 자연스럽다).
	const buildLines = React.useCallback((containerEl, itemRefs) => {
		const result = [];
		const cr = containerEl.getBoundingClientRect();
		matches.forEach(m => {
			const next = matches.find(
				x => x.round === m.round + 1 && x.bracketSlot === Math.floor(m.bracketSlot / 2)
			);
			if (!next) return;
			const fromEl = itemRefs[m.id];
			const toEl = itemRefs[next.id];
			if (!fromEl || !toEl) return;
			const fr = fromEl.getBoundingClientRect();
			const tr = toEl.getBoundingClientRect();
			result.push({
				key: `${m.id}-${next.id}`,
				x1: fr.right - cr.left,
				y1: fr.top + fr.height / 2 - cr.top,
				x2: tr.left - cr.left,
				y2: tr.top + tr.height / 2 - cr.top,
				finished: m.winnerTeamId != null
			});
		});
		return result;
	}, [matches]);

	const { containerRef, itemRefs, lines } = useBracketLines(buildLines, [matches]);

	if (grouped.length === 0) {
		return <div className={classes.emptyText}>매치 정보가 없습니다.</div>;
	}

	function renderTeamFullDetails(team) {
		if (!team) return null;
		const tierName = getTierName(team.avgRating);
		const tierShort = getTierShortLabel(team.avgRating);
		const tierEmblem = getTierEmblemUrl(tierName);
		const r = team.scrimRecord;
		return (
			<div className={classes.teamFullDetails}>
				{tierShort && (
					<div className={classes.teamTierBadgeMini}>
						{tierEmblem && <img src={tierEmblem} alt="" className={classes.teamTierEmblemMini} />}
						팀 평균 {tierShort}
					</div>
				)}
				{(team.members || []).map(m => {
					const info = memberMap.get(m.puuid);
					const url = info && info.profileIconId ? getProfileIconUrl(info.profileIconId) : null;
					const name = info ? info.name : `${m.puuid.slice(0, 8)}…`;
					const memberShort = info ? getTierShortLabel(info.rating) : null;
					const isCaptain = team.captainPuuid === m.puuid;
					return (
						<div key={m.puuid} className={classes.memberLine}>
							<PositionIcon
								position={m.position}
								className={classes.memberLinePosIcon}
								fallbackClassName={classes.memberLinePosFallback}
							/>
							{url ? (
								<img src={url} alt="" className={classes.memberLineAvatar} />
							) : (
								<div className={classes.memberLinePlaceholder} />
							)}
							<span className={classes.memberLineName}>{name}</span>
							{isCaptain && <StarIcon className={classes.memberLineCaptain} />}
							{memberShort && <span className={classes.memberLineTier}>{memberShort}</span>}
						</div>
					);
				})}
				{r && r.played > 0 && (
					<div className={classes.teamScrimSummary}>
						누적 스크림{' '}
						<span className="win">{r.won}</span>
						<span className="sep">-</span>
						<span className="loss">{r.lost}</span>
					</div>
				)}
			</div>
		);
	}

	function renderExpectedSection(team1, team2, prob1, prob2) {
		if (prob1 == null || prob2 == null) return null;
		const tier1 = getTierShortLabel(team1 && team1.avgRating);
		const tier2 = getTierShortLabel(team2 && team2.avgRating);
		return (
			<div className={classes.detailSection}>
				<div className={classes.detailSectionLabel}>예상 승률 (내전 티어 기준)</div>
				<div className={classes.detailSectionRow}>
					<span className={classes.detailTeamLeft}>{team1 ? team1.name : '?'}</span>
					<span className={classes.detailScore}>
						<span className="cyan">{prob1}%</span>
						<span className="sep">:</span>
						<span className="cyan">{prob2}%</span>
					</span>
					<span className={classes.detailTeamRight}>{team2 ? team2.name : '?'}</span>
				</div>
				{(tier1 || tier2) && (
					<div className={classes.detailSubRow}>팀 평균 {tier1 || '?'} vs {tier2 || '?'}</div>
				)}
			</div>
		);
	}

	function renderH2HSection(team1, team2, h2h) {
		if (!team1 || !team2) return null;
		if (!h2h || h2h.played === 0) {
			return (
				<div className={classes.detailSection}>
					<div className={classes.detailSectionLabel}>스크림 H2H</div>
					<div className={classes.detailEmpty}>아직 두 팀의 스크림 기록이 없습니다</div>
				</div>
			);
		}
		return (
			<div className={classes.detailSection}>
				<div className={classes.detailSectionLabel}>스크림 H2H</div>
				<div className={classes.detailSectionRow}>
					<span className={classes.detailTeamLeft}>{team1.name}</span>
					<span className={classes.detailScore}>
						<span className="win">{h2h.team1.won}</span>
						<span className="sep">:</span>
						<span className="loss">{h2h.team1.lost}</span>
					</span>
					<span className={classes.detailTeamRight}>{team2.name}</span>
				</div>
				<div className={classes.detailSubRow}>{h2h.played}매치</div>
			</div>
		);
	}

	function renderTeamRow(teamId, score, winnerTeamId, isFinishedMatch, emptyLabel) {
		const team = teamId ? teamMap.get(teamId) : null;
		const isWinner = winnerTeamId && winnerTeamId === teamId;
		const isLoser = winnerTeamId && winnerTeamId !== teamId && teamId;
		const isChampion = championTeamId && championTeamId === teamId;
		const showScore = isFinishedMatch && team;

		let rowCls = classes.teamRow;
		if (isWinner) rowCls = cx(rowCls, classes.teamRowWinner);
		else if (isLoser) rowCls = cx(rowCls, classes.teamRowLoser);
		else if (!team) rowCls = cx(rowCls, classes.teamRowTBD);

		return (
			<div className={rowCls}>
				<span className={classes.teamName}>
					{team ? team.name : emptyLabel}
					{isChampion && <EmojiEventsIcon className={classes.championBadge} />}
				</span>
				{showScore && <span className={classes.score}>{score}</span>}
			</div>
		);
	}

	return (
		<div className={classes.root}>
			<div className={classes.scroll} ref={containerRef}>
				<svg className={classes.linesSvg}>
					{lines.map(l => (
						<path
							key={l.key}
							d={buildLinePath(l.x1, l.y1, l.x2, l.y2)}
							stroke={l.finished ? BRACKET_LINE_COLOR_FINISHED : BRACKET_LINE_COLOR}
							strokeWidth={l.finished ? 2 : 1.5}
							fill="none"
						/>
					))}
				</svg>
				{grouped.map(([round, roundMatches]) => {
					// R1 의 BYE(한쪽만 null) 는 숨겨서 부전승팀이 다음 라운드로 자연스럽게 진출한 듯
					// 보이게 한다. R2 이상에선 한쪽이 비어 있어도 매치 자체는 표시 — 빈 자리는
					// "이전 라운드 승자 대기" 로 안내.
					const visibleMatches = round === 1
						? roundMatches.filter(m => !isByeMatch(m))
						: roundMatches;
					const label = roundLabels[round] || `${round}라운드`;
					const emptyLabel = round === 1 ? 'TBD' : '이전 라운드 승자 대기';

					return (
						<div key={round} className={cx(classes.column, verbose && classes.columnVerbose)}>
							<div className={classes.columnTitle}>{label}</div>
							<div className={classes.matchList}>
								{visibleMatches.length === 0 ? (
									<div className={classes.emptyText}>—</div>
								) : (
									visibleMatches.map(m => {
										const finished = m.winnerTeamId != null;
										const empty = isEmptyMatch(m);
										const editable = canEdit && !empty && !finished
											&& m.team1Id != null && m.team2Id != null;

										const team1 = m.team1Id ? teamMap.get(m.team1Id) : null;
										const team2 = m.team2Id ? teamMap.get(m.team2Id) : null;

										let prob1 = null;
										let prob2 = null;
										if (verbose && !finished && m.team1WinProb != null && m.team2WinProb != null) {
											prob1 = Math.round(m.team1WinProb * 100);
											prob2 = Math.round(m.team2WinProb * 100);
										}

										return (
											<div
												key={m.id}
												ref={el => { itemRefs.current[m.id] = el; }}
												className={cx(classes.match, editable && classes.matchClickable)}
												onClick={editable ? () => onEditMatch(m) : undefined}
												role={editable ? 'button' : undefined}
												tabIndex={editable ? 0 : undefined}
												onKeyDown={editable ? (e) => e.key === 'Enter' && onEditMatch(m) : undefined}
											>
												<div className={classes.matchHeader}>
													<span>매치 {m.bracketSlot + 1}</span>
													<span className={classes.matchHeaderBO}>BO{m.bestOf}</span>
													{editable && <EditIcon className={classes.editIcon} />}
												</div>
												{renderTeamRow(m.team1Id, m.team1Score, m.winnerTeamId, finished, emptyLabel)}
												{verbose && renderTeamFullDetails(team1)}
												{renderTeamRow(m.team2Id, m.team2Score, m.winnerTeamId, finished, emptyLabel)}
												{verbose && renderTeamFullDetails(team2)}
												{verbose && team1 && team2 && (
													<>
														{renderExpectedSection(team1, team2, prob1, prob2)}
														{renderH2HSection(team1, team2, m.headToHeadScrim)}
													</>
												)}
											</div>
										);
									})
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default TournamentBracket;
