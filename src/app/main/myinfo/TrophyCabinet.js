import React from 'react';
import { makeStyles } from 'tss-react/mui';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Link } from 'react-router-dom';
import { getTrophyIcon } from 'app/main/tournament/tournamentUtils';

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
			background: 'linear-gradient(180deg, #ffd700, #ff8a00)'
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
		gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
		gap: 12,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
			gap: 10
		}
	},
	card: {
		background: 'rgba(255, 215, 0, 0.06)',
		border: '1px solid rgba(255, 215, 0, 0.25)',
		borderRadius: 12,
		padding: '14px 12px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 8,
		textDecoration: 'none',
		color: 'inherit',
		transition: 'border-color 0.2s ease, background 0.2s ease',
		'&:hover': {
			background: 'rgba(255, 215, 0, 0.12)',
			borderColor: 'rgba(255, 215, 0, 0.5)'
		}
	},
	trophyImg: {
		width: 56,
		height: 56,
		objectFit: 'contain',
		filter: 'drop-shadow(0 4px 10px rgba(255, 215, 0, 0.3))',
		[theme.breakpoints.down('sm')]: {
			width: 44,
			height: 44
		}
	},
	trophyFallback: {
		fontSize: '3.4rem',
		color: '#ffd700',
		filter: 'drop-shadow(0 4px 10px rgba(255, 215, 0, 0.3))',
		[theme.breakpoints.down('sm')]: {
			fontSize: '2.6rem'
		}
	},
	tournamentName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.85)',
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
	teamName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.5)',
		textAlign: 'center'
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		padding: 24
	}
}));

function TrophyCabinet({ championships }) {
	const { classes } = useStyles();
	const list = championships || [];

	return (
		<div className={classes.root}>
			<div className={classes.header}>
				<span role="img" aria-label="trophy">🏆</span>
				트로피 캐비닛
				{list.length > 0 && <span className={classes.count}>({list.length})</span>}
			</div>
			{list.length === 0 ? (
				<div className={classes.emptyText}>아직 우승한 토너먼트가 없습니다.</div>
			) : (
				<div className={classes.grid}>
					{list.map(t => {
						const trophyIcon = getTrophyIcon(t.trophyType);
						return (
							<Link
								key={t.tournamentId}
								to={`/tournament/${t.tournamentId}`}
								className={classes.card}
							>
								{trophyIcon ? (
									<img className={classes.trophyImg} src={trophyIcon} alt="" />
								) : (
									<EmojiEventsIcon className={classes.trophyFallback} />
								)}
								<div className={classes.tournamentName} title={t.tournamentName}>
									{t.tournamentName}
								</div>
								{t.teamName && <div className={classes.teamName}>{t.teamName}</div>}
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default TrophyCabinet;
