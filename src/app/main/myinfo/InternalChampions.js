import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { getChampionIcon } from 'app/main/challenge/ddragonUtils';
import InternalChampionsDialog from './InternalChampionsDialog';
import { getChampBadges } from './championBadges';

const useStyles = makeStyles()((theme) => ({
	root: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 16,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		padding: '20px 24px',
		[theme.breakpoints.down('sm')]: {
			padding: '16px 18px',
			borderRadius: 14
		}
	},
	header: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.04em',
		textTransform: 'uppercase',
		display: 'flex',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 12,
		marginBottom: 16,
		'&::before': {
			content: '""',
			display: 'inline-block',
			width: 4,
			height: 20,
			borderRadius: 2,
			background: 'linear-gradient(180deg, #00d4ff, #0066ff)'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.4rem'
		}
	},
	count: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.5)',
		fontWeight: 400
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
		gap: 12,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))',
			gap: 10
		}
	},
	card: {
		background: 'rgba(0, 212, 255, 0.06)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		borderRadius: 12,
		padding: '14px 12px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 8
	},
	champImg: {
		width: 56,
		height: 56,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '2px solid rgba(0, 212, 255, 0.3)',
		boxShadow: '0 4px 10px rgba(0, 212, 255, 0.15)',
		[theme.breakpoints.down('sm')]: {
			width: 44,
			height: 44
		}
	},
	champName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.9)',
		textAlign: 'center',
		minWidth: 0,
		maxWidth: '100%',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.05rem'
		}
	},
	stat: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.5)',
		textAlign: 'center'
	},
	winRate: {
		fontWeight: 600
	},
	kdaRow: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 2
	},
	kdaValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 700,
		color: '#00d4ff'
	},
	kdaDetail: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.92rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	showAllBtn: {
		marginLeft: 'auto',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.55)',
		background: 'rgba(255, 255, 255, 0.04)',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		borderRadius: 8,
		padding: '4px 14px',
		cursor: 'pointer',
		textTransform: 'none',
		letterSpacing: 'normal',
		transition: 'all 0.2s ease',
		'&:hover': {
			color: '#00d4ff',
			borderColor: 'rgba(0, 212, 255, 0.4)',
			background: 'rgba(0, 212, 255, 0.08)'
		}
	},
	badgeRow: {
		display: 'flex',
		gap: 4
	},
	badge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.85rem',
		fontWeight: 700,
		padding: '1px 6px',
		borderRadius: 6,
		border: '1px solid currentColor'
	}
}));

// 내전 상세(헬퍼 수집) 기반 모스트 챔피언. 솔랭 MostChampions와 달리 포지션 정보 없이
// KDA를 함께 노출한다. championKoName은 API가 직접 제공하므로 별도 한글명 로드가 필요 없다.
function InternalChampions({ champions, totalGames }) {
	const { classes } = useStyles();
	const [dialogOpen, setDialogOpen] = useState(false);
	const all = champions || [];
	const list = all.slice(0, 5);

	if (list.length === 0) {
		return null;
	}

	return (
		<div className={classes.root}>
			<div className={classes.header}>
				내전 모스트 챔피언
				<span className={classes.count}>(수집 {totalGames}판)</span>
				{all.length > 5 && (
					<button type="button" className={classes.showAllBtn} onClick={() => setDialogOpen(true)}>
						전체 보기 ({all.length})
					</button>
				)}
			</div>
			<div className={classes.grid}>
				{list.map(c => {
					const wr = typeof c.winRate === 'number' ? c.winRate : 0;
					const wrColor = wr >= 50 ? '#00ff7f' : 'rgba(255, 255, 255, 0.55)';
					const kda = typeof c.kda === 'number' ? c.kda.toFixed(2) : '-';
					const name = c.championKoName || c.championName;
					const badges = getChampBadges(c, totalGames);
					return (
						<div key={c.championId} className={classes.card}>
							<img
								className={classes.champImg}
								src={getChampionIcon(c.championName)}
								alt={name}
								onError={e => {
									e.currentTarget.style.visibility = 'hidden';
								}}
							/>
							<div className={classes.champName} title={name}>
								{name}
							</div>
							{badges.length > 0 && (
								<div className={classes.badgeRow}>
									{badges.map(b => (
										<span key={b.key} className={classes.badge} style={{ color: b.color }}>
											{b.label}
										</span>
									))}
								</div>
							)}
							<div className={classes.stat}>
								{c.games}판 · 승률{' '}
								<span className={classes.winRate} style={{ color: wrColor }}>
									{wr}%
								</span>
							</div>
							<div className={classes.kdaRow}>
								<span className={classes.kdaValue}>{kda} KDA</span>
								<span className={classes.kdaDetail}>
									{c.kills} / {c.deaths} / {c.assists}
								</span>
							</div>
						</div>
					);
				})}
			</div>
			<InternalChampionsDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				champions={all}
				totalGames={totalGames}
			/>
		</div>
	);
}

export default InternalChampions;
