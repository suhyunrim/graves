import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useInView } from 'react-intersection-observer';

const FEATURES = [
	{
		emoji: '\uD83C\uDFC6',
		emojiLabel: 'trophy',
		title: 'Dashboard',
		subtitle: '\uC6D4\uAC04 \uC5B4\uC6CC\uB4DC',
		description:
			'\uB9E4\uB2EC \uCD5C\uACE0\uC758 \uD50C\uB808\uC774\uC5B4\uB97C \uC120\uC815\uD569\uB2C8\uB2E4. \uBA85\uC608\uC655, \uCD5C\uB2E4\uD310\uC218, \uCD5C\uACE0\uC2B9\uB960, \uC5F0\uC2B9\uC655, \uBCA0\uC2A4\uD2B8\uB4C0\uC624, \uB77C\uC774\uBC8C, \uC2E0\uC778\uC655, \uAE09\uB4F1\uC655, \uC62C\uBE7C\uBBF8, \uB2E4\uD06C\uD638\uC2A4 \uB4F1 10\uAC00\uC9C0 \uBD80\uBB38\uC758 \uC5B4\uC6CC\uB4DC\uB97C \uD655\uC778\uD558\uC138\uC694.',
		image: '/assets/images/about/dashboard.png',
		accent: '#FFD700'
	},
	{
		emoji: '\uD83D\uDCCA',
		emojiLabel: 'chart',
		title: 'Ranking',
		subtitle: '\uB808\uC774\uD305 & \uD2F0\uC5B4',
		description:
			'\uB0B4\uC804 \uACBD\uAE30 \uACB0\uACFC\uB97C \uBC14\uD0D5\uC73C\uB85C \uB808\uC774\uD305\uC744 \uC0B0\uCD9C\uD558\uACE0, \uC544\uC774\uC5B8\uBD80\uD130 \uCC4C\uB9B0\uC800\uAE4C\uC9C0 LoL \uD2F0\uC5B4 \uC2DC\uC2A4\uD15C\uC73C\uB85C \uBCC0\uD658\uD569\uB2C8\uB2E4. \uC2B9\uB960, \uC804\uC801, LP\uAE4C\uC9C0 \uD55C\uB208\uC5D0.',
		image: '/assets/images/about/ranking.png',
		accent: '#00d4ff'
	},
	{
		emoji: '\uD83D\uDE4E',
		emojiLabel: 'person',
		title: 'MyInfo',
		subtitle: '\uAC1C\uC778 \uD504\uB85C\uD544',
		description:
			'\uC194\uB85C\uB7AD\uD06C\uC640 \uB0B4\uC804 \uD2F0\uC5B4\uB97C \uB098\uB780\uD788 \uBE44\uAD50\uD558\uACE0, \uB808\uC774\uD305 \uBCC0\uD654 \uCC28\uD2B8\uB85C \uC131\uC7A5 \uCD94\uC774\uB97C \uD655\uC778\uD558\uC138\uC694. \uCD5C\uADFC \uC804\uC801, \uBCA0\uC2A4\uD2B8 \uD300\uC6D0/\uC0C1\uB300 \uD1B5\uACC4\uAE4C\uC9C0.',
		image: '/assets/images/about/myinfo.png',
		accent: '#50C878'
	},
	{
		emoji: '\u2694\uFE0F',
		emojiLabel: 'swords',
		title: 'Match History',
		subtitle: '\uACBD\uAE30 \uAE30\uB85D',
		description:
			'\uBAA8\uB4E0 \uB0B4\uC804 \uACBD\uAE30\uC758 \uC0C1\uC138 \uAE30\uB85D\uC744 \uC870\uD68C\uD558\uC138\uC694. \uD300 \uAD6C\uC131, \uC2B9\uD328 \uACB0\uACFC, \uB808\uC774\uD305 \uBCC0\uB3D9\uC744 \uD655\uC778\uD558\uACE0 MVP \uD22C\uD45C\uB85C \uD65C\uC57D\uD55C \uD50C\uB808\uC774\uC5B4\uB97C \uC120\uC815\uD558\uC138\uC694.',
		image: '/assets/images/about/match-history.png',
		accent: '#E74C3C'
	},
	{
		emoji: '\uD83D\uDEA9',
		emojiLabel: 'flag',
		title: 'Challenge',
		subtitle: '\uB0B4\uC804 \uB300\uD68C',
		description:
			'\uC9C1\uC811 \uB300\uD68C\uB97C \uB9CC\uB4E4\uACE0 \uCC38\uC5EC\uD558\uC138\uC694. 1v1\uBD80\uD130 5v5\uAE4C\uC9C0 \uB2E4\uC591\uD55C \uD615\uC2DD\uC744 \uC9C0\uC6D0\uD558\uBA70, \uB3C5\uB9BD \uB9AC\uB354\uBCF4\uB4DC\uC640 \uC2B9\uD328 \uAE30\uB85D\uC73C\uB85C \uACBD\uC7C1\uD558\uC138\uC694.',
		image: '/assets/images/about/challenge.png',
		accent: '#9B59B6'
	},
	{
		emoji: '\u2B50',
		emojiLabel: 'star',
		title: 'Achievement',
		subtitle: '\uC5C5\uC801 \uC2DC\uC2A4\uD15C',
		description:
			'\uB9E4\uCE58, \uD310\uC218, \uC5F0\uC2B9, \uC5F0\uD328, \uD2F0\uC5B4, \uBCF4\uC774\uC2A4, \uCC4C\uB9B0\uC9C0, \uC5B8\uB354\uB3C5, \uC57C\uC2DD \uB4F1 9\uAC1C \uCE74\uD14C\uACE0\uB9AC\uC758 \uC5C5\uC801. \uBE0C\uB860\uC988\uBD80\uD130 \uCC4C\uB9B0\uC800\uAE4C\uC9C0 \uB09C\uC774\uB3C4\uBCC4 \uB4F1\uAE09\uC774 \uBD80\uC5EC\uB429\uB2C8\uB2E4.',
		image: '/assets/images/about/achievement.png',
		accent: '#F1C40F'
	},
	{
		emoji: '\uD83C\uDF1F',
		emojiLabel: 'glowing star',
		title: 'Honor',
		subtitle: '\uBA85\uC608 \uC2DC\uC2A4\uD15C',
		description:
			'\uD568\uAED8 \uD50C\uB808\uC774\uD55C \uD300\uC6D0\uC5D0\uAC8C \uBA85\uC608 \uD22C\uD45C\uB85C \uAC10\uC0AC\uB97C \uC804\uD558\uC138\uC694. \uB204\uC801\uB41C \uBA85\uC608 \uD3EC\uC778\uD2B8\uB85C \uB7AD\uD0B9\uC774 \uB9E4\uACA8\uC9C0\uBA70, \uD2B9\uBCC4\uD55C \uCE6D\uD638\uB3C4 \uBD80\uC5EC\uB429\uB2C8\uB2E4.',
		image: '/assets/images/about/honor.png',
		accent: '#FF69B4'
	}
];

function FadeInSection({ children, delay }) {
	const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });
	return (
		<div
			ref={ref}
			style={{
				opacity: inView ? 1 : 0,
				transform: inView ? 'translateY(0)' : 'translateY(40px)',
				transition: `opacity 0.7s ease ${delay || 0}s, transform 0.7s ease ${delay || 0}s`
			}}
		>
			{children}
		</div>
	);
}

const useStyles = makeStyles(theme => ({
	root: {
		background: '#0a0a12',
		minHeight: '100vh',
		position: 'relative',
		overflowX: 'hidden',
		color: '#fff'
	},
	/* Hero */
	hero: {
		position: 'relative',
		textAlign: 'center',
		padding: '120px 28px 80px',
		overflow: 'hidden',
		'&::before': {
			content: '""',
			position: 'absolute',
			top: '-50%',
			left: '50%',
			transform: 'translateX(-50%)',
			width: '140%',
			height: '100%',
			background: 'radial-gradient(ellipse, rgba(0, 212, 255, 0.12) 0%, transparent 60%)',
			pointerEvents: 'none'
		},
		[theme.breakpoints.down('xs')]: {
			padding: '80px 16px 48px'
		}
	},
	heroLogo: {
		width: 100,
		height: 100,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '3px solid rgba(0, 212, 255, 0.4)',
		boxShadow: '0 0 40px rgba(0, 212, 255, 0.3)',
		marginBottom: 28,
		[theme.breakpoints.down('xs')]: {
			width: 72,
			height: 72
		}
	},
	heroTitle: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '6rem',
		fontWeight: 700,
		letterSpacing: '0.3em',
		textShadow: '0 0 60px rgba(0, 212, 255, 0.4)',
		margin: 0,
		lineHeight: 1,
		[theme.breakpoints.down('sm')]: {
			fontSize: '4rem'
		},
		[theme.breakpoints.down('xs')]: {
			fontSize: '2.8rem',
			letterSpacing: '0.15em'
		}
	},
	heroSub: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255,255,255,0.45)',
		marginTop: 16,
		letterSpacing: '0.06em',
		[theme.breakpoints.down('xs')]: {
			fontSize: '1.2rem'
		}
	},
	heroDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255,255,255,0.35)',
		maxWidth: 560,
		margin: '24px auto 0',
		lineHeight: 1.8,
		[theme.breakpoints.down('xs')]: {
			fontSize: '1.15rem'
		}
	},
	heroDivider: {
		width: 60,
		height: 2,
		background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
		margin: '32px auto',
		borderRadius: 1
	},
	heroScreenshot: {
		maxWidth: 900,
		width: '90%',
		margin: '48px auto 0',
		borderRadius: 16,
		border: '1px solid rgba(255,255,255,0.08)',
		boxShadow: '0 20px 80px rgba(0, 212, 255, 0.15), 0 8px 32px rgba(0,0,0,0.6)',
		transform: 'perspective(1200px) rotateX(4deg)',
		[theme.breakpoints.down('xs')]: {
			borderRadius: 10,
			transform: 'none'
		}
	},
	/* Feature Section */
	featureSection: {
		maxWidth: 1100,
		margin: '0 auto',
		padding: '0 28px',
		[theme.breakpoints.down('xs')]: {
			padding: '0 16px'
		}
	},
	featureRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 60,
		padding: '80px 0',
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column !important',
			gap: 32,
			padding: '48px 0'
		}
	},
	featureRowReverse: {
		flexDirection: 'row-reverse'
	},
	featureText: {
		flex: 1,
		minWidth: 0
	},
	featureLabel: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 8,
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700,
		letterSpacing: '0.08em',
		textTransform: 'uppercase',
		marginBottom: 12
	},
	featureLabelEmoji: {
		fontSize: '1.6rem'
	},
	featureTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		lineHeight: 1.3,
		marginBottom: 16,
		[theme.breakpoints.down('xs')]: {
			fontSize: '1.8rem'
		}
	},
	featureDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.35rem',
		color: 'rgba(255,255,255,0.55)',
		lineHeight: 1.8,
		[theme.breakpoints.down('xs')]: {
			fontSize: '1.2rem'
		}
	},
	featureImageWrap: {
		flex: 1.2,
		minWidth: 0
	},
	featureImage: {
		width: '100%',
		borderRadius: 14,
		border: '1px solid rgba(255,255,255,0.08)',
		boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
		transition: 'transform 0.4s ease, box-shadow 0.4s ease',
		'&:hover': {
			transform: 'scale(1.02)',
			boxShadow: '0 12px 50px rgba(0,0,0,0.6)'
		}
	},
	/* Divider between sections */
	sectionDivider: {
		width: 1,
		height: 60,
		background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent)',
		margin: '0 auto'
	},
	/* CTA */
	cta: {
		textAlign: 'center',
		padding: '80px 28px 100px',
		position: 'relative',
		'&::before': {
			content: '""',
			position: 'absolute',
			bottom: 0,
			left: '50%',
			transform: 'translateX(-50%)',
			width: '120%',
			height: '60%',
			background: 'radial-gradient(ellipse, rgba(0, 212, 255, 0.06) 0%, transparent 60%)',
			pointerEvents: 'none'
		}
	},
	ctaTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		marginBottom: 12,
		[theme.breakpoints.down('xs')]: {
			fontSize: '1.8rem'
		}
	},
	ctaSub: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255,255,255,0.4)',
		marginBottom: 36
	},
	ctaButton: {
		display: 'inline-block',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		letterSpacing: '0.1em',
		textTransform: 'uppercase',
		color: '#000',
		background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
		padding: '16px 48px',
		borderRadius: 12,
		textDecoration: 'none',
		boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
		transition: 'transform 0.2s ease, box-shadow 0.2s ease',
		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: '0 8px 30px rgba(0, 212, 255, 0.5)'
		},
		[theme.breakpoints.down('xs')]: {
			fontSize: '1.3rem',
			padding: '14px 36px'
		}
	},
	footer: {
		textAlign: 'center',
		padding: '24px 0',
		borderTop: '1px solid rgba(255,255,255,0.04)'
	},
	footerText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255,255,255,0.2)'
	}
}));

function AboutContent() {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			{/* Hero */}
			<div className={classes.hero}>
				<FadeInSection>
					<img className={classes.heroLogo} src="/assets/images/graves.jpg" alt="Graves" />
					<h1 className={classes.heroTitle}>GRAVES</h1>
					<div className={classes.heroSub}>LoL \uB0B4\uC804 \uD1B5\uACC4 & \uB7AD\uD0B9 \uB300\uC2DC\uBCF4\uB4DC</div>
					<div className={classes.heroDivider} />
					<div className={classes.heroDesc}>
						\uADF8\uB8F9 \uB0B4 LoL \uB0B4\uC804 \uACBD\uAE30\uB97C \uCD94\uC801\uD558\uACE0, \uB808\uC774\uD305
						\uC2DC\uC2A4\uD15C\uC73C\uB85C \uC2E4\uB825\uC744 \uCE21\uC815\uD558\uBA70, \uB2E4\uC591\uD55C
						\uC5C5\uC801\uACFC \uC5B4\uC6CC\uB4DC\uB85C \uB0B4\uC804\uC744 \uB354\uC6B1 \uC990\uAC81\uAC8C
						\uB9CC\uB4E4\uC5B4\uC8FC\uB294 \uD1B5\uACC4 \uB300\uC2DC\uBCF4\uB4DC\uC785\uB2C8\uB2E4.
					</div>
				</FadeInSection>
				<FadeInSection delay={0.3}>
					<img className={classes.heroScreenshot} src="/assets/images/about/dashboard.png" alt="Dashboard Preview" />
				</FadeInSection>
			</div>

			{/* Feature Sections */}
			<div className={classes.featureSection}>
				{FEATURES.map((feature, idx) => (
					<React.Fragment key={feature.title}>
						{idx > 0 && <div className={classes.sectionDivider} />}
						<FadeInSection>
							<div className={`${classes.featureRow} ${idx % 2 === 1 ? classes.featureRowReverse : ''}`}>
								<div className={classes.featureText}>
									<div className={classes.featureLabel} style={{ color: feature.accent }}>
										<span role="img" aria-label={feature.emojiLabel} className={classes.featureLabelEmoji}>
											{feature.emoji}
										</span>
										{feature.title}
									</div>
									<div className={classes.featureTitle}>{feature.subtitle}</div>
									<div className={classes.featureDesc}>{feature.description}</div>
								</div>
								<div className={classes.featureImageWrap}>
									<img className={classes.featureImage} src={feature.image} alt={feature.title} />
								</div>
							</div>
						</FadeInSection>
					</React.Fragment>
				))}
			</div>

			{/* CTA */}
			<FadeInSection>
				<div className={classes.cta}>
					<div className={classes.ctaTitle}>\uC9C0\uAE08 \uC2DC\uC791\uD558\uC138\uC694</div>
					<div className={classes.ctaSub}>
						\uB0B4\uC804 \uAE30\uB85D\uC744 \uCD94\uC801\uD558\uACE0, \uD300\uC6D0\uB4E4\uACFC
						\uACBD\uC7C1\uD558\uC138\uC694
					</div>
					<a href="/login" className={classes.ctaButton}>
						Login
					</a>
				</div>
			</FadeInSection>

			<div className={classes.footer}>
				<div className={classes.footerText}>Built for competitive communities</div>
			</div>
		</div>
	);
}

export default AboutContent;
