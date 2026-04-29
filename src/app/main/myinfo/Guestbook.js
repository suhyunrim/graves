import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { MentionsInput, Mention } from 'react-mentions';
import {
	Avatar,
	Button,
	IconButton,
	Checkbox,
	FormControlLabel,
	Snackbar,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import { formatDistanceToNow } from 'date-fns';
import koLocale from 'date-fns/locale/ko';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService';
import {
	fetchProfileComments,
	createProfileComment,
	deleteProfileComment,
	toggleProfileCommentLike,
	fetchGroupMembers
} from './profileApi';
import LikersDialog from './LikersDialog';
import MentionContent from './MentionContent';

const fadeIn = keyframes`
	0% { opacity: 0; transform: translateY(8px); }
	100% { opacity: 1; transform: translateY(0); }
`;

const flashHighlight = keyframes`
	0%   { box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.7), 0 0 30px rgba(0, 212, 255, 0.45); background: rgba(0, 212, 255, 0.18); }
	100% { box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05); background: rgba(0, 0, 0, 0.22); }
`;

const MAX_LEN = 500;

const MENTIONS_INTERNAL_REGEX = /@\[([^\]]+)\]\(([^)]+)\)/g;
const toBackendMentionFormat = value =>
	(value || '').replace(MENTIONS_INTERNAL_REGEX, (_m, _display, id) => `<@${id}>`);

const MENTIONS_INPUT_STYLE = {
	control: {
		backgroundColor: 'transparent',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 400,
		lineHeight: 1.5
	},
	'&multiLine': {
		control: {
			minHeight: 64
		},
		// textarea는 가시 텍스트(평문 + 멘션 모두)를 흰색으로 렌더하고,
		// highlighter는 멘션 위치에 cyan 강조만 덧그린다(평문은 transparent + visibility:hidden 디폴트).
		// 두 레이어가 픽셀 단위로 겹쳐야 하니 padding/border/font 속성을 완벽히 동일하게 둔다.
		highlighter: {
			padding: '12px 14px',
			border: 'none',
			boxSizing: 'border-box',
			fontFamily: 'inherit',
			fontSize: 'inherit',
			fontWeight: 'inherit',
			lineHeight: 'inherit',
			letterSpacing: 'inherit'
		},
		input: {
			padding: '12px 14px',
			border: 'none',
			outline: 'none',
			color: '#fff',
			caretColor: '#00d4ff',
			background: 'transparent',
			boxSizing: 'border-box',
			fontFamily: 'inherit',
			fontSize: 'inherit',
			fontWeight: 'inherit',
			lineHeight: 'inherit',
			letterSpacing: 'inherit'
		}
	},
	suggestions: {
		zIndex: 1300,
		list: {
			background: '#1a1a2e',
			border: '1px solid rgba(0, 212, 255, 0.3)',
			borderRadius: 10,
			boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
			maxHeight: 240,
			overflowY: 'auto',
			padding: 4
		},
		item: {
			padding: '8px 12px',
			borderRadius: 8,
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.25rem',
			color: 'rgba(255, 255, 255, 0.85)',
			cursor: 'pointer',
			'&focused': {
				background: 'rgba(0, 212, 255, 0.18)',
				color: '#00d4ff'
			}
		}
	}
};

// highlighter의 <strong>이 textarea 글자와 폭이 어긋나지 않도록
// fontWeight를 inherit으로 강제하고, padding/margin/border 등 박스 모델에
// 영향을 주는 속성은 절대 추가하지 않는다.
const MENTION_HIGHLIGHT_STYLE = {
	backgroundColor: 'rgba(0, 212, 255, 0.22)',
	color: '#00d4ff',
	fontWeight: 'inherit',
	borderRadius: 3
};

const useStyles = makeStyles()(theme => ({
	section: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.18)',
		padding: '24px 28px',
		[theme.breakpoints.down('sm')]: {
			padding: '18px 16px',
			borderRadius: 16
		}
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		marginBottom: 18
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff',
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		'&::before': {
			content: '""',
			width: 4,
			height: 24,
			background: 'linear-gradient(180deg, #00d4ff, #0066ff)',
			borderRadius: 2
		}
	},
	count: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(0, 212, 255, 0.7)',
		fontWeight: 600
	},
	formArea: {
		marginBottom: 24,
		padding: 16,
		background: 'rgba(0, 0, 0, 0.22)',
		borderRadius: 14,
		border: '1px solid rgba(255, 255, 255, 0.06)'
	},
	mentionsWrap: {
		background: 'rgba(0, 0, 0, 0.2)',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		borderRadius: 10,
		transition: 'border-color 0.2s ease',
		'&:hover': {
			borderColor: 'rgba(0, 212, 255, 0.4)'
		},
		'&:focus-within': {
			borderColor: '#00d4ff'
		}
	},
	mentionsHint: {
		marginTop: 6,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 215, 0, 0.7)'
	},
	formFooter: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 10,
		flexWrap: 'wrap',
		gap: 8
	},
	leftFooter: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		flexWrap: 'wrap'
	},
	secretLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.7)',
		marginLeft: 0,
		'& .MuiCheckbox-root': {
			color: 'rgba(255, 255, 255, 0.4)'
		},
		'& .MuiCheckbox-root.Mui-checked': {
			color: '#00d4ff'
		}
	},
	charCount: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	charCountOver: {
		color: '#ff6b6b'
	},
	submitBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.2rem',
		padding: '8px 24px',
		borderRadius: 10,
		textTransform: 'none',
		whiteSpace: 'nowrap',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)'
		},
		'&.Mui-disabled': {
			background: 'rgba(255, 255, 255, 0.1)',
			color: 'rgba(255, 255, 255, 0.3)'
		}
	},
	cancelBtn: {
		color: 'rgba(255, 255, 255, 0.55)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		textTransform: 'none',
		marginRight: 4,
		'&:hover': {
			color: '#fff',
			background: 'rgba(255, 255, 255, 0.04)'
		}
	},
	loginPrompt: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '18px 20px',
		background: 'rgba(0, 0, 0, 0.22)',
		borderRadius: 14,
		border: '1px dashed rgba(0, 212, 255, 0.3)',
		marginBottom: 24,
		flexWrap: 'wrap',
		gap: 12
	},
	loginText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.65)'
	},
	loginBtn: {
		background: '#5865F2',
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.2rem',
		padding: '8px 22px',
		borderRadius: 10,
		textTransform: 'none',
		'&:hover': {
			background: '#4752c4'
		}
	},
	list: {
		display: 'flex',
		flexDirection: 'column',
		gap: 14
	},
	emptyState: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.45)',
		textAlign: 'center',
		padding: '40px 0'
	},
	loadingState: {
		display: 'flex',
		justifyContent: 'center',
		padding: '40px 0'
	},
	threadGroup: {
		display: 'flex',
		flexDirection: 'column',
		gap: 8
	},
	comment: {
		display: 'flex',
		gap: 12,
		padding: '14px 18px',
		background: 'rgba(0, 0, 0, 0.22)',
		borderRadius: 14,
		border: '1px solid rgba(255, 255, 255, 0.05)',
		animation: `${fadeIn} 0.3s ease`,
		scrollMarginTop: 96,
		[theme.breakpoints.down('sm')]: {
			padding: '12px 14px',
			gap: 10
		}
	},
	commentHighlight: {
		animation: `${flashHighlight} 1.8s ease`
	},
	avatar: {
		width: 40,
		height: 40,
		flexShrink: 0,
		border: '1px solid rgba(0, 212, 255, 0.25)',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		color: '#00d4ff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		[theme.breakpoints.down('sm')]: {
			width: 32,
			height: 32,
			fontSize: '1rem'
		}
	},
	avatarReply: {
		width: 32,
		height: 32,
		fontSize: '1rem',
		[theme.breakpoints.down('sm')]: {
			width: 28,
			height: 28,
			fontSize: '0.9rem'
		}
	},
	avatarDeleted: {
		opacity: 0.4,
		borderColor: 'rgba(255, 255, 255, 0.1)'
	},
	avatarClickable: {
		cursor: 'pointer',
		transition: 'transform 0.15s ease, border-color 0.15s ease',
		'&:hover': {
			transform: 'scale(1.06)',
			borderColor: 'rgba(0, 212, 255, 0.7)'
		}
	},
	commentBody: {
		flex: 1,
		minWidth: 0
	},
	commentSecret: {
		borderColor: 'rgba(255, 215, 0, 0.18)',
		background: 'rgba(255, 215, 0, 0.04)'
	},
	commentDeleted: {
		borderColor: 'rgba(255, 255, 255, 0.04)',
		background: 'rgba(255, 255, 255, 0.025)'
	},
	replyWrapper: {
		display: 'flex',
		gap: 10,
		marginLeft: 28,
		[theme.breakpoints.down('sm')]: {
			marginLeft: 14,
			gap: 6
		}
	},
	replyConnector: {
		flexShrink: 0,
		paddingTop: 14,
		color: 'rgba(0, 212, 255, 0.45)',
		'& svg': {
			fontSize: '1.6rem'
		}
	},
	replyComment: {
		flex: 1,
		background: 'rgba(0, 0, 0, 0.32)'
	},
	commentTop: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 6,
		gap: 8
	},
	commentMeta: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		flexWrap: 'wrap'
	},
	authorName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.35rem',
		fontWeight: 700,
		color: '#fff'
	},
	authorNameDeleted: {
		color: 'rgba(255, 255, 255, 0.4)',
		fontStyle: 'italic',
		fontWeight: 500
	},
	authorNameClickable: {
		cursor: 'pointer',
		'&:hover': {
			color: '#00d4ff',
			textDecoration: 'underline'
		}
	},
	secretBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4,
		padding: '2px 8px',
		borderRadius: 8,
		background: 'rgba(255, 215, 0, 0.12)',
		color: '#ffd700',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		fontWeight: 600,
		'& svg': {
			fontSize: '1.2rem'
		}
	},
	timeAgo: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	deleteBtn: {
		color: 'rgba(255, 107, 107, 0.7)',
		padding: 6,
		'&:hover': {
			color: '#ff6b6b',
			background: 'rgba(255, 107, 107, 0.1)'
		}
	},
	content: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.35rem',
		color: 'rgba(255, 255, 255, 0.92)',
		lineHeight: 1.6,
		marginTop: 4,
		whiteSpace: 'pre-wrap',
		wordBreak: 'break-word'
	},
	contentDeleted: {
		color: 'rgba(255, 255, 255, 0.35)',
		fontStyle: 'italic'
	},
	commentBottom: {
		marginTop: 10,
		display: 'flex',
		alignItems: 'center',
		gap: 4,
		flexWrap: 'wrap'
	},
	likeBtn: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 5,
		padding: '4px 10px',
		borderRadius: 999,
		color: 'rgba(255, 255, 255, 0.55)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		textTransform: 'none',
		minWidth: 0,
		'&:hover': {
			color: '#ff6b9a',
			background: 'rgba(255, 107, 154, 0.1)'
		},
		'& svg': {
			fontSize: '1.4rem'
		}
	},
	likeBtnActive: {
		color: '#ff6b9a',
		'& svg': {
			color: '#ff6b9a'
		}
	},
	likeBtnDisabled: {
		opacity: 0.5,
		pointerEvents: 'none'
	},
	likeCountBtn: {
		padding: '4px 10px',
		borderRadius: 999,
		color: 'rgba(0, 212, 255, 0.75)',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 600,
		textTransform: 'none',
		minWidth: 0,
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.1)',
			color: '#00d4ff'
		}
	},
	replyBtn: {
		padding: '4px 10px',
		borderRadius: 999,
		color: 'rgba(255, 255, 255, 0.5)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		textTransform: 'none',
		minWidth: 0,
		gap: 5,
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.08)'
		},
		'& svg': {
			fontSize: '1.3rem'
		}
	},
	replyBtnActive: {
		color: '#00d4ff',
		background: 'rgba(0, 212, 255, 0.08)'
	},
	replyFormWrapper: {
		marginLeft: 28,
		marginTop: 4,
		marginBottom: 4,
		[theme.breakpoints.down('sm')]: {
			marginLeft: 14
		}
	},
	replyForm: {
		padding: 12,
		background: 'rgba(0, 0, 0, 0.32)',
		borderRadius: 12,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		animation: `${fadeIn} 0.2s ease`
	},
	snackSuccess: {
		'& .MuiSnackbarContent-root': {
			background: '#51cf66',
			color: '#000',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontWeight: 600
		}
	},
	snackError: {
		'& .MuiSnackbarContent-root': {
			background: '#ff6b6b',
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontWeight: 600
		}
	}
}));

function formatTimeAgo(iso) {
	if (!iso) return '';
	try {
		return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: koLocale });
	} catch (e) {
		return '';
	}
}

function CommentItem({
	comment,
	classes,
	cx,
	isReply,
	canDelete,
	canReply,
	canLike,
	isLikePending,
	isReplyOpen,
	isHighlighted,
	members,
	onAuthorClick,
	onToggleLike,
	onAskDelete,
	onToggleReply,
	onOpenLikers
}) {
	const isDeleted = comment.isDeleted;
	const showLike = !isDeleted;
	const showDelete = !isDeleted && canDelete;
	const showReplyButton = !isDeleted && canReply;
	const author = comment.author || null;
	const avatarUrl = author?.avatarUrl || null;
	const authorName = author?.name || null;
	const avatarInitial = !isDeleted && authorName ? authorName[0] : '?';
	const authorClickable = !isDeleted && Boolean(author?.puuid);
	const handleAuthorClick = e => {
		if (!authorClickable) return;
		e.stopPropagation();
		onAuthorClick(author);
	};

	return (
		<div
			id={`comment-${comment.id}`}
			className={cx(
				classes.comment,
				comment.isSecret && classes.commentSecret,
				isDeleted && classes.commentDeleted,
				isReply && classes.replyComment,
				isHighlighted && classes.commentHighlight
			)}
		>
			<Avatar
				className={cx(
					classes.avatar,
					isReply && classes.avatarReply,
					isDeleted && classes.avatarDeleted,
					authorClickable && classes.avatarClickable
				)}
				src={!isDeleted ? avatarUrl || undefined : undefined}
				alt={isDeleted ? '' : authorName || ''}
				onClick={handleAuthorClick}
			>
				{avatarInitial}
			</Avatar>
			<div className={classes.commentBody}>
				<div className={classes.commentTop}>
					<div className={classes.commentMeta}>
						<span
							className={cx(
								classes.authorName,
								isDeleted && classes.authorNameDeleted,
								authorClickable && classes.authorNameClickable
							)}
							onClick={handleAuthorClick}
							role={authorClickable ? 'link' : undefined}
							tabIndex={authorClickable ? 0 : undefined}
							onKeyDown={
								authorClickable
									? e => {
											if (e.key === 'Enter' || e.key === ' ') handleAuthorClick(e);
									  }
									: undefined
							}
						>
							{isDeleted ? '[삭제된 댓글]' : authorName}
						</span>
						{!isDeleted && comment.isSecret && (
							<span className={classes.secretBadge}>
								<LockOutlinedIcon /> 비밀글
							</span>
						)}
						<span className={classes.timeAgo}>{formatTimeAgo(comment.createdAt)}</span>
					</div>
					{showDelete && (
						<IconButton
							size="small"
							className={classes.deleteBtn}
							onClick={() => onAskDelete(comment)}
							aria-label="댓글 삭제"
						>
							<DeleteOutlineIcon fontSize="small" />
						</IconButton>
					)}
				</div>

				{!isDeleted && (
					<div className={classes.content}>
						<MentionContent content={comment.content} members={members} />
					</div>
				)}
				{isDeleted && (
					<div className={cx(classes.content, classes.contentDeleted)}>
						삭제된 메시지입니다.
					</div>
				)}

				{(showLike || showReplyButton) && (
					<div className={classes.commentBottom}>
						{showLike && (
							<>
							<Button
								className={cx(
									classes.likeBtn,
									comment.likedByMe && classes.likeBtnActive,
									!canLike && classes.likeBtnDisabled
								)}
								onClick={() => onToggleLike(comment)}
								disabled={!canLike || isLikePending}
								aria-label={comment.likedByMe ? '좋아요 취소' : '좋아요'}
							>
								{comment.likedByMe ? <FavoriteIcon /> : <FavoriteBorderIcon />}
							</Button>
							<Button
								className={classes.likeCountBtn}
								onClick={() => comment.likeCount > 0 && onOpenLikers(comment)}
								disabled={comment.likeCount === 0}
							>
								{comment.likeCount}
							</Button>
						</>
					)}
					{showReplyButton && (
						<Button
							className={cx(classes.replyBtn, isReplyOpen && classes.replyBtnActive)}
							onClick={() => onToggleReply(comment)}
							aria-label="답글 작성"
						>
							<ChatBubbleOutlineIcon /> 답글
						</Button>
					)}
				</div>
			)}
			</div>
		</div>
	);
}

function ReplyForm({ classes, cx, submitting, members, mentionsData, onSubmit, onCancel }) {
	const [content, setContent] = useState('');
	const [plainText, setPlainText] = useState('');
	const [isSecret, setIsSecret] = useState(false);

	const trimmedLen = plainText.trim().length;
	const overLimit = trimmedLen > MAX_LEN;
	const submitDisabled = submitting || trimmedLen === 0 || overLimit;

	function handleSubmit() {
		if (submitDisabled) return;
		onSubmit({ content: toBackendMentionFormat(content.trim()), isSecret }, () => {
			setContent('');
			setPlainText('');
			setIsSecret(false);
		});
	}

	return (
		<div className={classes.replyForm}>
			<div className={classes.mentionsWrap}>
				<MentionsInput
					value={content}
					onChange={(e, newValue, newPlainText) => {
						setContent(newValue);
						setPlainText(newPlainText);
					}}
					placeholder="답글을 입력하세요... (@로 멘션)"
					disabled={submitting}
					autoFocus
					allowSpaceInQuery={false}
					style={MENTIONS_INPUT_STYLE}
				>
					<Mention
						trigger="@"
						markup="@[__display__](__id__)"
						displayTransform={(id, display) => `@${display}`}
						appendSpaceOnAdd
						data={mentionsData}
						style={MENTION_HIGHLIGHT_STYLE}
						renderSuggestion={s => <span>@{s.display}</span>}
					/>
				</MentionsInput>
			</div>
			{isSecret && members && members.length > 0 && (
				<div className={classes.mentionsHint}>비밀글에서는 멘션 알림이 가지 않아요.</div>
			)}
			<div className={classes.formFooter}>
				<div className={classes.leftFooter}>
					<FormControlLabel
						className={classes.secretLabel}
						control={
							<Checkbox
								size="small"
								checked={isSecret}
								onChange={e => setIsSecret(e.target.checked)}
								disabled={submitting}
							/>
						}
						label="비밀글"
					/>
					<span className={cx(classes.charCount, overLimit && classes.charCountOver)}>
						{trimmedLen} / {MAX_LEN}
					</span>
				</div>
				<div>
					<Button className={classes.cancelBtn} onClick={onCancel} disabled={submitting}>
						취소
					</Button>
					<Button className={classes.submitBtn} onClick={handleSubmit} disabled={submitDisabled}>
						{submitting ? <CircularProgress size={16} style={{ color: '#000' }} /> : '답글 작성'}
					</Button>
				</div>
			</div>
		</div>
	);
}

function findCommentById(comments, id) {
	for (const c of comments) {
		if (c.id === id) return { comment: c, parentId: null };
		if (c.replies) {
			for (const r of c.replies) {
				if (r.id === id) return { comment: r, parentId: c.id };
			}
		}
	}
	return null;
}

function updateCommentById(comments, id, updater) {
	return comments.map(c => {
		if (c.id === id) return updater(c);
		if (c.replies && c.replies.some(r => r.id === id)) {
			return {
				...c,
				replies: c.replies.map(r => (r.id === id ? updater(r) : r))
			};
		}
		return c;
	});
}

function Guestbook({ groupId, puuid }) {
	const { classes, cx } = useStyles();
	const location = useLocation();
	const navigate = useNavigate();
	const user = useSelector(state => state.auth.user);
	const myDiscordId = user?.data?.discordUser?.discordId || null;
	const myPuuid = camilleRiotAuthService.getPuuid();
	const isAdmin = Boolean(user?.reprGroup?.isAdmin);
	const isLoggedIn = Boolean(camilleRiotAuthService.getDiscordToken()) && Boolean(myDiscordId);

	function handleAuthorClick(author) {
		if (!author?.puuid) return;
		if (author.puuid === myPuuid) navigate('/myinfo');
		else navigate(`/userinfo/${author.puuid}`);
	}

	const [comments, setComments] = useState(null);
	const [loadError, setLoadError] = useState(false);
	const [content, setContent] = useState('');
	const [plainText, setPlainText] = useState('');
	const [isSecret, setIsSecret] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [replySubmittingId, setReplySubmittingId] = useState(null);
	const [openReplyId, setOpenReplyId] = useState(null);
	const [pendingLikeIds, setPendingLikeIds] = useState({});
	const [likersDialog, setLikersDialog] = useState({ open: false, commentId: null });
	const [confirmDelete, setConfirmDelete] = useState({ open: false, commentId: null });
	const [snack, setSnack] = useState({ open: false, message: '', type: 'success' });
	const [highlightId, setHighlightId] = useState(null);
	const [members, setMembers] = useState([]);

	const mentionsData = useMemo(
		() => (members || []).map(m => ({ id: m.puuid, display: m.name })),
		[members]
	);

	const showSnack = useCallback((message, type = 'success') => {
		setSnack({ open: true, message, type });
	}, []);

	useEffect(() => {
		if (!groupId || !puuid) return;
		setComments(null);
		setLoadError(false);
		setOpenReplyId(null);
		fetchProfileComments(groupId, puuid)
			.then(result => setComments(Array.isArray(result) ? result : []))
			.catch(() => {
				setComments([]);
				setLoadError(true);
			});
	}, [groupId, puuid]);

	useEffect(() => {
		if (!groupId) return;
		fetchGroupMembers(groupId)
			.then(result => setMembers(Array.isArray(result) ? result : []))
			.catch(() => setMembers([]));
	}, [groupId]);

	useEffect(() => {
		if (!comments || comments.length === 0) return undefined;
		const hash = location.hash;
		if (!hash || !hash.startsWith('#comment-')) return undefined;
		const idStr = hash.slice('#comment-'.length);
		const idNum = Number(idStr);
		if (!Number.isFinite(idNum)) return undefined;

		const scrollTimer = setTimeout(() => {
			const el = document.getElementById(`comment-${idNum}`);
			if (!el) return;
			el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			setHighlightId(idNum);
		}, 80);

		const clearTimer = setTimeout(() => setHighlightId(null), 2000);

		return () => {
			clearTimeout(scrollTimer);
			clearTimeout(clearTimer);
		};
	}, [comments, location.hash]);

	function handleSubmitTopLevel() {
		const trimmed = content.trim();
		const trimmedPlainLen = plainText.trim().length;
		if (!trimmed || submitting) return;
		if (trimmedPlainLen > MAX_LEN) {
			showSnack(`최대 ${MAX_LEN}자까지 입력 가능합니다.`, 'error');
			return;
		}
		setSubmitting(true);
		const backendContent = toBackendMentionFormat(trimmed);
		createProfileComment(groupId, puuid, backendContent, isSecret, null)
			.then(newComment => {
				setComments(prev => [{ ...newComment, replies: newComment.replies || [] }, ...(prev || [])]);
				setContent('');
				setPlainText('');
				setIsSecret(false);
				showSnack('방명록이 등록되었습니다.');
			})
			.catch(err => {
				const msg =
					(err && err.response && err.response.data && err.response.data.result) ||
					'방명록 등록에 실패했습니다.';
				showSnack(msg, 'error');
			})
			.finally(() => setSubmitting(false));
	}

	function handleSubmitReply(target, payload, resetForm) {
		if (replySubmittingId) return;
		setReplySubmittingId(target.id);
		createProfileComment(groupId, puuid, payload.content, payload.isSecret, target.id)
			.then(newReply => {
				const rootId = newReply.parentId || target.parentId || target.id;
				setComments(prev =>
					(prev || []).map(c => {
						if (c.id !== rootId) return c;
						const existingReplies = Array.isArray(c.replies) ? c.replies : [];
						return { ...c, replies: [...existingReplies, newReply] };
					})
				);
				setOpenReplyId(null);
				resetForm();
				showSnack('답글이 등록되었습니다.');
			})
			.catch(err => {
				const msg =
					(err && err.response && err.response.data && err.response.data.result) ||
					'답글 등록에 실패했습니다.';
				showSnack(msg, 'error');
			})
			.finally(() => setReplySubmittingId(null));
	}

	function handleAskDelete(comment) {
		setConfirmDelete({ open: true, commentId: comment.id });
	}

	function handleConfirmDelete() {
		const commentId = confirmDelete.commentId;
		setConfirmDelete({ open: false, commentId: null });
		if (!commentId) return;

		const snapshot = comments;
		const found = findCommentById(comments || [], commentId);

		if (found) {
			if (found.parentId !== null) {
				setComments(prev =>
					(prev || []).map(c => {
						if (c.id !== found.parentId) return c;
						return {
							...c,
							replies: (c.replies || []).filter(r => r.id !== commentId)
						};
					})
				);
			} else {
				const top = found.comment;
				const hasReplies = Array.isArray(top.replies) && top.replies.length > 0;
				if (hasReplies) {
					setComments(prev =>
						(prev || []).map(c =>
							c.id === commentId
								? {
										...c,
										isDeleted: true,
										content: null,
										author: null,
										likeCount: 0,
										likedByMe: false
								  }
								: c
						)
					);
				} else {
					setComments(prev => (prev || []).filter(c => c.id !== commentId));
				}
			}
		}

		deleteProfileComment(commentId)
			.then(() => showSnack('삭제되었습니다.'))
			.catch(err => {
				setComments(snapshot);
				const msg =
					(err && err.response && err.response.data && err.response.data.result) ||
					'삭제에 실패했습니다.';
				showSnack(msg, 'error');
			});
	}

	function handleToggleLike(comment) {
		if (!isLoggedIn) {
			showSnack('로그인이 필요합니다.', 'error');
			return;
		}
		const commentId = comment.id;
		if (pendingLikeIds[commentId]) return;

		setPendingLikeIds(prev => ({ ...prev, [commentId]: true }));
		const snapshot = comments;
		setComments(prev =>
			updateCommentById(prev || [], commentId, c => {
				const nextLiked = !c.likedByMe;
				return {
					...c,
					likedByMe: nextLiked,
					likeCount: Math.max(0, c.likeCount + (nextLiked ? 1 : -1))
				};
			})
		);

		toggleProfileCommentLike(commentId)
			.then(result => {
				if (!result) return;
				setComments(prev =>
					updateCommentById(prev || [], commentId, c => ({
						...c,
						likedByMe: result.liked,
						likeCount: result.likeCount
					}))
				);
			})
			.catch(() => {
				setComments(snapshot);
				showSnack('좋아요 처리에 실패했습니다.', 'error');
			})
			.finally(() => {
				setPendingLikeIds(prev => {
					const next = { ...prev };
					delete next[commentId];
					return next;
				});
			});
	}

	function handleToggleReply(comment) {
		setOpenReplyId(prev => (prev === comment.id ? null : comment.id));
	}

	function canDelete(comment) {
		if (comment.isDeleted) return false;
		if (!isLoggedIn) return false;
		return isAdmin || comment.author?.discordId === myDiscordId;
	}

	const trimmedLen = plainText.trim().length;
	const overLimit = trimmedLen > MAX_LEN;
	const submitDisabled = submitting || trimmedLen === 0 || overLimit;

	const totalCount =
		Array.isArray(comments) ?
			comments.reduce(
				(sum, c) => sum + (c.isDeleted ? 0 : 1) + (c.replies ? c.replies.length : 0),
				0
			)
			: 0;

	function renderCommentItem(comment, isReply) {
		return (
			<CommentItem
				key={comment.id}
				comment={comment}
				classes={classes}
				cx={cx}
				isReply={isReply}
				canDelete={canDelete(comment)}
				canReply={isLoggedIn}
				canLike={isLoggedIn}
				isLikePending={Boolean(pendingLikeIds[comment.id])}
				isReplyOpen={openReplyId === comment.id}
				isHighlighted={highlightId === comment.id}
				members={members}
				onAuthorClick={handleAuthorClick}
				onToggleLike={handleToggleLike}
				onAskDelete={handleAskDelete}
				onToggleReply={handleToggleReply}
				onOpenLikers={c => setLikersDialog({ open: true, commentId: c.id })}
			/>
		);
	}

	function renderReplyForm(parentComment) {
		return (
			<div className={classes.replyFormWrapper}>
				<ReplyForm
					classes={classes}
					cx={cx}
					submitting={replySubmittingId === parentComment.id}
					members={members}
					mentionsData={mentionsData}
					onSubmit={(payload, reset) => handleSubmitReply(parentComment, payload, reset)}
					onCancel={() => setOpenReplyId(null)}
				/>
			</div>
		);
	}

	return (
		<div className={classes.section}>
			<div className={classes.header}>
				<div className={classes.title}>
					<span role="img" aria-label="guestbook">💬</span>
					방명록
				</div>
				{totalCount > 0 && <span className={classes.count}>· {totalCount}</span>}
			</div>

			{isLoggedIn ? (
				<div className={classes.formArea}>
					<div className={classes.mentionsWrap}>
						<MentionsInput
							value={content}
							onChange={(e, newValue, newPlainText) => {
								setContent(newValue);
								setPlainText(newPlainText);
							}}
							placeholder="이 프로필에 한마디 남겨보세요... (@로 멘션)"
							disabled={submitting}
							allowSpaceInQuery={false}
							style={MENTIONS_INPUT_STYLE}
						>
							<Mention
								trigger="@"
								markup="@[__display__](__id__)"
								displayTransform={(id, display) => `@${display}`}
								appendSpaceOnAdd
								data={mentionsData}
								style={MENTION_HIGHLIGHT_STYLE}
								renderSuggestion={s => <span>@{s.display}</span>}
							/>
						</MentionsInput>
					</div>
					{isSecret && members.length > 0 && (
						<div className={classes.mentionsHint}>비밀글에서는 멘션 알림이 가지 않아요.</div>
					)}
					<div className={classes.formFooter}>
						<div className={classes.leftFooter}>
							<FormControlLabel
								className={classes.secretLabel}
								control={
									<Checkbox
										size="small"
										checked={isSecret}
										onChange={e => setIsSecret(e.target.checked)}
										disabled={submitting}
									/>
								}
								label="비밀글"
							/>
							<span className={cx(classes.charCount, overLimit && classes.charCountOver)}>
								{trimmedLen} / {MAX_LEN}
							</span>
						</div>
						<Button
							className={classes.submitBtn}
							onClick={handleSubmitTopLevel}
							disabled={submitDisabled}
						>
							{submitting ? <CircularProgress size={18} style={{ color: '#000' }} /> : '작성'}
						</Button>
					</div>
				</div>
			) : (
				<div className={classes.loginPrompt}>
					<span className={classes.loginText}>
						<span role="img" aria-label="lock">🔒</span> 로그인하면 글을 남길 수 있어요
					</span>
					<Button className={classes.loginBtn} href="/login">
						Discord로 로그인
					</Button>
				</div>
			)}

			{comments === null && (
				<div className={classes.loadingState}>
					<CircularProgress size={24} style={{ color: '#00d4ff' }} />
				</div>
			)}

			{comments !== null && comments.length === 0 && (
				<div className={classes.emptyState}>
					{loadError
						? '방명록을 불러오지 못했습니다.'
						: '아직 방명록이 비어있어요. 첫 글을 남겨보세요!'}
				</div>
			)}

			{comments !== null && comments.length > 0 && (
				<div className={classes.list}>
					{comments.map(top => (
						<div key={top.id} className={classes.threadGroup}>
							{renderCommentItem(top, false)}
							{openReplyId === top.id && renderReplyForm(top)}
							{Array.isArray(top.replies) &&
								top.replies.map(reply => (
									<React.Fragment key={reply.id}>
										<div className={classes.replyWrapper}>
											<div className={classes.replyConnector}>
												<SubdirectoryArrowRightIcon />
											</div>
											{renderCommentItem(reply, true)}
										</div>
										{openReplyId === reply.id && renderReplyForm(reply)}
									</React.Fragment>
								))}
						</div>
					))}
				</div>
			)}

			<LikersDialog
				open={likersDialog.open}
				commentId={likersDialog.commentId}
				onClose={() => setLikersDialog({ open: false, commentId: null })}
			/>

			<Dialog
				open={confirmDelete.open}
				onClose={() => setConfirmDelete({ open: false, commentId: null })}
				PaperProps={{
					style: {
						background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
						color: '#fff',
						border: '1px solid rgba(255, 107, 107, 0.3)',
						borderRadius: 16
					}
				}}
			>
				<DialogTitle style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>방명록 삭제</DialogTitle>
				<DialogContent>
					<DialogContentText
						style={{ fontFamily: '"Noto Sans KR", sans-serif', color: 'rgba(255, 255, 255, 0.7)' }}
					>
						이 글을 삭제하시겠습니까?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setConfirmDelete({ open: false, commentId: null })}
						style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: '"Noto Sans KR", sans-serif' }}
					>
						취소
					</Button>
					<Button
						onClick={handleConfirmDelete}
						style={{ color: '#ff6b6b', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 700 }}
					>
						삭제
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				className={snack.type === 'success' ? classes.snackSuccess : classes.snackError}
				open={snack.open}
				autoHideDuration={3000}
				onClose={() => setSnack(prev => ({ ...prev, open: false }))}
				message={snack.message}
			/>
		</div>
	);
}

export default Guestbook;
