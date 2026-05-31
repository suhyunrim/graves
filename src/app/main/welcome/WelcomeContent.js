import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';

// ── 스크롤 리빌 ──────────────────────────────────────────────
function useInView(threshold = 0.15) {
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
			{ threshold }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [threshold]);
	return { ref, inView };
}

function FadeIn({ children, delay = 0, className }) {
	const { ref, inView } = useInView(0.15);
	return (
		<div
			ref={ref}
			className={className}
			style={{
				opacity: inView ? 1 : 0,
				transform: inView ? 'translateY(0)' : 'translateY(36px)',
				transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`
			}}
		>
			{children}
		</div>
	);
}

// ── 데이터 ───────────────────────────────────────────────────
const SHOWCASE = [
	{
		key: 'ranking',
		tab: '랭킹 & 티어',
		title: '내전 전용 랭킹 시스템',
		desc: '판수·승률 기반 레이팅을 LoL 티어(IRON → CHALLENGER)와 LP로 환산. 솔랭이 아닌 우리끼리의 진짜 순위를 매깁니다.',
		img: '/assets/images/welcome/ranking.png'
	},
	{
		key: 'dashboard',
		tab: '월간 대시보드',
		title: '이번 달 내전 하이라이트',
		desc: '명예왕·최다 판수·최고 승률·전생에 부부까지. 매달 자동 집계되는 어워드로 그 달의 주인공을 가립니다.',
		img: '/assets/images/welcome/dashboard.png'
	},
	{
		key: 'myinfo',
		tab: '내 정보 & 성장',
		title: '내 전적과 성장 그래프',
		desc: '솔로랭크·커스텀 레이팅을 한눈에. 베스트 듀오, 모스트 챔피언, 레이팅 추이까지 내 내전 커리어를 추적합니다.',
		img: '/assets/images/welcome/myinfo-chart.png'
	},
	{
		key: 'achievements',
		tab: '업적',
		title: '209가지 업적 컬렉션',
		desc: '첫 승부터 50판 달성, 연승 기록까지. 브론즈에서 골드 등급으로 빛나는 업적을 모으며 내전을 더 깊게 즐깁니다.',
		img: '/assets/images/welcome/achievements.png'
	},
	{
		key: 'tournament',
		tab: '토너먼트',
		title: '경매 드래프트 & 토너먼트',
		desc: '팀원 경매로 밸런스를 맞추고, 예선부터 결승까지 대진표로 진행. 승부의 신 예측 투표까지 함께합니다.',
		img: '/assets/images/welcome/bracket.png'
	}
];

const STATS = [
	{ value: '209', label: '수집 가능한 업적' },
	{ value: 'IRON→CHALL', label: '환산 티어 시스템' },
	{ value: '5종', label: '랭킹·대시보드·토너먼트' }
];

const BENTO = [
	{ icon: '🤝', label: 'discord', title: '디스코드 자동 매칭', desc: '봇이 참가자를 모아 밸런스 팀을 자동으로 구성합니다.' },
	{ icon: '👑', label: 'crown', title: '명예왕 투표', desc: '매 경기 MVP를 직접 투표해 명예 포인트를 적립합니다.' },
	{ icon: '📊', label: 'chart', title: '밸런스 리포트', desc: '매치 밸런스와 예상 승률을 분석해 공정한 내전을 돕습니다.' },
	{ icon: '📝', label: 'memo', title: '방명록 & 한마디', desc: '프로필 방명록과 상태 메시지로 소통합니다.' }
];

// ── 스타일 ───────────────────────────────────────────────────
const auroraDrift = keyframes`
	0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.8; }
	50%      { transform: translate3d(3%, -2%, 0) scale(1.08); opacity: 1; }
`;

const useStyles = makeStyles()((theme) => ({
	page: {
		width: '100%',
		minHeight: '100vh',
		background: 'linear-gradient(180deg, #0b0b14 0%, #0f0f1a 40%, #16213e 100%)',
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		overflowX: 'hidden',
		position: 'relative'
	},
	// 상단 고정 nav
	nav: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 50,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '16px 40px',
		background: 'rgba(11, 11, 20, 0.6)',
		backdropFilter: 'blur(14px)',
		borderBottom: '1px solid rgba(0, 212, 255, 0.12)',
		[theme.breakpoints.down('sm')]: {
			padding: '12px 18px'
		}
	},
	brand: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		cursor: 'pointer'
	},
	brandLogo: {
		width: 38,
		height: 38,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '2px solid rgba(0, 212, 255, 0.5)',
		boxShadow: '0 0 16px rgba(0, 212, 255, 0.35)'
	},
	brandName: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.6rem',
		letterSpacing: '0.18em',
		textTransform: 'uppercase',
		color: '#00d4ff',
		textShadow: '0 0 18px rgba(0, 212, 255, 0.4)'
	},
	navLogin: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.2rem',
		letterSpacing: '0.08em',
		textTransform: 'uppercase',
		color: '#000',
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		border: 'none',
		borderRadius: 10,
		padding: '8px 22px',
		cursor: 'pointer',
		boxShadow: '0 4px 16px rgba(0, 212, 255, 0.25)',
		transition: 'all 0.25s ease',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)',
			boxShadow: '0 6px 22px rgba(0, 212, 255, 0.45)',
			transform: 'translateY(-1px)'
		}
	},
	// 히어로
	hero: {
		position: 'relative',
		minHeight: '100vh',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		padding: '120px 24px 80px',
		overflow: 'hidden'
	},
	aurora: {
		position: 'absolute',
		top: '-10%',
		left: '50%',
		width: 900,
		height: 900,
		transform: 'translateX(-50%)',
		background: 'radial-gradient(circle, rgba(0, 212, 255, 0.22) 0%, rgba(0, 102, 255, 0.08) 35%, transparent 65%)',
		filter: 'blur(20px)',
		animation: `${auroraDrift} 12s ease-in-out infinite`,
		pointerEvents: 'none',
		[theme.breakpoints.down('sm')]: {
			width: 500,
			height: 500
		}
	},
	heroEyebrow: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		letterSpacing: '0.35em',
		textTransform: 'uppercase',
		color: 'rgba(0, 212, 255, 0.85)',
		marginBottom: 20,
		position: 'relative',
		zIndex: 1
	},
	heroTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '5.5rem',
		lineHeight: 1.05,
		letterSpacing: '0.01em',
		margin: 0,
		position: 'relative',
		zIndex: 1,
		[theme.breakpoints.down('md')]: { fontSize: '3.8rem' },
		[theme.breakpoints.down('sm')]: { fontSize: '2.6rem' }
	},
	heroAccent: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0066ff 100%)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text'
	},
	heroSub: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.7rem',
		lineHeight: 1.6,
		color: 'rgba(255, 255, 255, 0.7)',
		maxWidth: 680,
		margin: '28px auto 0',
		position: 'relative',
		zIndex: 1,
		[theme.breakpoints.down('sm')]: { fontSize: '1.4rem' }
	},
	heroCtas: {
		display: 'flex',
		gap: 16,
		marginTop: 44,
		flexWrap: 'wrap',
		justifyContent: 'center',
		position: 'relative',
		zIndex: 1
	},
	ctaPrimary: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.5rem',
		letterSpacing: '0.06em',
		textTransform: 'uppercase',
		color: '#000',
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		border: 'none',
		borderRadius: 12,
		padding: '16px 40px',
		cursor: 'pointer',
		boxShadow: '0 6px 24px rgba(0, 212, 255, 0.3)',
		transition: 'all 0.25s ease',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)',
			boxShadow: '0 8px 30px rgba(0, 212, 255, 0.5)',
			transform: 'translateY(-2px)'
		}
	},
	ctaGhost: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 600,
		fontSize: '1.5rem',
		letterSpacing: '0.06em',
		textTransform: 'uppercase',
		color: '#00d4ff',
		background: 'transparent',
		border: '1px solid rgba(0, 212, 255, 0.4)',
		borderRadius: 12,
		padding: '16px 40px',
		cursor: 'pointer',
		transition: 'all 0.25s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.08)',
			borderColor: 'rgba(0, 212, 255, 0.7)',
			transform: 'translateY(-2px)'
		}
	},
	heroStats: {
		display: 'flex',
		gap: 48,
		marginTop: 72,
		flexWrap: 'wrap',
		justifyContent: 'center',
		position: 'relative',
		zIndex: 1,
		[theme.breakpoints.down('sm')]: { gap: 28, marginTop: 48 }
	},
	stat: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center'
	},
	statValue: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '2.6rem',
		color: '#00d4ff',
		lineHeight: 1.1,
		textShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
		[theme.breakpoints.down('sm')]: { fontSize: '1.9rem' }
	},
	statLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.45)',
		marginTop: 6
	},
	// 공통 섹션
	section: {
		position: 'relative',
		maxWidth: 1200,
		margin: '0 auto',
		padding: '100px 24px',
		[theme.breakpoints.down('sm')]: { padding: '64px 18px' }
	},
	sectionEyebrow: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		letterSpacing: '0.3em',
		textTransform: 'uppercase',
		color: 'rgba(0, 212, 255, 0.8)',
		textAlign: 'center'
	},
	sectionTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '3rem',
		textAlign: 'center',
		margin: '12px 0 0',
		[theme.breakpoints.down('sm')]: { fontSize: '2.1rem' }
	},
	sectionDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.55)',
		textAlign: 'center',
		maxWidth: 600,
		margin: '16px auto 0'
	},
	// 탭 쇼케이스
	tabs: {
		display: 'flex',
		gap: 10,
		justifyContent: 'center',
		flexWrap: 'wrap',
		margin: '48px auto 0'
	},
	tab: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.55)',
		background: 'rgba(255, 255, 255, 0.04)',
		border: '1px solid rgba(255, 255, 255, 0.08)',
		borderRadius: 999,
		padding: '10px 24px',
		cursor: 'pointer',
		transition: 'all 0.2s ease',
		'&:hover': {
			color: '#fff',
			borderColor: 'rgba(0, 212, 255, 0.3)'
		}
	},
	tabActive: {
		color: '#000',
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		borderColor: 'transparent',
		boxShadow: '0 4px 18px rgba(0, 212, 255, 0.3)',
		'&:hover': { color: '#000' }
	},
	showcase: {
		display: 'grid',
		gridTemplateColumns: '1fr',
		gap: 40,
		alignItems: 'center',
		marginTop: 48
	},
	showcaseCopy: {
		textAlign: 'center',
		maxWidth: 760,
		margin: '0 auto'
	},
	showcaseTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '2.2rem',
		color: '#fff',
		[theme.breakpoints.down('sm')]: { fontSize: '1.7rem' }
	},
	showcaseDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		lineHeight: 1.7,
		color: 'rgba(255, 255, 255, 0.6)',
		marginTop: 14
	},
	// 브라우저 프레임
	frame: {
		borderRadius: 16,
		overflow: 'hidden',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		boxShadow: '0 24px 70px rgba(0, 0, 0, 0.6), 0 0 80px rgba(0, 212, 255, 0.1)',
		maxWidth: 960,
		margin: '0 auto',
		width: '100%'
	},
	frameBar: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '12px 16px',
		background: 'rgba(255, 255, 255, 0.03)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
	},
	dot: {
		width: 11,
		height: 11,
		borderRadius: '50%'
	},
	frameUrl: {
		marginLeft: 14,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1rem',
		letterSpacing: '0.04em',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	frameImgWrap: {
		position: 'relative',
		width: '100%',
		aspectRatio: '1280 / 760',
		overflow: 'hidden',
		background: '#0b0b14'
	},
	frameImg: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		objectPosition: 'top center',
		display: 'block'
	},
	// 벤토
	bento: {
		display: 'grid',
		gridTemplateColumns: 'repeat(4, 1fr)',
		gap: 20,
		marginTop: 48,
		[theme.breakpoints.down('md')]: { gridTemplateColumns: 'repeat(2, 1fr)' },
		[theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' }
	},
	bentoCard: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		border: '1px solid rgba(0, 212, 255, 0.12)',
		borderRadius: 16,
		padding: '28px 24px',
		transition: 'all 0.25s ease',
		'&:hover': {
			borderColor: 'rgba(0, 212, 255, 0.35)',
			transform: 'translateY(-4px)',
			boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 212, 255, 0.08)'
		}
	},
	bentoIcon: {
		fontSize: '2.4rem',
		display: 'block',
		marginBottom: 14
	},
	bentoTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.5rem',
		color: '#fff'
	},
	bentoDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		lineHeight: 1.6,
		color: 'rgba(255, 255, 255, 0.5)',
		marginTop: 8
	},
	// 푸터 CTA
	footer: {
		position: 'relative',
		textAlign: 'center',
		padding: '120px 24px 90px',
		overflow: 'hidden'
	},
	footerGlow: {
		position: 'absolute',
		bottom: '-30%',
		left: '50%',
		width: 800,
		height: 600,
		transform: 'translateX(-50%)',
		background: 'radial-gradient(circle, rgba(0, 212, 255, 0.16) 0%, transparent 60%)',
		filter: 'blur(10px)',
		pointerEvents: 'none'
	},
	footerTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '3.2rem',
		position: 'relative',
		zIndex: 1,
		[theme.breakpoints.down('sm')]: { fontSize: '2.2rem' }
	},
	footerDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginTop: 16,
		position: 'relative',
		zIndex: 1
	},
	footerNote: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.3)',
		marginTop: 64,
		position: 'relative',
		zIndex: 1
	}
}));

function WelcomeContent() {
	const { classes, cx } = useStyles();
	const navigate = useNavigate();
	const [active, setActive] = useState(0);
	const showcaseRef = useRef(null);

	const goLogin = () => navigate('/login');
	const scrollToShowcase = () => {
		showcaseRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	const current = SHOWCASE[active];

	return (
		<div className={classes.page}>
			{/* 상단 고정 nav */}
			<nav className={classes.nav}>
				<div className={classes.brand} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
					<img className={classes.brandLogo} src="/assets/images/graves.jpg" alt="Graves" />
					<span className={classes.brandName}>Graves</span>
				</div>
				<button type="button" className={classes.navLogin} onClick={goLogin}>
					로그인
				</button>
			</nav>

			{/* 히어로 */}
			<header className={classes.hero}>
				<div className={classes.aurora} />
				<div className={classes.heroEyebrow}>LoL Custom Game Stats</div>
				<h1 className={classes.heroTitle}>
					우리끼리의 내전,
					<br />
					<span className={classes.heroAccent}>제대로 기록하다</span>
				</h1>
				<p className={classes.heroSub}>
					그룹 내 롤 커스텀 게임을 추적하고 랭킹·티어·업적으로 즐기는 내전 통계 대시보드.
					이제 우리만의 진짜 순위를 매겨보세요.
				</p>
				<div className={classes.heroCtas}>
					<button type="button" className={classes.ctaPrimary} onClick={goLogin}>
						시작하기
					</button>
					<button type="button" className={classes.ctaGhost} onClick={scrollToShowcase}>
						둘러보기
					</button>
				</div>
				<div className={classes.heroStats}>
					{STATS.map((s) => (
						<div key={s.label} className={classes.stat}>
							<span className={classes.statValue}>{s.value}</span>
							<span className={classes.statLabel}>{s.label}</span>
						</div>
					))}
				</div>
			</header>

			{/* 탭 쇼케이스 */}
			<section className={classes.section} ref={showcaseRef}>
				<FadeIn>
					<div className={classes.sectionEyebrow}>Features</div>
					<h2 className={classes.sectionTitle}>한 곳에서 보는 우리 내전</h2>
					<p className={classes.sectionDesc}>탭을 눌러 실제 화면을 확인해 보세요.</p>
				</FadeIn>

				<div className={classes.tabs}>
					{SHOWCASE.map((item, idx) => (
						<button
							key={item.key}
							type="button"
							className={cx(classes.tab, idx === active && classes.tabActive)}
							onClick={() => setActive(idx)}
						>
							{item.tab}
						</button>
					))}
				</div>

				<div className={classes.showcase}>
					<div className={classes.frame}>
						<div className={classes.frameBar}>
							<span className={classes.dot} style={{ background: '#ff5f57' }} />
							<span className={classes.dot} style={{ background: '#febc2e' }} />
							<span className={classes.dot} style={{ background: '#28c840' }} />
							<span className={classes.frameUrl}>graves.zeroboom.lol/{current.key}</span>
						</div>
						<div className={classes.frameImgWrap}>
							<img className={classes.frameImg} src={current.img} alt={current.title} />
						</div>
					</div>
					<div className={classes.showcaseCopy}>
						<h3 className={classes.showcaseTitle}>{current.title}</h3>
						<p className={classes.showcaseDesc}>{current.desc}</p>
					</div>
				</div>
			</section>

			{/* 벤토 보조 기능 */}
			<section className={classes.section}>
				<FadeIn>
					<div className={classes.sectionEyebrow}>And more</div>
					<h2 className={classes.sectionTitle}>내전을 더 풍성하게</h2>
				</FadeIn>
				<FadeIn delay={0.1}>
					<div className={classes.bento}>
						{BENTO.map((b) => (
							<div key={b.label} className={classes.bentoCard}>
								<span className={classes.bentoIcon} role="img" aria-label={b.label}>
									{b.icon}
								</span>
								<div className={classes.bentoTitle}>{b.title}</div>
								<p className={classes.bentoDesc}>{b.desc}</p>
							</div>
						))}
					</div>
				</FadeIn>
			</section>

			{/* 푸터 CTA */}
			<footer className={classes.footer}>
				<div className={classes.footerGlow} />
				<FadeIn>
					<h2 className={classes.footerTitle}>지금 바로 합류하세요</h2>
					<p className={classes.footerDesc}>롤 닉네임#태그 하나면 충분합니다.</p>
					<div className={classes.heroCtas} style={{ justifyContent: 'center' }}>
						<button type="button" className={classes.ctaPrimary} onClick={goLogin}>
							로그인하고 시작하기
						</button>
					</div>
					<div className={classes.footerNote}>© Graves · LoL Custom Game Statistics</div>
				</FadeIn>
			</footer>
		</div>
	);
}

export default WelcomeContent;
