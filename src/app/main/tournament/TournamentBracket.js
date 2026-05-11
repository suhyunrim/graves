import React from 'react';
import { makeStyles } from 'tss-react/mui';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import { getProfileIconUrl } from 'app/main/challenge/ddragonUtils';
import {
	groupMatchesByRound,
	isEmptyMatch,
	isByeMatch,
	getTierName,
	getTierShortLabel,
	getTierEmblemUrl,
	bestOfLabel,
	formatScheduledAt,
	getVisibleMatches,
	displayNameForPuuid,
	BRACKET_LINE_COLOR,
	BRACKET_LINE_COLOR_FINISHED
} from './tournamentUtils';
import PositionIcon from './PositionIcon';
import useBracketLines, { buildLinePath } from './useBracketLines';

const useStyles = makeStyles()((theme) => ({
	root: {
		overflowX: 'auto',
		paddingBottom: 8,
		// flex/grid 조상에서 자식 콘텐츠가 부모 폭을 밀어내지 않도록 격리
		width: '100%',
		minWidth: 0,
		maxWidth: '100%'
	},
	scroll: {
		display: 'flex',
		gap: 56,
		minWidth: 'min-content',
		padding: '4px 4px 8px',
		position: 'relative',
		[theme.breakpoints.down('sm')]: {
			gap: 32
		}
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
		zIndex: 1,
		[theme.breakpoints.down('sm')]: {
			minWidth: 200,
			gap: 12
		}
	},
	columnVerbose: {
		minWidth: 320,
		[theme.breakpoints.down('sm')]: {
			minWidth: 260
		}
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
		textAlign: 'center',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.3rem',
			paddingBottom: 6
		}
	},
	matchList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
		justifyContent: 'space-around',
		flex: 1
	},
	// R1 에 BYE 가 섞인 경우: 매치를 슬롯 기반으로 절대 위치 배치해서
	// 다음 라운드 매치와 같은 선상에 오도록 한다 (가운데 정렬 어색함 해소).
	matchListAbsolute: {
		position: 'relative',
		justifyContent: 'flex-start'
	},
	matchAbsolute: {
		position: 'absolute',
		left: 0,
		right: 0,
		transform: 'translateY(-50%)'
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
		justifyContent: 'space-between',
		[theme.breakpoints.down('sm')]: {
			padding: '5px 10px',
			fontSize: '0.95rem'
		}
	},
	matchHeaderBO: {
		color: 'rgba(0, 212, 255, 0.6)',
		fontWeight: 600
	},
	matchHeaderActions: {
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	matchHeaderSchedule: {
		color: 'rgba(0, 212, 255, 0.7)',
		fontWeight: 500
	},
	matchHeaderScheduleTbd: {
		color: 'rgba(255, 255, 255, 0.3)',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 600,
		letterSpacing: '0.08em'
	},
	editIcon: {
		fontSize: '1.2rem',
		color: 'rgba(0, 212, 255, 0.7)'
	},
	editIconClickable: {
		cursor: 'pointer',
		padding: 2,
		borderRadius: 4,
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.15)',
			color: '#00d4ff'
		}
	},
	teamRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '10px 14px 10px 10px',
		borderLeft: '4px solid transparent',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.85)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		'&:last-child': {
			borderBottom: 'none'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.2rem',
			padding: '8px 12px 8px 8px'
		}
	},
	// Plan C 색 단서 — LoL 블루팀/레드팀 컨벤션. destructive #ff6b6b 와 톤 차별을 위해 #e84057 사용.
	teamRowBlueSide: {
		borderLeftColor: '#4287f5'
	},
	teamRowRedSide: {
		borderLeftColor: '#e84057'
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
		textAlign: 'right',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.3rem',
			marginLeft: 8
		}
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
	pickStar: {
		fontSize: '1.1rem',
		color: '#ffd700',
		marginLeft: 4,
		flexShrink: 0
	},
	predictionFooter: {
		display: 'flex',
		flexDirection: 'column',
		gap: 5,
		padding: '6px 12px 8px',
		borderTop: '1px solid rgba(0, 212, 255, 0.08)',
		[theme.breakpoints.down('sm')]: {
			padding: '5px 10px 7px',
			gap: 4
		}
	},
	predictionGaugeRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	predictionGaugePctLeft: {
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		fontSize: '1.05rem',
		color: '#4287f5',
		flexShrink: 0,
		minWidth: 26,
		textAlign: 'left'
	},
	predictionGaugePctRight: {
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		fontSize: '1.05rem',
		color: '#e84057',
		flexShrink: 0,
		minWidth: 26,
		textAlign: 'right'
	},
	predictionGauge: {
		flex: 1,
		display: 'flex',
		height: 5,
		borderRadius: 3,
		overflow: 'hidden',
		background: 'rgba(255, 255, 255, 0.05)'
	},
	predictionGaugeFillT1: {
		background: 'linear-gradient(90deg, #4287f5, #1976d2)',
		height: '100%'
	},
	predictionGaugeFillT2: {
		background: 'linear-gradient(90deg, #e84057, #c2384a)',
		height: '100%'
	},
	predictionMetaRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 4,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.45)',
		[theme.breakpoints.down('sm')]: {
			fontSize: '0.95rem'
		}
	},
	predictionFooterDot: {
		color: 'rgba(255, 255, 255, 0.2)',
		margin: '0 2px'
	},
	predictionFooterStar: {
		fontSize: '0.95rem',
		color: '#ffd700'
	},
	predictionFooterTeam: {
		color: 'rgba(255, 215, 0, 0.85)',
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	teamFullDetails: {
		padding: '8px 14px 10px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		display: 'flex',
		flexDirection: 'column',
		gap: 6,
		[theme.breakpoints.down('sm')]: {
			padding: '6px 12px 8px'
		}
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
		color: 'rgba(255, 255, 255, 0.85)',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1rem',
			gap: 5
		}
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
		borderTop: '1px solid rgba(0, 212, 255, 0.1)',
		[theme.breakpoints.down('sm')]: {
			padding: '8px 12px'
		}
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
		whiteSpace: 'nowrap',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.05rem'
		}
	},
	detailTeamRight: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: '#fff',
		textAlign: 'left',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.05rem'
		}
	},
	detailScore: {
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		fontSize: '1.5rem',
		display: 'inline-flex',
		alignItems: 'baseline',
		gap: 4,
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.3rem'
		},
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
	isInProgress,
	isAdmin,
	onEditMatch,
	verbose,
	myPuuid,
	onMatchClick
}) {
	const { classes, cx } = useStyles();

	const teamMap = React.useMemo(() => {
		const m = new Map();
		teams.forEach(t => m.set(t.id, t));
		return m;
	}, [teams]);

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
					const url = m.profileIconId ? getProfileIconUrl(m.profileIconId) : null;
					const name = displayNameForPuuid(m.name, m.puuid);
					const memberShort = m.rating != null ? getTierShortLabel(m.rating) : null;
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
						전체 스크림 전적{' '}
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
					<div className={classes.detailSectionLabel}>스크림 상대 전적</div>
					<div className={classes.detailEmpty}>아직 두 팀의 스크림 기록이 없습니다</div>
				</div>
			);
		}
		return (
			<div className={classes.detailSection}>
				<div className={classes.detailSectionLabel}>스크림 상대 전적</div>
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

	function renderTeamRow(teamId, score, winnerTeamId, isFinishedMatch, emptyLabel, isMyPick, sideKey) {
		const team = teamId ? teamMap.get(teamId) : null;
		const isWinner = winnerTeamId && winnerTeamId === teamId;
		const isLoser = winnerTeamId && winnerTeamId !== teamId && teamId;
		const isChampion = championTeamId && championTeamId === teamId;
		const showScore = isFinishedMatch && team;

		const sideCls = sideKey === 'blue' ? classes.teamRowBlueSide
			: sideKey === 'red' ? classes.teamRowRedSide
				: null;
		let rowCls = cx(classes.teamRow, sideCls);
		if (isWinner) rowCls = cx(rowCls, classes.teamRowWinner);
		else if (isLoser) rowCls = cx(rowCls, classes.teamRowLoser);
		else if (!team) rowCls = cx(rowCls, classes.teamRowTBD);

		return (
			<div className={rowCls}>
				<span className={classes.teamName}>
					{team ? team.name : emptyLabel}
					{isChampion && <EmojiEventsIcon className={classes.championBadge} />}
					{isMyPick && <StarIcon className={classes.pickStar} />}
				</span>
				{showScore && <span className={classes.score}>{score}</span>}
			</div>
		);
	}

	function renderPredictionFooter(m, myPickedTeamId) {
		const total = (m.team1PredictionCount || 0) + (m.team2PredictionCount || 0);
		const myPickedTeam = myPickedTeamId != null ? teamMap.get(myPickedTeamId) : null;
		const myPickedLabel = myPickedTeamId != null
			? (myPickedTeam ? myPickedTeam.name : `팀#${myPickedTeamId}`)
			: null;
		// 예측이 0표면서 본인도 안 찍었으면 푸터 자체를 숨겨 카드를 깔끔히 유지
		if (total === 0 && !myPickedLabel) return null;
		// 백엔드 pct 합계가 반올림으로 100% 가 안 맞을 수 있어 좌측을 round, 우측을 100-좌측으로 강제.
		const pct1 = total > 0 && m.team1PredictionPct != null
			? Math.round(m.team1PredictionPct * 100)
			: 0;
		const pct2 = total > 0 ? 100 - pct1 : 0;
		return (
			<div className={classes.predictionFooter}>
				{total > 0 && (
					<div className={classes.predictionGaugeRow}>
						<span className={classes.predictionGaugePctLeft}>{pct1}%</span>
						<div className={classes.predictionGauge}>
							<div className={classes.predictionGaugeFillT1} style={{ flexBasis: `${pct1}%` }} />
							<div className={classes.predictionGaugeFillT2} style={{ flexBasis: `${pct2}%` }} />
						</div>
						<span className={classes.predictionGaugePctRight}>{pct2}%</span>
					</div>
				)}
				<div className={classes.predictionMetaRow}>
					<span>예측 {total}표</span>
					{myPickedLabel && (
						<>
							<span className={classes.predictionFooterDot}>·</span>
							<StarIcon className={classes.predictionFooterStar} />
							<span className={classes.predictionFooterTeam}>{myPickedLabel}</span>
						</>
					)}
				</div>
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
					const visibleMatches = getVisibleMatches(round, roundMatches);
					const label = roundLabels[round] || `${round}라운드`;
					const emptyLabel = round === 1 ? 'TBD' : '이전 라운드 승자 대기';

					// R1 에 BYE 가 섞여 있으면 visible 매치를 슬롯 기반으로 절대 위치한다.
					// - 짝(sibling) 이 BYE 면 → R2 자식과 같은 y (라인이 거의 수평)
					// - 짝이 real 이면 → 자기 슬롯 (slot+0.5)/N (정상 fan-out)
					const r1ByeCount = round === 1 ? roundMatches.filter(isByeMatch).length : 0;
					const useAbsolute = round === 1 && r1ByeCount > 0;
					const totalR1Slots = roundMatches.length;
					const computeY = (m) => {
						const sibling = roundMatches.find(x => x.bracketSlot === (m.bracketSlot ^ 1));
						if (sibling && isByeMatch(sibling)) {
							const childSlot = Math.floor(m.bracketSlot / 2);
							const r2Count = totalR1Slots / 2;
							return (childSlot + 0.5) / r2Count;
						}
						return (m.bracketSlot + 0.5) / totalR1Slots;
					};

					return (
						<div key={round} className={cx(classes.column, verbose && classes.columnVerbose)}>
							<div className={classes.columnTitle}>{label}</div>
							<div className={cx(classes.matchList, useAbsolute && classes.matchListAbsolute)}>
								{visibleMatches.length === 0 ? (
									<div className={classes.emptyText}>—</div>
								) : (
									visibleMatches.map(m => {
										const finished = m.winnerTeamId != null;
										const empty = isEmptyMatch(m);

										const team1 = m.team1Id ? teamMap.get(m.team1Id) : null;
										const team2 = m.team2Id ? teamMap.get(m.team2Id) : null;

										// 매치별 스코어 수정 권한: 진행 중 + 미완료 + 두 팀 정해진 매치 + (어드민 또는 양 팀 중 본인이 팀장)
										const isMatchCaptain = Boolean(myPuuid) && (
											(team1 && team1.captainPuuid === myPuuid)
											|| (team2 && team2.captainPuuid === myPuuid)
										);
										const canScoreEdit = isInProgress && !empty && !finished
											&& m.team1Id != null && m.team2Id != null
											&& (isAdmin || isMatchCaptain);

										const predictionClickable = !!onMatchClick && !empty;
										const handleCardClick = predictionClickable
											? () => onMatchClick(m)
											: undefined;

										let prob1 = null;
										let prob2 = null;
										if (verbose && !finished && m.team1WinProb != null && m.team2WinProb != null) {
											prob1 = Math.round(m.team1WinProb * 100);
											prob2 = Math.round(m.team2WinProb * 100);
										}

										const myPick = myPuuid
											? (m.predictions || []).find(p => p.userPuuid === myPuuid)
											: null;
										const myPickedTeamId = myPick ? myPick.predictedTeamId : null;
										const isMyPickT1 = myPickedTeamId != null && myPickedTeamId === m.team1Id;
										const isMyPickT2 = myPickedTeamId != null && myPickedTeamId === m.team2Id;

										const absStyle = useAbsolute ? { top: `${computeY(m) * 100}%` } : undefined;

										return (
											<div
												key={m.id}
												ref={el => { itemRefs.current[m.id] = el; }}
												className={cx(
													classes.match,
													predictionClickable && classes.matchClickable,
													useAbsolute && classes.matchAbsolute
												)}
												style={absStyle}
												onClick={handleCardClick}
												role={predictionClickable ? 'button' : undefined}
												tabIndex={predictionClickable ? 0 : undefined}
												onKeyDown={predictionClickable ? (e) => e.key === 'Enter' && handleCardClick() : undefined}
											>
												<div className={classes.matchHeader}>
													<span
														className={cx(
															classes.matchHeaderSchedule,
															!m.scheduledAt && classes.matchHeaderScheduleTbd
														)}
													>
														{m.scheduledAt ? formatScheduledAt(m.scheduledAt) : 'TBD'}
													</span>
													<div className={classes.matchHeaderActions}>
														<span className={classes.matchHeaderBO}>{bestOfLabel(m.bestOf)}</span>
														{canScoreEdit && (
															<EditIcon
																className={cx(classes.editIcon, classes.editIconClickable)}
																onClick={(e) => { e.stopPropagation(); onEditMatch(m); }}
																role="button"
																tabIndex={0}
																onKeyDown={(e) => {
																	if (e.key === 'Enter') {
																		e.stopPropagation();
																		onEditMatch(m);
																	}
																}}
															/>
														)}
													</div>
												</div>
												{renderTeamRow(m.team1Id, m.team1Score, m.winnerTeamId, finished, emptyLabel, isMyPickT1, 'blue')}
												{verbose && renderTeamFullDetails(team1)}
												{renderTeamRow(m.team2Id, m.team2Score, m.winnerTeamId, finished, emptyLabel, isMyPickT2, 'red')}
												{verbose && renderTeamFullDetails(team2)}
												{verbose && team1 && team2 && (
													<>
														{renderExpectedSection(team1, team2, prob1, prob2)}
														{renderH2HSection(team1, team2, m.headToHeadScrim)}
													</>
												)}
												{!empty && renderPredictionFooter(m, myPickedTeamId)}
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
