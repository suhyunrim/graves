import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
	Button,
	IconButton,
	Tabs,
	Tab,
	TextField,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	ToggleButton,
	ToggleButtonGroup
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import GavelIcon from '@mui/icons-material/Gavel';
import UndoIcon from '@mui/icons-material/Undo';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import StarIcon from '@mui/icons-material/Star';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import useToast from 'app/utility/useToast';
import { getProfileIconUrl } from 'app/main/challenge/ddragonUtils';
import * as Actions from './store/actions';
import {
	POSITIONS,
	POSITION_LABELS,
	displayNameForPuuid,
	getTierName,
	getTierLabel,
	getTierShortLabel,
	getTierEmblemUrl
} from './tournamentUtils';
import PositionIcon from './PositionIcon';

const flashCyan = keyframes({
	'0%': { background: 'rgba(0, 212, 255, 0.35)', boxShadow: '0 0 0 2px rgba(0, 212, 255, 0.8)' },
	'100%': { background: 'rgba(255, 255, 255, 0.03)', boxShadow: '0 0 0 0 rgba(0, 212, 255, 0)' }
});

const blink = keyframes({
	'0%, 100%': { opacity: 1 },
	'50%': { opacity: 0.35 }
});

const useStyles = makeStyles()((theme) => ({
	wrapper: {
		display: 'flex',
		flexDirection: 'column',
		gap: 20,
		marginBottom: 20
	},
	auctionBlock: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		borderRadius: 16,
		padding: 18,
		position: 'relative'
	},
	auctionEmpty: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 14,
		padding: '28px 16px'
	},
	auctionEmptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	candidateLayout: {
		display: 'grid',
		gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
		gap: 18,
		alignItems: 'center',
		[theme.breakpoints.down('md')]: {
			gridTemplateColumns: '1fr'
		}
	},
	candidateMain: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		minWidth: 0
	},
	candidateAvatarLg: {
		width: 80,
		height: 80,
		borderRadius: 12,
		flexShrink: 0
	},
	candidateBody: {
		minWidth: 0,
		flex: 1
	},
	candidateNameRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		flexWrap: 'wrap'
	},
	candidateName: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.02em'
	},
	candidatePosBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.12)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		padding: '2px 10px',
		borderRadius: 6
	},
	candidatePosBadgeIcon: {
		width: 16,
		height: 16,
		color: '#00d4ff'
	},
	statRow: {
		display: 'flex',
		gap: 16,
		marginTop: 8,
		flexWrap: 'wrap',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.8)'
	},
	statLabel: {
		color: 'rgba(255, 255, 255, 0.45)',
		marginRight: 4
	},
	statValue: {
		fontWeight: 600,
		color: '#fff'
	},
	statSep: {
		color: 'rgba(255, 255, 255, 0.2)'
	},
	achievementRow: {
		marginTop: 8,
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.7)',
		flexWrap: 'wrap'
	},
	achievementChip: {
		background: 'rgba(255, 215, 0, 0.12)',
		border: '1px solid rgba(255, 215, 0, 0.3)',
		color: '#ffd700',
		padding: '2px 8px',
		borderRadius: 6,
		fontSize: '1.05rem'
	},
	honorRow: {
		marginTop: 6,
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.6)'
	},
	honorTitle: {
		color: '#ffd700',
		fontWeight: 600
	},
	auctionSide: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 10,
		[theme.breakpoints.down('md')]: {
			alignItems: 'stretch'
		}
	},
	countdownBox: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: '8px 22px',
		borderRadius: 12,
		background: 'rgba(255, 255, 255, 0.04)',
		border: '1px solid rgba(255, 255, 255, 0.1)',
		minWidth: 140
	},
	countdownLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	countdownValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '3rem',
		fontWeight: 700,
		color: '#fff',
		lineHeight: 1.1
	},
	countdownWarn: {
		color: '#ff8c00'
	},
	countdownDanger: {
		color: '#ff6b6b',
		animation: `${blink} 0.6s linear infinite`
	},
	countdownEnd: {
		color: 'rgba(255, 255, 255, 0.4)',
		fontSize: '1.4rem'
	},
	adminActions: {
		display: 'flex',
		gap: 8,
		flexWrap: 'wrap',
		justifyContent: 'center'
	},
	adminBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.1rem',
		padding: '6px 16px',
		borderRadius: 8,
		textTransform: 'none',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)'
		},
		'&.Mui-disabled': {
			background: 'rgba(255, 255, 255, 0.08)',
			color: 'rgba(255, 255, 255, 0.3)'
		}
	},
	adminBtnSecondary: {
		background: 'rgba(255, 255, 255, 0.06)',
		color: '#fff',
		border: '1px solid rgba(255, 255, 255, 0.18)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 600,
		fontSize: '1.1rem',
		padding: '6px 16px',
		borderRadius: 8,
		textTransform: 'none',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.12)',
			borderColor: 'rgba(0, 212, 255, 0.4)'
		},
		'&.Mui-disabled': {
			color: 'rgba(255, 255, 255, 0.25)',
			borderColor: 'rgba(255, 255, 255, 0.08)'
		}
	},
	root: {
		display: 'grid',
		gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
		gap: 20,
		[theme.breakpoints.down('md')]: {
			gridTemplateColumns: '1fr'
		}
	},
	panel: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		border: '1px solid rgba(0, 212, 255, 0.18)',
		borderRadius: 16,
		padding: 18
	},
	panelTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.05em',
		textTransform: 'uppercase',
		marginBottom: 14,
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	completeBtn: {
		marginLeft: 'auto',
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.1rem',
		padding: '4px 16px',
		borderRadius: 8,
		textTransform: 'none',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)'
		},
		'&.Mui-disabled': {
			background: 'rgba(255, 255, 255, 0.08)',
			color: 'rgba(255, 255, 255, 0.3)'
		}
	},
	teamGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
		gap: 12
	},
	teamCard: {
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		borderRadius: 12,
		padding: 12
	},
	teamCardActive: {
		border: '1px solid rgba(0, 212, 255, 0.4)',
		boxShadow: '0 0 0 1px rgba(0, 212, 255, 0.2)'
	},
	teamHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginBottom: 10
	},
	teamName: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.02em',
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	budgetBox: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.1)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		borderRadius: 6,
		padding: '2px 8px'
	},
	budgetLow: {
		color: '#ff8c00',
		background: 'rgba(255, 140, 0, 0.1)',
		borderColor: 'rgba(255, 140, 0, 0.3)'
	},
	budgetNeg: {
		color: '#ff6b6b',
		background: 'rgba(255, 107, 107, 0.1)',
		borderColor: 'rgba(255, 107, 107, 0.3)'
	},
	slotRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '6px 0',
		borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
		'&:last-child': { borderBottom: 'none' }
	},
	slotRowFlash: {
		animation: `${flashCyan} 1.4s ease-out`,
		borderRadius: 6
	},
	slotPosCell: {
		width: 28,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	slotPosIcon: {
		width: 22,
		height: 22,
		color: '#00d4ff'
	},
	slotAvatar: {
		width: 26,
		height: 26,
		borderRadius: 6
	},
	slotName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: '#fff',
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	slotEmpty: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.35)',
		flex: 1,
		fontStyle: 'italic'
	},
	slotCaptainStar: {
		color: '#ffd700',
		width: 16,
		height: 16
	},
	bidAmount: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		color: '#ffd700',
		fontWeight: 700
	},
	undoBtn: {
		color: 'rgba(255, 255, 255, 0.5)',
		padding: 4,
		'&:hover': {
			color: '#ff6b6b',
			background: 'rgba(255, 107, 107, 0.1)'
		}
	},
	memberTier: {
		display: 'flex',
		alignItems: 'center',
		gap: 3
	},
	memberTierEmblem: {
		width: 18,
		height: 18
	},
	memberTierShort: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.85)'
	},
	teamBidArea: {
		marginTop: 10,
		paddingTop: 10,
		borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	teamBidInput: {
		flex: 1,
		'& .MuiInputBase-root': { color: '#fff', fontSize: '1.15rem' },
		'& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' }
	},
	teamBidBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.05rem',
		padding: '4px 14px',
		minWidth: 0,
		borderRadius: 8,
		textTransform: 'none',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)'
		},
		'&.Mui-disabled': {
			background: 'rgba(255, 255, 255, 0.08)',
			color: 'rgba(255, 255, 255, 0.3)'
		}
	},
	teamBidLocked: {
		marginTop: 10,
		paddingTop: 10,
		borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center'
	},
	posTabs: {
		marginBottom: 12,
		minHeight: 'unset',
		'& .MuiTabs-indicator': { backgroundColor: '#00d4ff', height: 2 }
	},
	posTab: {
		minHeight: 40,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.5)',
		textTransform: 'none',
		'&.Mui-selected': { color: '#00d4ff', fontWeight: 700 }
	},
	candidateList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 8
	},
	candidateCard: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		padding: 10,
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		borderRadius: 10
	},
	candidateCardActive: {
		border: '1px solid rgba(0, 212, 255, 0.6)',
		background: 'rgba(0, 212, 255, 0.08)'
	},
	smallAvatar: {
		width: 38,
		height: 38,
		borderRadius: 8
	},
	smallMeta: {
		display: 'flex',
		flexDirection: 'column',
		minWidth: 0
	},
	smallName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: '#fff',
		fontWeight: 600
	},
	smallTier: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: 16
	},
	ruleBox: {
		marginTop: 12,
		padding: 12,
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.06)',
		borderRadius: 10,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.55)',
		lineHeight: 1.6
	},
	ruleBullet: {
		display: 'block',
		marginBottom: 4
	},
	negTag: {
		color: '#ff8c00',
		fontWeight: 600
	},
	dialogPaper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		color: '#fff',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		borderRadius: 16,
		minWidth: 360
	},
	dialogTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		color: '#00d4ff',
		fontWeight: 700
	},
	durationToggle: {
		marginTop: 8,
		'& .MuiToggleButton-root': {
			color: 'rgba(255, 255, 255, 0.7)',
			borderColor: 'rgba(255, 255, 255, 0.2)',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.15rem',
			padding: '6px 16px',
			'&.Mui-selected': {
				color: '#00d4ff',
				borderColor: '#00d4ff',
				background: 'rgba(0, 212, 255, 0.12)'
			}
		}
	},
	customInput: {
		marginTop: 12,
		'& .MuiInputBase-root': { color: '#fff' },
		'& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
		'& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' }
	},
	dialogHint: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginTop: 8
	}
}));

const DURATION_PRESETS = [30, 60, 120];

function getMemberTier(rating) {
	const tierName = getTierName(rating);
	return {
		name: tierName,
		label: getTierLabel(rating),
		short: getTierShortLabel(rating),
		emblem: getTierEmblemUrl(tierName)
	};
}

// ─── Countdown ────────────────────────────────────────────────
function Countdown({ deadline, classes }) {
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 250);
		return () => clearInterval(id);
	}, []);

	if (!deadline) return null;
	const target = new Date(deadline).getTime();
	const remainMs = target - now;
	if (remainMs <= 0) {
		return (
			<div className={classes.countdownBox}>
				<span className={classes.countdownLabel}>입찰 시간</span>
				<span className={`${classes.countdownValue} ${classes.countdownEnd}`}>시간 종료</span>
			</div>
		);
	}
	const sec = Math.ceil(remainMs / 1000);
	let cls = '';
	if (sec <= 5) cls = classes.countdownDanger;
	else if (sec <= 10) cls = classes.countdownWarn;
	return (
		<div className={classes.countdownBox}>
			<span className={classes.countdownLabel}>입찰 시간</span>
			<span className={`${classes.countdownValue} ${cls}`}>{sec}s</span>
		</div>
	);
}

// ─── Duration Dialog (시작/갱신 공용) ─────────────────────────
function DurationDialog({ open, title, hint, confirmLabel, onClose, onConfirm, classes }) {
	const [preset, setPreset] = useState(30);
	const [custom, setCustom] = useState('');
	const useCustom = preset === 'custom';
	const value = useCustom ? Number(custom) : preset;
	const valid = Number.isFinite(value) && value > 0 && value <= 600;
	function handleConfirm() {
		if (!valid) return;
		onConfirm(value);
	}
	return (
		<Dialog
			open={open}
			onClose={onClose}
			slotProps={{ paper: { className: classes.dialogPaper } }}
		>
			<DialogTitle className={classes.dialogTitle}>{title}</DialogTitle>
			<DialogContent>
				<ToggleButtonGroup
					exclusive
					value={preset}
					onChange={(_e, v) => v != null && setPreset(v)}
					className={classes.durationToggle}
				>
					{DURATION_PRESETS.map(p => (
						<ToggleButton key={p} value={p}>{p}초</ToggleButton>
					))}
					<ToggleButton value="custom">직접 입력</ToggleButton>
				</ToggleButtonGroup>
				{useCustom && (
					<TextField
						className={classes.customInput}
						label="초"
						type="number"
						value={custom}
						onChange={(e) => setCustom(e.target.value)}
						variant="outlined"
						fullWidth
						size="small"
						inputProps={{ min: 1, max: 600 }}
					/>
				)}
				{hint && <div className={classes.dialogHint}>{hint}</div>}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>취소</Button>
				<Button onClick={handleConfirm} disabled={!valid}>{confirmLabel}</Button>
			</DialogActions>
		</Dialog>
	);
}

// ─── CandidateInfoCard ────────────────────────────────────────
function CandidateInfoCard({ candidate, classes }) {
	if (!candidate) return null;
	const positionLabel = POSITION_LABELS[candidate.position] || candidate.position;
	const rankParts = [];
	if (candidate.rankTier) rankParts.push(candidate.rankTier);
	const rankWL = (candidate.rankWin != null || candidate.rankLose != null)
		? `${candidate.rankWin || 0}승 ${candidate.rankLose || 0}패`
		: null;
	const internalParts = [];
	if (candidate.internalRating != null) internalParts.push(`${candidate.internalRating}`);
	const internalWL = (candidate.win != null || candidate.lose != null)
		? `${candidate.win || 0}승 ${candidate.lose || 0}패`
		: null;

	const achievements = candidate.achievements || [];
	const honor = candidate.honor;

	return (
		<div className={classes.candidateMain}>
			{candidate.profileIconId != null ? (
				<img
					className={classes.candidateAvatarLg}
					src={getProfileIconUrl(candidate.profileIconId)}
					alt=""
				/>
			) : (
				<div className={classes.candidateAvatarLg} style={{ background: 'rgba(255,255,255,0.05)' }} />
			)}
			<div className={classes.candidateBody}>
				<div className={classes.candidateNameRow}>
					<span className={classes.candidateName}>
						{candidate.name || displayNameForPuuid(null, candidate.puuid)}
					</span>
					<span className={classes.candidatePosBadge}>
						<PositionIcon
							position={candidate.position}
							className={classes.candidatePosBadgeIcon}
						/>
						{positionLabel}
					</span>
				</div>
				<div className={classes.statRow}>
					{(rankParts.length > 0 || rankWL) && (
						<span>
							<span className={classes.statLabel}>솔랭</span>
							<span className={classes.statValue}>{rankParts.join(' ') || '-'}</span>
							{rankWL && (
								<>
									{' '}<span className={classes.statSep}>·</span>{' '}
									<span>{rankWL}</span>
								</>
							)}
						</span>
					)}
					{(internalParts.length > 0 || internalWL) && (
						<span>
							<span className={classes.statLabel}>내전</span>
							<span className={classes.statValue}>{internalParts.join(' ') || '-'}</span>
							{internalWL && (
								<>
									{' '}<span className={classes.statSep}>·</span>{' '}
									<span>{internalWL}</span>
								</>
							)}
						</span>
					)}
				</div>
				{achievements.length > 0 && (
					<div className={classes.achievementRow}>
						<EmojiEventsIcon style={{ color: '#ffd700', width: 18, height: 18 }} />
						<span>업적</span>
						{achievements.map(a => (
							<span key={a.id} className={classes.achievementChip}>{a.id}</span>
						))}
					</div>
				)}
				{honor && (honor.received != null || honor.title) && (
					<div className={classes.honorRow}>
						<span role="img" aria-label="sparkles">✨</span>
						<span>
							명예 받음 <span className={classes.statValue}>{honor.received || 0}</span>
							{honor.given != null && <> · 줌 <span className={classes.statValue}>{honor.given}</span></>}
						</span>
						{honor.title && (
							<>
								<span className={classes.statSep}>·</span>
								<span className={classes.honorTitle}>{honor.title}</span>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

// ─── Main ─────────────────────────────────────────────────────
function AuctionStage({ tournament, teams, isAdmin, onChanged, lastBidPuuid }) {
	const { classes, cx } = useStyles();
	const dispatch = useDispatch();
	const toast = useToast();
	const activeMembers = useSelector(({ Tournament }) => Tournament.tournament.activeMembers);
	const currentCandidate = useSelector(({ Tournament }) => Tournament.tournament.currentCandidate);

	const auctionConfig = tournament.auctionConfig;
	const tournamentId = tournament.id;
	const minBid = (auctionConfig && auctionConfig.minBid) || 1;
	const allowNegative = Boolean(auctionConfig && auctionConfig.allowNegative);

	const currentPuuid = tournament.currentAuctionPuuid;
	const currentDeadline = tournament.currentAuctionDeadline;
	const hasCurrent = Boolean(currentPuuid);
	const candidatePosition = currentCandidate ? currentCandidate.position : null;

	// 현재 시각 (1초 갱신) — deadline 만료 여부 판단에 사용.
	const [nowTick, setNowTick] = useState(() => Date.now());
	useEffect(() => {
		if (!currentDeadline) return undefined;
		const id = setInterval(() => setNowTick(Date.now()), 500);
		return () => clearInterval(id);
	}, [currentDeadline]);

	const deadlineMs = currentDeadline ? new Date(currentDeadline).getTime() : null;
	const bidActive = hasCurrent && deadlineMs != null && deadlineMs > nowTick;
	const bidExpired = hasCurrent && deadlineMs != null && deadlineMs <= nowTick;

	useEffect(() => {
		if (tournament.groupId) {
			dispatch(Actions.getActiveMembers(tournament.groupId));
		}
	}, [dispatch, tournament.groupId]);

	const memberMap = useMemo(() => {
		const m = new Map();
		(activeMembers || []).forEach(x => m.set(x.puuid, x));
		teams.forEach(t => (t.members || []).forEach(mb => m.set(mb.puuid, mb)));
		if (currentCandidate) m.set(currentCandidate.puuid, currentCandidate);
		return m;
	}, [activeMembers, teams, currentCandidate]);

	const assignedPuuids = useMemo(() => {
		const s = new Set();
		teams.forEach(t => (t.members || []).forEach(m => s.add(m.puuid)));
		return s;
	}, [teams]);

	const candidatesByPos = useMemo(() => {
		const map = {};
		POSITIONS.forEach(p => {
			const all = (auctionConfig && auctionConfig.candidates && auctionConfig.candidates[p]) || [];
			map[p] = all.filter(puuid => !assignedPuuids.has(puuid));
		});
		return map;
	}, [auctionConfig, assignedPuuids]);

	const teamFilledPositions = useMemo(() => {
		const map = new Map();
		teams.forEach(t => {
			const s = new Set((t.members || []).map(m => m.position));
			map.set(t.id, s);
		});
		return map;
	}, [teams]);

	const [activePos, setActivePos] = useState(POSITIONS[0]);
	// 현재 매물 포지션으로 후보 풀 탭 자동 동기화.
	useEffect(() => {
		if (candidatePosition && POSITIONS.includes(candidatePosition)) {
			setActivePos(candidatePosition);
		}
	}, [candidatePosition]);

	const [teamBidAmount, setTeamBidAmount] = useState({}); // { [teamId]: amount }
	const [pendingBidTeams, setPendingBidTeams] = useState({});

	// 매물이 바뀌면 입찰 입력값 초기화.
	const prevPuuidRef = useRef(currentPuuid);
	useEffect(() => {
		if (prevPuuidRef.current !== currentPuuid) {
			setTeamBidAmount({});
			prevPuuidRef.current = currentPuuid;
		}
	}, [currentPuuid]);

	const [completeOpen, setCompleteOpen] = useState(false);
	const [startBidOpen, setStartBidOpen] = useState(false);
	const [extendOpen, setExtendOpen] = useState(false);
	const [nextLoading, setNextLoading] = useState(false);

	const allTeamsFull = teams.length > 0 && teams.every(t => (t.members || []).length >= 5);

	function setBidFor(teamId, amount) {
		setTeamBidAmount(prev => ({ ...prev, [teamId]: amount }));
	}

	function handleNextCandidate() {
		setNextLoading(true);
		Actions.nextAuctionCandidate(tournamentId)
			.then(() => onChanged && onChanged())
			.catch(err => {
				const msg = err.response && err.response.data ? err.response.data.result : '다음 매물 선정 실패';
				toast.error(msg);
			})
			.finally(() => setNextLoading(false));
	}

	function handleStartBidConfirm(durationSeconds) {
		setStartBidOpen(false);
		Actions.startAuctionBid(tournamentId, durationSeconds)
			.then(() => onChanged && onChanged())
			.catch(err => {
				const msg = err.response && err.response.data ? err.response.data.result : '입찰 시작 실패';
				toast.error(msg);
			});
	}

	function handleExtendConfirm(durationSeconds) {
		setExtendOpen(false);
		Actions.extendAuctionTime(tournamentId, durationSeconds)
			.then(() => onChanged && onChanged())
			.catch(err => {
				const msg = err.response && err.response.data ? err.response.data.result : '시간 갱신 실패';
				toast.error(msg);
			});
	}

	function handlePlaceTeamBid(teamId) {
		if (!currentPuuid) return;
		const amount = Number(teamBidAmount[teamId]);
		if (!Number.isFinite(amount) || amount < minBid) {
			toast.error(`최소 입찰가는 ${minBid} 입니다.`);
			return;
		}
		setPendingBidTeams(prev => ({ ...prev, [teamId]: true }));
		Actions.placeAuctionBid(tournamentId, teamId, currentPuuid, amount)
			.then(() => {
				toast.success('낙찰 완료');
				onChanged && onChanged();
			})
			.catch(err => {
				const msg = err.response && err.response.data ? err.response.data.result : '입찰 실패';
				toast.error(msg);
			})
			.finally(() => {
				setPendingBidTeams(prev => {
					const next = { ...prev };
					delete next[teamId];
					return next;
				});
			});
	}

	function handleUndoBid(teamId, puuid) {
		Actions.undoAuctionBid(tournamentId, teamId, puuid)
			.then(() => {
				toast.success('입찰을 취소했습니다.');
				onChanged && onChanged();
			})
			.catch(err => {
				const msg = err.response && err.response.data ? err.response.data.result : '취소 실패';
				toast.error(msg);
			});
	}

	function handleComplete() {
		setCompleteOpen(false);
		Actions.completeAuction(tournamentId)
			.then(() => {
				toast.success('경매를 완료했습니다.');
				onChanged && onChanged();
			})
			.catch(err => {
				const msg = err.response && err.response.data ? err.response.data.result : '경매 완료 실패';
				toast.error(msg);
			});
	}

	function renderAuctionBlock() {
		if (!hasCurrent) {
			return (
				<div className={classes.auctionBlock}>
					<div className={classes.auctionEmpty}>
						<div className={classes.auctionEmptyText}>다음 매물을 선정하세요</div>
						{isAdmin && (
							<Button
								className={classes.adminBtn}
								startIcon={<SkipNextIcon />}
								onClick={handleNextCandidate}
								disabled={nextLoading || candidatesByPos === null}
							>
								다음 매물
							</Button>
						)}
					</div>
				</div>
			);
		}
		return (
			<div className={classes.auctionBlock}>
				<div className={classes.candidateLayout}>
					<CandidateInfoCard candidate={currentCandidate} classes={classes} />
					<div className={classes.auctionSide}>
						{deadlineMs != null && <Countdown deadline={currentDeadline} classes={classes} />}
						{isAdmin && (
							<div className={classes.adminActions}>
								{!bidActive && (
									<Button
										className={classes.adminBtn}
										startIcon={<PlayArrowIcon />}
										onClick={() => setStartBidOpen(true)}
									>
										입찰 시작
									</Button>
								)}
								{bidActive && (
									<Button
										className={classes.adminBtn}
										startIcon={<TimerIcon />}
										onClick={() => setExtendOpen(true)}
									>
										시간 갱신
									</Button>
								)}
								<Tooltip
									title={bidActive ? '입찰 진행 중에는 다음 매물로 넘어갈 수 없습니다' : ''}
									arrow
								>
									<span>
										<Button
											className={classes.adminBtnSecondary}
											startIcon={<SkipNextIcon />}
											onClick={handleNextCandidate}
											disabled={bidActive || nextLoading}
										>
											다음 매물
										</Button>
									</span>
								</Tooltip>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	function renderTeamCard(team) {
		const remaining = team.remainingBudget;
		const remainingCls = (() => {
			if (remaining == null) return null;
			if (remaining < 0) return classes.budgetNeg;
			if (remaining < minBid * 2) return classes.budgetLow;
			return null;
		})();
		const slots = POSITIONS.map(pos => {
			const member = (team.members || []).find(m => m.position === pos);
			return { pos, member };
		});

		const filled = teamFilledPositions.get(team.id) || new Set();
		const teamIsFull = (team.members || []).length >= 5;

		const canBidThisTeam =
			isAdmin && bidActive && candidatePosition
			&& !filled.has(candidatePosition)
			&& !teamIsFull
			&& (allowNegative || remaining == null || remaining >= minBid);

		const bidLockReason = (() => {
			if (!isAdmin || !hasCurrent) return null;
			if (!bidActive) return null;
			if (filled.has(candidatePosition)) return `${POSITION_LABELS[candidatePosition]} 자리가 차 있습니다`;
			if (teamIsFull) return '팀 정원이 가득 찼습니다';
			if (!(allowNegative || remaining == null || remaining >= minBid)) return '예산 부족';
			return null;
		})();

		const isPending = pendingBidTeams[team.id];

		const cardActive = isAdmin && bidActive && canBidThisTeam;

		return (
			<div key={team.id} className={cx(classes.teamCard, cardActive && classes.teamCardActive)}>
				<div className={classes.teamHeader}>
					<span className={classes.teamName}>{team.name}</span>
					{remaining != null && (
						<span className={cx(classes.budgetBox, remainingCls)}>
							{remaining}
						</span>
					)}
				</div>
				{slots.map(({ pos, member }) => {
					const isCaptain = member && team.captainPuuid === member.puuid;
					const tier = member ? getMemberTier(member.rating) : null;
					const flash = member && lastBidPuuid && member.puuid === lastBidPuuid;
					return (
						<div key={pos} className={cx(classes.slotRow, flash && classes.slotRowFlash)}>
							<div className={classes.slotPosCell}>
								<PositionIcon position={pos} className={classes.slotPosIcon} />
							</div>
							{member ? (
								<>
									{member.profileIconId != null && (
										<img
											className={classes.slotAvatar}
											src={getProfileIconUrl(member.profileIconId)}
											alt=""
										/>
									)}
									<span className={classes.slotName}>
										{displayNameForPuuid(member.name, member.puuid)}
									</span>
									{isCaptain && <StarIcon className={classes.slotCaptainStar} />}
									{tier && tier.short && (
										<span className={classes.memberTier} title={tier.label || ''}>
											{tier.emblem && (
												<img src={tier.emblem} alt="" className={classes.memberTierEmblem} />
											)}
											<span className={classes.memberTierShort}>{tier.short}</span>
										</span>
									)}
									{member.bidAmount != null && (
										<span className={classes.bidAmount}>{member.bidAmount}</span>
									)}
									{isAdmin && !isCaptain && (
										<Tooltip title="입찰 취소" arrow>
											<IconButton
												className={classes.undoBtn}
												size="small"
												onClick={() => handleUndoBid(team.id, member.puuid)}
											>
												<UndoIcon fontSize="small" />
											</IconButton>
										</Tooltip>
									)}
								</>
							) : (
								<span className={classes.slotEmpty}>비어있음</span>
							)}
						</div>
					);
				})}
				{isAdmin && bidActive && (
					canBidThisTeam ? (
						<div className={classes.teamBidArea}>
							<TextField
								className={classes.teamBidInput}
								size="small"
								type="number"
								placeholder={String(minBid)}
								value={teamBidAmount[team.id] == null ? '' : teamBidAmount[team.id]}
								onChange={(e) => setBidFor(team.id, e.target.value)}
								inputProps={{ min: minBid }}
							/>
							<Button
								className={classes.teamBidBtn}
								startIcon={<GavelIcon />}
								onClick={() => handlePlaceTeamBid(team.id)}
								disabled={isPending}
							>
								낙찰
							</Button>
						</div>
					) : (
						<div className={classes.teamBidLocked}>{bidLockReason || '입찰 불가'}</div>
					)
				)}
			</div>
		);
	}

	function renderCandidateCard(puuid) {
		const member = memberMap.get(puuid);
		const name = member ? member.name : null;
		const profileIconId = member ? member.profileIconId : null;
		const rating = member ? member.rating : null;
		const tier = getMemberTier(rating);
		const isCurrent = puuid === currentPuuid;

		return (
			<div key={puuid} className={cx(classes.candidateCard, isCurrent && classes.candidateCardActive)}>
				{profileIconId != null ? (
					<img
						className={classes.smallAvatar}
						src={getProfileIconUrl(profileIconId)}
						alt=""
					/>
				) : (
					<div className={classes.smallAvatar} style={{ background: 'rgba(255,255,255,0.05)' }} />
				)}
				<div className={classes.smallMeta}>
					<span className={classes.smallName}>
						{name || displayNameForPuuid(null, puuid)}
					</span>
					{tier.label && (
						<span className={classes.smallTier}>
							{tier.short ? `${tier.short} · ${tier.label}` : tier.label}
						</span>
					)}
				</div>
			</div>
		);
	}

	return (
		<>
			<div className={classes.wrapper}>
				{renderAuctionBlock()}

				{bidExpired && isAdmin && (
					<div className={classes.dialogHint} style={{ textAlign: 'center', marginTop: -8 }}>
						시간이 종료됐습니다. 낙찰을 처리하거나 다음 매물로 넘어가세요.
					</div>
				)}

				<div className={classes.root}>
					<div className={classes.panel}>
						<div className={classes.panelTitle}>
							<span>팀 슬롯</span>
							{isAdmin && (
								<Tooltip
									title={allTeamsFull ? '' : '모든 팀의 멤버가 채워져야 완료할 수 있습니다.'}
									arrow
								>
									<span style={{ marginLeft: 'auto' }}>
										<Button
											className={classes.completeBtn}
											startIcon={<DoneAllIcon />}
											onClick={() => setCompleteOpen(true)}
											disabled={!allTeamsFull}
										>
											경매 완료
										</Button>
									</span>
								</Tooltip>
							)}
						</div>
						<div className={classes.teamGrid}>
							{teams.map(t => renderTeamCard(t))}
						</div>
					</div>
					<div className={classes.panel}>
						<div className={classes.panelTitle}>후보 풀</div>
						<Tabs
							className={classes.posTabs}
							value={activePos}
							onChange={(_e, v) => setActivePos(v)}
							variant="fullWidth"
						>
							{POSITIONS.map(p => (
								<Tab
									key={p}
									className={classes.posTab}
									value={p}
									label={`${POSITION_LABELS[p]} (${candidatesByPos[p].length})`}
								/>
							))}
						</Tabs>
						<div className={classes.candidateList}>
							{candidatesByPos[activePos].length === 0 ? (
								<div className={classes.emptyText}>이 포지션의 남은 후보가 없습니다</div>
							) : (
								candidatesByPos[activePos].map(puuid => renderCandidateCard(puuid))
							)}
						</div>
						<div className={classes.ruleBox}>
							<span className={classes.ruleBullet}>• 저티어부터 입찰을 진행하세요.</span>
							<span className={classes.ruleBullet}>• 마지막 낙찰 팀은 다음 라운드 첫 입찰을 양보합니다.</span>
							<span className={classes.ruleBullet}>
								• 최소 입찰가 <b>{minBid}</b>
								{allowNegative && (
									<> · <span className={classes.negTag}>마이너스 잔액 허용</span></>
								)}
							</span>
						</div>
					</div>
				</div>
			</div>

			<Dialog open={completeOpen} onClose={() => setCompleteOpen(false)}>
				<DialogTitle>경매를 완료할까요?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						완료하면 더 이상 입찰을 받을 수 없고, 대진 짜기 단계로 넘어갑니다.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCompleteOpen(false)}>취소</Button>
					<Button onClick={handleComplete} color="primary" autoFocus>완료</Button>
				</DialogActions>
			</Dialog>

			<DurationDialog
				open={startBidOpen}
				title="입찰 시간 설정"
				confirmLabel="시작"
				onClose={() => setStartBidOpen(false)}
				onConfirm={handleStartBidConfirm}
				classes={classes}
			/>
			<DurationDialog
				open={extendOpen}
				title="시간 갱신"
				hint="현재 시각부터 N초 후로 재설정됩니다 (남은 시간 + 추가가 아님)"
				confirmLabel="갱신"
				onClose={() => setExtendOpen(false)}
				onConfirm={handleExtendConfirm}
				classes={classes}
			/>
		</>
	);
}

export default AuctionStage;
