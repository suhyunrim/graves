import React from 'react';
import { makeStyles } from 'tss-react/mui';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EditIcon from '@mui/icons-material/Edit';
import { groupMatchesByRound, isByeMatch, isEmptyMatch } from './tournamentUtils';

const useStyles = makeStyles()((theme) => ({
	root: {
		overflowX: 'auto',
		paddingBottom: 8
	},
	scroll: {
		display: 'flex',
		gap: 24,
		minWidth: 'min-content',
		padding: '4px 4px 8px'
	},
	column: {
		display: 'flex',
		flexDirection: 'column',
		gap: 16,
		minWidth: 240,
		flexShrink: 0
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
	}
}));

function TournamentBracket({ matches, teams, roundLabels, championTeamId, canEdit, onEditMatch }) {
	const { classes, cx } = useStyles();

	const teamMap = React.useMemo(() => {
		const m = new Map();
		teams.forEach(t => m.set(t.id, t));
		return m;
	}, [teams]);

	const grouped = React.useMemo(() => groupMatchesByRound(matches), [matches]);

	if (grouped.length === 0) {
		return <div className={classes.emptyText}>매치 정보가 없습니다.</div>;
	}

	function renderTeamRow(teamId, score, otherScore, winnerTeamId, isFinishedMatch) {
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
					{team ? team.name : 'TBD'}
					{isChampion && <EmojiEventsIcon className={classes.championBadge} />}
				</span>
				{showScore && <span className={classes.score}>{score}</span>}
			</div>
		);
	}

	return (
		<div className={classes.root}>
			<div className={classes.scroll}>
				{grouped.map(([round, roundMatches]) => {
					// BYE 매치는 숨김 — 부전승팀이 다음 라운드로 자연스럽게 진출한 것처럼 보이게
					const visibleMatches = roundMatches.filter(m => !isByeMatch(m));
					const label = roundLabels[round] || `${round}라운드`;

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

										return (
											<div
												key={m.id}
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
												{renderTeamRow(m.team1Id, m.team1Score, m.team2Score, m.winnerTeamId, finished)}
												{renderTeamRow(m.team2Id, m.team2Score, m.team1Score, m.winnerTeamId, finished)}
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
