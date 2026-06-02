import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';

// ─────────────────────────────────────────────────────────────
//  TACTICAL HEXTECH HUD — /welcome 랜딩
//  Valorant식 각진 HUD 프레임 + 헥테크 시안 에너지.
//  스크린샷 대신 실제 티어 엠블럼 + 네이티브 라이브 목업으로 재현.
// ─────────────────────────────────────────────────────────────

const EMBLEM = (tier) => `/assets/images/ranked-emblems/Emblem_${tier}.webp`;

const TIER_COLOR = {
	IRON: '#7d7d7d',
	BRONZE: '#cd7f32',
	SILVER: '#c0c0c0',
	GOLD: '#ffd700',
	PLATINUM: '#3fe0d0',
	EMERALD: '#50c878',
	DIAMOND: '#9fe9ff',
	MASTER: '#b15bff',
	GRANDMASTER: '#ff5a3c',
	CHALLENGER: '#f5e08a'
};

const TIERS = [
	{ name: 'IRON', at: 200 },
	{ name: 'BRONZE', at: 300 },
	{ name: 'SILVER', at: 400 },
	{ name: 'GOLD', at: 500 },
	{ name: 'PLATINUM', at: 600 },
	{ name: 'EMERALD', at: 700 },
	{ name: 'DIAMOND', at: 800 },
	{ name: 'MASTER', at: 900 },
	{ name: 'GRANDMASTER', at: 1000 },
	{ name: 'CHALLENGER', at: 1150 }
];

// 실제 prod 데이터 기반 래더 (상위권)
const LADDER = [
	{ rank: 1, name: '남 우서 연', tier: 'GRANDMASTER', sub: '376 LP', win: 12, loss: 9 },
	{ rank: 2, name: 'O3Oa#KR1', tier: 'GRANDMASTER', sub: '28 LP', win: 70, loss: 52 },
	{ rank: 3, name: '삼슐두꺼비뚜껍', tier: 'MASTER', sub: '376 LP', win: 76, loss: 52 },
	{ rank: 4, name: '2일찔#217', tier: 'MASTER', sub: '300 LP', win: 42, loss: 31 },
	{ rank: 5, name: '해 욥#KR1', tier: 'MASTER', sub: '216 LP', win: 8, loss: 5 }
];

const AWARDS = [
	{ icon: '👑', label: 'crown', title: '명예왕', who: '쥬티키스#kr2', stat: '42표', tone: '#ffd700' },
	{ icon: '🔥', label: 'fire', title: '최다 판수', who: '쥬티키스#kr2', stat: '94판', tone: '#ff5a3c' },
	{ icon: '🎯', label: 'target', title: '최고 승률', who: '최예나#바 보', stat: '68.8%', tone: '#00ff9d' },
	{ icon: '⚡', label: 'streak', title: '최다 연승', who: '강빈 공듀', stat: '13연승', tone: '#00d4ff' }
];

// 레이팅 추이 (DIAMOND I 까지 상승) — SVG 차트용
const CHART = [515, 540, 558, 600, 585, 640, 690, 705, 760, 800, 824, 844];

const BENTO = [
	{ icon: '🤝', label: 'discord', title: '디스코드 자동 매칭', desc: '봇이 참가자를 모아 밸런스 팀을 자동 편성.' },
	{ icon: '📊', label: 'chart', title: '밸런스 리포트', desc: '매치 밸런스와 예상 승률을 분석.' },
	{ icon: '📝', label: 'memo', title: '방명록 & 한마디', desc: '프로필 방명록과 상태 메시지로 소통.' },
	{ icon: '🃏', label: 'cards', title: '경매 드래프트', desc: '팀원 경매로 공정하게 팀을 구성.' }
];

// ── clip-path 모서리 컷(Valorant 시그니처) ───────────────────
const cut = (s) =>
	`polygon(0 0, calc(100% - ${s}px) 0, 100% ${s}px, 100% 100%, ${s}px 100%, 0 calc(100% - ${s}px))`;

// ── 훅 ───────────────────────────────────────────────────────
function useInView(threshold = 0.2) {
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

function useCountUp(target, run, duration = 1400) {
	const [val, setVal] = useState(0);
	useEffect(() => {
		if (!run) return undefined;
		let raf;
		let startTs = 0;
		const tick = (now) => {
			if (!startTs) startTs = now;
			const p = Math.min((now - startTs) / duration, 1);
			const eased = 1 - (1 - p) ** 3;
			setVal(target * eased);
			if (p < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [run, target, duration]);
	return val;
}

// ── keyframes ────────────────────────────────────────────────
const scan = keyframes`
	0% { transform: translateY(-100%); opacity: 0; }
	10% { opacity: 0.6; }
	90% { opacity: 0.6; }
	100% { transform: translateY(2400%); opacity: 0; }
`;
const gridDrift = keyframes`
	0% { background-position: 0 0; }
	100% { background-position: 56px 56px; }
`;
const floaty = keyframes`
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-12px); }
`;
const pulseRing = keyframes`
	0%, 100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4), 0 0 30px rgba(0, 212, 255, 0.25); }
	50% { box-shadow: 0 0 0 6px rgba(0, 212, 255, 0), 0 0 50px rgba(0, 212, 255, 0.45); }
`;
const flicker = keyframes`
	0%, 100% { opacity: 1; }
	48% { opacity: 1; }
	50% { opacity: 0.6; }
	52% { opacity: 1; }
`;

const CYAN = '#00d4ff';
const PANEL = 'linear-gradient(135deg, #121a28 0%, #0a0f18 100%)';

const useStyles = makeStyles()((theme) => ({
	page: {
		width: '100%',
		minHeight: '100vh',
		background: '#070a10',
		color: '#e8edf4',
		fontFamily: '"Noto Sans KR", sans-serif',
		overflowX: 'hidden',
		position: 'relative'
	},
	// 전역 배경 레이어
	bgGrid: {
		position: 'fixed',
		inset: 0,
		backgroundImage:
			'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)',
		backgroundSize: '56px 56px',
		animation: `${gridDrift} 9s linear infinite`,
		pointerEvents: 'none',
		zIndex: 0,
		maskImage: 'radial-gradient(ellipse at 50% 0%, #000 0%, transparent 75%)',
		WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, #000 0%, transparent 75%)'
	},
	bgGlow: {
		position: 'fixed',
		top: '-20%',
		left: '50%',
		width: 1100,
		height: 1100,
		transform: 'translateX(-50%)',
		background: 'radial-gradient(circle, rgba(0,212,255,0.16) 0%, rgba(0,80,255,0.06) 38%, transparent 66%)',
		pointerEvents: 'none',
		zIndex: 0
	},
	shell: { position: 'relative', zIndex: 1 },

	// ── HUD nav ──
	nav: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 50,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '14px 40px',
		background: 'rgba(7,10,16,0.72)',
		backdropFilter: 'blur(12px)',
		borderBottom: '1px solid rgba(0,212,255,0.18)',
		'&::after': {
			content: '""',
			position: 'absolute',
			left: 0,
			bottom: -1,
			height: 1,
			width: 140,
			background: `linear-gradient(90deg, ${CYAN}, transparent)`
		},
		[theme.breakpoints.down('sm')]: { padding: '12px 18px' }
	},
	brand: { display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' },
	brandLogo: {
		width: 34,
		height: 34,
		objectFit: 'cover',
		clipPath: cut(8),
		border: '1px solid rgba(0,212,255,0.6)'
	},
	brandName: {
		fontFamily: '"Chakra Petch", sans-serif',
		fontWeight: 700,
		fontSize: '1.5rem',
		letterSpacing: '0.32em',
		textTransform: 'uppercase',
		color: '#fff',
		paddingLeft: '0.32em'
	},
	navRight: { display: 'flex', alignItems: 'center', gap: 22 },
	navMeta: {
		fontFamily: '"Chakra Petch", sans-serif',
		fontSize: '0.8rem',
		letterSpacing: '0.18em',
		color: 'rgba(0,212,255,0.55)',
		textTransform: 'uppercase',
		[theme.breakpoints.down('sm')]: { display: 'none' }
	},

	// ── 버튼(각진) ──
	btnPrimary: {
		fontFamily: '"Chakra Petch", sans-serif',
		fontWeight: 700,
		fontSize: '1.05rem',
		letterSpacing: '0.12em',
		textTransform: 'uppercase',
		color: '#04222b',
		background: `linear-gradient(135deg, ${CYAN} 0%, #00a6cc 100%)`,
		border: 'none',
		clipPath: cut(10),
		padding: '13px 30px',
		cursor: 'pointer',
		position: 'relative',
		transition: 'all 0.2s ease',
		'&:hover': { filter: 'brightness(1.12)', transform: 'translateY(-1px)' }
	},
	btnGhost: {
		fontFamily: '"Chakra Petch", sans-serif',
		fontWeight: 600,
		fontSize: '1.05rem',
		letterSpacing: '0.12em',
		textTransform: 'uppercase',
		color: CYAN,
		background: 'rgba(0,212,255,0.06)',
		border: '1px solid rgba(0,212,255,0.4)',
		clipPath: cut(10),
		padding: '13px 30px',
		cursor: 'pointer',
		transition: 'all 0.2s ease',
		'&:hover': { background: 'rgba(0,212,255,0.14)', transform: 'translateY(-1px)' }
	},

	// ── HERO ──
	hero: {
		position: 'relative',
		minHeight: '100vh',
		display: 'grid',
		gridTemplateColumns: '1.1fr 0.9fr',
		alignItems: 'center',
		gap: 40,
		maxWidth: 1240,
		margin: '0 auto',
		padding: '140px 40px 80px',
		[theme.breakpoints.down('md')]: {
			gridTemplateColumns: '1fr',
			textAlign: 'center',
			padding: '120px 24px 60px'
		}
	},
	scanline: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 80,
		background: `linear-gradient(180deg, transparent, rgba(0,212,255,0.12), transparent)`,
		animation: `${scan} 7s linear infinite`,
		pointerEvents: 'none'
	},
	eyebrow: {
		fontFamily: '"Chakra Petch", sans-serif',
		fontSize: '0.95rem',
		fontWeight: 600,
		letterSpacing: '0.34em',
		textTransform: 'uppercase',
		color: CYAN,
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		marginBottom: 22,
		[theme.breakpoints.down('md')]: { justifyContent: 'center' },
		'&::before': {
			content: '""',
			width: 34,
			height: 2,
			background: CYAN,
			boxShadow: `0 0 10px ${CYAN}`
		}
	},
	title: {
		fontFamily: '"Chakra Petch", sans-serif',
		fontWeight: 700,
		fontSize: '5rem',
		lineHeight: 0.98,
		letterSpacing: '-0.01em',
		margin: 0,
		textTransform: 'uppercase',
		[theme.breakpoints.down('md')]: { fontSize: '3.6rem' },
		[theme.breakpoints.down('sm')]: { fontSize: '2.7rem' }
	},
	titleAccent: {
		color: 'transparent',
		WebkitTextStroke: `1.5px ${CYAN}`,
		textShadow: `0 0 26px rgba(0,212,255,0.55)`,
		display: 'inline-block'
	},
	titleFill: {
		background: `linear-gradient(135deg, ${CYAN}, #0066ff)`,
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text'
	},
	sub: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.45rem',
		lineHeight: 1.65,
		color: 'rgba(232,237,244,0.62)',
		maxWidth: 520,
		marginTop: 26,
		[theme.breakpoints.down('md')]: { margin: '26px auto 0' }
	},
	heroCtas: {
		display: 'flex',
		gap: 14,
		marginTop: 38,
		flexWrap: 'wrap',
		[theme.breakpoints.down('md')]: { justifyContent: 'center' }
	},
	heroStrip: {
		display: 'flex',
		gap: 0,
		marginTop: 52,
		borderTop: '1px solid rgba(0,212,255,0.15)',
		[theme.breakpoints.down('md')]: { justifyContent: 'center' }
	},
	stripItem: {
		padding: '18px 28px 0 0',
		marginRight: 28,
		borderRight: '1px solid rgba(0,212,255,0.12)',
		'&:last-child': { borderRight: 'none', marginRight: 0 }
	},
	stripVal: {
		fontFamily: '"Chakra Petch", sans-serif',
		fontWeight: 700,
		fontSize: '2.1rem',
		color: '#fff',
		lineHeight: 1,
		textShadow: '0 0 18px rgba(0,212,255,0.3)'
	},
	stripLabel: {
		fontFamily: '"Chakra Petch", sans-serif',
		fontSize: '0.78rem',
		letterSpacing: '0.16em',
		textTransform: 'uppercase',
		color: 'rgba(232,237,244,0.4)',
		marginTop: 6
	},

	// ── 히어로 RANK CARD ──
	rankCardWrap: {
		display: 'flex',
		justifyContent: 'center',
		animation: `${floaty} 6s ease-in-out infinite`,
		[theme.breakpoints.down('md')]: { marginTop: 20 }
	},
	rankCard: {
		position: 'relative',
		width: '100%',
		maxWidth: 380,
		background: PANEL,
		clipPath: cut(22),
		border: '1px solid rgba(0,212,255,0.3)',
		padding: '28px 28px 24px',
		boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,212,255,0.05)'
	},
	rankCardTag: {
		fontFamily: '"Chakra Petch", sans-serif',
		fontSize: '0.78rem',
		letterSpacing: '0.24em',
		textTransform: 'uppercase',
		color: CYAN,
		display: 'flex',
		justifyContent: 'space-between',
		marginBottom: 14
	},
	liveDot: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 7,
		color: '#00ff9d',
		animation: `${flicker} 2.4s infinite`
	},
	liveDotMark: { width: 7, height: 7, borderRadius: '50%', background: '#00ff9d', boxShadow: '0 0 8px #00ff9d' },
	rankEmblemBox: { display: 'flex', alignItems: 'center', gap: 18 },
	rankEmblem: { width: 92, height: 92, objectFit: 'contain', filter: 'drop-shadow(0 0 16px rgba(159,233,255,0.5))' },
	rankName: { fontFamily: '"Chakra Petch", sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#fff' },
	rankTier: {
		fontFamily: '"Chakra Petch", sans-serif',
		fontWeight: 700,
		fontSize: '1.9rem',
		color: TIER_COLOR.DIAMOND,
		letterSpacing: '0.04em',
		lineHeight: 1.1
	},
	rankLp: { fontFamily: '"Chakra Petch", sans-serif', fontSize: '1rem', color: 'rgba(232,237,244,0.55)', marginTop: 2 },
	rankStatsRow: { display: 'flex', gap: 10, marginTop: 22 },
	rankStat: {
		flex: 1,
		background: 'rgba(0,212,255,0.05)',
		border: '1px solid rgba(0,212,255,0.14)',
		clipPath: cut(8),
		padding: '12px 10px',
		textAlign: 'center'
	},
	rankStatVal: { fontFamily: '"Chakra Petch", sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#fff' },
	rankStatLabel: {
		fontFamily: '"Chakra Petch", sans-serif',
		fontSize: '0.7rem',
		letterSpacing: '0.12em',
		textTransform: 'uppercase',
		color: 'rgba(232,237,244,0.4)',
		marginTop: 3
	},
	wrBarTrack: {
		marginTop: 18,
		height: 8,
		background: 'rgba(255,70,85,0.25)',
		clipPath: cut(4),
		overflow: 'hidden',
		position: 'relative'
	},
	wrBarFill: {
		height: '100%',
		background: `linear-gradient(90deg, ${CYAN}, #00ff9d)`,
		transition: 'width 1.4s cubic-bezier(0.2,0.8,0.2,1)'
	},
	wrLabelRow: {
		display: 'flex',
		justifyContent: 'space-between',
		marginTop: 8,
		fontFamily: '"Chakra Petch", sans-serif',
		fontSize: '0.82rem',
		letterSpacing: '0.06em'
	},

	// ── 공통 섹션 ──
	section: { position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '96px 40px', [theme.breakpoints.down('sm')]: { padding: '64px 20px' } },
	secHead: { marginBottom: 44 },
	secIndex: {
		fontFamily: '"Chakra Petch", sans-serif',
		fontSize: '0.85rem',
		letterSpacing: '0.28em',
		textTransform: 'uppercase',
		color: 'rgba(0,212,255,0.6)',
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		'&::before': { content: '""', width: 26, height: 2, background: CYAN }
	},
	secTitle: {
		fontFamily: '"Chakra Petch", sans-serif',
		fontWeight: 700,
		fontSize: '2.7rem',
		textTransform: 'uppercase',
		margin: '12px 0 0',
		letterSpacing: '-0.01em',
		[theme.breakpoints.down('sm')]: { fontSize: '2rem' }
	},
	secSub: { fontFamily: '"Noto Sans KR", sans-serif', fontSize: '1.25rem', color: 'rgba(232,237,244,0.5)', marginTop: 10, maxWidth: 560 },

	// ── 라이브 래더 ──
	ladder: { display: 'flex', flexDirection: 'column', gap: 12 },
	row: {
		display: 'grid',
		gridTemplateColumns: '52px 70px 1fr 170px 92px',
		alignItems: 'center',
		gap: 16,
		background: PANEL,
		clipPath: cut(12),
		border: '1px solid rgba(0,212,255,0.12)',
		padding: '14px 22px',
		transition: 'opacity 0.6s ease, transform 0.6s ease, border-color 0.2s ease',
		'&:hover': { borderColor: 'rgba(0,212,255,0.4)' },
		[theme.breakpoints.down('sm')]: { gridTemplateColumns: '36px 50px 1fr 70px', gap: 10, padding: '12px 14px' }
	},
	rowRank: { fontFamily: '"Chakra Petch", sans-serif', fontWeight: 700, fontSize: '1.7rem', color: 'rgba(232,237,244,0.35)', textAlign: 'center' },
	rowEmblem: { width: 50, height: 50, objectFit: 'contain', justifySelf: 'center' },
	rowName: { fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 700, fontSize: '1.3rem', color: '#fff' },
	rowTier: { fontFamily: '"Chakra Petch", sans-serif', fontSize: '0.92rem', letterSpacing: '0.08em', marginTop: 2 },
	rowBarWrap: { [theme.breakpoints.down('sm')]: { display: 'none' } },
	rowBarTrack: { height: 7, background: 'rgba(255,70,85,0.2)', clipPath: cut(3), overflow: 'hidden' },
	rowBarFill: { height: '100%', background: `linear-gradient(90deg, ${CYAN}, #00ff9d)`, transition: 'width 1.2s cubic-bezier(0.2,0.8,0.2,1)' },
	rowBarMeta: { display: 'flex', justifyContent: 'space-between', fontFamily: '"Chakra Petch", sans-serif', fontSize: '0.74rem', color: 'rgba(232,237,244,0.45)', marginTop: 5 },
	rowWr: { fontFamily: '"Chakra Petch", sans-serif', fontWeight: 700, fontSize: '1.5rem', textAlign: 'right', color: '#fff' },

	// ── 티어 트랙 ──
	tierTrack: {
		display: 'flex',
		alignItems: 'flex-end',
		justifyContent: 'space-between',
		gap: 4,
		marginTop: 8,
		padding: '30px 24px',
		background: PANEL,
		clipPath: cut(16),
		border: '1px solid rgba(0,212,255,0.14)',
		overflowX: 'auto'
	},
	tierStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 78, position: 'relative', flex: 1 },
	tierStepImg: { width: 46, height: 46, objectFit: 'contain', transition: 'transform 0.3s ease' },
	// tss-react는 JSS $ruleName 참조를 지원 안 함 → 확대 효과는 별도 클래스로 img에 직접 적용
	tierStepImgCurrent: { width: 64, height: 64, transform: 'translateY(-6px)', filter: 'drop-shadow(0 0 14px rgba(159,233,255,0.7))' },
	tierStepName: { fontFamily: '"Chakra Petch", sans-serif', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap' },
	tierStepCurrent: {
		'&::after': {
			content: '"YOU"',
			position: 'absolute',
			top: -22,
			fontFamily: '"Chakra Petch", sans-serif',
			fontSize: '0.7rem',
			letterSpacing: '0.18em',
			color: '#04222b',
			background: CYAN,
			padding: '2px 8px',
			clipPath: cut(4),
			animation: `${pulseRing} 2.4s infinite`
		}
	},

	// ── 어워드 그리드 ──
	awardGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, [theme.breakpoints.down('md')]: { gridTemplateColumns: 'repeat(2,1fr)' }, [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' } },
	awardCard: {
		position: 'relative',
		background: PANEL,
		clipPath: cut(14),
		border: '1px solid rgba(0,212,255,0.12)',
		padding: '24px 22px',
		transition: 'transform 0.25s ease, border-color 0.25s ease',
		'&:hover': { transform: 'translateY(-5px)' }
	},
	awardIcon: { fontSize: '2rem', display: 'block' },
	awardTitle: { fontFamily: '"Chakra Petch", sans-serif', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 14 },
	awardWho: { fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 700, fontSize: '1.35rem', color: '#fff', marginTop: 10 },
	awardStat: { fontFamily: '"Chakra Petch", sans-serif', fontWeight: 700, fontSize: '1.8rem', marginTop: 4 },

	// ── 성장 차트 ──
	chartPanel: { background: PANEL, clipPath: cut(18), border: '1px solid rgba(0,212,255,0.14)', padding: '28px 30px 18px', position: 'relative' },
	chartSvg: { width: '100%', height: 260, display: 'block', [theme.breakpoints.down('sm')]: { height: 180 } },
	chartCaption: { display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: '"Chakra Petch", sans-serif', fontSize: '0.82rem', letterSpacing: '0.08em', color: 'rgba(232,237,244,0.45)' },
	splitCols: { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'center', [theme.breakpoints.down('md')]: { gridTemplateColumns: '1fr' } },
	achPanel: { background: PANEL, clipPath: cut(16), border: '1px solid rgba(0,212,255,0.14)', padding: '26px 26px' },
	achHead: { fontFamily: '"Chakra Petch", sans-serif', fontWeight: 700, fontSize: '1.3rem', letterSpacing: '0.1em', textTransform: 'uppercase' },
	achBarTrack: { height: 10, background: 'rgba(0,212,255,0.1)', clipPath: cut(4), overflow: 'hidden', marginTop: 16 },
	achBarFill: { height: '100%', background: `linear-gradient(90deg, ${CYAN}, #0066ff)`, transition: 'width 1.4s cubic-bezier(0.2,0.8,0.2,1)' },
	achCount: { fontFamily: '"Chakra Petch", sans-serif', marginTop: 12, fontSize: '0.95rem', color: 'rgba(232,237,244,0.55)', letterSpacing: '0.06em' },
	achBadges: { display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' },
	achBadge: { width: 38, height: 38, clipPath: cut(8), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.06)' },

	// ── 미니 브래킷 ──
	bracket: { display: 'flex', gap: 18, alignItems: 'center' },
	bracketCol: { display: 'flex', flexDirection: 'column', gap: 14, flex: 1 },
	matchBox: { background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.16)', clipPath: cut(8), padding: '10px 12px' },
	matchTeam: { display: 'flex', justifyContent: 'space-between', fontFamily: '"Noto Sans KR", sans-serif', fontSize: '0.95rem', padding: '2px 0' },
	matchWin: { color: '#00ff9d', fontWeight: 700 },
	matchLose: { color: 'rgba(232,237,244,0.4)' },

	// ── 벤토 ──
	bento: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, [theme.breakpoints.down('md')]: { gridTemplateColumns: 'repeat(2,1fr)' }, [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' } },
	bentoCard: { background: PANEL, clipPath: cut(12), border: '1px solid rgba(0,212,255,0.12)', padding: '24px 22px', transition: 'transform 0.25s ease', '&:hover': { transform: 'translateY(-4px)' } },
	bentoIcon: { fontSize: '1.9rem', display: 'block', marginBottom: 12 },
	bentoTitle: { fontFamily: '"Chakra Petch", sans-serif', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.04em' },
	bentoDesc: { fontFamily: '"Noto Sans KR", sans-serif', fontSize: '1.05rem', lineHeight: 1.55, color: 'rgba(232,237,244,0.5)', marginTop: 8 },

	// ── 푸터 ──
	footer: { position: 'relative', textAlign: 'center', padding: '120px 24px 90px', overflow: 'hidden' },
	footerTitle: { fontFamily: '"Chakra Petch", sans-serif', fontWeight: 700, fontSize: '3.4rem', textTransform: 'uppercase', letterSpacing: '-0.01em', [theme.breakpoints.down('sm')]: { fontSize: '2.2rem' } },
	footerDesc: { fontFamily: '"Noto Sans KR", sans-serif', fontSize: '1.35rem', color: 'rgba(232,237,244,0.55)', marginTop: 16 },
	footerNote: { fontFamily: '"Chakra Petch", sans-serif', fontSize: '0.82rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(232,237,244,0.28)', marginTop: 60 }
}));

// ── 리빌 래퍼 ──
function Reveal({ children, delay = 0, className }) {
	const { ref, inView } = useInView(0.15);
	return (
		<div
			ref={ref}
			className={className}
			style={{
				opacity: inView ? 1 : 0,
				transform: inView ? 'translateY(0)' : 'translateY(34px)',
				transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`
			}}
		>
			{children}
		</div>
	);
}

// ── 래더 행 ──
function LadderRow({ data, classes, index }) {
	const { ref, inView } = useInView(0.4);
	const total = data.win + data.loss;
	const wr = Math.round((data.win / total) * 100);
	const color = TIER_COLOR[data.tier];
	return (
		<div
			ref={ref}
			className={classes.row}
			style={{
				opacity: inView ? 1 : 0,
				transform: inView ? 'translateX(0)' : 'translateX(-30px)',
				transitionDelay: `${index * 0.08}s`
			}}
		>
			<div className={classes.rowRank}>{data.rank}</div>
			<img className={classes.rowEmblem} src={EMBLEM(data.tier)} alt={data.tier} />
			<div>
				<div className={classes.rowName}>{data.name}</div>
				<div className={classes.rowTier} style={{ color }}>
					{data.tier} · {data.sub}
				</div>
			</div>
			<div className={classes.rowBarWrap}>
				<div className={classes.rowBarTrack}>
					<div className={classes.rowBarFill} style={{ width: inView ? `${wr}%` : '0%' }} />
				</div>
				<div className={classes.rowBarMeta}>
					<span style={{ color: '#00ff9d' }}>{data.win}승</span>
					<span style={{ color: '#ff4655' }}>{data.loss}패</span>
				</div>
			</div>
			<div className={classes.rowWr}>{wr}%</div>
		</div>
	);
}

// ── 카운트업 숫자 ──
function CountStat({ value, suffix = '', decimals = 0, run }) {
	const v = useCountUp(value, run);
	return (
		<>
			{decimals ? v.toFixed(decimals) : Math.round(v)}
			{suffix}
		</>
	);
}

// ── 성장 차트 (자가 드로잉 SVG) ──
function GrowthChart({ classes }) {
	const { ref, inView } = useInView(0.3);
	const W = 720;
	const H = 240;
	const pad = 16;
	const min = Math.min(...CHART) - 30;
	const max = Math.max(...CHART) + 20;
	const pts = CHART.map((v, i) => {
		const x = pad + (i / (CHART.length - 1)) * (W - pad * 2);
		const y = H - pad - ((v - min) / (max - min)) * (H - pad * 2);
		return [x, y];
	});
	const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
	const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z`;
	return (
		<div ref={ref} className={classes.chartPanel}>
			<svg className={classes.chartSvg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
				<defs>
					<linearGradient id="gv-area" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={CYAN} stopOpacity="0.35" />
						<stop offset="100%" stopColor={CYAN} stopOpacity="0" />
					</linearGradient>
					<linearGradient id="gv-line" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor={CYAN} />
						<stop offset="100%" stopColor="#0066ff" />
					</linearGradient>
				</defs>
				<path d={area} fill="url(#gv-area)" style={{ opacity: inView ? 1 : 0, transition: 'opacity 1.4s ease 0.4s' }} />
				<path
					d={line}
					fill="none"
					stroke="url(#gv-line)"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
					style={{
						strokeDasharray: 2000,
						strokeDashoffset: inView ? 0 : 2000,
						transition: 'stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1)',
						filter: `drop-shadow(0 0 6px rgba(0,212,255,0.5))`
					}}
				/>
				{pts.map((p, i) => (
					<circle
						key={i}
						cx={p[0]}
						cy={p[1]}
						r="3.5"
						fill="#070a10"
						stroke={CYAN}
						strokeWidth="2"
						style={{ opacity: inView ? 1 : 0, transition: `opacity 0.4s ease ${0.6 + i * 0.08}s` }}
					/>
				))}
			</svg>
			<div className={classes.chartCaption}>
				<span>시즌 시작</span>
				<span style={{ color: CYAN }}>DIAMOND I · 844</span>
			</div>
		</div>
	);
}

function WelcomeContent() {
	const { classes, cx } = useStyles();
	const navigate = useNavigate();
	const heroRef = useInView(0.3);
	const achRef = useInView(0.4);

	const goLogin = () => navigate('/login');
	const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

	return (
		<div className={classes.page}>
			<div className={classes.bgGrid} />
			<div className={classes.bgGlow} />

			<div className={classes.shell}>
				{/* HUD nav */}
				<nav className={classes.nav}>
					<div className={classes.brand} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
						<img className={classes.brandLogo} src="/assets/images/graves.jpg" alt="Graves" />
						<span className={classes.brandName}>Graves</span>
					</div>
					<div className={classes.navRight}>
						<span className={classes.navMeta}>// CUSTOM GAME NETWORK</span>
						<button type="button" className={classes.btnPrimary} onClick={goLogin}>
							로그인
						</button>
					</div>
				</nav>

				{/* HERO */}
				<header className={classes.hero} ref={heroRef.ref}>
					<div className={classes.scanline} />
					<div>
						<div className={classes.eyebrow}>LoL Custom Game Statistics</div>
						<h1 className={classes.title}>
							우리끼리의 내전,
							<br />
							<span className={classes.titleAccent}>전장</span>
							<span className={classes.titleFill}>으로.</span>
						</h1>
						<p className={classes.sub}>
							그룹 내전을 추적하고 티어·랭킹·업적으로 겨루는 통계 플랫폼. 솔랭이 아닌 우리만의 진짜 순위를 매깁니다.
						</p>
						<div className={classes.heroCtas}>
							<button type="button" className={classes.btnPrimary} onClick={goLogin}>
								시작하기
							</button>
							<button type="button" className={classes.btnGhost} onClick={() => scrollTo('ladder')}>
								랭킹 둘러보기
							</button>
						</div>
						<div className={classes.heroStrip}>
							<div className={classes.stripItem}>
								<div className={classes.stripVal}>
									<CountStat value={10} run={heroRef.inView} />
								</div>
								<div className={classes.stripLabel}>Tier Ranks</div>
							</div>
							<div className={classes.stripItem}>
								<div className={classes.stripVal}>
									<CountStat value={209} run={heroRef.inView} />
								</div>
								<div className={classes.stripLabel}>Achievements</div>
							</div>
							<div className={classes.stripItem}>
								<div className={classes.stripVal}>
									<CountStat value={150} run={heroRef.inView} suffix="+" />
								</div>
								<div className={classes.stripLabel}>Monthly Games</div>
							</div>
						</div>
					</div>

					{/* RANK CARD */}
					<div className={classes.rankCardWrap}>
						<div className={classes.rankCard}>
							<div className={classes.rankCardTag}>
								<span>RANK PROFILE</span>
								<span className={classes.liveDot}>
									<span className={classes.liveDotMark} />
									LIVE
								</span>
							</div>
							<div className={classes.rankEmblemBox}>
								<img className={classes.rankEmblem} src={EMBLEM('DIAMOND')} alt="DIAMOND" />
								<div>
									<div className={classes.rankName}>ZeroBoom#KR1</div>
									<div className={classes.rankTier}>DIAMOND I</div>
									<div className={classes.rankLp}>
										<CountStat value={44} run={heroRef.inView} /> LP
									</div>
								</div>
							</div>
							<div className={classes.rankStatsRow}>
								<div className={classes.rankStat}>
									<div className={classes.rankStatVal} style={{ color: '#00ff9d' }}>
										<CountStat value={39} run={heroRef.inView} />
									</div>
									<div className={classes.rankStatLabel}>WINS</div>
								</div>
								<div className={classes.rankStat}>
									<div className={classes.rankStatVal} style={{ color: '#ff4655' }}>
										<CountStat value={28} run={heroRef.inView} />
									</div>
									<div className={classes.rankStatLabel}>LOSSES</div>
								</div>
								<div className={classes.rankStat}>
									<div className={classes.rankStatVal}>
										<CountStat value={59} run={heroRef.inView} suffix="%" />
									</div>
									<div className={classes.rankStatLabel}>WIN RATE</div>
								</div>
							</div>
							<div className={classes.wrBarTrack}>
								<div className={classes.wrBarFill} style={{ width: heroRef.inView ? '59%' : '0%' }} />
							</div>
							<div className={classes.wrLabelRow}>
								<span style={{ color: '#00ff9d' }}>WIN 59%</span>
								<span style={{ color: '#ff4655' }}>LOSS 41%</span>
							</div>
						</div>
					</div>
				</header>

				{/* LIVE LADDER */}
				<section className={classes.section} id="ladder">
					<Reveal className={classes.secHead}>
						<div className={classes.secIndex}>01 / Ranking</div>
						<h2 className={classes.secTitle}>실시간 내전 랭킹</h2>
						<p className={classes.secSub}>
							판수·승률 기반 레이팅을 LoL 티어와 LP로 환산. 우리끼리의 사다리를 매주 다시 그립니다.
						</p>
					</Reveal>
					<div className={classes.ladder}>
						{LADDER.map((row, i) => (
							<LadderRow key={row.rank} data={row} classes={classes} index={i} />
						))}
					</div>
				</section>

				{/* TIER TRACK */}
				<section className={classes.section}>
					<Reveal className={classes.secHead}>
						<div className={classes.secIndex}>02 / Tiers</div>
						<h2 className={classes.secTitle}>IRON에서 CHALLENGER까지</h2>
						<p className={classes.secSub}>레이팅이 오를수록 티어가 승급합니다. 지금 당신의 자리는 어디인가요?</p>
					</Reveal>
					<Reveal delay={0.1}>
						<div className={classes.tierTrack}>
							{TIERS.map((t) => (
								<div
									key={t.name}
									className={cx(classes.tierStep, t.name === 'DIAMOND' && classes.tierStepCurrent)}
								>
									<img
										className={cx(classes.tierStepImg, t.name === 'DIAMOND' && classes.tierStepImgCurrent)}
										src={EMBLEM(t.name)}
										alt={t.name}
									/>
									<span className={classes.tierStepName} style={{ color: TIER_COLOR[t.name] }}>
										{t.name}
									</span>
								</div>
							))}
						</div>
					</Reveal>
				</section>

				{/* MONTHLY AWARDS */}
				<section className={classes.section}>
					<Reveal className={classes.secHead}>
						<div className={classes.secIndex}>03 / Dashboard</div>
						<h2 className={classes.secTitle}>이번 달 내전 하이라이트</h2>
						<p className={classes.secSub}>매달 자동 집계되는 어워드로 그 달의 주인공을 가립니다.</p>
					</Reveal>
					<div className={classes.awardGrid}>
						{AWARDS.map((a, i) => (
							<Reveal key={a.label} delay={i * 0.08}>
								<div className={classes.awardCard} style={{ borderColor: `${a.tone}40` }}>
									<span className={classes.awardIcon} role="img" aria-label={a.label}>
										{a.icon}
									</span>
									<div className={classes.awardTitle} style={{ color: a.tone }}>
										{a.title}
									</div>
									<div className={classes.awardWho}>{a.who}</div>
									<div className={classes.awardStat} style={{ color: a.tone }}>
										{a.stat}
									</div>
								</div>
							</Reveal>
						))}
					</div>
				</section>

				{/* GROWTH + ACHIEVEMENTS */}
				<section className={classes.section}>
					<Reveal className={classes.secHead}>
						<div className={classes.secIndex}>04 / My Career</div>
						<h2 className={classes.secTitle}>내 전적과 성장</h2>
						<p className={classes.secSub}>레이팅 추이부터 업적 컬렉션까지 — 내 내전 커리어를 한눈에 추적합니다.</p>
					</Reveal>
					<div className={classes.splitCols}>
						<Reveal>
							<GrowthChart classes={classes} />
						</Reveal>
						<Reveal delay={0.1}>
							<div className={classes.achPanel} ref={achRef.ref}>
								<div className={classes.achHead}>🏆 업적 컬렉션</div>
								<div className={classes.achBarTrack}>
									<div className={classes.achBarFill} style={{ width: achRef.inView ? '27.7%' : '0%' }} />
								</div>
								<div className={classes.achCount}>
									<CountStat value={58} run={achRef.inView} /> / 209 달성
								</div>
								<div className={classes.achBadges}>
									{['🥇', '🥈', '🥉', '⚔️', '🔥', '🎯', '💎', '👑'].map((b, i) => (
										<span key={i} className={classes.achBadge} role="img" aria-label="badge">
											{b}
										</span>
									))}
								</div>
							</div>
						</Reveal>
					</div>
				</section>

				{/* TOURNAMENT */}
				<section className={classes.section}>
					<Reveal className={classes.secHead}>
						<div className={classes.secIndex}>05 / Tournament</div>
						<h2 className={classes.secTitle}>경매 드래프트 & 토너먼트</h2>
						<p className={classes.secSub}>팀원 경매로 밸런스를 맞추고, 예선부터 결승까지 대진표로 진행합니다.</p>
					</Reveal>
					<Reveal delay={0.1}>
						<div className={classes.chartPanel}>
							<div className={classes.bracket}>
								<div className={classes.bracketCol}>
									{[
										['미정이가 누구야?', 2, '송혜원졌다고', 1],
										['챙공불이', 2, '슈퍼알치라메', 1]
									].map((m, i) => (
										<div key={i} className={classes.matchBox}>
											<div className={classes.matchTeam}>
												<span>{m[0]}</span>
												<span className={classes.matchWin}>{m[1]}</span>
											</div>
											<div className={classes.matchTeam}>
												<span className={classes.matchLose}>{m[2]}</span>
												<span className={classes.matchLose}>{m[3]}</span>
											</div>
										</div>
									))}
								</div>
								<div className={classes.bracketCol}>
									<div className={classes.matchBox}>
										<div className={classes.matchTeam}>
											<span>챙공불이</span>
											<span className={classes.matchWin}>2</span>
										</div>
										<div className={classes.matchTeam}>
											<span className={classes.matchLose}>미정이가 누구야?</span>
											<span className={classes.matchLose}>0</span>
										</div>
									</div>
								</div>
								<div className={classes.bracketCol}>
									<div className={classes.matchBox} style={{ borderColor: 'rgba(255,215,0,0.4)' }}>
										<div className={classes.matchTeam}>
											<span style={{ color: '#ffd700', fontWeight: 700 }}>🏆 미정</span>
											<span className={classes.matchWin}>2</span>
										</div>
										<div className={classes.matchTeam}>
											<span className={classes.matchLose}>챙공불이</span>
											<span className={classes.matchLose}>0</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Reveal>
				</section>

				{/* BENTO */}
				<section className={classes.section}>
					<Reveal className={classes.secHead}>
						<div className={classes.secIndex}>+ / More</div>
						<h2 className={classes.secTitle}>내전을 더 풍성하게</h2>
					</Reveal>
					<div className={classes.bento}>
						{BENTO.map((b, i) => (
							<Reveal key={b.label} delay={i * 0.06}>
								<div className={classes.bentoCard}>
									<span className={classes.bentoIcon} role="img" aria-label={b.label}>
										{b.icon}
									</span>
									<div className={classes.bentoTitle}>{b.title}</div>
									<p className={classes.bentoDesc}>{b.desc}</p>
								</div>
							</Reveal>
						))}
					</div>
				</section>

				{/* FOOTER */}
				<footer className={classes.footer}>
					<div className={classes.bgGlow} style={{ top: 'auto', bottom: '-40%' }} />
					<Reveal>
						<h2 className={classes.footerTitle}>전장에 합류하라</h2>
						<p className={classes.footerDesc}>롤 닉네임#태그 하나면 충분합니다.</p>
						<div className={classes.heroCtas} style={{ justifyContent: 'center', marginTop: 32 }}>
							<button type="button" className={classes.btnPrimary} onClick={goLogin}>
								로그인하고 시작하기
							</button>
						</div>
						<div className={classes.footerNote}>Graves · LoL Custom Game Statistics</div>
					</Reveal>
				</footer>
			</div>
		</div>
	);
}

export default WelcomeContent;
