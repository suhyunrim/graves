import React, { useState, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import StarIcon from '@mui/icons-material/Star';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService/camilleRiotAuthService';
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';
import { isValidMatch, getStageLabel, getTotalRoundsFromMatches } from './tournamentUtils';

// 열린 매치(predictable)만 대상으로 초기 픽 맵 구성.
function buildInitialMap(openMatches, myPuuid) {
	const map = {};
	if (!myPuuid) return map;
	openMatches.forEach(m => {
		const mine = (m.predictions || []).find(p => p.userPuuid === myPuuid);
		if (mine && mine.predictedTeamId != null) {
			map[m.id] = mine.predictedTeamId;
		}
	});
	return map;
}

const useStyles = makeStyles()((theme) => ({
	paperWidth: {
		minWidth: 480,
		maxWidth: '95vw',
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 8,
			width: 'calc(100% - 16px)'
		}
	},
	hint: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.5)',
		padding: '0 28px 12px',
		[theme.breakpoints.down('sm')]: {
			padding: '0 16px 10px',
			fontSize: '1.05rem'
		}
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
		gap: 12,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr',
			gap: 10
		}
	},
	matchCard: {
		background: 'rgba(0, 0, 0, 0.3)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		borderRadius: 10,
		overflow: 'hidden'
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
	contextLine: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginTop: 16,
		paddingTop: 12,
		borderTop: '1px solid rgba(255, 255, 255, 0.08)'
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

function RollingPredictionDialog({ open, onClose, onSuccess, tournamentId, matches, teams, roundLabels }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();
	const myPuuid = useMemo(() => camilleRiotAuthService.getAuthenticatedPuuid(), []);

	const teamMap = useMemo(() => {
		const m = new Map();
		(teams || []).forEach(t => m.set(t.id, t));
		return m;
	}, [teams]);

	const totalRounds = useMemo(() => getTotalRoundsFromMatches(matches), [matches]);

	const validMatches = useMemo(() => (matches || []).filter(isValidMatch), [matches]);

	// 지금 예측 가능한 매치 — 양팀 확정 + 미시작.
	const openMatches = useMemo(
		() => validMatches
			.filter(m => m.predictable)
			.sort((a, b) => a.round - b.round || a.bracketSlot - b.bracketSlot),
		[validMatches]
	);

	// 이미 시작/종료돼 예측이 마감된 매치 수(양팀 확정 + predictable=false).
	// 대진 미확정 매치는 애초에 isValidMatch에서 걸러지므로 여기선 셀 수 없다.
	const closedCount = useMemo(
		() => validMatches.filter(m => !m.predictable).length,
		[validMatches]
	);

	const initialMap = useMemo(() => buildInitialMap(openMatches, myPuuid), [openMatches, myPuuid]);
	const [predictionMap, setPredictionMap] = useState(initialMap);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	function handleSelect(matchId, teamId) {
		setPredictionMap(prev => {
			if (prev[matchId] === teamId) {
				const copy = { ...prev };
				delete copy[matchId];
				return copy;
			}
			return { ...prev, [matchId]: teamId };
		});
	}

	function handleSubmit() {
		// 완결성 강제 없음 — 열린 매치 중 바뀐 것만 모아 전송(null = 예측 취소).
		const changes = [];
		openMatches.forEach(m => {
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

	const hasOpen = openMatches.length > 0;

	function renderSlot(m, teamId) {
		const team = teamMap.get(teamId);
		const isSelected = predictionMap[m.id] === teamId;
		return (
			<div
				key={`${m.id}-${teamId}`}
				className={cx(classes.teamSlot, isSelected && classes.teamSlotSelected)}
				onClick={() => handleSelect(m.id, teamId)}
			>
				<span className={classes.teamName}>{team ? team.name : `팀#${teamId}`}</span>
				{isSelected && <StarIcon className={classes.pickStar} />}
			</div>
		);
	}

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onClose}
			maxWidth={false}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>승부예측</DialogTitle>
			<div className={classes.hint}>
				두 팀이 확정된 경기만 예측할 수 있어요. 같은 팀을 다시 누르면 해제됩니다.
			</div>
			<DialogContent className={dialogClasses.contentPad}>
				{!hasOpen ? (
					<div className={classes.emptyHint}>
						지금 예측할 수 있는 경기가 없습니다.
						<br />
						대진이 확정되면 예측할 수 있어요.
					</div>
				) : (
					<div className={classes.grid}>
						{openMatches.map(m => {
							const stage = getStageLabel(m.round, totalRounds, roundLabels);
							return (
								<div key={m.id} className={classes.matchCard}>
									<div className={classes.matchHeader}>{stage} · 매치 {m.bracketSlot + 1}</div>
									{renderSlot(m, m.team1Id)}
									{renderSlot(m, m.team2Id)}
								</div>
							);
						})}
					</div>
				)}
				{closedCount > 0 && (
					<div className={classes.contextLine}>
						예측 마감 {closedCount}경기 — 결과·집계는 브래킷/리더보드에서 확인
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
					disabled={loading || !hasOpen}
				>
					{loading ? '저장 중...' : '저장'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default RollingPredictionDialog;
