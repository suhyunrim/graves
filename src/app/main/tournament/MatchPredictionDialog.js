import React, { useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import StarIcon from '@mui/icons-material/Star';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService/camilleRiotAuthService';
import useDialogStyles from '../components/dialogStyles';
import { displayNameForPuuid } from './tournamentUtils';

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
	}
}));

function formatPct(pct) {
	if (pct == null) return '–';
	return `${Math.round(pct * 100)}%`;
}

function MatchPredictionDialog({ open, onClose, match, team1, team2 }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();
	const myPuuid = useMemo(() => camilleRiotAuthService.getAuthenticatedPuuid(), []);

	const { team1Voters, team2Voters } = useMemo(() => {
		const t1 = [];
		const t2 = [];
		(match && match.predictions ? match.predictions : []).forEach(p => {
			if (match.team1Id != null && p.predictedTeamId === match.team1Id) t1.push(p);
			else if (match.team2Id != null && p.predictedTeamId === match.team2Id) t2.push(p);
		});
		// 브래킷 일관성 통과한 표를 먼저, 성립 불가 표를 아래로. isValid=null (비활성 매치)
		// 은 가운데 묶여 보이도록 둔다.
		const sortByValid = (a, b) => {
			if (a.isValid === b.isValid) return 0;
			if (a.isValid === false) return 1;
			if (b.isValid === false) return -1;
			return 0;
		};
		t1.sort(sortByValid);
		t2.sort(sortByValid);
		return { team1Voters: t1, team2Voters: t2 };
	}, [match]);

	if (!match) return null;

	const isActive = Boolean(match.predictionsActive);

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
