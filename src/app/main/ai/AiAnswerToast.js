import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Slide from '@mui/material/Slide';
import { makeStyles } from 'tss-react/mui';

// 마크다운 기호를 걷어낸 한 줄 미리보기(토스트는 답변 요약만 보여준다).
function previewText(s) {
	const plain = (s || '')
		.replace(/[#*`_>~[\]]/g, '')
		.replace(/\n+/g, ' ')
		.trim();
	return plain.length > 80 ? `${plain.slice(0, 80)}…` : plain;
}

const useStyles = makeStyles()((theme) => ({
	root: {
		[theme.breakpoints.up('sm')]: {
			maxWidth: 440
		}
	},
	card: {
		display: 'flex',
		alignItems: 'flex-start',
		gap: 12,
		width: '100%',
		padding: '14px 14px 14px 18px',
		cursor: 'pointer',
		textAlign: 'left',
		border: '1px solid rgba(0, 212, 255, 0.35)',
		borderRadius: 14,
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 32px rgba(0, 212, 255, 0.12)',
		color: '#fff',
		transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
		'&:hover': {
			borderColor: 'rgba(0, 212, 255, 0.6)',
			boxShadow: '0 10px 36px rgba(0, 0, 0, 0.55), 0 0 44px rgba(0, 212, 255, 0.22)'
		}
	},
	iconWrap: {
		flex: '0 0 auto',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 38,
		height: 38,
		borderRadius: '50%',
		marginTop: 2,
		fontSize: '1.6rem',
		background: 'rgba(0, 212, 255, 0.12)',
		border: '1px solid rgba(0, 212, 255, 0.3)'
	},
	body: {
		flex: 1,
		minWidth: 0
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.35rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.03em'
	},
	preview: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		lineHeight: 1.45,
		color: 'rgba(255, 255, 255, 0.85)',
		marginTop: 3,
		display: '-webkit-box',
		WebkitLineClamp: 2,
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden',
		wordBreak: 'break-word'
	},
	hint: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(0, 212, 255, 0.7)',
		marginTop: 6
	},
	closeBtn: {
		flex: '0 0 auto',
		marginTop: -2,
		marginRight: -4,
		color: 'rgba(255, 255, 255, 0.5)',
		'&:hover': {
			color: '#fff',
			background: 'rgba(255, 255, 255, 0.08)'
		}
	}
}));

function SlideUp(props) {
	return <Slide {...props} direction="up" />;
}

// 자리 비운 사이 도착한 AI 답변 알림. 클릭하면 /ai로 이동(onOpen), X는 닫기(onClose).
// 동시 요청은 1개뿐이라 자동으로 사라지지 않고 클릭/닫기 전까지 유지한다.
function AiAnswerToast({ data, onOpen, onClose }) {
	const { classes } = useStyles();

	const handleCardKeyDown = (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onOpen();
		}
	};

	return (
		<Snackbar
			open={Boolean(data)}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			slots={{ transition: SlideUp }}
			classes={{ root: classes.root }}
		>
			<div
				role="button"
				tabIndex={0}
				className={classes.card}
				onClick={onOpen}
				onKeyDown={handleCardKeyDown}
			>
				<span className={classes.iconWrap} role="img" aria-label="robot">
					&#x1F916;
				</span>
				<div className={classes.body}>
					<div className={classes.title}>AI 도우미 답변 도착</div>
					<div className={classes.preview}>{previewText(data?.text)}</div>
					<div className={classes.hint}>탭하여 보기 →</div>
				</div>
				<IconButton
					aria-label="알림 닫기"
					size="small"
					className={classes.closeBtn}
					onClick={(e) => {
						e.stopPropagation();
						onClose();
					}}
				>
					<Icon style={{ fontSize: 20 }}>close</Icon>
				</IconButton>
			</div>
		</Snackbar>
	);
}

export default React.memo(AiAnswerToast);
