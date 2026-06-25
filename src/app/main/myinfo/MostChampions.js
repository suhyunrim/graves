import React, { useState, useEffect } from 'react';
import { makeStyles } from 'tss-react/mui';
import { getChampionIcon, loadChampionNames } from 'app/main/challenge/ddragonUtils';
import PositionIcon from '../tournament/PositionIcon';

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
	// 헤더 (5) 자리에 들어가는 솔랭 메인/서브 포지션
	positionInfo: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 5,
		textTransform: 'none',
		letterSpacing: 'normal',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 400,
		fontSize: '1.2rem',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.05rem'
		}
	},
	positionIcon: {
		width: 16,
		height: 16,
		[theme.breakpoints.down('sm')]: {
			width: 14,
			height: 14
		}
	},
	positionKind: {
		color: 'rgba(255, 255, 255, 0.4)'
	},
	positionName: {
		color: 'rgba(255, 255, 255, 0.85)',
		fontWeight: 600
	},
	positionRate: {
		fontFamily: '"Rajdhani", sans-serif',
		fontWeight: 700,
		color: '#00d4ff'
	},
	positionDivider: {
		color: 'rgba(255, 255, 255, 0.25)',
		margin: '0 3px'
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

function MostChampions({ champions, mainPosition, mainPositionIcon, mainPositionRate, subPosition, subPositionIcon, subPositionRate }) {
	const { classes } = useStyles();
	const [names, setNames] = useState({});

	useEffect(() => {
		let alive = true;
		loadChampionNames().then(map => {
			if (alive) setNames(map);
		});
		return () => {
			alive = false;
		};
	}, []);

	const list = (champions || []).slice(0, 5);

	if (list.length === 0) {
		return null;
	}

	return (
		<div className={classes.root}>
			<div className={classes.header}>
				솔랭 모스트 챔피언
				{mainPosition ? (
					<span className={classes.positionInfo}>
						<span className={classes.positionKind}>메인</span>
						<PositionIcon
							position={mainPositionIcon}
							className={classes.positionIcon}
							fallbackClassName={classes.positionName}
						/>
						<span className={classes.positionName}>{mainPosition}</span>
						<span className={classes.positionRate}>{mainPositionRate}%</span>
						{subPosition && (
							<>
								<span className={classes.positionDivider}>·</span>
								<span className={classes.positionKind}>서브</span>
								<PositionIcon
									position={subPositionIcon}
									className={classes.positionIcon}
									fallbackClassName={classes.positionName}
								/>
								<span className={classes.positionName}>{subPosition}</span>
								<span className={classes.positionRate}>{subPositionRate}%</span>
							</>
						)}
					</span>
				) : (
					<span className={classes.count}>({list.length})</span>
				)}
			</div>
			<div className={classes.grid}>
				{list.map(c => {
					const wr = typeof c.winRate === 'number' ? c.winRate : 0;
					const wrColor = wr >= 50 ? '#00ff7f' : 'rgba(255, 255, 255, 0.55)';
					const name = names[c.championName] || c.championName;
					return (
						<div key={c.championName} className={classes.card}>
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
