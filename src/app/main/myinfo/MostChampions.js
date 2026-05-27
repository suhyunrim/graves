import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { getChampionIcon } from 'app/main/challenge/ddragonUtils';

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
	}
}));

function MostChampions({ champions }) {
	const { classes } = useStyles();
	const list = (champions || []).slice(0, 5);

	if (list.length === 0) {
		return null;
	}

	return (
		<div className={classes.root}>
			<div className={classes.header}>
				솔랭 모스트 챔피언
				<span className={classes.count}>({list.length})</span>
			</div>
			<div className={classes.grid}>
				{list.map(c => {
					const wr = typeof c.winRate === 'number' ? c.winRate : 0;
					const wrColor = wr >= 50 ? '#00ff7f' : 'rgba(255, 255, 255, 0.55)';
					return (
						<div key={c.championName} className={classes.card}>
							<img
								className={classes.champImg}
								src={getChampionIcon(c.championName)}
								alt={c.championName}
								onError={e => {
									e.currentTarget.style.visibility = 'hidden';
								}}
							/>
							<div className={classes.champName} title={c.championName}>
								{c.championName}
							</div>
							<div className={classes.stat}>
								{c.games}판 · 승률{' '}
								<span className={classes.winRate} style={{ color: wrColor }}>
									{wr}%
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default MostChampions;
