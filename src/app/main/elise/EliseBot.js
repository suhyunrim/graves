import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Button, Typography } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import DownloadIcon from '@mui/icons-material/Download';
import MemoryIcon from '@mui/icons-material/Memory';
import SpeedIcon from '@mui/icons-material/Speed';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import WifiIcon from '@mui/icons-material/Wifi';
import ShieldIcon from '@mui/icons-material/Shield';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Reveal, RevealGroup } from '../components/Reveal';

const DOWNLOAD_URL = 'https://zeroboom.lol/elise/download'; // 고정 URL — 서버가 항상 최신 버전으로 리다이렉트

const LIGHTWEIGHT_ITEMS = [
	{
		key: 'memory',
		icon: MemoryIcon,
		label: '메모리',
		value: '약 100MB',
		desc: '크롬 탭 1개 수준'
	},
	{
		key: 'cpu',
		icon: SpeedIcon,
		label: 'CPU',
		value: '평상시 0%',
		desc: '15초에 한 번 롤 클라이언트를 가볍게 확인하는 게 전부'
	},
	{
		key: 'game',
		icon: SportsEsportsIcon,
		label: '게임 성능',
		value: '영향 없음',
		desc: '게임 프로세스에 접근하지 않고 오버레이도 없는 순수 뷰어 (롤 클라이언트의 로컬 API만 읽음)'
	},
	{
		key: 'network',
		icon: WifiIcon,
		label: '네트워크',
		value: '게임당 수백 KB',
		desc: '새 내전 게임이 있을 때만 업로드, 그 외 통신 없음'
	}
];

const CAUTION_ITEMS = [
	{
		key: 'smartscreen',
		icon: ShieldIcon,
		title: 'Windows 보호 화면(SmartScreen)이 뜨는 경우',
		body: "'알 수 없는 게시자' 경고가 표시될 수 있습니다. [추가 정보] 클릭 → [실행] 버튼을 누르면 설치됩니다. 개인 개발 앱이라 코드서명 인증서가 없어서 뜨는 경고로, 악성 프로그램이 아닙니다."
	},
	{
		key: 'autostart',
		icon: PowerSettingsNewIcon,
		title: '자동 시작 켜기',
		body: "상태창의 '자동 시작' 토글을 켜두세요. 롤 클라이언트의 매치 히스토리는 최근 20판까지만 조회되므로, 엘리스가 꺼진 채 게임을 많이 하면 수집이 누락될 수 있습니다."
	},
	{
		key: 'subaccount',
		icon: PersonAddIcon,
		title: '부캐로 내전하는 경우',
		body: '부캐 전적이 본캐로 합산되려면 마이페이지에서 부캐를 등록해두세요.'
	}
];

const FAQ_ITEMS = [
	{
		key: 'game-impact',
		q: '게임에 영향 있나요?',
		a: '없습니다. 클라이언트의 로컬 API만 읽는 뷰어로, 게임 프로세스에 접근하지 않습니다.'
	},
	{
		key: 'when-on',
		q: '언제 켜두면 되나요?',
		a: '항상 켜두세요. 내전 직후가 아니어도 클라이언트를 켜면 최근 판을 소급 수집합니다.'
	},
	{
		key: 'during-game',
		q: '게임 중에도 켜져 있어야 하나요?',
		a: '아니요. 게임이 끝난 뒤 롤 클라이언트가 켜져 있을 때 수집됩니다.'
	},
	{
		key: 'update',
		q: '업데이트는 어떻게 하나요?',
		a: '자동입니다. 새 버전이 나오면 스스로 받아서 적용됩니다.'
	}
];

const useStyles = makeStyles()((theme) => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	},
	headerRoot: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		padding: '24px 28px 20px',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '4rem',
		color: '#fff',
		textTransform: 'uppercase',
		letterSpacing: '0.15em',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
		margin: 0,
		[theme.breakpoints.down('md')]: {
			fontSize: '2.75rem'
		}
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.6)',
		letterSpacing: '0.05em',
		marginTop: 10,
		[theme.breakpoints.down('md')]: {
			fontSize: '1.35rem'
		}
	},
	container: {
		padding: '28px',
		maxWidth: 900,
		margin: '0 auto',
		width: '100%',
		[theme.breakpoints.down('sm')]: {
			padding: '20px 16px'
		}
	},
	section: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 16,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		padding: '24px 28px',
		marginBottom: 24,
		[theme.breakpoints.down('sm')]: {
			padding: '20px 18px',
			borderRadius: 14
		}
	},
	sectionTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.05em',
		marginBottom: 18,
		paddingLeft: 14,
		position: 'relative',
		'&::before': {
			content: '""',
			position: 'absolute',
			left: 0,
			top: '50%',
			transform: 'translateY(-50%)',
			width: 4,
			height: '1.1em',
			borderRadius: 2,
			background: 'linear-gradient(180deg, #00d4ff, #0066ff)'
		}
	},
	hero: {
		textAlign: 'center',
		padding: '40px 28px 36px'
	},
	heroEmoji: {
		fontSize: '4.2rem',
		lineHeight: 1,
		display: 'block',
		marginBottom: 14
	},
	heroTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2.6rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.05em',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
		marginBottom: 12
	},
	heroDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.75)',
		lineHeight: 1.7,
		maxWidth: 560,
		margin: '0 auto 26px'
	},
	downloadBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.6rem',
		padding: '14px 44px',
		borderRadius: 12,
		textTransform: 'none',
		boxShadow: '0 4px 18px rgba(0, 212, 255, 0.25)',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)',
			boxShadow: '0 6px 22px rgba(0, 212, 255, 0.4)'
		}
	},
	downloadCaption: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginTop: 12
	},
	lightGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
		gap: 14,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr 1fr',
			gap: 10
		}
	},
	lightCard: {
		background: 'rgba(0, 0, 0, 0.25)',
		border: '1px solid rgba(0, 212, 255, 0.12)',
		borderRadius: 12,
		padding: '16px 18px',
		display: 'flex',
		flexDirection: 'column',
		gap: 6
	},
	lightIcon: {
		color: 'rgba(0, 212, 255, 0.7)',
		fontSize: '2.2rem'
	},
	lightLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	lightValue: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#00ff7f'
	},
	lightDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.55)',
		lineHeight: 1.55
	},
	cautionList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12
	},
	cautionCard: {
		background: 'rgba(0, 0, 0, 0.25)',
		border: '1px solid rgba(0, 212, 255, 0.12)',
		borderRadius: 12,
		padding: '16px 18px',
		display: 'flex',
		gap: 14,
		alignItems: 'flex-start'
	},
	cautionIcon: {
		color: 'rgba(0, 212, 255, 0.7)',
		fontSize: '2.2rem',
		flexShrink: 0,
		marginTop: 2
	},
	cautionTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.35rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.9)',
		marginBottom: 6
	},
	cautionBody: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.6)',
		lineHeight: 1.65
	},
	faqList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12
	},
	faqItem: {
		background: 'rgba(0, 0, 0, 0.25)',
		border: '1px solid rgba(0, 212, 255, 0.12)',
		borderRadius: 12,
		padding: '14px 18px'
	},
	faqQ: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.9)',
		marginBottom: 6,
		'&::before': {
			content: '"Q. "',
			color: '#00d4ff',
			fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif'
		}
	},
	faqA: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.6)',
		lineHeight: 1.65
	}
}));

function EliseBot() {
	const { classes, cx } = useStyles();

	return (
		<FusePageSimple
			classes={{ root: classes.layoutRoot }}
			header={
				<div className={classes.headerRoot}>
					<Typography className={classes.title} variant="h4">
						Elise Bot
					</Typography>
					<Typography className={classes.subtitle}>내전 전적 자동 수집기</Typography>
				</div>
			}
			content={
				<div className={classes.container}>
					<Reveal>
						<div className={cx(classes.section, classes.hero)}>
							<span className={classes.heroEmoji} role="img" aria-label="spider">
								🕷️
							</span>
							<div className={classes.heroTitle}>Elise Bot — 내전 전적 자동 수집기</div>
							<div className={classes.heroDesc}>
								롤 클라이언트에서 내전/스크림 게임의 챔피언, KDA, CS 등을 자동으로 수집해 전적 페이지에
								반영합니다. 켜두기만 하면 됩니다 — 게임 중 조작 불필요, 트레이 상주, 자동 업데이트.
							</div>
							<Button className={classes.downloadBtn} href={DOWNLOAD_URL} startIcon={<DownloadIcon />}>
								다운로드
							</Button>
							<div className={classes.downloadCaption}>Windows 전용 · 설치 후 자동 실행 · 자동 업데이트 지원</div>
						</div>
					</Reveal>

					<Reveal delay={0.1}>
						<div className={classes.section}>
							<div className={classes.sectionTitle}>컴퓨터에 부담이 거의 없습니다</div>
							<RevealGroup className={classes.lightGrid}>
								{LIGHTWEIGHT_ITEMS.map(item => {
									const Icon = item.icon;
									return (
										<div key={item.key} className={classes.lightCard}>
											<Icon className={classes.lightIcon} />
											<span className={classes.lightLabel}>{item.label}</span>
											<span className={classes.lightValue}>{item.value}</span>
											<span className={classes.lightDesc}>{item.desc}</span>
										</div>
									);
								})}
							</RevealGroup>
						</div>
					</Reveal>

					<Reveal delay={0.2}>
						<div className={classes.section}>
							<div className={classes.sectionTitle}>설치 시 이것만 확인하세요</div>
							<RevealGroup className={classes.cautionList}>
								{CAUTION_ITEMS.map(item => {
									const Icon = item.icon;
									return (
										<div key={item.key} className={classes.cautionCard}>
											<Icon className={classes.cautionIcon} />
											<div>
												<div className={classes.cautionTitle}>{item.title}</div>
												<div className={classes.cautionBody}>{item.body}</div>
											</div>
										</div>
									);
								})}
							</RevealGroup>
						</div>
					</Reveal>

					<Reveal delay={0.3}>
						<div className={classes.section}>
							<div className={classes.sectionTitle}>자주 묻는 질문</div>
							<RevealGroup className={classes.faqList}>
								{FAQ_ITEMS.map(item => (
									<div key={item.key} className={classes.faqItem}>
										<div className={classes.faqQ}>{item.q}</div>
										<div className={classes.faqA}>{item.a}</div>
									</div>
								))}
							</RevealGroup>
						</div>
					</Reveal>
				</div>
			}
		/>
	);
}

export default EliseBot;
