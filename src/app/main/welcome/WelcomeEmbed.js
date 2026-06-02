import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import * as userActions from 'app/auth/store/actions';
import { disableSampleMode } from '../sample/sampleStorage';
import Ranking from '../ranking/Ranking';
import Dashboard from '../dashboard/Dashboard';
import MyInfo from '../myinfo/MyInfo';
import Achievement from '../achievement/Achievement';
import MatchHistory from '../matchHistory/MatchHistory';

// ─────────────────────────────────────────────────────────────
//  /welcome2 — "실제 앱 컴포넌트 임베드" 대안 템플릿
//  스샷/네이티브 재현이 아니라, 데모(샘플) 모드를 켠 뒤 진짜 페이지
//  컴포넌트들을 그대로 렌더한다. 각 페이지는 default export가 이미
//  withReducer로 감싸져 있고, fetch 액션엔 isSampleMode() 분기가 있어
//  샘플 데이터로 자체 구동된다. → 프로덕션 컴포넌트 수정 0.
// ─────────────────────────────────────────────────────────────

const SECTIONS = [
	{ key: 'ranking', label: '01 / Ranking', title: '실시간 내전 랭킹', url: 'graves.lol / ranking', Comp: Ranking },
	{ key: 'dashboard', label: '02 / Dashboard', title: '이번 달 하이라이트', url: 'graves.lol / dashboard', Comp: Dashboard },
	{ key: 'myinfo', label: '03 / My Career', title: '내 전적과 성장', url: 'graves.lol / myinfo', Comp: MyInfo },
	{ key: 'achievement', label: '04 / Achievements', title: '업적 컬렉션', url: 'graves.lol / achievement', Comp: Achievement },
	{ key: 'matchHistory', label: '05 / Matches', title: '매치 히스토리', url: 'graves.lol / matches', Comp: MatchHistory }
];

const useStyles = makeStyles()((theme) => ({
	page: {
		width: '100%',
		minHeight: '100vh',
		background: 'radial-gradient(ellipse at 50% -10%, #16213e 0%, #0a0a14 55%)',
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		overflowX: 'hidden'
	},
	nav: {
		position: 'sticky',
		top: 0,
		zIndex: 20,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '16px 40px',
		background: 'rgba(10,10,20,0.8)',
		backdropFilter: 'blur(12px)',
		borderBottom: '1px solid rgba(0,212,255,0.15)',
		[theme.breakpoints.down('sm')]: { padding: '12px 20px' }
	},
	brand: { display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' },
	brandLogo: { width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(0,212,255,0.5)' },
	brandName: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.6rem',
		letterSpacing: '0.18em',
		textTransform: 'uppercase'
	},
	loginBtn: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.1rem',
		color: '#000',
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		border: 'none',
		borderRadius: 10,
		padding: '10px 24px',
		cursor: 'pointer',
		boxShadow: '0 4px 18px rgba(0,212,255,0.25)',
		transition: 'all 0.2s ease',
		'&:hover': { filter: 'brightness(1.1)', transform: 'translateY(-1px)' }
	},
	hero: {
		maxWidth: 1100,
		margin: '0 auto',
		padding: '80px 40px 20px',
		textAlign: 'center',
		[theme.breakpoints.down('sm')]: { padding: '56px 20px 16px' }
	},
	eyebrow: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1rem',
		fontWeight: 600,
		letterSpacing: '0.3em',
		textTransform: 'uppercase',
		color: '#00d4ff',
		marginBottom: 18
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '4.2rem',
		lineHeight: 1.05,
		margin: 0,
		[theme.breakpoints.down('md')]: { fontSize: '3rem' },
		[theme.breakpoints.down('sm')]: { fontSize: '2.3rem' }
	},
	titleAccent: {
		background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text'
	},
	sub: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		lineHeight: 1.6,
		color: 'rgba(255,255,255,0.6)',
		maxWidth: 640,
		margin: '24px auto 0'
	},
	sectionWrap: { maxWidth: 1320, margin: '60px auto 0', padding: '0 24px' },
	sectionHead: { marginBottom: 16, paddingLeft: 6 },
	sectionLabel: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 700,
		letterSpacing: '0.2em',
		textTransform: 'uppercase',
		color: 'rgba(0,212,255,0.7)'
	},
	sectionTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2.2rem',
		fontWeight: 700,
		margin: '6px 0 0',
		[theme.breakpoints.down('sm')]: { fontSize: '1.6rem' }
	},
	frame: {
		border: '1px solid rgba(0,212,255,0.25)',
		borderRadius: 20,
		background: 'rgba(0,0,0,0.25)',
		boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
		overflow: 'hidden'
	},
	frameBar: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '12px 18px',
		borderBottom: '1px solid rgba(255,255,255,0.08)',
		background: 'rgba(255,255,255,0.02)'
	},
	dot: { width: 12, height: 12, borderRadius: '50%' },
	frameTitle: {
		marginLeft: 12,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		letterSpacing: '0.08em',
		color: 'rgba(255,255,255,0.5)'
	},
	// 실제 페이지 컴포넌트가 자연 높이로 펼쳐지도록 (내부 스크롤 X → 페이지 한 번만 스크롤)
	frameBody: { overflowX: 'hidden' },
	footer: { textAlign: 'center', padding: '90px 24px 100px' },
	footerTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '3rem',
		[theme.breakpoints.down('sm')]: { fontSize: '2rem' }
	},
	footerSub: { fontFamily: '"Noto Sans KR", sans-serif', fontSize: '1.3rem', color: 'rgba(255,255,255,0.55)', margin: '14px 0 28px' },
	loading: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: '60vh',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(0,212,255,0.7)'
	}
}));

function WelcomeEmbed() {
	const { classes } = useStyles();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [ready, setReady] = useState(false);

	// 샘플 모드 진입 → auth.reprGroup 셋업 + localStorage flag. 셋업이 끝난
	// 뒤에 자식(실제 페이지)을 렌더해야 reprGroup undefined 크래시가 없다.
	useEffect(() => {
		dispatch(userActions.enterSampleMode());
		setReady(true);
		// 랜딩을 떠나면 샘플 모드 해제 (실서비스로 샘플 플래그가 새지 않게)
		return () => disableSampleMode();
	}, [dispatch]);

	const goLogin = () => {
		disableSampleMode();
		navigate('/login');
	};

	return (
		<div className={classes.page}>
			<nav className={classes.nav}>
				<div className={classes.brand} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
					<img className={classes.brandLogo} src="/assets/images/graves.jpg" alt="Graves" />
					<span className={classes.brandName}>Graves</span>
				</div>
				<button type="button" className={classes.loginBtn} onClick={goLogin}>
					로그인
				</button>
			</nav>

			<header className={classes.hero}>
				<div className={classes.eyebrow}>LoL Custom Game Statistics</div>
				<h1 className={classes.title}>
					데모가 아닙니다.
					<br />
					<span className={classes.titleAccent}>실제 서비스 그대로.</span>
				</h1>
				<p className={classes.sub}>
					아래 모든 화면은 실제 서비스에서 쓰는 그 컴포넌트입니다. 지금은 샘플 데이터로 채워져 있고, 로그인하면 우리 그룹의 진짜
					데이터로 똑같이 동작합니다.
				</p>
			</header>

			{ready ? (
				SECTIONS.map(({ key, label, title, url, Comp }) => (
					<section className={classes.sectionWrap} key={key}>
						<div className={classes.sectionHead}>
							<div className={classes.sectionLabel}>{label}</div>
							<h2 className={classes.sectionTitle}>{title}</h2>
						</div>
						<div className={classes.frame}>
							<div className={classes.frameBar}>
								<span className={classes.dot} style={{ background: '#ff5f56' }} />
								<span className={classes.dot} style={{ background: '#ffbd2e' }} />
								<span className={classes.dot} style={{ background: '#27c93f' }} />
								<span className={classes.frameTitle}>{url}</span>
							</div>
							<div className={classes.frameBody}>
								<Comp />
							</div>
						</div>
					</section>
				))
			) : (
				<div className={classes.loading}>로딩 중…</div>
			)}

			<footer className={classes.footer}>
				<h2 className={classes.footerTitle}>전장에 합류하라</h2>
				<p className={classes.footerSub}>롤 닉네임#태그 하나면 충분합니다.</p>
				<button type="button" className={classes.loginBtn} onClick={goLogin}>
					로그인하고 시작하기
				</button>
			</footer>
		</div>
	);
}

export default WelcomeEmbed;
