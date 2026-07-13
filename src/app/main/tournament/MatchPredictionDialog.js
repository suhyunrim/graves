import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import StarIcon from '@mui/icons-material/Star';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService/camilleRiotAuthService';
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';
import { displayNameForPuuid, parseRankTier, formatScheduledAt } from './tournamentUtils';

const useStyles = makeStyles()((theme) => ({
	paperWidth: {
		minWidth: 540,
		maxWidth: 680,
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 12,
			width: 'calc(100% - 24px)'
		}
	},
	body: {
		display: 'flex',
		gap: 16,
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			gap: 12
		}
	},
	side: {
		flex: 1,
		minWidth: 0,
		background: 'rgba(0, 0, 0, 0.25)',
		border: '1px solid rgba(0, 212, 255, 0.18)',
		borderRadius: 12,
		padding: '14px 16px',
		display: 'flex',
		flexDirection: 'column',
		gap: 8
	},
	sideHeader: {
		display: 'flex',
		alignItems: 'baseline',
		justifyContent: 'space-between',
		gap: 12,
		paddingBottom: 8,
		borderBottom: '1px solid rgba(0, 212, 255, 0.15)'
	},
	teamName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#00d4ff',
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	pct: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.85)',
		flexShrink: 0
	},
	count: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.45)',
		marginLeft: 6
	},
	totalNote: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginTop: -2,
		marginBottom: 2
	},
	voterList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 4,
		maxHeight: 280,
		overflowY: 'auto'
	},
	voterRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		padding: '4px 6px',
		borderRadius: 6,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.85)'
	},
	voterRowMine: {
		background: 'rgba(255, 215, 0, 0.1)',
		color: '#ffd700'
	},
	voterRowInvalid: {
		color: 'rgba(255, 255, 255, 0.35)',
		textDecoration: 'line-through'
	},
	voterInvalidTag: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(255, 107, 107, 0.7)',
		textDecoration: 'none',
		marginLeft: 'auto',
		flexShrink: 0
	},
	voterEmpty: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.35)',
		fontStyle: 'italic',
		padding: '8px 4px'
	},
	mineStar: {
		fontSize: '1.1rem',
		color: '#ffd700'
	},
	tbdNote: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		fontStyle: 'italic',
		marginTop: 4
	},
	intro: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 12,
		lineHeight: 1.5
	},
	aiBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 3,
		padding: '1px 7px',
		borderRadius: 8,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		letterSpacing: '0.03em',
		color: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.12)',
		border: '1px solid rgba(0, 212, 255, 0.35)',
		flexShrink: 0
	},
	aiSection: {
		background: 'rgba(0, 0, 0, 0.25)',
		border: '1px solid rgba(0, 212, 255, 0.18)',
		borderRadius: 12,
		padding: '14px 16px',
		marginBottom: 16,
		display: 'flex',
		flexDirection: 'column',
		gap: 10,
		[theme.breakpoints.down('sm')]: {
			padding: '12px 12px',
			marginBottom: 12
		}
	},
	aiHeaderRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 10,
		flexWrap: 'wrap'
	},
	aiTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.35rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.04em',
		textTransform: 'uppercase',
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	aiFreshNote: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	aiFrozenLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 600,
		color: 'rgba(255, 215, 0, 0.85)'
	},
	aiTeamsRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 10
	},
	aiTeamName: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		minWidth: 0,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.85)'
	},
	aiTeamNameRight: {
		justifyContent: 'flex-end'
	},
	aiTeamNameText: {
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	aiGaugeRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	aiGaugePctLeft: {
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		fontSize: '1.5rem',
		color: '#4287f5',
		flexShrink: 0,
		minWidth: 52
	},
	aiGaugePctRight: {
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		fontSize: '1.5rem',
		color: '#e84057',
		flexShrink: 0,
		minWidth: 52,
		textAlign: 'right'
	},
	aiGauge: {
		flex: 1,
		display: 'flex',
		height: 8,
		borderRadius: 4,
		overflow: 'hidden',
		background: 'rgba(255, 255, 255, 0.06)'
	},
	aiGaugeFillT1: {
		background: 'linear-gradient(90deg, #4287f5, #1976d2)',
		height: '100%'
	},
	aiGaugeFillT2: {
		background: 'linear-gradient(90deg, #e84057, #c2384a)',
		height: '100%'
	},
	aiStatList: {
		display: 'flex',
		flexDirection: 'column'
	},
	aiStatRow: {
		display: 'grid',
		gridTemplateColumns: '1fr auto 1fr',
		alignItems: 'center',
		gap: 8,
		padding: '6px 0',
		borderTop: '1px solid rgba(0, 212, 255, 0.08)',
		'&:first-of-type': { borderTop: 'none' }
	},
	aiStatLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.45)',
		textAlign: 'center',
		whiteSpace: 'nowrap',
		padding: '0 8px'
	},
	aiStatValue: {
		display: 'flex',
		alignItems: 'center',
		gap: 5,
		minWidth: 0,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.85)'
	},
	aiStatValueRight: {
		justifyContent: 'flex-end'
	},
	aiStatGood: {
		color: '#00ff7f'
	},
	aiStatBad: {
		color: '#ff6b6b'
	},
	aiStatDim: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 400,
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.35)'
	},
	aiTierEmblem: {
		width: 18,
		height: 18,
		objectFit: 'contain',
		flexShrink: 0
	},
	aiH2hBadge: {
		alignSelf: 'center',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		fontWeight: 600,
		color: 'rgba(0, 212, 255, 0.85)',
		background: 'rgba(0, 212, 255, 0.08)',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		borderRadius: 8,
		padding: '3px 12px'
	},
	aiNote: {
		display: 'flex',
		alignItems: 'flex-start',
		gap: 5,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(255, 255, 255, 0.35)',
		lineHeight: 1.5
	},
	aiNoteIcon: {
		fontSize: '1.2rem',
		marginTop: 1,
		flexShrink: 0
	},
	aiPlaceholder: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.35)',
		fontStyle: 'italic'
	}
}));

function formatPct(pct) {
	if (pct == null) return '–';
	return `${Math.round(pct * 100)}%`;
}

function MatchPredictionDialog({ open, onClose, tournamentId, match, team1, team2 }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();
	const myPuuid = useMemo(() => camilleRiotAuthService.getAuthenticatedPuuid(), []);

	// AI 예측 — ok | loading | unavailable(대진 미확정/기록 없음) | hidden(404/500 등)
	const [aiState, setAiState] = useState({ status: 'loading', data: null });

	useEffect(() => {
		if (!match) return undefined;
		// 대진 미확정(waiting) 매치는 서버가 어차피 409 — 호출을 생략한다.
		if (match.team1Id == null || match.team2Id == null) {
			setAiState({ status: 'unavailable', data: null });
			return undefined;
		}
		let cancelled = false;
		setAiState({ status: 'loading', data: null });
		Actions.getAiPrediction(tournamentId, match.id)
			.then(res => {
				if (!cancelled) setAiState({ status: 'ok', data: res.data.prediction });
			})
			.catch(err => {
				if (cancelled) return;
				const httpStatus = err.response ? err.response.status : null;
				setAiState({ status: httpStatus === 409 ? 'unavailable' : 'hidden', data: null });
			});
		return () => {
			cancelled = true;
		};
	}, [tournamentId, match]);

	const { team1Voters, team2Voters } = useMemo(() => {
		const t1 = [];
		const t2 = [];
		(match && match.predictions ? match.predictions : []).forEach(p => {
			if (match.team1Id != null && p.predictedTeamId === match.team1Id) t1.push(p);
			else if (match.team2Id != null && p.predictedTeamId === match.team2Id) t2.push(p);
		});
		// 내 표는 항상 맨 위. 그 다음 브래킷 일관성 통과한 표, 성립 불가 표는 아래로.
		// isValid=null (비활성 매치) 은 가운데 묶여 보이도록 둔다.
		const sortVoters = (a, b) => {
			const aMine = Boolean(myPuuid) && a.userPuuid === myPuuid;
			const bMine = Boolean(myPuuid) && b.userPuuid === myPuuid;
			if (aMine !== bMine) return aMine ? -1 : 1;
			if (a.isValid === b.isValid) return 0;
			if (a.isValid === false) return 1;
			if (b.isValid === false) return -1;
			return 0;
		};
		t1.sort(sortVoters);
		t2.sort(sortVoters);
		return { team1Voters: t1, team2Voters: t2 };
	}, [match, myPuuid]);

	if (!match) return null;

	const isActive = Boolean(match.predictionsActive);

	const aiPickBadge = (
		<span className={classes.aiBadge}>
			<span role="img" aria-label="robot">🤖</span> AI 픽
		</span>
	);

	const renderAiTier = (rankTier) => {
		const parsed = parseRankTier(rankTier);
		if (!parsed) return <span className={classes.aiStatDim}>–</span>;
		return (
			<>
				<img src={parsed.emblem} alt="" className={classes.aiTierEmblem} />
				<span title={rankTier}>{parsed.short}</span>
			</>
		);
	};

	const renderAiFit = (score) => {
		if (score == null) return <span className={classes.aiStatDim}>–</span>;
		return <span>{score}/100</span>;
	};

	const renderAiSynergy = (pct) => {
		if (pct == null) return <span className={classes.aiStatDim}>표본 부족</span>;
		const num = Number(pct);
		const cls = num > 0 ? classes.aiStatGood : (num < 0 ? classes.aiStatBad : undefined);
		return <span className={cls}>{`${num > 0 ? '+' : ''}${num}%p`}</span>;
	};

	const renderAiScrim = (rec) => {
		if (!rec || !rec.played) return <span className={classes.aiStatDim}>기록 없음</span>;
		return <span>{`${rec.won}승 ${rec.lost}패`}</span>;
	};

	const renderAiSection = () => {
		if (aiState.status === 'hidden') return null;

		const sectionTitle = (
			<span className={classes.aiTitle}>
				<span role="img" aria-label="robot">🤖</span> AI 예측
			</span>
		);

		if (aiState.status !== 'ok') {
			return (
				<div className={classes.aiSection}>
					<div className={classes.aiHeaderRow}>{sectionTitle}</div>
					<div className={classes.aiPlaceholder}>
						{aiState.status === 'loading' ? 'AI 예측 불러오는 중…' : '대진 확정 후 제공됩니다.'}
					</div>
				</div>
			);
		}

		const p = aiState.data;
		if (!p || !p.team1 || !p.team2) return null;
		const isPick1 = p.predictedTeamId != null && p.predictedTeamId === match.team1Id;
		const isPick2 = p.predictedTeamId != null && p.predictedTeamId === match.team2Id;
		const computedAtLabel = formatScheduledAt(p.computedAt);
		const h2h = p.headToHeadScrim;
		const statRows = [
			{ label: '팀 티어', v1: renderAiTier(p.team1.teamRatingTier), v2: renderAiTier(p.team2.teamRatingTier) },
			{ label: '포지션 적합도', v1: renderAiFit(p.team1.positionFitScore), v2: renderAiFit(p.team2.positionFitScore) },
			{ label: '팀 시너지', v1: renderAiSynergy(p.team1.synergyPct), v2: renderAiSynergy(p.team2.synergyPct) },
			{ label: '스크림 전적', v1: renderAiScrim(p.team1.scrimRecord), v2: renderAiScrim(p.team2.scrimRecord) }
		];

		return (
			<div className={classes.aiSection}>
				<div className={classes.aiHeaderRow}>
					{sectionTitle}
					{p.frozen ? (
						<span className={classes.aiFrozenLabel}>
							<span role="img" aria-label="lock">🔒</span> 확정된 예측
						</span>
					) : (
						<span className={classes.aiFreshNote}>
							매치 시작 전까지 갱신됨{computedAtLabel ? ` · ${computedAtLabel}` : ''}
						</span>
					)}
				</div>
				<div className={classes.aiTeamsRow}>
					<span className={classes.aiTeamName}>
						<span className={classes.aiTeamNameText}>{p.team1.name}</span>
						{isPick1 && aiPickBadge}
					</span>
					<span className={cx(classes.aiTeamName, classes.aiTeamNameRight)}>
						{isPick2 && aiPickBadge}
						<span className={classes.aiTeamNameText}>{p.team2.name}</span>
					</span>
				</div>
				<div className={classes.aiGaugeRow}>
					<span className={classes.aiGaugePctLeft}>{p.team1.winProb}%</span>
					<div className={classes.aiGauge}>
						<div className={classes.aiGaugeFillT1} style={{ flexBasis: `${p.team1.winProb}%` }} />
						<div className={classes.aiGaugeFillT2} style={{ flexBasis: `${p.team2.winProb}%` }} />
					</div>
					<span className={classes.aiGaugePctRight}>{p.team2.winProb}%</span>
				</div>
				<div className={classes.aiStatList}>
					{statRows.map(row => (
						<div key={row.label} className={classes.aiStatRow}>
							<span className={classes.aiStatValue}>{row.v1}</span>
							<span className={classes.aiStatLabel}>{row.label}</span>
							<span className={cx(classes.aiStatValue, classes.aiStatValueRight)}>{row.v2}</span>
						</div>
					))}
				</div>
				{h2h && h2h.played > 0 && (
					<div className={classes.aiH2hBadge}>
						스크림 맞대결 {h2h.team1.won}:{h2h.team2.won}
					</div>
				)}
				{p.note && (
					<div className={classes.aiNote}>
						<InfoOutlinedIcon className={classes.aiNoteIcon} />
						<span>{p.note}</span>
					</div>
				)}
			</div>
		);
	};

	const renderSide = (team, teamId, voters, validCount, totalCount, pct) => {
		const isTbd = teamId == null;
		const hasInvalid = isActive && totalCount > validCount;
		// 비활성(한쪽 미정) 매치는 일관성 검사가 적용되지 않음 — 전체 카운트를 그대로 보여준다.
		const headerCount = isActive ? validCount : totalCount;
		return (
			<div className={classes.side}>
				<div className={classes.sideHeader}>
					<span className={classes.teamName}>
						{isTbd ? 'TBD' : (team ? team.name : `팀#${teamId}`)}
					</span>
					<span className={classes.pct}>
						{isActive ? formatPct(pct) : '–'}
						<span className={classes.count}>({headerCount}명)</span>
					</span>
				</div>
				{hasInvalid && (
					<div className={classes.totalNote}>
						성립 불가 {totalCount - validCount}표 포함 (전체 {totalCount}명)
					</div>
				)}
				{voters.length === 0 ? (
					<div className={classes.voterEmpty}>아직 예측한 사람이 없습니다</div>
				) : (
					<div className={classes.voterList}>
						{voters.map(v => {
							const isMine = myPuuid && v.userPuuid === myPuuid;
							const isInvalid = v.isValid === false;
							return (
								<div
									key={v.userPuuid}
									className={cx(
										classes.voterRow,
										isMine && classes.voterRowMine,
										isInvalid && classes.voterRowInvalid
									)}
								>
									{isMine && <StarIcon className={classes.mineStar} />}
									<span>{displayNameForPuuid(v.summonerName, v.userPuuid)}</span>
									{v.isAi && (
										<span className={classes.aiBadge}>
											<span role="img" aria-label="robot">🤖</span> AI
										</span>
									)}
									{isInvalid && <span className={classes.voterInvalidTag}>성립 불가</span>}
								</div>
							);
						})}
					</div>
				)}
				{isTbd && (
					<div className={classes.tbdNote}>
						이전 라운드 결과가 정해지면 팀이 표시됩니다.
					</div>
				)}
			</div>
		);
	};

	const totalInvalid = isActive
		? ((match.team1PredictionCountTotal || 0) - (match.team1PredictionCount || 0))
			+ ((match.team2PredictionCountTotal || 0) - (match.team2PredictionCount || 0))
		: 0;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>매치 예측 현황</DialogTitle>
			<DialogContent className={dialogClasses.contentPad}>
				{renderAiSection()}
				{totalInvalid > 0 && (
					<div className={classes.intro}>
						이전 라운드 예측과 트리가 어긋난 표는 채점에서 제외돼요. 줄 그어진 표가 ‘성립 불가’ 표시.
					</div>
				)}
				<div className={classes.body}>
					{renderSide(
						team1,
						match.team1Id,
						team1Voters,
						match.team1PredictionCount || 0,
						match.team1PredictionCountTotal || 0,
						match.team1PredictionPct
					)}
					{renderSide(
						team2,
						match.team2Id,
						team2Voters,
						match.team2PredictionCount || 0,
						match.team2PredictionCountTotal || 0,
						match.team2PredictionPct
					)}
				</div>
			</DialogContent>
			<DialogActions className={dialogClasses.actionsPad}>
				<Button className={dialogClasses.cancelBtn} onClick={onClose}>닫기</Button>
			</DialogActions>
		</Dialog>
	);
}

export default MatchPredictionDialog;
