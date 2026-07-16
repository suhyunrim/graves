import React from 'react';
import { makeStyles } from 'tss-react/mui';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { getChampionIcon } from 'app/main/challenge/ddragonUtils';
import { getChampBadges } from './championBadges';

const useStyles = makeStyles()((theme) => ({
	dialogPaper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		color: '#fff',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		borderRadius: '20px !important',
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 212, 255, 0.08)',
		overflow: 'hidden',
		position: 'relative',
		width: '100%',
		maxWidth: 760,
		'&::before': {
			content: '""',
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			height: 1,
			background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent)'
		}
	},
	dialogTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.05em',
		textTransform: 'uppercase',
		padding: '24px 28px 4px',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
	},
	dialogSubtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.4)',
		padding: '0 28px 12px'
	},
	dialogContent: {
		padding: '8px 28px 20px',
		overflowY: 'auto',
		maxHeight: '60vh'
	},
	dialogActions: {
		display: 'flex',
		justifyContent: 'flex-end',
		padding: '12px 28px 24px'
	},
	table: {
		width: '100%',
		borderCollapse: 'collapse'
	},
	th: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.5)',
		textTransform: 'uppercase',
		letterSpacing: '0.05em',
		textAlign: 'right',
		padding: '8px 10px',
		borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
		whiteSpace: 'nowrap'
	},
	thChamp: {
		textAlign: 'left'
	},
	td: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.85)',
		textAlign: 'right',
		padding: '8px 10px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		whiteSpace: 'nowrap'
	},
	champCell: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		textAlign: 'left'
	},
	champImg: {
		width: 36,
		height: 36,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '2px solid rgba(0, 212, 255, 0.3)',
		flexShrink: 0
	},
	champName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.92)',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		maxWidth: 120,
		[theme.breakpoints.down('sm')]: {
			maxWidth: 80
		}
	},
	badge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.9rem',
		fontWeight: 700,
		padding: '2px 7px',
		borderRadius: 6,
		border: '1px solid currentColor',
		flexShrink: 0
	},
	kdaDetail: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	winHigh: {
		color: '#00ff7f'
	},
	scrollX: {
		overflowX: 'auto'
	},
	cancelBtn: {
		color: 'rgba(255, 255, 255, 0.5)',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		borderRadius: 10,
		padding: '8px 22px',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		textTransform: 'none',
		'&:hover': {
			color: '#00d4ff',
			borderColor: 'rgba(0, 212, 255, 0.4)',
			background: 'rgba(0, 212, 255, 0.08)'
		}
	}
}));

// 내전 챔피언 전체 목록 다이얼로그 (판수순, op.gg식 상세 지표)
function InternalChampionsDialog({ open, onClose, champions, totalGames }) {
	const { classes } = useStyles();
	const list = champions || [];

	return (
		<Dialog open={open} onClose={onClose} classes={{ paper: classes.dialogPaper }}>
			<div className={classes.dialogTitle}>내전 챔피언 전체 보기</div>
			<div className={classes.dialogSubtitle}>
				{list.length}챔피언 · 수집 {totalGames}판 기준
			</div>
			<div className={classes.dialogContent}>
				<div className={classes.scrollX}>
					<table className={classes.table}>
						<thead>
							<tr>
								<th className={`${classes.th} ${classes.thChamp}`}>챔피언</th>
								<th className={classes.th}>판수</th>
								<th className={classes.th}>승률</th>
								<th className={classes.th}>KDA</th>
								<th className={classes.th}>평균 K / D / A</th>
								<th className={classes.th}>CS/분</th>
							</tr>
						</thead>
						<tbody>
							{list.map(c => {
								const name = c.championKoName || c.championName;
								const badges = getChampBadges(c, totalGames);
								return (
									<tr key={c.championId}>
										<td className={classes.td}>
											<div className={classes.champCell}>
												<img
													className={classes.champImg}
													src={getChampionIcon(c.championName)}
													alt={name}
													onError={e => {
														e.currentTarget.style.visibility = 'hidden';
													}}
												/>
												<span className={classes.champName} title={name}>
													{name}
												</span>
												{badges.map(b => (
													<span key={b.key} className={classes.badge} style={{ color: b.color }}>
														{b.label}
													</span>
												))}
											</div>
										</td>
										<td className={classes.td}>{c.games}</td>
										<td className={`${classes.td} ${c.winRate >= 50 ? classes.winHigh : ''}`}>{c.winRate}%</td>
										<td className={classes.td}>{typeof c.kda === 'number' ? c.kda.toFixed(2) : '-'}</td>
										<td className={classes.td}>
											<span className={classes.kdaDetail}>
												{c.kills} / {c.deaths} / {c.assists}
											</span>
										</td>
										<td className={classes.td}>{c.csPerMin != null ? c.csPerMin : '-'}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
			<div className={classes.dialogActions}>
				<Button className={classes.cancelBtn} onClick={onClose}>
					닫기
				</Button>
			</div>
		</Dialog>
	);
}

export default InternalChampionsDialog;
