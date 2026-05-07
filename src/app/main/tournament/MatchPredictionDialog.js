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
		return { team1Voters: t1, team2Voters: t2 };
	}, [match]);

	if (!match) return null;

	const renderSide = (team, teamId, voters, count, pct) => {
		const isTbd = teamId == null;
		return (
			<div className={classes.side}>
				<div className={classes.sideHeader}>
					<span className={classes.teamName}>
						{isTbd ? 'TBD' : (team ? team.name : `팀#${teamId}`)}
					</span>
					<span className={classes.pct}>
						{formatPct(pct)}
						<span className={classes.count}>({count}명)</span>
					</span>
				</div>
				{voters.length === 0 ? (
					<div className={classes.voterEmpty}>아직 예측한 사람이 없습니다</div>
				) : (
					<div className={classes.voterList}>
						{voters.map(v => {
							const isMine = myPuuid && v.userPuuid === myPuuid;
							return (
								<div
									key={v.userPuuid}
									className={cx(classes.voterRow, isMine && classes.voterRowMine)}
								>
									{isMine && <StarIcon className={classes.mineStar} />}
									<span>{displayNameForPuuid(v.summonerName, v.userPuuid)}</span>
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

	return (
		<Dialog
			open={open}
			onClose={onClose}
			slotProps={{ paper: { className: cx(dialogClasses.paperCyan, classes.paperWidth) } }}
		>
			<DialogTitle className={dialogClasses.titleCyan}>매치 예측 현황</DialogTitle>
			<DialogContent className={dialogClasses.contentPad}>
				<div className={classes.body}>
					{renderSide(team1, match.team1Id, team1Voters, match.team1PredictionCount || 0, match.team1PredictionPct)}
					{renderSide(team2, match.team2Id, team2Voters, match.team2PredictionCount || 0, match.team2PredictionPct)}
				</div>
			</DialogContent>
			<DialogActions className={dialogClasses.actionsPad}>
				<Button className={dialogClasses.cancelBtn} onClick={onClose}>닫기</Button>
			</DialogActions>
		</Dialog>
	);
}

export default MatchPredictionDialog;
