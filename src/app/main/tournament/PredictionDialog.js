import React, { useState, useMemo } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import StarIcon from '@mui/icons-material/Star';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService/camilleRiotAuthService';
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';
import {
	groupMatchesByRound,
	roundLabelFor,
	getParentMatches,
	getChildMatch,
	getVisibleMatches
} from './tournamentUtils';

// 백엔드가 채워준 team1Id/team2Id 우선, 없으면 부모 매치에서 사용자 예측을 propagate.
function getEffectiveTeams(m, matches, predictionMap) {
	let team1Id = m.team1Id != null ? m.team1Id : null;
	let team2Id = m.team2Id != null ? m.team2Id : null;
	if (team1Id != null && team2Id != null) return [team1Id, team2Id];
	const [left, right] = getParentMatches(matches, m);
	if (team1Id == null && left) {
		team1Id = predictionMap[left.id] != null ? predictionMap[left.id] : null;
	}
	if (team2Id == null && right) {
		team2Id = predictionMap[right.id] != null ? predictionMap[right.id] : null;
	}
	return [team1Id, team2Id];
}

function buildInitialPredictionMap(matches, myPuuid) {
	const map = {};
	if (!myPuuid) return map;
	matches.forEach(m => {
		const mine = (m.predictions || []).find(p => p.userPuuid === myPuuid);
		if (mine && mine.predictedTeamId != null) {
			map[m.id] = mine.predictedTeamId;
		}
	});
	return map;
}

// 부모 픽이 바뀌면 자식 픽이 새 effective team1/2 둘 다와 달라질 수 있어 그땐 reset 한다.
function resetDescendants(map, parentMatchId, matches) {
	const next = { ...map };
	const parent = matches.find(m => m.id === parentMatchId);
	if (!parent) return next;
	const child = getChildMatch(matches, parent);
	if (!child) return next;
	const [t1Id, t2Id] = getEffectiveTeams(child, matches, next);
	const childPick = next[child.id];
	if (childPick != null && childPick !== t1Id && childPick !== t2Id) {
		delete next[child.id];
		return resetDescendants(next, child.id, matches);
	}
	return next;
}

const shakeAnim = keyframes`
	0%, 100% { transform: translateX(0); }
	20%, 60% { transform: translateX(-5px); }
	40%, 80% { transform: translateX(5px); }
`;

const useStyles = makeStyles()((theme) => ({
	paperWidth: {
		// 컨텐츠(트리) 폭 만큼만 차지하되 화면을 넘지 않도록 95vw 로 cap.
		maxWidth: '95vw',
		[theme.breakpoints.down('sm')]: {
			margin: 8,
			width: 'calc(100% - 16px)'
		}
	},
	hint: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.5)',
		padding: '0 28px 6px',
		[theme.breakpoints.down('sm')]: {
			padding: '0 16px 4px',
			fontSize: '1.05rem'
		}
	},
	progressHint: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 600,
		padding: '0 28px 12px',
		[theme.breakpoints.down('sm')]: {
			padding: '0 16px 10px',
			fontSize: '1.05rem'
		}
	},
	progressHintIncomplete: {
		color: '#ffd700'
	},
	progressHintComplete: {
		color: '#00ff7f'
	},
	treeWrap: {
		overflowX: 'auto',
		paddingBottom: 8,
		minWidth: 0
	},
	tree: {
		display: 'flex',
		gap: 40,
		minWidth: 'min-content',
		padding: '4px 4px 8px',
		[theme.breakpoints.down('sm')]: {
			gap: 24
		}
	},
	column: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
		minWidth: 220,
		flexShrink: 0,
		[theme.breakpoints.down('sm')]: {
			minWidth: 170
		}
	},
	columnTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.04em',
		textTransform: 'uppercase',
		textAlign: 'center',
		paddingBottom: 6,
		borderBottom: '1px solid rgba(0, 212, 255, 0.25)',
		marginBottom: 4,
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.2rem'
		}
	},
	matchList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
		justifyContent: 'space-around',
		flex: 1
	},
	matchCard: {
		background: 'rgba(0, 0, 0, 0.3)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		borderRadius: 10,
		overflow: 'hidden',
		transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
	},
	matchCardIncomplete: {
		borderColor: 'rgba(255, 215, 0, 0.5)',
		boxShadow: '0 0 12px rgba(255, 215, 0, 0.15)'
	},
	matchCardError: {
		borderColor: '#ff6b6b',
		boxShadow: '0 0 14px rgba(255, 107, 107, 0.35)'
	},
	matchCardShake: {
		animation: `${shakeAnim} 0.5s ease-in-out`
	},
	matchHeader: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		padding: '4px 10px',
		borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
		textAlign: 'center',
		letterSpacing: '0.02em'
	},
	teamSlot: {
		padding: '10px 12px',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		color: 'rgba(255, 255, 255, 0.85)',
		cursor: 'pointer',
		transition: 'background 0.15s ease',
		borderTop: '1px solid rgba(0, 212, 255, 0.08)',
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		minHeight: 42,
		'&:first-of-type': { borderTop: 'none' },
		'&:hover': { background: 'rgba(0, 212, 255, 0.1)' },
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.15rem',
			padding: '8px 10px',
			minHeight: 38
		}
	},
	teamSlotSelected: {
		background: 'rgba(0, 212, 255, 0.18)',
		color: '#00d4ff',
		fontWeight: 700,
		'&:hover': { background: 'rgba(0, 212, 255, 0.24)' }
	},
	teamSlotEmpty: {
		color: 'rgba(255, 255, 255, 0.3)',
		cursor: 'not-allowed',
		fontStyle: 'italic',
		'&:hover': { background: 'transparent' }
	},
	teamName: {
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	pickStar: {
		fontSize: '1.3rem',
		color: '#ffd700',
		flexShrink: 0
	},
	errorText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: '#ff6b6b',
		marginTop: 12,
		padding: '0 4px'
	},
	emptyHint: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: 40
	}
}));

function PredictionDialog({ open, onClose, onSuccess, tournamentId, matches, teams }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();
	const myPuuid = useMemo(() => camilleRiotAuthService.getAuthenticatedPuuid(), []);

	const teamMap = useMemo(() => {
		const m = new Map();
		(teams || []).forEach(t => m.set(t.id, t));
		return m;
	}, [teams]);

	const initialMap = useMemo(
		() => buildInitialPredictionMap(matches || [], myPuuid),
		[matches, myPuuid]
	);
	const [predictionMap, setPredictionMap] = useState(initialMap);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	// 제출 시도 카운터 — 매치 카드 key 에 섞어서 매 시도마다 shake 애니메이션 재실행 트리거.
	const [submitAttempts, setSubmitAttempts] = useState(0);

	const groupedRounds = useMemo(() => groupMatchesByRound(matches || []), [matches]);
	const totalRounds = groupedRounds.length;

	const requiredMatchCount = useMemo(
		() => groupedRounds.reduce((acc, [round, rs]) => acc + getVisibleMatches(round, rs).length, 0),
		[groupedRounds]
	);
	const pickedCount = Object.keys(predictionMap).length;
	const allPicked = requiredMatchCount > 0 && pickedCount >= requiredMatchCount;
	const remainingCount = Math.max(0, requiredMatchCount - pickedCount);

	function handleSelect(matchId, teamId) {
		setPredictionMap(prev => {
			let nextMap;
			if (prev[matchId] === teamId) {
				const copy = { ...prev };
				delete copy[matchId];
				nextMap = copy;
			} else {
				nextMap = { ...prev, [matchId]: teamId };
			}
			return resetDescendants(nextMap, matchId, matches);
		});
	}

	function handleSubmit() {
		// 모든 매치 다 찍어야 제출 — 미완료면 카운터 +1 해서 미완료 카드 shake 재실행.
		if (!allPicked) {
			setSubmitAttempts(prev => prev + 1);
			setError(`아직 ${remainingCount}매치 더 예측해야 합니다.`);
			return;
		}
		const changes = [];
		(matches || []).forEach(m => {
			const oldVal = initialMap[m.id] != null ? initialMap[m.id] : null;
			const newVal = predictionMap[m.id] != null ? predictionMap[m.id] : null;
			if (oldVal !== newVal) {
				changes.push({ matchId: m.id, predictedTeamId: newVal });
			}
		});
		if (changes.length === 0) {
			onClose();
			return;
		}
		setError('');
		setLoading(true);
		Actions.putPredictions(tournamentId, changes)
			.then(() => {
				setLoading(false);
				onSuccess();
			})
			.catch(err => {
				setLoading(false);
				const msg = err.response && err.response.data ? err.response.data.result : '예측 저장 실패';
				setError(msg);
			});
	}

	const noMatches = !matches || matches.length === 0;

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			maxWidth={false}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>승부예측</DialogTitle>
			<div className={classes.hint}>
				라운드별 승자를 골라 트리를 채워주세요. 같은 팀을 다시 누르면 해제됩니다. 부모 매치를 바꾸면 그 아래 픽은 초기화됩니다.
			</div>
			{!noMatches && (
				<div className={cx(
					classes.progressHint,
					allPicked ? classes.progressHintComplete : classes.progressHintIncomplete
				)}>
					{allPicked
						? `모든 매치 예측 완료 (${pickedCount}/${requiredMatchCount})`
						: `아직 ${remainingCount}매치 남음 (${pickedCount}/${requiredMatchCount})`}
				</div>
			)}
			<DialogContent className={dialogClasses.contentPad}>
				{noMatches ? (
					<div className={classes.emptyHint}>
						아직 매치가 생성되지 않았습니다.
					</div>
				) : (
					<div className={classes.treeWrap}>
						<div className={classes.tree}>
							{groupedRounds.map(([round, roundMatches]) => {
								const visibleMatches = getVisibleMatches(round, roundMatches);
								const label = roundLabelFor(round, totalRounds);
								return (
									<div key={round} className={classes.column}>
										<div className={classes.columnTitle}>{label}</div>
										<div className={classes.matchList}>
											{visibleMatches.map(m => {
												const [t1Id, t2Id] = getEffectiveTeams(m, matches, predictionMap);
												const t1 = t1Id != null ? teamMap.get(t1Id) : null;
												const t2 = t2Id != null ? teamMap.get(t2Id) : null;
												const pick = predictionMap[m.id];
												const renderSlot = (slotKey, teamId, team) => {
													const isEmpty = teamId == null;
													const isSelected = !isEmpty && pick === teamId;
													return (
														<div
															key={teamId == null ? `empty-${m.id}-${slotKey}` : `${m.id}-${teamId}`}
															className={cx(
																classes.teamSlot,
																isSelected && classes.teamSlotSelected,
																isEmpty && classes.teamSlotEmpty
															)}
															onClick={() => {
																if (isEmpty) return;
																handleSelect(m.id, teamId);
															}}
														>
															<span className={classes.teamName}>
																{isEmpty ? 'TBD' : (team ? team.name : `팀#${teamId}`)}
															</span>
															{isSelected && <StarIcon className={classes.pickStar} />}
														</div>
													);
												};
												const isPicked = pick != null;
												const errored = !isPicked && submitAttempts > 0;
												return (
													<div
														// 미완료 매치는 submitAttempts 가 바뀔 때마다 remount 되어 shake 재실행.
														key={!isPicked ? `${m.id}-${submitAttempts}` : m.id}
														className={cx(
															classes.matchCard,
															!isPicked && (errored ? classes.matchCardError : classes.matchCardIncomplete),
															errored && classes.matchCardShake
														)}
													>
														<div className={classes.matchHeader}>매치 {m.bracketSlot + 1}</div>
														{renderSlot('L', t1Id, t1)}
														{renderSlot('R', t2Id, t2)}
													</div>
												);
											})}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
				{error && <div className={classes.errorText}>{error}</div>}
			</DialogContent>
			<DialogActions className={dialogClasses.actionsPad}>
				<Button className={dialogClasses.cancelBtn} onClick={onClose} disabled={loading}>
					취소
				</Button>
				<Button
					className={dialogClasses.saveBtn}
					onClick={handleSubmit}
					disabled={loading || noMatches}
				>
					{loading ? '저장 중...' : '제출'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default PredictionDialog;
