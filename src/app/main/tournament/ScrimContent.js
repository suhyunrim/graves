import React, { useMemo, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import {
	Button,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useToast from 'app/utility/useToast';
import { useSelector } from 'react-redux';
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';
import {
	computeScrimLeaderboard,
	computeVsRecords,
	canEditScrim,
	checkIsAdmin
} from './tournamentUtils';
import ScrimFormDialog from './ScrimFormDialog';

const useStyles = makeStyles()((theme) => ({
	section: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 16,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		padding: '24px 28px',
		marginBottom: 24,
		[theme.breakpoints.down('sm')]: {
			padding: '18px 20px',
			borderRadius: 14
		}
	},
	sectionHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 18,
		gap: 12,
		flexWrap: 'wrap'
	},
	sectionTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.04em',
		textTransform: 'uppercase',
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		'&::before': {
			content: '""',
			display: 'inline-block',
			width: 4,
			height: 22,
			borderRadius: 2,
			background: 'linear-gradient(180deg, #00d4ff, #0066ff)'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.5rem',
			gap: 10,
			'&::before': { height: 18 }
		}
	},
	primaryBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.15rem',
		padding: '6px 16px',
		borderRadius: 10,
		textTransform: 'none',
		boxShadow: '0 4px 14px rgba(0, 212, 255, 0.2)',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)'
		}
	},
	tableWrapper: {
		overflowX: 'auto'
	},
	table: {
		width: '100%',
		borderCollapse: 'collapse',
		minWidth: 540,
		fontFamily: '"Noto Sans KR", sans-serif'
	},
	headerRow: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.5)',
		textTransform: 'uppercase',
		letterSpacing: '0.05em'
	},
	headerCell: {
		padding: '10px 12px',
		textAlign: 'left',
		borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
		fontWeight: 600,
		[theme.breakpoints.down('sm')]: {
			padding: '8px 8px',
			fontSize: '1rem'
		}
	},
	headerCellNum: {
		textAlign: 'center'
	},
	bodyRow: {
		cursor: 'pointer',
		transition: 'background 0.15s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.05)'
		}
	},
	bodyRowExpanded: {
		background: 'rgba(0, 212, 255, 0.08)'
	},
	cell: {
		padding: '12px',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.9)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		[theme.breakpoints.down('sm')]: {
			padding: '8px',
			fontSize: '1.15rem'
		}
	},
	cellNum: {
		textAlign: 'center',
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700
	},
	rankCell: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.7)',
		textAlign: 'center',
		width: 44
	},
	rankTop1: {
		color: '#FFD700'
	},
	rankTop2: {
		color: '#C0C0C0'
	},
	rankTop3: {
		color: '#CD7F32'
	},
	teamCell: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		fontWeight: 600,
		color: '#00d4ff'
	},
	expandIcon: {
		color: 'rgba(255, 255, 255, 0.4)',
		transition: 'transform 0.2s ease'
	},
	expandIconOpen: {
		transform: 'rotate(180deg)',
		color: '#00d4ff'
	},
	winRateCell: {
		fontSize: '1.5rem',
		color: '#00d4ff'
	},
	vsRow: {
		background: 'rgba(0, 0, 0, 0.25)'
	},
	vsCell: {
		padding: '12px 16px 16px 60px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		[theme.breakpoints.down('sm')]: {
			padding: '10px 12px 14px 36px'
		}
	},
	vsTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 8
	},
	vsList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 6
	},
	vsItem: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		fontSize: '1.25rem',
		color: 'rgba(255, 255, 255, 0.85)'
	},
	vsOpponent: {
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	vsRecord: {
		display: 'inline-flex',
		alignItems: 'baseline',
		gap: 4,
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		fontSize: '1.45rem',
		color: '#fff',
		minWidth: 64,
		justifyContent: 'flex-end'
	},
	vsRecordWin: {
		color: '#00ff7f'
	},
	vsRecordLoss: {
		color: '#ff6b6b'
	},
	vsRecordSep: {
		color: 'rgba(255, 255, 255, 0.4)'
	},
	scrimList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 10
	},
	scrimItem: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		padding: '12px 16px',
		background: 'rgba(0, 0, 0, 0.25)',
		border: '1px solid rgba(0, 212, 255, 0.12)',
		borderRadius: 12,
		flexWrap: 'wrap',
		[theme.breakpoints.down('sm')]: {
			padding: '10px 12px',
			gap: 8
		}
	},
	scrimMatchup: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		flex: 1,
		minWidth: 220,
		[theme.breakpoints.down('sm')]: {
			minWidth: 180,
			gap: 8
		}
	},
	scrimTeam: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.9)',
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.2rem'
		}
	},
	scrimTeamWinner: {
		color: '#00ff7f'
	},
	scrimTeamLoser: {
		color: 'rgba(255, 255, 255, 0.5)'
	},
	scrimScore: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		minWidth: 60,
		textAlign: 'center',
		letterSpacing: '0.05em',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.4rem',
			minWidth: 52
		}
	},
	scrimMeta: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		minWidth: 110,
		textAlign: 'right'
	},
	scrimActions: {
		display: 'flex',
		gap: 4
	},
	scrimActionBtn: {
		color: 'rgba(255, 255, 255, 0.5)',
		padding: 4,
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.08)'
		}
	},
	scrimActionBtnDanger: {
		color: 'rgba(255, 255, 255, 0.5)',
		padding: 4,
		'&:hover': {
			color: '#ff6b6b',
			background: 'rgba(255, 107, 107, 0.08)'
		}
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: 40
	},
	loginHint: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.4)'
	}
}));

function rankClassFor(idx, classes) {
	if (idx === 0) return classes.rankTop1;
	if (idx === 1) return classes.rankTop2;
	if (idx === 2) return classes.rankTop3;
	return null;
}

function formatDate(iso) {
	if (!iso) return '';
	const d = new Date(iso);
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${yyyy}.${mm}.${dd}`;
}

function ScrimContent({ tournamentId, teams, scrims, onMutated }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();
	const toast = useToast();
	const user = useSelector(state => state.auth.user);
	const isAdmin = checkIsAdmin(user);
	const isLoggedIn = Boolean(user && user.reprGroup);

	const [formOpen, setFormOpen] = useState(false);
	const [editingScrim, setEditingScrim] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [expandedTeamId, setExpandedTeamId] = useState(null);

	const teamMap = useMemo(() => {
		const m = new Map();
		teams.forEach(t => m.set(t.id, t));
		return m;
	}, [teams]);

	const leaderboard = useMemo(
		() => computeScrimLeaderboard(teams),
		[teams]
	);

	const vsRecordsForExpanded = useMemo(() => {
		if (!expandedTeamId) return [];
		return computeVsRecords(expandedTeamId, scrims, teams);
	}, [expandedTeamId, scrims, teams]);

	function teamName(id) {
		const t = teamMap.get(id);
		return t ? t.name : '?';
	}

	function handleCreateClick() {
		setEditingScrim(null);
		setFormOpen(true);
	}

	function handleEditClick(scrim) {
		setEditingScrim(scrim);
		setFormOpen(true);
	}

	function handleFormSuccess() {
		setFormOpen(false);
		setEditingScrim(null);
		toast.success(editingScrim ? '스크림이 수정되었습니다.' : '스크림이 기록되었습니다.');
		onMutated();
	}

	function handleDelete() {
		if (!deleteTarget) return;
		Actions.deleteScrim(tournamentId, deleteTarget.id)
			.then(() => {
				setDeleteTarget(null);
				toast.success('스크림이 삭제되었습니다.');
				onMutated();
			})
			.catch(err => {
				const msg = err.response && err.response.data ? err.response.data.result : '삭제 실패';
				toast.error(msg);
			});
	}

	return (
		<>
			<div className={classes.section}>
				<div className={classes.sectionHeader}>
					<div className={classes.sectionTitle}>리더보드</div>
					{isLoggedIn ? (
						<Button
							className={classes.primaryBtn}
							startIcon={<AddIcon />}
							onClick={handleCreateClick}
						>
							결과 기록
						</Button>
					) : (
						<span className={classes.loginHint}>기록은 로그인 후 가능합니다</span>
					)}
				</div>
				{leaderboard.length === 0 ? (
					<div className={classes.emptyText}>참가팀이 없습니다</div>
				) : (
					<div className={classes.tableWrapper}>
						<table className={classes.table}>
							<thead>
								<tr className={classes.headerRow}>
									<th className={classes.headerCell}>#</th>
									<th className={classes.headerCell}>팀</th>
									<th className={cx(classes.headerCell, classes.headerCellNum)}>승</th>
									<th className={cx(classes.headerCell, classes.headerCellNum)}>패</th>
									<th className={cx(classes.headerCell, classes.headerCellNum)}>승률</th>
									<th className={classes.headerCell} aria-label="expand" />
								</tr>
							</thead>
							<tbody>
								{leaderboard.map((row, idx) => {
									const expanded = expandedTeamId === row.teamId;
									const ratePct = Math.round(row.winRate * 100);
									return (
										<React.Fragment key={row.teamId}>
											<tr
												className={cx(classes.bodyRow, expanded && classes.bodyRowExpanded)}
												onClick={() => setExpandedTeamId(prev => prev === row.teamId ? null : row.teamId)}
											>
												<td className={cx(classes.cell, classes.rankCell, rankClassFor(idx, classes))}>
													{idx + 1}
												</td>
												<td className={classes.cell}>
													<span className={classes.teamCell}>{teamName(row.teamId)}</span>
												</td>
												<td className={cx(classes.cell, classes.cellNum)}>{row.wins}</td>
												<td className={cx(classes.cell, classes.cellNum)}>{row.losses}</td>
												<td className={cx(classes.cell, classes.cellNum, classes.winRateCell)}>
													{row.wins + row.losses === 0 ? '—' : `${ratePct}%`}
												</td>
												<td className={cx(classes.cell, classes.cellNum)}>
													<ExpandMoreIcon
														className={cx(classes.expandIcon, expanded && classes.expandIconOpen)}
													/>
												</td>
											</tr>
											{expanded && (
												<tr className={classes.vsRow}>
													<td className={classes.vsCell} colSpan={6}>
														{vsRecordsForExpanded.length === 0 ? (
															<div className={classes.vsTitle}>아직 기록된 상대 전적이 없습니다.</div>
														) : (
															<>
																<div className={classes.vsTitle}>상대팀별 전적</div>
																<div className={classes.vsList}>
																	{vsRecordsForExpanded.map(r => (
																		<div key={r.opponentId} className={classes.vsItem}>
																			<span className={classes.vsOpponent}>vs {teamName(r.opponentId)}</span>
																			<span className={classes.vsRecord}>
																				<span className={classes.vsRecordWin}>{r.mySets}</span>
																				<span className={classes.vsRecordSep}>:</span>
																				<span className={classes.vsRecordLoss}>{r.oppSets}</span>
																			</span>
																		</div>
																	))}
																</div>
															</>
														)}
													</td>
												</tr>
											)}
										</React.Fragment>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<div className={classes.section}>
				<div className={classes.sectionHeader}>
					<div className={classes.sectionTitle}>최근 기록</div>
				</div>
				{scrims.length === 0 ? (
					<div className={classes.emptyText}>기록된 스크림이 없습니다</div>
				) : (
					<div className={classes.scrimList}>
						{scrims.map(s => {
							const t1Wins = s.team1Score > s.team2Score;
							const t2Wins = s.team2Score > s.team1Score;
							const editable = canEditScrim(s, user, isAdmin);
							return (
								<div key={s.id} className={classes.scrimItem}>
									<div className={classes.scrimMatchup}>
										<span
											className={cx(
												classes.scrimTeam,
												t1Wins && classes.scrimTeamWinner,
												t2Wins && classes.scrimTeamLoser
											)}
											style={{ textAlign: 'right' }}
										>
											{teamName(s.team1Id)}
										</span>
										<span className={classes.scrimScore}>
											{s.team1Score} : {s.team2Score}
										</span>
										<span
											className={cx(
												classes.scrimTeam,
												t2Wins && classes.scrimTeamWinner,
												t1Wins && classes.scrimTeamLoser
											)}
										>
											{teamName(s.team2Id)}
										</span>
									</div>
									<span className={classes.scrimMeta}>{formatDate(s.createdAt)}</span>
									{editable && (
										<div className={classes.scrimActions}>
											<IconButton
												className={classes.scrimActionBtn}
												onClick={() => handleEditClick(s)}
												size="small"
											>
												<EditIcon fontSize="small" />
											</IconButton>
											<IconButton
												className={classes.scrimActionBtnDanger}
												onClick={() => setDeleteTarget(s)}
												size="small"
											>
												<DeleteIcon fontSize="small" />
											</IconButton>
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>

			{formOpen && (
				<ScrimFormDialog
					open={formOpen}
					onClose={() => {
						setFormOpen(false);
						setEditingScrim(null);
					}}
					onSuccess={handleFormSuccess}
					tournamentId={tournamentId}
					teams={teams}
					scrim={editingScrim}
				/>
			)}
			{deleteTarget && (
				<Dialog
					open={Boolean(deleteTarget)}
					onClose={() => setDeleteTarget(null)}
					slotProps={{ paper: { className: dialogClasses.paperDestructive } }}
				>
					<DialogTitle className={dialogClasses.titleDestructive}>스크림 삭제</DialogTitle>
					<DialogContent>
						<DialogContentText className={dialogClasses.contentText}>
							{teamName(deleteTarget.team1Id)} {deleteTarget.team1Score}:{deleteTarget.team2Score} {teamName(deleteTarget.team2Id)} 기록을 삭제하시겠습니까?
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button
							className={dialogClasses.destructiveCancelBtn}
							onClick={() => setDeleteTarget(null)}
						>
							취소
						</Button>
						<Button
							className={dialogClasses.destructiveConfirmBtn}
							onClick={handleDelete}
						>
							삭제
						</Button>
					</DialogActions>
				</Dialog>
			)}
		</>
	);
}

export default ScrimContent;
