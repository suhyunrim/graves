import React, { useEffect, useMemo, useState } from 'react';
import {
	Button,
	IconButton,
	Tabs,
	Tab,
	TextField,
	MenuItem,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useDispatch, useSelector } from 'react-redux';
import GavelIcon from '@mui/icons-material/Gavel';
import UndoIcon from '@mui/icons-material/Undo';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import StarIcon from '@mui/icons-material/Star';
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

const useStyles = makeStyles()((theme) => ({
	root: {
		display: 'grid',
		gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
		gap: 20,
		marginBottom: 20,
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
		borderRadius: 10,
		flexWrap: 'wrap'
	},
	candidateAvatar: {
		width: 38,
		height: 38,
		borderRadius: 8
	},
	candidateMeta: {
		display: 'flex',
		flexDirection: 'column',
		minWidth: 0,
		flex: '0 1 auto'
	},
	candidateName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: '#fff',
		fontWeight: 600
	},
	candidateTier: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	bidControls: {
		display: 'flex',
		gap: 6,
		alignItems: 'center',
		marginLeft: 'auto'
	},
	bidTeamSelect: {
		minWidth: 120,
		'& .MuiInputBase-root': { color: '#fff', fontSize: '1.15rem' },
		'& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
		'& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.5)' }
	},
	bidAmountInput: {
		width: 92,
		'& .MuiInputBase-root': { color: '#fff', fontSize: '1.15rem' },
		'& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' }
	},
	bidBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.05rem',
		padding: '4px 12px',
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
	}
}));

function getMemberTier(rating) {
	const tierName = getTierName(rating);
	return {
		name: tierName,
		label: getTierLabel(rating),
		short: getTierShortLabel(rating),
		emblem: getTierEmblemUrl(tierName)
	};
}

function AuctionStage({ tournament, teams, isAdmin, onChanged }) {
	const { classes, cx } = useStyles();
	const dispatch = useDispatch();
	const toast = useToast();
	const activeMembers = useSelector(({ Tournament }) => Tournament.tournament.activeMembers);

	const auctionConfig = tournament.auctionConfig;
	const tournamentId = tournament.id;
	const teamSize = (auctionConfig && auctionConfig.teamSize) || 5;
	const minBid = (auctionConfig && auctionConfig.minBid) || 1;
	const allowNegative = Boolean(auctionConfig && auctionConfig.allowNegative);

	useEffect(() => {
		if (tournament.groupId) {
			dispatch(Actions.getActiveMembers(tournament.groupId));
		}
	}, [dispatch, tournament.groupId]);

	const memberMap = useMemo(() => {
		const m = new Map();
		(activeMembers || []).forEach(x => m.set(x.puuid, x));
		// 팀에 이미 들어간 멤버는 detail enrich 정보를 우선시.
		teams.forEach(t => (t.members || []).forEach(mb => m.set(mb.puuid, mb)));
		return m;
	}, [activeMembers, teams]);

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

	// 각 팀이 이미 가진 포지션 (해당 포지션엔 더 못 받음).
	const teamFilledPositions = useMemo(() => {
		const map = new Map();
		teams.forEach(t => {
			const s = new Set((t.members || []).map(m => m.position));
			map.set(t.id, s);
		});
		return map;
	}, [teams]);

	const [activePos, setActivePos] = useState(POSITIONS[0]);
	// 후보별 입찰 상태: { [puuid]: { teamId, amount } }
	const [bidState, setBidState] = useState({});
	const [pendingBids, setPendingBids] = useState({}); // 진행 중 puuid 락
	const [completeOpen, setCompleteOpen] = useState(false);

	function setBidField(puuid, field, value) {
		setBidState(prev => ({
			...prev,
			[puuid]: { ...(prev[puuid] || {}), [field]: value }
		}));
	}

	const allTeamsFull = teams.length > 0 && teams.every(t => (t.members || []).length >= teamSize);

	function handlePlaceBid(puuid) {
		const st = bidState[puuid] || {};
		const teamId = st.teamId;
		const amount = Number(st.amount);
		if (!teamId) {
			toast.error('팀을 선택하세요.');
			return;
		}
		if (!Number.isFinite(amount) || amount < minBid) {
			toast.error(`최소 입찰가는 ${minBid} 입니다.`);
			return;
		}
		setPendingBids(prev => ({ ...prev, [puuid]: true }));
		Actions.placeAuctionBid(tournamentId, teamId, puuid, amount)
			.then(() => {
				setBidState(prev => {
					const next = { ...prev };
					delete next[puuid];
					return next;
				});
				toast.success('낙찰 완료');
				onChanged && onChanged();
			})
			.catch(err => {
				const msg = err.response && err.response.data ? err.response.data.result : '입찰 실패';
				toast.error(msg);
			})
			.finally(() => {
				setPendingBids(prev => {
					const next = { ...prev };
					delete next[puuid];
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
		return (
			<div key={team.id} className={classes.teamCard}>
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
					return (
						<div key={pos} className={classes.slotRow}>
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
			</div>
		);
	}

	function renderCandidateCard(puuid) {
		const member = memberMap.get(puuid);
		const name = member ? member.name : null;
		const profileIconId = member ? member.profileIconId : null;
		const rating = member ? member.rating : null;
		const tier = getMemberTier(rating);

		const st = bidState[puuid] || {};
		const isPending = pendingBids[puuid];

		const teamOptions = teams.map(t => {
			const filled = teamFilledPositions.get(t.id) || new Set();
			const posTaken = filled.has(activePos);
			const full = (t.members || []).length >= teamSize;
			const budgetOk = allowNegative || (t.remainingBudget == null) || (t.remainingBudget >= minBid);
			const disabled = posTaken || full || !budgetOk;
			let reason = '';
			if (posTaken) reason = `${POSITION_LABELS[activePos]} 자리가 이미 차 있습니다`;
			else if (full) reason = '팀 정원이 가득 찼습니다';
			else if (!budgetOk) reason = '예산 부족';
			return { team: t, disabled, reason };
		});

		return (
			<div key={puuid} className={classes.candidateCard}>
				{profileIconId != null ? (
					<img
						className={classes.candidateAvatar}
						src={getProfileIconUrl(profileIconId)}
						alt=""
					/>
				) : (
					<div className={classes.candidateAvatar} style={{ background: 'rgba(255,255,255,0.05)' }} />
				)}
				<div className={classes.candidateMeta}>
					<span className={classes.candidateName}>
						{name || displayNameForPuuid(null, puuid)}
					</span>
					{tier.label && (
						<span className={classes.candidateTier}>
							{tier.short ? `${tier.short} · ${tier.label}` : tier.label}
						</span>
					)}
				</div>
				{isAdmin && (
					<div className={classes.bidControls}>
						<TextField
							className={classes.bidTeamSelect}
							select
							size="small"
							value={st.teamId || ''}
							onChange={(e) => setBidField(puuid, 'teamId', Number(e.target.value))}
							SelectProps={{
								renderValue: (v) => {
									if (!v) return '팀 선택';
									const t = teams.find(x => x.id === v);
									return t ? t.name : '팀 선택';
								},
								displayEmpty: true
							}}
						>
							{teamOptions.map(({ team, disabled, reason }) => {
								const label = (
									<span>
										{team.name}
										{team.remainingBudget != null && (
											<span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>
												({team.remainingBudget})
											</span>
										)}
									</span>
								);
								if (disabled) {
									return (
										<Tooltip key={team.id} title={reason} arrow placement="left">
											<span>
												<MenuItem value={team.id} disabled style={{ opacity: 0.5 }}>
													{label}
												</MenuItem>
											</span>
										</Tooltip>
									);
								}
								return (
									<MenuItem key={team.id} value={team.id}>
										{label}
									</MenuItem>
								);
							})}
						</TextField>
						<TextField
							className={classes.bidAmountInput}
							size="small"
							type="number"
							placeholder={String(minBid)}
							value={st.amount == null ? '' : st.amount}
							onChange={(e) => setBidField(puuid, 'amount', e.target.value)}
							inputProps={{ min: minBid }}
						/>
						<Button
							className={classes.bidBtn}
							startIcon={<GavelIcon />}
							onClick={() => handlePlaceBid(puuid)}
							disabled={isPending}
						>
							낙찰
						</Button>
					</div>
				)}
			</div>
		);
	}

	return (
		<>
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
		</>
	);
}

export default AuctionStage;
