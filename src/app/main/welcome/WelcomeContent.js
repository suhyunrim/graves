import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import { Button } from '@mui/material';

const FEATURES = [
	{
		eyebrow: '01 · 자동 매칭',
		title: 'Discord 봇이 팀을 맞춰드립니다',
		description:
			'커스텀 게임 시작 전 명령어 하나로 충분합니다. 각 참가자의 레이팅을 기반으로 밸런스 잡힌 5v5 팀을 자동으로 구성하고, 결과는 그대로 통계에 반영됩니다.',
		accent: '#5865F2',
		mode: 'discord'
	},
	{
		eyebrow: '02 · 랭킹 & 티어',
		title: '내전이 진짜 리그가 됩니다',
		description:
			'누적된 경기 결과로 레이팅을 산출하고, 아이언부터 챌린저까지 LoL 티어로 변환합니다. 승률·LP·연승 기록까지 — 내전이 솔로랭크처럼 경쟁력을 갖게 됩니다.',
		accent: '#00d4ff',
		mode: 'video',
		video: '/assets/images/about/ranking.webm',
		poster: '/assets/images/about/ranking.png'
	},
	{
		eyebrow: '03 · 내정보',
		title: '내 성장을 숫자로 확인하세요',
		description:
			'레이팅 변화 추이, 베스트 듀오, 최근 전적, 승률까지. 솔로랭크 티어와 내전 티어를 나란히 비교하며 내 내전 커리어를 한눈에 확인하세요.',
		accent: '#50C878',
		mode: 'video',
		video: '/assets/images/about/myinfo.webm',
		poster: '/assets/images/about/myinfo.png'
	},
	{
		eyebrow: '04 · 월간 대시보드',
		title: '이번 달 우리 서버의 주인공은?',
		description:
			'명예왕·연승왕·베스트듀오·신인왕 등 10개 부문 월간 어워드로 서버 전체의 하이라이트를 한 페이지에 담습니다. 매달 새로운 이야깃거리가 쌓입니다.',
		accent: '#FFD700',
		mode: 'video',
		video: '/assets/images/about/dashboard.webm',
		poster: '/assets/images/about/dashboard.png'
	}
];

function useInView(options) {
	const ref = useRef(null);
	const [inView, setInView] = useState(false);
	useEffect(() => {
		const node = ref.current;
		if (!node) return undefined;
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setInView(true);
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: options?.threshold ?? 0.15 }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [options?.threshold]);
	return { ref, inView };
}

function FadeIn({ children, delay = 0 }) {
	const { ref, inView } = useInView({ threshold: 0.15 });
	return (
		<div
			ref={ref}
			style={{
				opacity: inView ? 1 : 0,
				transform: inView ? 'translateY(0)' : 'translateY(32px)',
				transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`
			}}
		>
			{children}
		</div>
	);
}

const useStyles = makeStyles()((theme) => ({
	root: {
		background: '#0a0a12',
		color: '#fff',
		minHeight: '100vh',
		overflowX: 'hidden'
	},
	topNav: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '20px 48px',
		zIndex: 10,
		background: 'rgba(10, 10, 18, 0.6)',
		backdropFilter: 'blur(12px)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		[theme.breakpoints.down('sm')]: {
			padding: '14px 20px'
		}
	},
	brand: {
		display: 'flex',
		alignItems: 'center',
		gap: 12
	},
	brandLogo: {
		width: 32,
		height: 32,
		borderRadius: '50%',
		border: '1px solid rgba(0, 212, 255, 0.4)'
	},
	brandText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		letterSpacing: '0.2em'
	},
	navLogin: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.7)',
		textTransform: 'none',
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.08)'
		}
	},
	hero: {
		position: 'relative',
		textAlign: 'center',
		padding: '180px 28px 120px',
		'&::before': {
			content: '""',
			position: 'absolute',
			top: '-20%',
			left: '50%',
			transform: 'translateX(-50%)',
			width: '120%',
			height: '80%',
			background: 'radial-gradient(ellipse, rgba(0, 212, 255, 0.15) 0%, transparent 60%)',
			pointerEvents: 'none'
		},
		[theme.breakpoints.down('sm')]: {
			padding: '120px 20px 80px'
		}
	},
	heroEyebrow: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		letterSpacing: '0.4em',
		color: 'rgba(0, 212, 255, 0.7)',
		marginBottom: 24,
		textTransform: 'uppercase'
	},
	heroTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '4.4rem',
		fontWeight: 800,
		lineHeight: 1.2,
		margin: 0,
		letterSpacing: '-0.01em',
		background: 'linear-gradient(135deg, #fff 0%, #b8dff5 100%)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		[theme.breakpoints.down('md')]: {
			fontSize: '3.4rem'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '2.6rem'
		}
	},
	heroSub: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginTop: 28,
		maxWidth: 640,
		marginLeft: 'auto',
		marginRight: 'auto',
		lineHeight: 1.7,
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.2rem',
			marginTop: 20
		}
	},
	heroCtaRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 20,
		marginTop: 48,
		flexWrap: 'wrap'
	},
	primaryCta: {
		background: '#5865F2',
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		padding: '16px 40px',
		borderRadius: 12,
		textTransform: 'none',
		boxShadow: '0 8px 24px rgba(88, 101, 242, 0.35)',
		transition: 'all 0.25s ease',
		'&:hover': {
			background: '#4752C4',
			transform: 'translateY(-2px)',
			boxShadow: '0 12px 30px rgba(88, 101, 242, 0.5)'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.1rem',
			padding: '14px 32px'
		}
	},
	primaryCtaIcon: {
		width: 22,
		height: 22,
		marginRight: 10
	},
	secondaryCta: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.7)',
		textTransform: 'none',
		padding: '14px 20px',
		'&:hover': {
			color: '#00d4ff',
			background: 'transparent'
		}
	},
	section: {
		padding: '120px 48px',
		maxWidth: 1200,
		margin: '0 auto',
		[theme.breakpoints.down('md')]: {
			padding: '80px 28px'
		},
		[theme.breakpoints.down('sm')]: {
			padding: '60px 20px'
		}
	},
	featureRow: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: 80,
		alignItems: 'center',
		[theme.breakpoints.down('md')]: {
			gridTemplateColumns: '1fr',
			gap: 40
		}
	},
	featureRowReverse: {
		'& > :first-of-type': {
			order: 2
		},
		'& > :last-of-type': {
			order: 1
		},
		[theme.breakpoints.down('md')]: {
			'& > :first-of-type': { order: 1 },
			'& > :last-of-type': { order: 2 }
		}
	},
	featureText: {
		display: 'flex',
		flexDirection: 'column',
		gap: 20
	},
	featureEyebrow: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		fontWeight: 600,
		letterSpacing: '0.25em',
		textTransform: 'uppercase'
	},
	featureTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '2.6rem',
		fontWeight: 700,
		lineHeight: 1.3,
		margin: 0,
		[theme.breakpoints.down('sm')]: {
			fontSize: '2rem'
		}
	},
	featureDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.55)',
		lineHeight: 1.8,
		margin: 0
	},
	featureMedia: {
		borderRadius: 16,
		border: '1px solid rgba(255, 255, 255, 0.08)',
		boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
		overflow: 'hidden',
		background: '#000'
	},
	featureVideo: {
		display: 'block',
		width: '100%',
		height: 'auto'
	},
	discordMock: {
		background: '#2b2d31',
		borderRadius: 16,
		border: '1px solid rgba(255, 255, 255, 0.08)',
		padding: '20px 24px',
		boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
		fontFamily: '"Noto Sans KR", sans-serif'
	},
	discordHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		paddingBottom: 14,
		borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
		marginBottom: 18
	},
	discordChannelHash: {
		color: 'rgba(255, 255, 255, 0.4)',
		fontSize: '1.4rem',
		fontWeight: 700
	},
	discordChannelName: {
		color: '#fff',
		fontSize: '1.1rem',
		fontWeight: 600
	},
	discordMessage: {
		display: 'flex',
		gap: 12,
		marginBottom: 16,
		alignItems: 'flex-start'
	},
	discordAvatar: {
		width: 36,
		height: 36,
		borderRadius: '50%',
		flexShrink: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: '1rem',
		fontWeight: 700,
		color: '#fff'
	},
	discordMsgBody: {
		flex: 1,
		minWidth: 0
	},
	discordUserRow: {
		display: 'flex',
		alignItems: 'baseline',
		gap: 8,
		marginBottom: 4
	},
	discordUsername: {
		fontSize: '1rem',
		fontWeight: 600,
		color: '#fff'
	},
	discordTime: {
		fontSize: '0.8rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	discordText: {
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.85)',
		lineHeight: 1.5
	},
	discordCommand: {
		color: '#00d4ff',
		fontFamily: '"JetBrains Mono", monospace',
		background: 'rgba(0, 212, 255, 0.1)',
		padding: '2px 6px',
		borderRadius: 4
	},
	discordEmbed: {
		borderLeft: '4px solid #00d4ff',
		background: 'rgba(255, 255, 255, 0.03)',
		padding: '12px 16px',
		borderRadius: 4,
		marginTop: 8
	},
	discordEmbedTitle: {
		fontSize: '0.95rem',
		fontWeight: 700,
		color: '#fff',
		marginBottom: 8
	},
	discordTeams: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: 20,
		marginTop: 8
	},
	discordTeam: {
		display: 'flex',
		flexDirection: 'column',
		gap: 4
	},
	discordTeamLabel: {
		fontSize: '0.75rem',
		fontWeight: 700,
		letterSpacing: '0.1em',
		color: 'rgba(255, 255, 255, 0.5)',
		textTransform: 'uppercase',
		marginBottom: 4
	},
	discordPlayer: {
		fontSize: '0.9rem',
		color: 'rgba(255, 255, 255, 0.85)',
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	discordPosition: {
		fontSize: '0.7rem',
		color: 'rgba(255, 255, 255, 0.4)',
		fontWeight: 700,
		minWidth: 28
	},
	finalCta: {
		position: 'relative',
		textAlign: 'center',
		padding: '160px 28px 140px',
		'&::before': {
			content: '""',
			position: 'absolute',
			inset: 0,
			background: 'radial-gradient(ellipse at center, rgba(88, 101, 242, 0.18) 0%, transparent 55%)',
			pointerEvents: 'none'
		},
		[theme.breakpoints.down('sm')]: {
			padding: '100px 20px 80px'
		}
	},
	finalTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '3.4rem',
		fontWeight: 800,
		lineHeight: 1.3,
		margin: 0,
		[theme.breakpoints.down('sm')]: {
			fontSize: '2.2rem'
		}
	},
	finalSub: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.55)',
		marginTop: 20,
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.1rem'
		}
	},
	footer: {
		borderTop: '1px solid rgba(255, 255, 255, 0.05)',
		padding: '32px 48px',
		textAlign: 'center',
		color: 'rgba(255, 255, 255, 0.3)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		[theme.breakpoints.down('sm')]: {
			padding: '24px 20px'
		}
	}
}));

const DISCORD_AUTH_URL = `${import.meta.env.VITE_CAMILLE_HOST}api/auth/discord`;

function DiscordIcon({ className }) {
	return (
		<svg className={className} viewBox="0 0 71 55" fill="currentColor" aria-hidden="true">
			<path d="M60.1 4.9C55.6 2.8 50.7 1.3 45.7.4c-.1 0-.2 0-.2.1-.6 1.1-1.3 2.6-1.8 3.7-5.5-.8-10.9-.8-16.2 0-.5-1.2-1.2-2.6-1.8-3.7-.1-.1-.2-.1-.2-.1C20.3 1.3 15.4 2.8 10.9 4.9c0 0-.1 0-.1.1C1.6 18.7-.9 32.1.3 45.4c0 .1 0 .1.1.2 6.1 4.5 12 7.2 17.7 9 .1 0 .2 0 .3-.1 1.4-1.9 2.6-3.8 3.6-5.9.1-.1 0-.3-.1-.3-2-.7-3.8-1.6-5.6-2.7-.1-.1-.1-.3 0-.4.5-.3.9-.6 1.2-.9.1-.1.1-.1.2-.1 11.6 5.3 24.2 5.3 35.7 0h.2c.4.3.8.7 1.2.9.1.1.1.3 0 .4-1.8 1-3.6 2-5.6 2.7-.1 0-.2.2-.1.3 1.1 2.1 2.3 4 3.6 5.9.1.1.2.1.3.1 5.8-1.8 11.7-4.5 17.8-9 .1 0 .1-.1.1-.2 1.5-15.3-2.5-28.6-10.5-40.4 0 0 0-.1-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.4 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.4 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" />
		</svg>
	);
}

function DiscordMock({ classes }) {
	const blueTeam = [
		{ pos: 'TOP', name: '플레이어A', color: '#5865F2' },
		{ pos: 'JNG', name: '플레이어C', color: '#EB459E' },
		{ pos: 'MID', name: '플레이어E', color: '#FEE75C' },
		{ pos: 'ADC', name: '플레이어G', color: '#57F287' },
		{ pos: 'SUP', name: '플레이어I', color: '#ED4245' }
	];
	const redTeam = [
		{ pos: 'TOP', name: '플레이어B', color: '#EB459E' },
		{ pos: 'JNG', name: '플레이어D', color: '#57F287' },
		{ pos: 'MID', name: '플레이어F', color: '#5865F2' },
		{ pos: 'ADC', name: '플레이어H', color: '#FEE75C' },
		{ pos: 'SUP', name: '플레이어J', color: '#ED4245' }
	];
	return (
		<div className={classes.discordMock}>
			<div className={classes.discordHeader}>
				<span className={classes.discordChannelHash}>#</span>
				<span className={classes.discordChannelName}>내전-모집</span>
			</div>

			<div className={classes.discordMessage}>
				<div className={classes.discordAvatar} style={{ background: '#5865F2' }}>
					방
				</div>
				<div className={classes.discordMsgBody}>
					<div className={classes.discordUserRow}>
						<span className={classes.discordUsername}>방장</span>
						<span className={classes.discordTime}>오늘 오후 9:12</span>
					</div>
					<div className={classes.discordText}>
						<span className={classes.discordCommand}>/매칭 시작</span>
					</div>
				</div>
			</div>

			<div className={classes.discordMessage}>
				<div className={classes.discordAvatar} style={{ background: 'linear-gradient(135deg, #00d4ff, #0099cc)' }}>
					G
				</div>
				<div className={classes.discordMsgBody}>
					<div className={classes.discordUserRow}>
						<span className={classes.discordUsername} style={{ color: '#00d4ff' }}>
							Graves 봇
						</span>
						<span className={classes.discordTime}>오늘 오후 9:12</span>
					</div>
					<div className={classes.discordEmbed}>
						<div className={classes.discordEmbedTitle}>레이팅 밸런스 기준으로 팀을 구성했습니다</div>
						<div className={classes.discordTeams}>
							<div className={classes.discordTeam}>
								<span className={classes.discordTeamLabel} style={{ color: '#5865F2' }}>
									블루팀
								</span>
								{blueTeam.map((p) => (
									<div key={`b-${p.pos}`} className={classes.discordPlayer}>
										<span className={classes.discordPosition}>{p.pos}</span>
										<span style={{ color: p.color }}>●</span>
										<span>{p.name}</span>
									</div>
								))}
							</div>
							<div className={classes.discordTeam}>
								<span className={classes.discordTeamLabel} style={{ color: '#ED4245' }}>
									레드팀
								</span>
								{redTeam.map((p) => (
									<div key={`r-${p.pos}`} className={classes.discordPlayer}>
										<span className={classes.discordPosition}>{p.pos}</span>
										<span style={{ color: p.color }}>●</span>
										<span>{p.name}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function FeatureMedia({ feature, classes }) {
	if (feature.mode === 'discord') {
		return <DiscordMock classes={classes} />;
	}
	return (
		<div className={classes.featureMedia}>
			<video
				className={classes.featureVideo}
				src={feature.video}
				poster={feature.poster}
				autoPlay
				loop
				muted
				playsInline
			/>
		</div>
	);
}

function WelcomeContent() {
	const { classes, cx } = useStyles();
	const navigate = useNavigate();

	function handleDiscordStart() {
		window.location.href = DISCORD_AUTH_URL;
	}

	function handleLogin() {
		navigate('/login');
	}

	return (
		<div className={classes.root}>
			<div className={classes.topNav}>
				<div className={classes.brand}>
					<img className={classes.brandLogo} src="/assets/images/graves.jpg" alt="Graves" />
					<span className={classes.brandText}>GRAVES</span>
				</div>
				<Button className={classes.navLogin} onClick={handleLogin}>
					로그인
				</Button>
			</div>

			<section className={classes.hero}>
				<FadeIn>
					<div className={classes.heroEyebrow}>Discord Custom Game Dashboard</div>
				</FadeIn>
				<FadeIn delay={0.1}>
					<h1 className={classes.heroTitle}>
						Discord 내전,
						<br />
						봇이 팀 맞춰드립니다
					</h1>
				</FadeIn>
				<FadeIn delay={0.2}>
					<p className={classes.heroSub}>
						5v5 밸런싱부터 랭킹·통계까지, 명령어 하나로.
						<br />
						친구들과의 커스텀 게임을 진짜 리그처럼 만들어보세요.
					</p>
				</FadeIn>
				<FadeIn delay={0.3}>
					<div className={classes.heroCtaRow}>
						<Button className={classes.primaryCta} onClick={handleDiscordStart}>
							<DiscordIcon className={classes.primaryCtaIcon} />
							Discord로 시작하기
						</Button>
						<Button className={classes.secondaryCta} onClick={handleLogin}>
							이미 가입했어요 →
						</Button>
					</div>
				</FadeIn>
			</section>

			{FEATURES.map((feature, idx) => (
				<section key={feature.eyebrow} className={classes.section}>
					<div className={cx(classes.featureRow, idx % 2 === 1 && classes.featureRowReverse)}>
						<FadeIn>
							<div className={classes.featureText}>
								<span className={classes.featureEyebrow} style={{ color: feature.accent }}>
									{feature.eyebrow}
								</span>
								<h2 className={classes.featureTitle}>{feature.title}</h2>
								<p className={classes.featureDesc}>{feature.description}</p>
							</div>
						</FadeIn>
						<FadeIn delay={0.1}>
							<FeatureMedia feature={feature} classes={classes} />
						</FadeIn>
					</div>
				</section>
			))}

			<section className={classes.finalCta}>
				<FadeIn>
					<h2 className={classes.finalTitle}>
						오늘부터 우리 서버 내전,
						<br />
						전부 기록됩니다
					</h2>
				</FadeIn>
				<FadeIn delay={0.1}>
					<p className={classes.finalSub}>Discord 계정으로 30초면 시작할 수 있습니다.</p>
				</FadeIn>
				<FadeIn delay={0.2}>
					<div className={classes.heroCtaRow}>
						<Button className={classes.primaryCta} onClick={handleDiscordStart}>
							<DiscordIcon className={classes.primaryCtaIcon} />
							Discord로 시작하기
						</Button>
					</div>
				</FadeIn>
			</section>

			<div className={classes.footer}>© Graves · League of Legends Custom Game Dashboard</div>
		</div>
	);
}

export default WelcomeContent;
