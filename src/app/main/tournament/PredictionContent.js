import React, { useState, useMemo } from 'react';
import { Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import EditNoteIcon from '@mui/icons-material/EditNote';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService/camilleRiotAuthService';
import PredictionDialog from './PredictionDialog';
import RollingPredictionDialog from './RollingPredictionDialog';
import { STATUS, displayNameForPuuid, isValidMatch, getTotalRoundsFromMatches, getStageLabel } from './tournamentUtils';
import useDiscordLoginGate from '../components/useDiscordLoginGate';

const LEADER_GRID_DESKTOP = '60px 1fr 100px 120px 36px';
const LEADER_GRID_MOBILE = '40px 1fr 36px 86px 22px';

const useStyles = makeStyles()((theme) => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		gap: 18
	},
	headerRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
		flexWrap: 'wrap'
	},
	noticeRow: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.55)',
		padding: '8px 14px',
		background: 'rgba(0, 212, 255, 0.06)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		borderRadius: 10
	},
	noticeRowLocked: {
		background: 'rgba(255, 215, 0, 0.06)',
		border: '1px solid rgba(255, 215, 0, 0.25)',
		color: 'rgba(255, 215, 0, 0.85)'
	},
	primaryBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.2rem',
		padding: '8px 22px',
		borderRadius: 10,
		textTransform: 'none',
		boxShadow: '0 4px 18px rgba(0, 212, 255, 0.25)',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)'
		},
		'&.Mui-disabled': {
			background: 'rgba(255, 255, 255, 0.08)',
			color: 'rgba(255, 255, 255, 0.3)',
			boxShadow: 'none'
		}
	},
	leaderboardWrap: {
		background: 'rgba(0, 0, 0, 0.25)',
		border: '1px solid rgba(0, 212, 255, 0.18)',
		borderRadius: 12,
		overflow: 'hidden'
	},
	leaderHeader: {
		display: 'grid',
		gridTemplateColumns: LEADER_GRID_DESKTOP,
		gap: 8,
		padding: '12px 16px',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(0, 212, 255, 0.85)',
		letterSpacing: '0.04em',
		textTransform: 'uppercase',
		borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: LEADER_GRID_MOBILE,
			gap: 6,
			padding: '10px 10px',
			fontSize: '1rem'
		}
	},
	leaderRow: {
		display: 'grid',
		gridTemplateColumns: LEADER_GRID_DESKTOP,
		gap: 8,
		padding: '10px 16px',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		color: 'rgba(255, 255, 255, 0.85)',
		alignItems: 'center',
		borderTop: '1px solid rgba(0, 212, 255, 0.08)',
		'&:first-of-type': { borderTop: 'none' },
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: LEADER_GRID_MOBILE,
			gap: 6,
			padding: '8px 10px',
			fontSize: '1.1rem'
		}
	},
	leaderRowMine: {
		background: 'rgba(255, 215, 0, 0.08)',
		color: '#ffd700'
	},
	rankCell: {
		display: 'flex',
		alignItems: 'center',
		gap: 4,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.4rem',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.2rem'
		}
	},
	rankTopIcon: {
		fontSize: '1.4rem',
		color: '#ffd700'
	},
	nameCell: {
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	aiBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 3,
		marginRight: 6,
		padding: '1px 7px',
		borderRadius: 8,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		letterSpacing: '0.03em',
		color: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.12)',
		border: '1px solid rgba(0, 212, 255, 0.35)',
		verticalAlign: 'middle'
	},
	scoreCell: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		textAlign: 'right'
	},
	accuracyCell: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		textAlign: 'right',
		color: 'rgba(255, 255, 255, 0.65)'
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: 32
	},
	leaderRowClickable: {
		cursor: 'pointer',
		transition: 'background 0.15s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.06)'
		}
	},
	expandIconCell: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	expandIcon: {
		fontSize: '1.6rem',
		transition: 'transform 0.2s ease'
	},
	expandIconOpen: {
		transform: 'rotate(180deg)',
		color: '#00d4ff'
	},
	expandBlock: {
		padding: '10px 18px 16px',
		background: 'rgba(0, 0, 0, 0.25)',
		borderTop: '1px solid rgba(0, 212, 255, 0.1)',
		borderBottom: '1px solid rgba(0, 212, 255, 0.08)',
		[theme.breakpoints.down('sm')]: {
			padding: '8px 12px 14px'
		}
	},
	expandTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 6
	},
	predictionList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 4
	},
	predictionRow: {
		display: 'grid',
		gridTemplateColumns: '70px 1fr 24px',
		alignItems: 'center',
		gap: 10,
		padding: '6px 8px',
		borderRadius: 6,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.85)',
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '60px 1fr 22px',
			fontSize: '1.05rem',
			padding: '5px 6px',
			gap: 8
		}
	},
	predictionRowCorrect: {
		background: 'rgba(0, 212, 255, 0.06)'
	},
	predictionRowWrong: {
		background: 'rgba(255, 107, 107, 0.05)'
	},
	predictionRowPending: {
		background: 'rgba(255, 255, 255, 0.02)'
	},
	predictionRowInvalid: {
		opacity: 0.5
	},
	predictionRound: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		color: 'rgba(0, 212, 255, 0.85)',
		letterSpacing: '0.04em'
	},
	predictionMatchLine: {
		minWidth: 0,
		overflow: 'hidden',
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis'
	},
	predictionPick: {
		color: '#00d4ff',
		fontWeight: 700,
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	predictionPickWrong: {
		color: '#ff6b6b'
	},
	predictionPickDim: {
		color: 'rgba(255, 255, 255, 0.45)'
	},
	predictionOpponent: {
		color: 'rgba(255, 255, 255, 0.5)',
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	predictionVs: {
		color: 'rgba(255, 255, 255, 0.3)',
		fontSize: '0.95rem'
	},
	predictionResult: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	predictionResultCorrect: {
		color: '#00ff7f',
		fontSize: '1.4rem'
	},
	predictionResultWrong: {
		color: '#ff6b6b',
		fontSize: '1.4rem'
	},
	predictionResultPending: {
		color: 'rgba(255, 255, 255, 0.35)',
		fontSize: '1.2rem'
	},
	predictionResultMissing: {
		color: 'rgba(255, 255, 255, 0.25)',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600
	},
	predictionInvalidNote: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(255, 107, 107, 0.7)',
		marginTop: 4
	}
}));

function rankMedalColor(rank) {
	if (rank === 1) return '#ffd700';
	if (rank === 2) return '#c0c0c0';
	if (rank === 3) return '#cd7f32';
	return null;
}

function formatAccuracy(correct, settled) {
	if (!settled) return '–';
	const pct = Math.round((correct / settled) * 100);
	return `${pct}% (${correct}/${settled})`;
}

function PredictionContent({ tournamentId, status, predictionMode = 'bracket', predictionsLocked, matches, teams, leaderboard, roundLabels, onMutated }) {
	const { classes, cx } = useStyles();
	const myPuuid = useMemo(() => camilleRiotAuthService.getAuthenticatedPuuid(), []);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [expandedPuuid, setExpandedPuuid] = useState(null);
	const { requireLogin: requireDiscordLogin, gate: discordLoginGate } = useDiscordLoginGate();

	const teamMap = useMemo(() => {
		const m = new Map();
		(teams || []).forEach(t => m.set(t.id, t));
		return m;
	}, [teams]);

	const totalRounds = useMemo(() => getTotalRoundsFromMatches(matches), [matches]);

	// BYE/empty 제외한 정상 매치만 — 예측 대상.
	const predictableMatches = useMemo(
		() => (matches || []).filter(isValidMatch).sort((a, b) => a.round - b.round || a.bracketSlot - b.bracketSlot),
		[matches]
	);

	// 사용자별 매치 예측 결과 — expand 됐을 때만 계산.
	function buildUserPredictions(userPuuid) {
		return predictableMatches.map(m => {
			const pred = (m.predictions || []).find(p => p.userPuuid === userPuuid);
			const finished = m.winnerTeamId != null;
			const team1 = teamMap.get(m.team1Id);
			const team2 = teamMap.get(m.team2Id);
			let resultStatus = 'missing'; // 미예측
			let pickedTeam = null;
			let isInvalid = false;
			if (pred) {
				pickedTeam = teamMap.get(pred.predictedTeamId);
				isInvalid = pred.isValid === false;
				if (!finished) {
					resultStatus = 'pending';
				} else if (pred.predictedTeamId === m.winnerTeamId) {
					resultStatus = 'correct';
				} else {
					resultStatus = 'wrong';
				}
			}
			return { match: m, team1, team2, pred, pickedTeam, resultStatus, isInvalid };
		});
	}

	function handleOpenDialog() {
		if (!requireDiscordLogin('승부예측')) return;
		setDialogOpen(true);
	}

	const isPreparing = status === STATUS.PREPARING;
	const isFinished = status === STATUS.FINISHED;
	const isRolling = predictionMode === 'rolling';

	// rolling: 지금 예측 가능한(양팀 확정+미시작) 매치 수.
	const openMatchCount = useMemo(
		() => (isRolling ? predictableMatches.filter(m => m.predictable).length : 0),
		[isRolling, predictableMatches]
	);

	let canPredict;
	let notice = null;
	if (isRolling) {
		canPredict = openMatchCount > 0;
		if (openMatchCount > 0) {
			notice = `지금 예측할 수 있는 경기 ${openMatchCount}개 — 두 팀이 확정된 경기만 그때그때 예측할 수 있어요.`;
		} else if (isFinished) {
			notice = '종료된 토너먼트입니다.';
		} else {
			notice = '지금 예측할 수 있는 경기가 없습니다. 대진이 확정되면 예측할 수 있어요.';
		}
	} else {
		canPredict = !isPreparing && !isFinished && !predictionsLocked;
		if (isPreparing) {
			notice = '토너먼트가 시작되면 예측이 가능합니다.';
		} else if (predictionsLocked && !isFinished) {
			notice = '첫 매치가 시작되어 예측이 마감되었습니다.';
		} else if (isFinished) {
			notice = '종료된 토너먼트입니다.';
		} else {
			notice = '첫 매치가 시작되기 전까지 자유롭게 변경할 수 있습니다.';
		}
	}

	function handleSuccess() {
		setDialogOpen(false);
		if (onMutated) onMutated();
	}

	return (
		<div className={classes.root}>
			<div className={classes.headerRow}>
				<div className={cx(classes.noticeRow, !canPredict && classes.noticeRowLocked)}>
					{notice}
				</div>
				<Button
					className={classes.primaryBtn}
					startIcon={<EditNoteIcon />}
					disabled={!canPredict}
					onClick={handleOpenDialog}
				>
					내 예측 입력
				</Button>
			</div>

			<div className={classes.leaderboardWrap}>
				<div className={classes.leaderHeader}>
					<span>순위</span>
					<span>참가자</span>
					<span style={{ textAlign: 'right' }}>정답</span>
					<span style={{ textAlign: 'right' }}>적중률</span>
					<span aria-label="expand" />
				</div>
				{(!leaderboard || leaderboard.length === 0) ? (
					<div className={classes.emptyText}>아직 예측한 사람이 없습니다.</div>
				) : (
					leaderboard.map((row, idx) => {
						const rank = idx + 1;
						const medalColor = rankMedalColor(rank);
						const isMine = myPuuid && row.userPuuid === myPuuid;
						const expanded = expandedPuuid === row.userPuuid;
						const items = expanded ? buildUserPredictions(row.userPuuid) : [];
						return (
							<React.Fragment key={row.userPuuid}>
								<div
									className={cx(classes.leaderRow, classes.leaderRowClickable, isMine && classes.leaderRowMine)}
									onClick={() => setExpandedPuuid(prev => prev === row.userPuuid ? null : row.userPuuid)}
									role="button"
									tabIndex={0}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											setExpandedPuuid(prev => prev === row.userPuuid ? null : row.userPuuid);
										}
									}}
								>
									<span className={classes.rankCell} style={medalColor ? { color: medalColor } : null}>
										{rank <= 3 && <EmojiEventsIcon className={classes.rankTopIcon} style={{ color: medalColor }} />}
										{rank}
									</span>
									<span className={classes.nameCell}>
										{row.isAi && (
											<span className={classes.aiBadge}>
												<span role="img" aria-label="robot">🤖</span> AI
											</span>
										)}
										{displayNameForPuuid(row.summonerName, row.userPuuid)}
									</span>
									<span className={classes.scoreCell}>{row.correctCount}</span>
									<span className={classes.accuracyCell}>
										{formatAccuracy(row.correctCount, row.settledCount)}
									</span>
									<span className={classes.expandIconCell}>
										<ExpandMoreIcon className={cx(classes.expandIcon, expanded && classes.expandIconOpen)} />
									</span>
								</div>
								{expanded && (
									<div className={classes.expandBlock}>
										<div className={classes.expandTitle}>매치별 예측</div>
										{items.length === 0 ? (
											<div className={classes.emptyText}>예측 대상 매치가 없습니다</div>
										) : (
											<div className={classes.predictionList}>
												{items.map(({ match: m, team1, team2, pickedTeam, resultStatus, isInvalid }) => {
													const stage = getStageLabel(m.round, totalRounds, roundLabels);
													let rowVariant = null;
													if (resultStatus === 'correct') rowVariant = classes.predictionRowCorrect;
													else if (resultStatus === 'wrong') rowVariant = classes.predictionRowWrong;
													else if (resultStatus === 'pending') rowVariant = classes.predictionRowPending;
													const opponent = pickedTeam
														? (pickedTeam.id === m.team1Id ? team2 : team1)
														: null;
													let pickCls = classes.predictionPick;
													if (resultStatus === 'wrong') pickCls = cx(classes.predictionPick, classes.predictionPickWrong);
													else if (!pickedTeam) pickCls = classes.predictionPickDim;
													let resultNode = null;
													if (resultStatus === 'correct') {
														resultNode = <CheckIcon className={classes.predictionResultCorrect} />;
													} else if (resultStatus === 'wrong') {
														resultNode = <CloseIcon className={classes.predictionResultWrong} />;
													} else if (resultStatus === 'pending') {
														resultNode = <HourglassEmptyIcon className={classes.predictionResultPending} />;
													} else {
														resultNode = <span className={classes.predictionResultMissing}>—</span>;
													}
													return (
														<div
															key={m.id}
															className={cx(classes.predictionRow, rowVariant, isInvalid && classes.predictionRowInvalid)}
															title={isInvalid ? '이전 라운드 결과로 무효화된 예측' : undefined}
														>
															<span className={classes.predictionRound}>{stage}</span>
															<span className={classes.predictionMatchLine}>
																{pickedTeam ? (
																	<>
																		<span className={pickCls}>{pickedTeam.name}</span>
																		<span className={classes.predictionVs}>vs</span>
																		<span className={classes.predictionOpponent}>
																			{opponent ? opponent.name : '?'}
																		</span>
																	</>
																) : (
																	<span className={classes.predictionPickDim}>
																		미예측 ({team1 ? team1.name : '?'} vs {team2 ? team2.name : '?'})
																	</span>
																)}
															</span>
															<span className={classes.predictionResult}>{resultNode}</span>
														</div>
													);
												})}
											</div>
										)}
									</div>
								)}
							</React.Fragment>
						);
					})
				)}
			</div>

			{dialogOpen && (
				isRolling ? (
					<RollingPredictionDialog
						open
						onClose={() => setDialogOpen(false)}
						onSuccess={handleSuccess}
						tournamentId={tournamentId}
						matches={matches}
						teams={teams}
						roundLabels={roundLabels}
					/>
				) : (
					<PredictionDialog
						open
						onClose={() => setDialogOpen(false)}
						onSuccess={handleSuccess}
						tournamentId={tournamentId}
						matches={matches}
						teams={teams}
					/>
				)
			)}
			{discordLoginGate}
		</div>
	);
}

export default PredictionContent;
