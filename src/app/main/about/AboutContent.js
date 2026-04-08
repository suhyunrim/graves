import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const FEATURES = [
	{
		emoji: '\uD83C\uDFC6',
		emojiLabel: 'trophy',
		title: 'Dashboard',
		subtitle: '\uC6D4\uAC04 \uC5B4\uC6CC\uB4DC',
		description:
			'\uB9E4\uB2EC \uCD5C\uACE0\uC758 \uD50C\uB808\uC774\uC5B4\uB97C \uC120\uC815\uD569\uB2C8\uB2E4. \uBA85\uC608\uC655, \uCD5C\uB2E4\uD310\uC218, \uCD5C\uACE0\uC2B9\uB960, \uC5F0\uC2B9\uC655, \uBCA0\uC2A4\uD2B8\uB4C0\uC624, \uB77C\uC774\uBC8C, \uC2E0\uC778\uC655, \uAE09\uB4F1\uC655, \uC62C\uBE7C\uBBF8, \uB2E4\uD06C\uD638\uC2A4 \uB4F1 \uB2E4\uC591\uD55C \uBD80\uBB38\uC758 \uC5B4\uC6CC\uB4DC\uB97C \uD655\uC778\uD558\uC138\uC694.',
		accent: '#FFD700'
	},
	{
		emoji: '\uD83D\uDCCA',
		emojiLabel: 'chart',
		title: 'Ranking',
		subtitle: '\uB808\uC774\uD305 & \uD2F0\uC5B4',
		description:
			'\uB0B4\uC804 \uACBD\uAE30 \uACB0\uACFC\uB97C \uBC14\uD0D5\uC73C\uB85C \uB808\uC774\uD305\uC744 \uC0B0\uCD9C\uD558\uACE0, \uC544\uC774\uC5B8\uBD80\uD130 \uCC4C\uB9B0\uC800\uAE4C\uC9C0 LoL \uD2F0\uC5B4 \uC2DC\uC2A4\uD15C\uC73C\uB85C \uBCC0\uD658\uD569\uB2C8\uB2E4. \uC2B9\uB960, \uC804\uC801, LP\uAE4C\uC9C0 \uD55C\uB208\uC5D0 \uD655\uC778\uD558\uC138\uC694.',
		accent: '#00d4ff'
	},
	{
		emoji: '\uD83D\uDE4E',
		emojiLabel: 'person',
		title: 'MyInfo',
		subtitle: '\uAC1C\uC778 \uD504\uB85C\uD544',
		description:
			'\uC194\uB85C\uB7AD\uD06C\uC640 \uB0B4\uC804 \uD2F0\uC5B4\uB97C \uB098\uB780\uD788 \uBE44\uAD50\uD558\uACE0, \uB808\uC774\uD305 \uBCC0\uD654 \uCC28\uD2B8\uB85C \uC131\uC7A5 \uCD94\uC774\uB97C \uD655\uC778\uD558\uC138\uC694. \uCD5C\uADFC \uC804\uC801, \uBCA0\uC2A4\uD2B8 \uD300\uC6D0/\uC0C1\uB300 \uD1B5\uACC4\uAE4C\uC9C0 \uC81C\uACF5\uD569\uB2C8\uB2E4.',
		accent: '#50C878'
	},
	{
		emoji: '\u2694\uFE0F',
		emojiLabel: 'swords',
		title: 'Match History',
		subtitle: '\uACBD\uAE30 \uAE30\uB85D',
		description:
			'\uBAA8\uB4E0 \uB0B4\uC804 \uACBD\uAE30\uC758 \uC0C1\uC138 \uAE30\uB85D\uC744 \uC870\uD68C\uD558\uC138\uC694. \uD300 \uAD6C\uC131, \uC2B9\uD328 \uACB0\uACFC, \uB808\uC774\uD305 \uBCC0\uB3D9\uC744 \uD655\uC778\uD558\uACE0 MVP \uD22C\uD45C\uB85C \uD65C\uC57D\uD55C \uD50C\uB808\uC774\uC5B4\uB97C \uC120\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
		accent: '#E74C3C'
	},
	{
		emoji: '\uD83D\uDEA9',
		emojiLabel: 'flag',
		title: 'Challenge',
		subtitle: '\uB0B4\uC804 \uB300\uD68C',
		description:
			'\uC9C1\uC811 \uB300\uD68C\uB97C \uB9CC\uB4E4\uACE0 \uCC38\uC5EC\uD558\uC138\uC694. 1v1\uBD80\uD130 5v5\uAE4C\uC9C0 \uB2E4\uC591\uD55C \uD615\uC2DD\uC744 \uC9C0\uC6D0\uD558\uBA70, \uB3C5\uB9BD\uB41C \uB9AC\uB354\uBCF4\uB4DC\uC640 \uC2B9\uD328 \uAE30\uB85D\uC73C\uB85C \uACBD\uC7C1\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
		accent: '#9B59B6'
	},
	{
		emoji: '\u2B50',
		emojiLabel: 'star',
		title: 'Achievement',
		subtitle: '\uC5C5\uC801 \uC2DC\uC2A4\uD15C',
		description:
			'\uB9E4\uCE58, \uD310\uC218, \uC5F0\uC2B9, \uC5F0\uD328, \uD2F0\uC5B4, \uBCF4\uC774\uC2A4, \uCC4C\uB9B0\uC9C0, \uC5B8\uB354\uB3C5, \uC57C\uC2DD \uB4F1 \uB2E4\uC591\uD55C \uCE74\uD14C\uACE0\uB9AC\uC758 \uC5C5\uC801\uC744 \uB2EC\uC131\uD558\uC138\uC694. \uBE0C\uB860\uC988\uBD80\uD130 \uCC4C\uB9B0\uC800\uAE4C\uC9C0 \uB09C\uC774\uB3C4\uBCC4 \uB4F1\uAE09\uC774 \uBD80\uC5EC\uB429\uB2C8\uB2E4.',
		accent: '#F1C40F'
	},
	{
		emoji: '\uD83C\uDF1F',
		emojiLabel: 'glowing star',
		title: 'Honor',
		subtitle: '\uBA85\uC608 \uC2DC\uC2A4\uD15C',
		description:
			'\uD568\uAED8 \uD50C\uB808\uC774\uD55C \uD300\uC6D0\uC5D0\uAC8C \uBA85\uC608 \uD22C\uD45C\uB85C \uAC10\uC0AC\uB97C \uC804\uD558\uC138\uC694. \uB204\uC801\uB41C \uBA85\uC608 \uD3EC\uC778\uD2B8\uB85C \uB7AD\uD0B9\uC774 \uB9E4\uACA8\uC9C0\uBA70, \uD2B9\uBCC4\uD55C \uCE6D\uD638\uB3C4 \uBD80\uC5EC\uB429\uB2C8\uB2E4.',
		accent: '#FF69B4'
	}
];

const useStyles = makeStyles(theme => ({
	container: {
		maxWidth: 1200,
		margin: '0 auto',
		padding: '0 28px 60px',
		[theme.breakpoints.down('xs')]: {
			padding: '0 16px 40px'
		}
	},
	hero: {
		textAlign: 'center',
		padding: '80px 0 60px',
		position: 'relative',
		[theme.breakpoints.down('xs')]: {
			padding: '48px 0 40px'
		}
	},
	heroTitle: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '7rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.25em',
		textShadow: '0 0 40px rgba(0, 212, 255, 0.5), 0 0 80px rgba(0, 212, 255, 0.2)',
		margin: 0,
		lineHeight: 1,
		[theme.breakpoints.down('sm')]: {
			fontSize: '4.5rem'
		},
		[theme.breakpoints.down('xs')]: {
			fontSize: '3.2rem',
			letterSpacing: '0.15em'
		}
	},
	heroSubtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginTop: 16,
		letterSpacing: '0.08em',
		[theme.breakpoints.down('xs')]: {
			fontSize: '1.3rem'
		}
	},
	heroDivider: {
		width: 80,
		height: 3,
		background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
		margin: '28px auto 0',
		borderRadius: 2
	},
	heroDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginTop: 24,
		maxWidth: 600,
		marginLeft: 'auto',
		marginRight: 'auto',
		lineHeight: 1.7,
		[theme.breakpoints.down('xs')]: {
			fontSize: '1.2rem'
		}
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(2, 1fr)',
		gap: 24,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr',
			gap: 16
		}
	},
	card: {
		position: 'relative',
		borderRadius: 20,
		padding: 32,
		background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(15, 15, 26, 0.9) 100%)',
		border: '1px solid rgba(255, 255, 255, 0.06)',
		overflow: 'hidden',
		transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
		'&:hover': {
			transform: 'translateY(-4px)',
			borderColor: 'rgba(0, 212, 255, 0.3)',
			boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
		},
		[theme.breakpoints.down('xs')]: {
			padding: 20,
			borderRadius: 16
		}
	},
	cardGlow: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 3,
		borderRadius: '20px 20px 0 0'
	},
	cardHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		marginBottom: 16
	},
	cardEmoji: {
		fontSize: '2.8rem',
		lineHeight: 1,
		width: 52,
		height: 52,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 14,
		background: 'rgba(0, 0, 0, 0.3)',
		flexShrink: 0
	},
	cardTitleWrap: {
		flex: 1,
		minWidth: 0
	},
	cardTitle: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '2rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.05em',
		lineHeight: 1.2
	},
	cardSubtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginTop: 2
	},
	cardDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.6)',
		lineHeight: 1.8,
		[theme.breakpoints.down('xs')]: {
			fontSize: '1.2rem'
		}
	},
	footer: {
		textAlign: 'center',
		marginTop: 60,
		padding: '32px 0',
		borderTop: '1px solid rgba(255, 255, 255, 0.06)'
	},
	footerText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.3)'
	}
}));

function AboutContent() {
	const classes = useStyles();

	return (
		<div className={classes.container}>
			<div className={classes.hero}>
				<h1 className={classes.heroTitle}>GRAVES</h1>
				<div className={classes.heroSubtitle}>
					LoL \uB0B4\uC804 \uD1B5\uACC4 & \uB7AD\uD0B9 \uB300\uC2DC\uBCF4\uB4DC
				</div>
				<div className={classes.heroDivider} />
				<div className={classes.heroDesc}>
					\uADF8\uB8F9 \uB0B4 LoL \uB0B4\uC804 \uACBD\uAE30\uB97C \uCD94\uC801\uD558\uACE0, \uB808\uC774\uD305
					\uC2DC\uC2A4\uD15C\uC73C\uB85C \uC2E4\uB825\uC744 \uCE21\uC815\uD558\uBA70, \uB2E4\uC591\uD55C
					\uC5C5\uC801\uACFC \uC5B4\uC6CC\uB4DC\uB85C \uB0B4\uC804\uC744 \uB354\uC6B1 \uC990\uAC81\uAC8C
					\uB9CC\uB4E4\uC5B4\uC8FC\uB294 \uD1B5\uACC4 \uB300\uC2DC\uBCF4\uB4DC\uC785\uB2C8\uB2E4.
				</div>
			</div>

			<div className={classes.grid}>
				{FEATURES.map(feature => (
					<div key={feature.title} className={classes.card}>
						<div
							className={classes.cardGlow}
							style={{ background: `linear-gradient(90deg, transparent, ${feature.accent}, transparent)` }}
						/>
						<div className={classes.cardHeader}>
							<div className={classes.cardEmoji}>
								<span role="img" aria-label={feature.emojiLabel}>
									{feature.emoji}
								</span>
							</div>
							<div className={classes.cardTitleWrap}>
								<div className={classes.cardTitle} style={{ color: feature.accent }}>
									{feature.title}
								</div>
								<div className={classes.cardSubtitle}>{feature.subtitle}</div>
							</div>
						</div>
						<div className={classes.cardDesc}>{feature.description}</div>
					</div>
				))}
			</div>

			<div className={classes.footer}>
				<div className={classes.footerText}>Built for competitive communities</div>
			</div>
		</div>
	);
}

export default AboutContent;
