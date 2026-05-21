import React, { useEffect, useMemo, useState } from 'react';
import {
	Button,
	TextField,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	ToggleButton,
	ToggleButtonGroup,
	MenuItem
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GavelIcon from '@mui/icons-material/Gavel';
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
	getTierEmblemUrl,
	parseRankTier
} from './tournamentUtils';
import PositionIcon from './PositionIcon';
import { CATEGORY_LABELS, TIER_COLORS, TIER_RANK } from '../achievementDashboard/constants';

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
	candidateTop: {
		display: 'grid',
		gridTemplateColumns: 'minmax(0, 1fr) auto',
		gap: 18,
		alignItems: 'center',
		[theme.breakpoints.down('md')]: {
			gridTemplateColumns: '1fr',
			gap: 12
		}
	},
	topActionBar: {
		display: 'flex',
		gap: 10,
		flexWrap: 'wrap',
		alignItems: 'center',
		padding: '10px 14px',
		background: 'rgba(0, 212, 255, 0.06)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		borderRadius: 12,
		marginBottom: 14
	},
	topActionLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(0, 212, 255, 0.8)',
		fontWeight: 600,
		marginRight: 4
	},
	topActionSpacer: {
		flex: 1
	},
	candidateColumn: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
		minWidth: 0,
		width: '100%'
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
		gap: 28,
		marginTop: 12,
		flexWrap: 'wrap',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.85)'
	},
	statBlock: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 8
	},
	statLabel: {
		color: 'rgba(255, 255, 255, 0.5)',
		fontSize: '1.3rem'
	},
	statValue: {
		fontWeight: 600,
		color: '#fff'
	},
	statTierEmblem: {
		width: 34,
		height: 34
	},
	statTierShort: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.9rem',
		fontWeight: 700,
		color: '#fff',
		lineHeight: 1
	},
	statWL: {
		color: 'rgba(255, 255, 255, 0.6)',
		fontSize: '1.3rem'
	},
	statSep: {
		color: 'rgba(255, 255, 255, 0.2)'
	},
	candidateExtras: {
		marginTop: 14,
		paddingTop: 12,
		borderTop: '1px solid rgba(255, 255, 255, 0.08)',
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: 18,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.65)'
	},
	achievementGroup: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 6,
		flexWrap: 'wrap'
	},
	achievementLabel: {
		color: 'rgba(255, 255, 255, 0.4)',
		fontSize: '1.05rem'
	},
	achievementIcons: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 6,
		flexWrap: 'wrap'
	},
	achievementChip: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 6,
		padding: '3px 10px',
		borderRadius: 8,
		fontSize: '1.1rem',
		fontFamily: '"Noto Sans KR", sans-serif',
		lineHeight: 1.3
	},
	achievementChipEmoji: {
		fontSize: '1.2rem',
		lineHeight: 1
	},
	achievementChipName: {
		color: '#fff',
		fontWeight: 600
	},
	honorGroup: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 6
	},
	honorTitle: {
		color: '#ffd700',
		fontWeight: 600
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
	completeBtn: {
		background: 'linear-gradient(135deg, #ffd700 0%, #c8a000 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.1rem',
		padding: '6px 16px',
		borderRadius: 8,
		textTransform: 'none',
		'&:hover': {
			background: 'linear-gradient(135deg, #ffe43d 0%, #d4ad08 100%)'
		},
		'&.Mui-disabled': {
			background: 'rgba(255, 255, 255, 0.08)',
			color: 'rgba(255, 255, 255, 0.3)'
		}
	},
	poolPanel: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		border: '1px solid rgba(0, 212, 255, 0.18)',
		borderRadius: 16,
		padding: 18
	},
	poolTitle: {
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
	poolPositions: {
		display: 'grid',
		gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
		gap: 12,
		[theme.breakpoints.down('lg')]: {
			gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
		},
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
		}
	},
	posColumn: {
		display: 'flex',
		flexDirection: 'column',
		gap: 6,
		padding: 10,
		background: 'rgba(255, 255, 255, 0.02)',
		border: '1px solid rgba(255, 255, 255, 0.06)',
		borderRadius: 10
	},
	posColumnActive: {
		border: '1px solid rgba(0, 212, 255, 0.4)',
		background: 'rgba(0, 212, 255, 0.05)'
	},
	posHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		marginBottom: 4
	},
	posHeaderIcon: {
		width: 18,
		height: 18,
		color: '#00d4ff'
	},
	posHeaderLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: '#fff'
	},
	posHeaderCount: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(0, 212, 255, 0.7)',
		marginLeft: 'auto'
	},
	candidateCard: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: 8,
		background: 'rgba(255, 255, 255, 0.04)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		borderRadius: 8
	},
	candidateCardActive: {
		border: '1px solid rgba(0, 212, 255, 0.6)',
		background: 'rgba(0, 212, 255, 0.1)'
	},
	smallAvatar: {
		width: 32,
		height: 32,
		borderRadius: 6,
		flexShrink: 0
	},
	smallMeta: {
		display: 'flex',
		flexDirection: 'column',
		minWidth: 0,
		flex: 1
	},
	smallName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: '#fff',
		fontWeight: 600,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	smallTierRow: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-end',
		gap: 2,
		marginLeft: 'auto',
		flexShrink: 0
	},
	smallTier: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4,
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.75)',
		fontWeight: 600
	},
	smallTierLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.9rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginRight: 2,
		minWidth: 26
	},
	smallTierEmblem: {
		width: 16,
		height: 16,
		flexShrink: 0
	},
	smallTierEmblemPlaceholder: {
		display: 'inline-block',
		width: 16,
		height: 16,
		flexShrink: 0
	},
	smallTierValue: {
		minWidth: 22,
		textAlign: 'left'
	},
	smallTierEmpty: {
		color: 'rgba(255, 255, 255, 0.3)',
		fontStyle: 'italic'
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.3)',
		textAlign: 'center',
		padding: 12
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
	},
	expiredHint: {
		textAlign: 'center',
		marginTop: -8,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	bidDialogField: {
		marginTop: 12,
		'& .MuiInputBase-root': { color: '#fff' },
		'& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
		'& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
		'& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.5)'
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: '#00d4ff'
		},
		'& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.5)' },
		'& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.5)' }
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

// ─── Duration Dialog ──────────────────────────────────────────
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

// ─── BidDialog (낙찰 — 팀 선택 + 금액) ────────────────────
function BidDialog({
	open, teams, candidatePosition, minBid, allowNegative,
	teamId, amount, pending, onTeamChange, onAmountChange, onClose, onConfirm, classes
}) {
	const valid = Boolean(teamId) && Number(amount) >= minBid;
	const options = (teams || []).map(t => {
		const filled = new Set((t.members || []).map(m => m.position));
		const teamFull = (t.members || []).length >= 5;
		const remaining = t.remainingBudget;
		const budgetOk = allowNegative || remaining == null || remaining >= minBid;
		const posTaken = candidatePosition && filled.has(candidatePosition);
		const disabled = posTaken || teamFull || !budgetOk;
		let reason = '';
		if (posTaken) reason = `${POSITION_LABELS[candidatePosition] || candidatePosition} 자리가 차 있습니다`;
		else if (teamFull) reason = '팀 정원이 가득 찼습니다';
		else if (!budgetOk) reason = '예산 부족';
		return { team: t, disabled, reason };
	});
	return (
		<Dialog
			open={open}
			onClose={pending ? undefined : onClose}
			slotProps={{ paper: { className: classes.dialogPaper } }}
		>
			<DialogTitle className={classes.dialogTitle}>낙찰</DialogTitle>
			<DialogContent>
				<TextField
					className={classes.bidDialogField}
					label="팀"
					select
					value={teamId || ''}
					onChange={(e) => onTeamChange(Number(e.target.value))}
					variant="outlined"
					fullWidth
					size="small"
				>
					{options.map(({ team, disabled, reason }) => (
						<MenuItem key={team.id} value={team.id} disabled={disabled}>
							{team.name}
							{team.remainingBudget != null && (
								<span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>
									(잔여 {team.remainingBudget})
								</span>
							)}
							{disabled && (
								<span style={{ color: 'rgba(255, 107, 107, 0.7)', marginLeft: 6 }}>
									· {reason}
								</span>
							)}
						</MenuItem>
					))}
				</TextField>
				<TextField
					className={classes.bidDialogField}
					label="낙찰가"
					type="number"
					value={amount}
					onChange={(e) => onAmountChange(e.target.value)}
					variant="outlined"
					fullWidth
					size="small"
					inputProps={{ min: minBid }}
					helperText={`최소 입찰가 ${minBid}`}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={pending}>취소</Button>
				<Button onClick={onConfirm} disabled={!valid || pending}>낙찰</Button>
			</DialogActions>
		</Dialog>
	);
}

// ─── 티어 표시 (솔랭 / 내전 공용) ───────────────────────────
function TierStat({ classes, label, emblem, short, wl }) {
	if (!short && !wl) return null;
	return (
		<span className={classes.statBlock}>
			<span className={classes.statLabel}>{label}</span>
			{emblem && <img src={emblem} alt="" className={classes.statTierEmblem} />}
			{short && <span className={classes.statTierShort}>{short}</span>}
			{wl && <span className={classes.statWL}>({wl})</span>}
		</span>
	);
}

// ─── CandidateInfoCard ────────────────────────────────────────
function CandidateInfoCard({ candidate, classes }) {
	if (!candidate) return null;
	const positionLabel = POSITION_LABELS[candidate.position] || candidate.position;

	const rank = parseRankTier(candidate.rankTier);
	const rankWL = (candidate.rankWin != null || candidate.rankLose != null)
		? `${candidate.rankWin || 0}승 ${candidate.rankLose || 0}패`
		: null;

	const internalTierName = candidate.internalRating != null ? getTierName(candidate.internalRating) : null;
	const internalEmblem = internalTierName ? getTierEmblemUrl(internalTierName) : null;
	const internalShort = candidate.internalRating != null ? getTierShortLabel(candidate.internalRating) : null;
	const internalLabel = candidate.internalRating != null ? getTierLabel(candidate.internalRating) : null;
	const internalWL = (candidate.win != null || candidate.lose != null)
		? `${candidate.win || 0}승 ${candidate.lose || 0}패`
		: null;

	const achievements = candidate.achievements || [];
	const honor = candidate.honor;

	// honor.title — 객체 또는 문자열 폴리포림.
	let honorTitleText = null;
	let honorTitleEmoji = null;
	if (honor && honor.title && typeof honor.title === 'object') {
		honorTitleText = honor.title.title || null;
		honorTitleEmoji = honor.title.emoji || null;
	} else if (honor && typeof honor.title === 'string') {
		honorTitleText = honor.title;
	}

	return (
		<div className={classes.candidateColumn}>
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
						<TierStat
							classes={classes}
							label="솔랭"
							emblem={rank ? rank.emblem : null}
							short={rank ? rank.short : null}
							wl={rankWL}
						/>
						<TierStat
							classes={classes}
							label="내전"
							emblem={internalEmblem}
							short={internalShort}
							wl={internalWL}
						/>
					</div>
				</div>
			</div>
			{(achievements.length > 0 || (honor && (honor.received != null || honorTitleText))) && (
				<div className={classes.candidateExtras}>
						{achievements.length > 0 && (() => {
							// 티어 높은 순 정렬. IRON은 TIER_RANK에 없어 0 으로 떨어지므로 명시 폴백.
							const tierScore = (t) => {
								if (t == null) return -1;
								if (t in TIER_RANK) return TIER_RANK[t];
								if (t === 'IRON') return 0;
								return -1;
							};
							const sorted = [...achievements]
								.filter(Boolean)
								.sort((a, b) => tierScore(b.tier) - tierScore(a.tier));
							if (sorted.length === 0) return null;
							return (
								<span className={classes.achievementGroup}>
									<span className={classes.achievementLabel}>업적</span>
									<span className={classes.achievementIcons}>
										{sorted.map(a => {
											const catMeta = CATEGORY_LABELS[a.category];
											const catLabel = (catMeta && catMeta.label) || a.category || '';
											const emoji = a.emoji || (catMeta && catMeta.icon) || '🏅';
											const name = a.name || catLabel || '업적';
											const tierColor = TIER_COLORS[a.tier] || 'rgba(255,255,255,0.4)';
											const desc = a.description || (catMeta && catMeta.description) || '';
											const tooltipTitle = (
												<span>
													{name}{a.tier ? ` (${a.tier})` : ''}
													{desc && <><br />{desc}</>}
												</span>
											);
											return (
												<Tooltip key={a.id || a.category || name} title={tooltipTitle} arrow>
													<span
														className={classes.achievementChip}
														style={{
															background: `${tierColor}15`,
															border: `1px solid ${tierColor}60`,
															boxShadow: `0 0 6px ${tierColor}25`
														}}
													>
														<span className={classes.achievementChipEmoji} role="img" aria-label={catLabel}>
															{emoji}
														</span>
														<span className={classes.achievementChipName}>{name}</span>
													</span>
												</Tooltip>
											);
										})}
									</span>
								</span>
							);
						})()}
						{honor && (honor.received != null || honorTitleText) && (
							<span className={classes.honorGroup}>
								<span role="img" aria-label="sparkles">✨</span>
								<span>
									명예 <span className={classes.statValue}>{honor.received || 0}</span>
									{honor.given != null && <> · 줌 <span className={classes.statValue}>{honor.given}</span></>}
								</span>
								{honorTitleText && (
									<>
										<span className={classes.statSep}>·</span>
										<span className={classes.honorTitle}>
											{honorTitleEmoji && (
												<span role="img" aria-label="title" style={{ marginRight: 4 }}>
													{honorTitleEmoji}
												</span>
											)}
											{honorTitleText}
										</span>
									</>
								)}
							</span>
						)}
					</div>
				)}
		</div>
	);
}

// ─── Main ─────────────────────────────────────────────────────
function AuctionStage({ tournament, teams, isAdmin, onChanged }) {
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

	const [completeOpen, setCompleteOpen] = useState(false);
	const [startBidOpen, setStartBidOpen] = useState(false);
	const [nextLoading, setNextLoading] = useState(false);
	const [lastDuration, setLastDuration] = useState(30);
	const [bidDialogOpen, setBidDialogOpen] = useState(false);
	const [bidDialogTeamId, setBidDialogTeamId] = useState('');
	const [bidDialogAmount, setBidDialogAmount] = useState('');
	const [bidDialogPending, setBidDialogPending] = useState(false);

	const allTeamsFull = teams.length > 0 && teams.every(t => (t.members || []).length >= 5);

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
		setLastDuration(durationSeconds);
		Actions.startAuctionBid(tournamentId, durationSeconds)
			.then(() => onChanged && onChanged())
			.catch(err => {
				const msg = err.response && err.response.data ? err.response.data.result : '입찰 시작 실패';
				toast.error(msg);
			});
	}

	// extendOpen 관련 다이얼로그 흐름 제거 — handleExtendQuick으로 대체.
	function handleExtendQuick() {
		Actions.extendAuctionTime(tournamentId, lastDuration)
			.then(() => onChanged && onChanged())
			.catch(err => {
				const msg = err.response && err.response.data ? err.response.data.result : '시간 갱신 실패';
				toast.error(msg);
			});
	}

	function openBidDialog() {
		setBidDialogTeamId('');
		setBidDialogAmount('');
		setBidDialogOpen(true);
	}

	function handleBidConfirm() {
		if (!currentPuuid) return;
		const teamId = Number(bidDialogTeamId);
		const amount = Number(bidDialogAmount);
		if (!teamId) {
			toast.error('팀을 선택하세요.');
			return;
		}
		if (!Number.isFinite(amount) || amount < minBid) {
			toast.error(`최소 입찰가는 ${minBid} 입니다.`);
			return;
		}
		setBidDialogPending(true);
		Actions.placeAuctionBid(tournamentId, teamId, currentPuuid, amount)
			.then(() => {
				toast.success('낙찰 완료');
				setBidDialogOpen(false);
				onChanged && onChanged();
			})
			.catch(err => {
				const msg = err.response && err.response.data ? err.response.data.result : '낙찰 실패';
				toast.error(msg);
			})
			.finally(() => setBidDialogPending(false));
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

	function renderAdminActionBar() {
		if (!isAdmin) return null;
		return (
			<div className={classes.topActionBar}>
				<span className={classes.topActionLabel}>경매 진행</span>
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
				{hasCurrent && !bidActive && !bidExpired && (
					<Button
						className={classes.adminBtn}
						startIcon={<PlayArrowIcon />}
						onClick={() => setStartBidOpen(true)}
					>
						입찰 시작
					</Button>
				)}
				{hasCurrent && bidActive && (
					<Button
						className={classes.adminBtn}
						startIcon={<TimerIcon />}
						onClick={handleExtendQuick}
					>
						시간 갱신 ({lastDuration}s)
					</Button>
				)}
				{hasCurrent && bidExpired && (
					<Button
						className={classes.adminBtn}
						startIcon={<GavelIcon />}
						onClick={openBidDialog}
					>
						낙찰
					</Button>
				)}
				<span className={classes.topActionSpacer} />
				<Tooltip
					title={allTeamsFull ? '' : '모든 팀의 멤버가 채워져야 완료할 수 있습니다.'}
					arrow
				>
					<span>
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
			</div>
		);
	}

	function renderAuctionBlock() {
		if (!hasCurrent) {
			return (
				<div className={classes.auctionBlock}>
					<div className={classes.auctionEmpty}>
						<div className={classes.auctionEmptyText}>다음 매물을 선정하세요</div>
					</div>
				</div>
			);
		}
		return (
			<div className={classes.auctionBlock}>
				<div className={classes.candidateTop}>
					<CandidateInfoCard candidate={currentCandidate} classes={classes} />
					{deadlineMs != null && <Countdown deadline={currentDeadline} classes={classes} />}
				</div>
			</div>
		);
	}

	function renderCandidateCard(puuid) {
		const member = memberMap.get(puuid);
		const name = member ? member.name : null;
		const profileIconId = member ? member.profileIconId : null;
		// 내전 rating — active-members 객체는 `rating`, currentCandidate enrich 객체는 `internalRating`.
		const rating = member
			? (member.rating != null ? member.rating : member.internalRating)
			: null;
		const internalTier = getMemberTier(rating);
		// 솔랭 — currentCandidate / active-members 응답 모두 `rankTier` 우선, 다른 필드명도 폴백.
		const soloRankStr = member && (member.rankTier || member.soloRank || member.solo_rank || null);
		const soloRank = parseRankTier(soloRankStr);
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
				</div>
				<div className={classes.smallTierRow}>
					<span className={classes.smallTier}>
						<span className={classes.smallTierLabel}>솔랭</span>
						{soloRank && soloRank.emblem ? (
							<img src={soloRank.emblem} alt="" className={classes.smallTierEmblem} />
						) : (
							<span className={classes.smallTierEmblemPlaceholder} />
						)}
						<span className={classes.smallTierValue}>
							{soloRank && soloRank.short
								? soloRank.short
								: <span className={classes.smallTierEmpty}>-</span>}
						</span>
					</span>
					<span className={classes.smallTier}>
						<span className={classes.smallTierLabel}>내전</span>
						{internalTier.emblem ? (
							<img src={internalTier.emblem} alt="" className={classes.smallTierEmblem} />
						) : (
							<span className={classes.smallTierEmblemPlaceholder} />
						)}
						<span className={classes.smallTierValue}>
							{internalTier.short
								? internalTier.short
								: <span className={classes.smallTierEmpty}>-</span>}
						</span>
					</span>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className={classes.wrapper}>
				{renderAdminActionBar()}
				{renderAuctionBlock()}

				{bidExpired && isAdmin && (
					<div className={classes.expiredHint}>
						시간이 종료됐습니다. 낙찰을 처리하거나 다음 매물로 넘어가세요.
					</div>
				)}

				<div className={classes.poolPanel}>
					<div className={classes.poolTitle}>후보 풀</div>
					<div className={classes.poolPositions}>
						{POSITIONS.map(pos => (
							<div
								key={pos}
								className={cx(classes.posColumn, candidatePosition === pos && classes.posColumnActive)}
							>
								<div className={classes.posHeader}>
									<PositionIcon position={pos} className={classes.posHeaderIcon} />
									<span className={classes.posHeaderLabel}>{POSITION_LABELS[pos]}</span>
									<span className={classes.posHeaderCount}>{candidatesByPos[pos].length}</span>
								</div>
								{candidatesByPos[pos].length === 0 ? (
									<div className={classes.emptyText}>남은 후보 없음</div>
								) : (
									candidatesByPos[pos].map(puuid => renderCandidateCard(puuid))
								)}
							</div>
						))}
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
			<BidDialog
				open={bidDialogOpen}
				teams={teams}
				candidatePosition={candidatePosition}
				minBid={minBid}
				allowNegative={allowNegative}
				teamId={bidDialogTeamId}
				amount={bidDialogAmount}
				pending={bidDialogPending}
				onTeamChange={setBidDialogTeamId}
				onAmountChange={setBidDialogAmount}
				onClose={() => setBidDialogOpen(false)}
				onConfirm={handleBidConfirm}
				classes={classes}
			/>
		</>
	);
}

export default AuctionStage;
