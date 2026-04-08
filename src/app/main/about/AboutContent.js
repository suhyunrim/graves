import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useInView } from 'react-intersection-observer';

const FEATURES = [
	{
		emoji: '🏆',
		emojiLabel: 'trophy',
		title: 'Dashboard',
		subtitle: '월간 어워드',
		description:
			'매달 최고의 플레이어를 선정합니다. 명예왕, 최다판수, 최고승률, 연승왕, 베스트듀오, 라이벌, 신인왕, 급등왕, 올빼미, 다크호스 등 10가지 부문의 어워드를 확인하세요.',
		image: '/assets/images/about/dashboard.png',
		video: '/assets/images/about/dashboard.webm',
		accent: '#FFD700'
	},
	{
		emoji: '📊',
		emojiLabel: 'chart',
		title: 'Ranking',
		subtitle: '레이팅 & 티어',
		description:
			'내전 경기 결과를 바탕으로 레이팅을 산출하고, 아이언부터 챌린저까지 LoL 티어 시스템으로 변환합니다. 승률, 전적, LP까지 한눈에 확인하세요.',
		image: '/assets/images/about/ranking.png',
		video: '/assets/images/about/ranking.webm',
		accent: '#00d4ff'
	},
	{
		emoji: '🙎',
		emojiLabel: 'person',
		title: 'MyInfo',
		subtitle: '개인 프로필',
		description:
			'솔로랭크와 내전 티어를 나란히 비교하고, 레이팅 변화 차트로 성장 추이를 확인하세요. 최근 전적, 베스트 팀원/상대 통계까지 제공합니다.',
		image: '/assets/images/about/myinfo.png',
		video: '/assets/images/about/myinfo.webm',
		accent: '#50C878'
	},
	{
		emoji: '⚔️',
		emojiLabel: 'swords',
		title: 'Match History',
		subtitle: '경기 기록',
		description:
			'모든 내전 경기의 상세 기록을 조회하세요. 팀 구성, 승패 결과, 레이팅 변동을 확인하고 MVP 투표로 활약한 플레이어를 선정하세요.',
		image: '/assets/images/about/match-history.png',
		video: '/assets/images/about/match-history.webm',
		accent: '#E74C3C'
	},
	{
		emoji: '🚩',
		emojiLabel: 'flag',
		title: 'Challenge',
		subtitle: '내전 대회',
		description:
			'직접 대회를 만들고 참여하세요. 1v1부터 5v5까지 다양한 형식을 지원하며, 독립 리더보드와 승패 기록으로 경쟁하세요.',
		image: '/assets/images/about/challenge.png',
		video: '/assets/images/about/challenge.webm',
		accent: '#9B59B6'
	},
	{
		emoji: '⭐',
		emojiLabel: 'star',
		title: 'Achievement',
		subtitle: '업적 시스템',
		description:
			'매치, 판수, 연승, 연패, 티어, 보이스, 챌린지, 언더독, 야식 등 9개 카테고리의 업적을 달성하세요. 브론즈부터 챌린저까지 난이도별 등급이 부여됩니다.',
		image: '/assets/images/about/achievement.png',
		video: '/assets/images/about/achievement.webm',
		accent: '#F1C40F'
	},
	{
		emoji: '🌟',
		emojiLabel: 'glowing star',
		title: 'Honor',
		subtitle: '명예 시스템',
		description:
			'함께 플레이한 팀원에게 명예 투표로 감사를 전하세요. 누적된 명예 포인트로 랭킹이 매겨지며, 특별한 칭호도 부여됩니다.',
		image: '/assets/images/about/honor.png',
		video: '/assets/images/about/honor.webm',
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
	featureMedia: {
		width: '100%',
		borderRadius: 14,
		border: '1px solid rgba(255,255,255,0.08)',
		boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
		transition: 'transform 0.4s ease, box-shadow 0.4s ease',
		display: 'block',
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
					<div className={classes.heroSub}>LoL 내전 통계 & 랭킹 대시보드</div>
					<div className={classes.heroDivider} />
					<div className={classes.heroDesc}>
						그룹 내 LoL 내전 경기를 추적하고, 레이팅 시스템으로 실력을 측정하며, 다양한 업적과 어워드로 내전을 더욱
						즐겁게 만들어주는 통계 대시보드입니다.
					</div>
				</FadeInSection>
				<FadeInSection delay={0.3}>
					<video
						className={classes.heroScreenshot}
						src="/assets/images/about/dashboard.webm"
						poster="/assets/images/about/dashboard.png"
						autoPlay
						loop
						muted
						playsInline
					/>
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
									<video
										className={classes.featureMedia}
										src={feature.video}
										poster={feature.image}
										autoPlay
										loop
										muted
										playsInline
									/>
								</div>
							</div>
						</FadeInSection>
					</React.Fragment>
				))}
			</div>

			{/* CTA */}
			<FadeInSection>
				<div className={classes.cta}>
					<div className={classes.ctaTitle}>지금 시작하세요</div>
					<div className={classes.ctaSub}>내전 기록을 추적하고, 팀원들과 경쟁하세요</div>
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
