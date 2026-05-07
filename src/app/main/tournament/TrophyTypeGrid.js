import React from 'react';
import { makeStyles } from 'tss-react/mui';
import BlockIcon from '@mui/icons-material/Block';
import { TROPHY_TYPES, TROPHY_TYPE_ORDER } from './tournamentUtils';

const useStyles = makeStyles()((theme) => ({
	wrap: {
		marginBottom: 16
	},
	label: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginBottom: 8
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
		gap: 8,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
			gap: 6
		}
	},
	card: {
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.12)',
		borderRadius: 10,
		padding: 10,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		cursor: 'pointer',
		transition: 'border-color 0.15s ease, background 0.15s ease',
		userSelect: 'none',
		aspectRatio: '1 / 1',
		'&:hover': {
			borderColor: 'rgba(0, 212, 255, 0.4)',
			background: 'rgba(0, 212, 255, 0.06)'
		}
	},
	cardSelected: {
		borderColor: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.12)',
		boxShadow: '0 0 0 1px #00d4ff inset'
	},
	icon: {
		maxWidth: '100%',
		maxHeight: '100%',
		objectFit: 'contain'
	},
	noneIcon: {
		fontSize: '2.4rem',
		color: 'rgba(255, 255, 255, 0.35)'
	},
	helper: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginTop: 8
	}
}));

function TrophyTypeGrid({ value, onChange, label, helperText }) {
	const { classes, cx } = useStyles();

	return (
		<div className={classes.wrap}>
			{label && <div className={classes.label}>{label}</div>}
			<div className={classes.grid}>
				<div
					className={cx(classes.card, !value && classes.cardSelected)}
					onClick={() => onChange('')}
					role="button"
					tabIndex={0}
					title="미지정"
				>
					<BlockIcon className={classes.noneIcon} />
				</div>
				{TROPHY_TYPE_ORDER.map(t => {
					const trophy = TROPHY_TYPES[t];
					const selected = value === t;
					return (
						<div
							key={t}
							className={cx(classes.card, selected && classes.cardSelected)}
							onClick={() => onChange(t)}
							role="button"
							tabIndex={0}
							title={trophy.ko}
						>
							<img className={classes.icon} src={trophy.icon} alt={trophy.ko} />
						</div>
					);
				})}
			</div>
			{helperText && <div className={classes.helper}>{helperText}</div>}
		</div>
	);
}

export default TrophyTypeGrid;
