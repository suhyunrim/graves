import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles()((theme) => ({
	root: {
		'& .logo-icon': {
			width: 28,
			height: 28,
			transition: theme.transitions.create(['width', 'height', 'filter'], {
				duration: theme.transitions.duration.shortest,
				easing: theme.transitions.easing.easeInOut
			}),
			filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.5))'
		},
		'& .logo-text': {
			transition: theme.transitions.create('opacity', {
				duration: theme.transitions.duration.shortest,
				easing: theme.transitions.easing.easeInOut
			})
		}
	},
	logoText: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.1em',
		textTransform: 'uppercase',
		textShadow: '0 0 15px rgba(0, 212, 255, 0.5)',
		marginLeft: 12
	}
}));

function Logo() {
	const { classes } = useStyles();

	return (
		<div className={clsx(classes.root, 'flex items-center')}>
			<img className="logo-icon" src="assets/images/logos/logo.png" alt="logo" />
			<Typography className={clsx(classes.logoText, 'logo-text')}>
				Graves
			</Typography>
		</div>
	);
}

export default Logo;
