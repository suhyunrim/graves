import React from 'react';
import { makeStyles } from 'tss-react/mui';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EditIcon from '@mui/icons-material/Edit';
import { getProfileIconUrl } from 'app/main/challenge/ddragonUtils';
import {
	groupMatchesByRound,
	isByeMatch,
	isEmptyMatch,
	BRACKET_LINE_COLOR,
	BRACKET_LINE_COLOR_FINISHED
} from './tournamentUtils';
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
	winProb: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(0, 212, 255, 0.85)',
		marginLeft: 12,
		minWidth: 42,
		textAlign: 'right',
		fontWeight: 600
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
	teamDetails: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '6px 14px 8px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		'&:last-child': { borderBottom: 'none' }
	},
	teamMembers: {
		display: 'flex',
		gap: 3,
		flex: 1,
		minWidth: 0
	},
	teamMemberAvatar: {
		width: 18,
		height: 18,
		borderRadius: 4,
		flexShrink: 0
	},
	teamMemberPlaceholder: {
		width: 18,
		height: 18,
		borderRadius: 4,
		background: 'rgba(0, 212, 255, 0.15)',
		flexShrink: 0
	},
	teamScrimRecord: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.6)',
		whiteSpace: 'nowrap',
		'& > .win': { color: '#00ff7f' },
		'& > .loss': { color: '#ff6b6b' },
		'& > .sep': { color: 'rgba(255, 255, 255, 0.3)', margin: '0 2px' }
	},
	h2hRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '8px 14px',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.55)',
		background: 'rgba(0, 0, 0, 0.25)'
	},
	h2hLabel: {
		letterSpacing: '0.03em'
	},
	h2hScore: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700,
		color: '#fff'
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

	function renderTeamDetails(team) {
		if (!team) return null;
		const r = team.scrimRecord || { won: 0, lost: 0, played: 0 };
		return (
			<div className={classes.teamDetails}>
				<div className={classes.teamMembers}>
					{(team.members || []).map(m => {
						const info = memberMap.get(m.puuid);
						const url = info && info.profileIconId ? getProfileIconUrl(info.profileIconId) : null;
						const name = info ? info.name : m.puuid;
						return url ? (
							<img key={m.puuid} src={url} alt={name} title={name} className={classes.teamMemberAvatar} />
						) : (
							<div key={m.puuid} className={classes.teamMemberPlaceholder} title={name} />
						);
					})}
				</div>
				{r.played > 0 && (
					<span className={classes.teamScrimRecord}>
						<span className="win">{r.won}</span>
						<span className="sep">-</span>
						<span className="loss">{r.lost}</span>
					</span>
				)}
			</div>
		);
	}

	function renderTeamRow(teamId, score, winnerTeamId, isFinishedMatch, emptyLabel, winProbPct) {
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
				{!isFinishedMatch && winProbPct != null && team && (
					<span className={classes.winProb}>{winProbPct}%</span>
				)}
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
						<div key={round} className={classes.column}>
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

										let prob1 = null;
										let prob2 = null;
										if (!finished && m.team1WinProb != null && m.team2WinProb != null) {
											prob1 = Math.round(m.team1WinProb * 100);
											prob2 = Math.round(m.team2WinProb * 100);
										}

										const team1 = m.team1Id ? teamMap.get(m.team1Id) : null;
										const team2 = m.team2Id ? teamMap.get(m.team2Id) : null;
										const h2h = verbose ? m.headToHeadScrim : null;

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
												{renderTeamRow(m.team1Id, m.team1Score, m.winnerTeamId, finished, emptyLabel, prob1)}
												{verbose && renderTeamDetails(team1)}
												{renderTeamRow(m.team2Id, m.team2Score, m.winnerTeamId, finished, emptyLabel, prob2)}
												{verbose && renderTeamDetails(team2)}
												{h2h && h2h.played > 0 && (
													<div className={classes.h2hRow}>
														<span className={classes.h2hLabel}>상대 전적</span>
														<span className={classes.h2hScore}>
															{h2h.team1.won} : {h2h.team1.lost}
														</span>
													</div>
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
