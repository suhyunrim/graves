import React, { useState, useMemo } from 'react';
import { Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import EditNoteIcon from '@mui/icons-material/EditNote';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService/camilleRiotAuthService';
import PredictionDialog from './PredictionDialog';
import { STATUS, displayNameForPuuid } from './tournamentUtils';
import useDiscordLoginGate from '../components/useDiscordLoginGate';

const LEADER_GRID_DESKTOP = '60px 1fr 100px 120px';
const LEADER_GRID_MOBILE = '40px 1fr 70px 90px';

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
			padding: '10px 12px',
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
			padding: '8px 12px',
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

function PredictionContent({ tournamentId, status, predictionsLocked, matches, teams, leaderboard, onMutated }) {
	const { classes, cx } = useStyles();
	const myPuuid = useMemo(() => camilleRiotAuthService.getAuthenticatedPuuid(), []);
	const [dialogOpen, setDialogOpen] = useState(false);
	const { requireLogin: requireDiscordLogin, gate: discordLoginGate } = useDiscordLoginGate();

	function handleOpenDialog() {
		if (!requireDiscordLogin('승부예측')) return;
		setDialogOpen(true);
	}

	const isPreparing = status === STATUS.PREPARING;
	const isFinished = status === STATUS.FINISHED;
	const canPredict = !isPreparing && !isFinished && !predictionsLocked;

	let notice = null;
	if (isPreparing) {
		notice = '토너먼트가 시작되면 예측이 가능합니다.';
	} else if (predictionsLocked && !isFinished) {
		notice = '첫 매치가 시작되어 예측이 마감되었습니다.';
	} else if (isFinished) {
		notice = '종료된 토너먼트입니다.';
	} else {
		notice = '첫 매치가 시작되기 전까지 자유롭게 변경할 수 있습니다.';
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
				</div>
				{(!leaderboard || leaderboard.length === 0) ? (
					<div className={classes.emptyText}>아직 예측한 사람이 없습니다.</div>
				) : (
					leaderboard.map((row, idx) => {
						const rank = idx + 1;
						const medalColor = rankMedalColor(rank);
						const isMine = myPuuid && row.userPuuid === myPuuid;
						return (
							<div
								key={row.userPuuid}
								className={cx(classes.leaderRow, isMine && classes.leaderRowMine)}
							>
								<span className={classes.rankCell} style={medalColor ? { color: medalColor } : null}>
									{rank <= 3 && <EmojiEventsIcon className={classes.rankTopIcon} style={{ color: medalColor }} />}
									{rank}
								</span>
								<span className={classes.nameCell}>
									{displayNameForPuuid(row.summonerName, row.userPuuid)}
								</span>
								<span className={classes.scoreCell}>{row.correctCount}</span>
								<span className={classes.accuracyCell}>
									{formatAccuracy(row.correctCount, row.settledCount)}
								</span>
							</div>
						);
					})
				)}
			</div>

			{dialogOpen && (
				<PredictionDialog
					open
					onClose={() => setDialogOpen(false)}
					onSuccess={handleSuccess}
					tournamentId={tournamentId}
					matches={matches}
					teams={teams}
				/>
			)}
			{discordLoginGate}
		</div>
	);
}

export default PredictionContent;
