import React, { useState, useRef, useEffect } from 'react';
import { TextField, IconButton, Chip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { askAI, AI_QUESTION_MAX } from './aiApi';

const blink = keyframes`
	0%, 80%, 100% { opacity: 0.2; transform: translateY(0); }
	40% { opacity: 1; transform: translateY(-3px); }
`;

const EXAMPLE_QUESTIONS = [
	'이 그룹 고인물 누구?',
	'내 업적 더 따려면 뭘 해야 해?',
	'승률 1위는?',
	'최근 가장 폼 좋은 사람은?'
];

// remarkGfm: 표/취소선/자동링크, remarkBreaks: 단일 줄바꿈(\n)을 <br>로 유지(채팅 느낌).
const MARKDOWN_PLUGINS = [remarkGfm, remarkBreaks];
// 링크는 새 탭으로(SPA 이탈 방지). node prop은 DOM에 안 넘기게 제거.
const MARKDOWN_COMPONENTS = {
	// eslint-disable-next-line no-unused-vars
	a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
};

const useStyles = makeStyles()((theme) => ({
	root: {
		maxWidth: 900,
		margin: '0 auto',
		width: '100%',
		padding: '20px 28px',
		display: 'flex',
		flexDirection: 'column',
		height: 'calc(100vh - 184px)',
		[theme.breakpoints.down('sm')]: {
			padding: '12px 16px',
			height: 'calc(100vh - 150px)'
		}
	},
	loginNotice: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.55)',
		background: 'rgba(0, 212, 255, 0.08)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		borderRadius: 10,
		padding: '8px 14px',
		marginBottom: 12
	},
	messages: {
		flex: 1,
		overflowY: 'auto',
		display: 'flex',
		flexDirection: 'column',
		gap: 14,
		padding: '4px 4px 12px',
		// 얇은 cyan 스크롤바
		'&::-webkit-scrollbar': { width: 8 },
		'&::-webkit-scrollbar-thumb': {
			background: 'rgba(0, 212, 255, 0.25)',
			borderRadius: 4
		}
	},
	emptyState: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 18,
		textAlign: 'center'
	},
	emptyTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.9rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.03em'
	},
	emptyDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.5)',
		lineHeight: 1.6
	},
	chips: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: 10,
		justifyContent: 'center',
		maxWidth: 560
	},
	chip: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		height: 'auto',
		padding: '8px 4px',
		color: 'rgba(255, 255, 255, 0.85)',
		background: 'rgba(0, 0, 0, 0.25)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.12)',
			borderColor: 'rgba(0, 212, 255, 0.5)'
		}
	},
	row: {
		display: 'flex',
		width: '100%'
	},
	rowUser: {
		justifyContent: 'flex-end'
	},
	rowAi: {
		justifyContent: 'flex-start'
	},
	bubble: {
		maxWidth: '78%',
		padding: '12px 16px',
		borderRadius: 16,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.35rem',
		lineHeight: 1.6,
		wordBreak: 'break-word',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.25rem',
			maxWidth: '88%'
		}
	},
	userBubble: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#001018',
		fontWeight: 500,
		borderBottomRightRadius: 4,
		whiteSpace: 'pre-wrap'
	},
	aiBubble: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		color: 'rgba(255, 255, 255, 0.92)',
		border: '1px solid rgba(0, 212, 255, 0.18)',
		borderBottomLeftRadius: 4,
		// 마크다운 렌더 요소: 브라우저 기본 마진 제거 + 디자인 토큰(cyan) 적용
		'& > :first-of-type': { marginTop: 0 },
		'& > :last-child': { marginBottom: 0 },
		'& p': { margin: '0 0 8px' },
		'& ul, & ol': { margin: '4px 0', paddingLeft: '1.5em' },
		'& li': { marginBottom: 2 },
		'& li::marker': { color: 'rgba(0, 212, 255, 0.7)' },
		'& strong': { fontWeight: 700, color: '#fff' },
		'& em': { fontStyle: 'italic' },
		'& del': { color: 'rgba(255, 255, 255, 0.5)' },
		'& a': { color: '#00d4ff', textDecoration: 'underline' },
		'& h1, & h2, & h3, & h4, & h5, & h6': {
			fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
			fontWeight: 700,
			color: '#fff',
			margin: '10px 0 6px',
			lineHeight: 1.3
		},
		'& h1': { fontSize: '1.6rem' },
		'& h2': { fontSize: '1.5rem' },
		'& h3': { fontSize: '1.4rem' },
		'& h4, & h5, & h6': { fontSize: '1.35rem' },
		'& code': {
			fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
			background: 'rgba(0, 212, 255, 0.12)',
			color: '#7fe3ff',
			padding: '1px 6px',
			borderRadius: 5,
			fontSize: '0.9em'
		},
		'& pre': {
			background: 'rgba(0, 0, 0, 0.35)',
			border: '1px solid rgba(0, 212, 255, 0.15)',
			borderRadius: 8,
			padding: '10px 12px',
			overflowX: 'auto',
			margin: '6px 0'
		},
		'& pre code': {
			background: 'none',
			color: 'rgba(255, 255, 255, 0.9)',
			padding: 0
		},
		'& blockquote': {
			margin: '6px 0',
			paddingLeft: 12,
			borderLeft: '3px solid rgba(0, 212, 255, 0.4)',
			color: 'rgba(255, 255, 255, 0.7)'
		},
		'& table': {
			borderCollapse: 'collapse',
			margin: '6px 0',
			fontSize: '0.95em'
		},
		'& th, & td': {
			border: '1px solid rgba(255, 255, 255, 0.18)',
			padding: '4px 8px',
			textAlign: 'left'
		},
		'& th': { background: 'rgba(0, 212, 255, 0.1)' },
		'& hr': {
			border: 'none',
			borderTop: '1px solid rgba(255, 255, 255, 0.15)',
			margin: '10px 0'
		}
	},
	errorBubble: {
		border: '1px solid rgba(255, 107, 107, 0.4)',
		color: '#ff9d9d'
	},
	typing: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 6
	},
	typingLabel: {
		color: 'rgba(255, 255, 255, 0.55)',
		marginRight: 4
	},
	dot: {
		width: 7,
		height: 7,
		borderRadius: '50%',
		background: '#00d4ff',
		display: 'inline-block',
		animation: `${blink} 1.2s infinite ease-in-out`,
		'&:nth-of-type(2)': { animationDelay: '0.2s' },
		'&:nth-of-type(3)': { animationDelay: '0.4s' }
	},
	inputRow: {
		display: 'flex',
		alignItems: 'flex-end',
		gap: 10,
		marginTop: 12
	},
	textField: {
		flex: 1,
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.35rem',
			background: 'rgba(0, 0, 0, 0.25)',
			borderRadius: 12
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(255, 255, 255, 0.2)'
		},
		'& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.5)'
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: '#00d4ff'
		}
	},
	sendBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#001018',
		width: 48,
		height: 48,
		borderRadius: 12,
		flexShrink: 0,
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)'
		},
		'&.Mui-disabled': {
			background: 'rgba(255, 255, 255, 0.1)',
			color: 'rgba(255, 255, 255, 0.3)'
		}
	},
	charCount: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.35)',
		textAlign: 'right',
		marginTop: 4
	},
	charCountOver: {
		color: '#ff6b6b'
	}
}));

function AiChat() {
	const { classes, cx } = useStyles();
	const groupId = useSelector(state => state.auth.user?.reprGroup?.groupId);
	const isLoggedIn = Boolean(localStorage.getItem('camille_discord_token'));

	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const endRef = useRef(null);

	useEffect(() => {
		if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
	}, [messages, loading]);

	function send(text) {
		const q = (text != null ? text : input).trim();
		if (!q || loading || q.length > AI_QUESTION_MAX) return;

		setInput('');

		if (!groupId) {
			setMessages(prev => [
				...prev,
				{ role: 'user', text: q },
				{ role: 'ai', text: '로그인하고 그룹에 들어가야 답할 수 있어요.', error: true }
			]);
			return;
		}

		// messages는 이번 질문을 push하기 전 상태(클로저) → history로 그대로 전달(현재 질문 제외).
		const history = messages;
		setMessages(prev => [...prev, { role: 'user', text: q }]);
		setLoading(true);
		askAI(groupId, q, history)
			.then(result => {
				setMessages(prev => [...prev, { role: 'ai', text: result.answer }]);
			})
			.catch(() => {
				setMessages(prev => [
					...prev,
					{ role: 'ai', text: '답변 생성에 실패했어요. 잠시 후 다시 시도해 주세요.', error: true }
				]);
			})
			.finally(() => setLoading(false));
	}

	function handleKeyDown(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	const over = input.length > AI_QUESTION_MAX;

	return (
		<div className={classes.root}>
			{!isLoggedIn && (
				<div className={classes.loginNotice}>
					<span role="img" aria-label="info">
						&#x1F4A1;
					</span>{' '}
					로그인하면 &quot;나/내&quot; 같은 질문도 본인 기준으로 답해드려요.
				</div>
			)}

			{messages.length === 0 && !loading ? (
				<div className={classes.emptyState}>
					<div className={classes.emptyTitle}>무엇이든 물어보세요</div>
					<div className={classes.emptyDesc}>
						내전 전적·랭킹·업적 데이터를 바탕으로 답해드려요.
						<br />
						아래 예시처럼 자연어로 질문해 보세요.
					</div>
					<div className={classes.chips}>
						{EXAMPLE_QUESTIONS.map(q => (
							<Chip key={q} label={q} className={classes.chip} onClick={() => send(q)} clickable />
						))}
					</div>
				</div>
			) : (
				<div className={classes.messages}>
					{messages.map((m, i) => (
						<div
							// 메시지는 추가만 되고 재정렬되지 않으므로 index key 사용
							// eslint-disable-next-line react/no-array-index-key
							key={i}
							className={cx(classes.row, m.role === 'user' ? classes.rowUser : classes.rowAi)}
						>
							<div
								className={cx(
									classes.bubble,
									m.role === 'user' ? classes.userBubble : classes.aiBubble,
									m.error && classes.errorBubble
								)}
							>
								{m.role === 'user' ? (
									m.text
								) : (
									<ReactMarkdown remarkPlugins={MARKDOWN_PLUGINS} components={MARKDOWN_COMPONENTS}>
										{m.text}
									</ReactMarkdown>
								)}
							</div>
						</div>
					))}
					{loading && (
						<div className={cx(classes.row, classes.rowAi)}>
							<div className={cx(classes.bubble, classes.aiBubble)}>
								<span className={classes.typing}>
									<span className={classes.typingLabel}>생각 중</span>
									<span className={classes.dot} />
									<span className={classes.dot} />
									<span className={classes.dot} />
								</span>
							</div>
						</div>
					)}
					<div ref={endRef} />
				</div>
			)}

			<div className={classes.inputRow}>
				<TextField
					className={classes.textField}
					placeholder="내전에 대해 물어보세요 (Enter 전송, Shift+Enter 줄바꿈)"
					variant="outlined"
					size="small"
					multiline
					maxRows={5}
					value={input}
					onChange={e => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={loading}
					slotProps={{ htmlInput: { maxLength: AI_QUESTION_MAX } }}
				/>
				<IconButton
					className={classes.sendBtn}
					onClick={() => send()}
					disabled={loading || !input.trim() || over}
					aria-label="전송"
				>
					<SendIcon />
				</IconButton>
			</div>
			<div className={cx(classes.charCount, over && classes.charCountOver)}>
				{input.length}/{AI_QUESTION_MAX}
			</div>
		</div>
	);
}

export default AiChat;
