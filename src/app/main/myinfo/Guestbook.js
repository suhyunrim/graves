import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
	Button,
	TextField,
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
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import { formatDistanceToNow } from 'date-fns';
import koLocale from 'date-fns/locale/ko';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService';
import {
	fetchProfileComments,
	createProfileComment,
	deleteProfileComment,
	toggleProfileCommentLike
} from './profileApi';
import LikersDialog from './LikersDialog';

const fadeIn = keyframes`
	0% { opacity: 0; transform: translateY(8px); }
	100% { opacity: 1; transform: translateY(0); }
`;

const MAX_LEN = 500;

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
	textField: {
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.3rem',
			background: 'rgba(0, 0, 0, 0.2)',
			borderRadius: 10
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(255, 255, 255, 0.15)'
		},
		'& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.4)'
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: '#00d4ff'
		}
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
	comment: {
		padding: '14px 18px',
		background: 'rgba(0, 0, 0, 0.22)',
		borderRadius: 14,
		border: '1px solid rgba(255, 255, 255, 0.05)',
		animation: `${fadeIn} 0.3s ease`,
		[theme.breakpoints.down('sm')]: {
			padding: '12px 14px'
		}
	},
	commentSecret: {
		borderColor: 'rgba(255, 215, 0, 0.18)',
		background: 'rgba(255, 215, 0, 0.04)'
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
	commentBottom: {
		marginTop: 10,
		display: 'flex',
		alignItems: 'center',
		gap: 4
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

function Guestbook({ groupId, puuid }) {
	const { classes, cx } = useStyles();
	const user = useSelector(state => state.auth.user);
	const myDiscordId = user?.data?.discordUser?.discordId || null;
	const isAdmin = Boolean(user?.reprGroup?.isAdmin);
	const isLoggedIn = Boolean(camilleRiotAuthService.getDiscordToken()) && Boolean(myDiscordId);

	const [comments, setComments] = useState(null);
	const [loadError, setLoadError] = useState(false);
	const [content, setContent] = useState('');
	const [isSecret, setIsSecret] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [pendingLikeIds, setPendingLikeIds] = useState({});
	const [likersDialog, setLikersDialog] = useState({ open: false, commentId: null });
	const [confirmDelete, setConfirmDelete] = useState({ open: false, commentId: null });
	const [snack, setSnack] = useState({ open: false, message: '', type: 'success' });

	const showSnack = useCallback((message, type = 'success') => {
		setSnack({ open: true, message, type });
	}, []);

	useEffect(() => {
		if (!groupId || !puuid) return;
		setComments(null);
		setLoadError(false);
		fetchProfileComments(groupId, puuid)
			.then(result => setComments(result || []))
			.catch(() => {
				setComments([]);
				setLoadError(true);
			});
	}, [groupId, puuid]);

	function handleSubmit() {
		const trimmed = content.trim();
		if (!trimmed || submitting) return;
		if (trimmed.length > MAX_LEN) {
			showSnack(`최대 ${MAX_LEN}자까지 입력 가능합니다.`, 'error');
			return;
		}
		setSubmitting(true);
		createProfileComment(groupId, puuid, trimmed, isSecret)
			.then(newComment => {
				setComments(prev => [newComment, ...(prev || [])]);
				setContent('');
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

	function handleDelete(commentId) {
		setConfirmDelete({ open: false, commentId: null });
		const prev = comments;
		setComments(curr => (curr || []).filter(c => c.id !== commentId));
		deleteProfileComment(commentId)
			.then(() => showSnack('삭제되었습니다.'))
			.catch(err => {
				setComments(prev);
				const msg =
					(err && err.response && err.response.data && err.response.data.result) ||
					'삭제에 실패했습니다.';
				showSnack(msg, 'error');
			});
	}

	function handleToggleLike(commentId) {
		if (!isLoggedIn) {
			showSnack('로그인이 필요합니다.', 'error');
			return;
		}
		if (pendingLikeIds[commentId]) return;

		setPendingLikeIds(prev => ({ ...prev, [commentId]: true }));
		const snapshot = comments;
		setComments(curr =>
			(curr || []).map(c => {
				if (c.id !== commentId) return c;
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
				setComments(curr =>
					(curr || []).map(c =>
						c.id === commentId
							? { ...c, likedByMe: result.liked, likeCount: result.likeCount }
							: c
					)
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

	function canDelete(comment) {
		if (!isLoggedIn) return false;
		return isAdmin || comment.authorDiscordId === myDiscordId;
	}

	const trimmedLen = content.trim().length;
	const overLimit = trimmedLen > MAX_LEN;
	const submitDisabled = submitting || trimmedLen === 0 || overLimit;

	return (
		<div className={classes.section}>
			<div className={classes.header}>
				<div className={classes.title}>
					<span role="img" aria-label="guestbook">💬</span>
					방명록
				</div>
				{Array.isArray(comments) && comments.length > 0 && (
					<span className={classes.count}>· {comments.length}</span>
				)}
			</div>

			{isLoggedIn ? (
				<div className={classes.formArea}>
					<TextField
						className={classes.textField}
						placeholder="이 프로필에 한마디 남겨보세요..."
						multiline
						minRows={2}
						maxRows={6}
						fullWidth
						variant="outlined"
						value={content}
						onChange={e => setContent(e.target.value)}
						disabled={submitting}
					/>
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
							<span
								className={cx(classes.charCount, overLimit && classes.charCountOver)}
							>
								{trimmedLen} / {MAX_LEN}
							</span>
						</div>
						<Button
							className={classes.submitBtn}
							onClick={handleSubmit}
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
					<Button
						className={classes.loginBtn}
						href="/login"
					>
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
					{comments.map(comment => {
						const isPending = Boolean(pendingLikeIds[comment.id]);
						return (
							<div
								key={comment.id}
								className={cx(classes.comment, comment.isSecret && classes.commentSecret)}
							>
								<div className={classes.commentTop}>
									<div className={classes.commentMeta}>
										<span className={classes.authorName}>{comment.authorName}</span>
										{comment.isSecret && (
											<span className={classes.secretBadge}>
												<LockOutlinedIcon /> 비밀글
											</span>
										)}
										<span className={classes.timeAgo}>{formatTimeAgo(comment.createdAt)}</span>
									</div>
									{canDelete(comment) && (
										<IconButton
											size="small"
											className={classes.deleteBtn}
											onClick={() => setConfirmDelete({ open: true, commentId: comment.id })}
											aria-label="댓글 삭제"
										>
											<DeleteOutlineIcon fontSize="small" />
										</IconButton>
									)}
								</div>
								<div className={classes.content}>{comment.content}</div>
								<div className={classes.commentBottom}>
									<Button
										className={cx(
											classes.likeBtn,
											comment.likedByMe && classes.likeBtnActive,
											!isLoggedIn && classes.likeBtnDisabled
										)}
										onClick={() => handleToggleLike(comment.id)}
										disabled={!isLoggedIn || isPending}
										aria-label={comment.likedByMe ? '좋아요 취소' : '좋아요'}
									>
										{comment.likedByMe ? <FavoriteIcon /> : <FavoriteBorderIcon />}
									</Button>
									<Button
										className={classes.likeCountBtn}
										onClick={() =>
											comment.likeCount > 0 &&
											setLikersDialog({ open: true, commentId: comment.id })
										}
										disabled={comment.likeCount === 0}
									>
										{comment.likeCount}
									</Button>
								</div>
							</div>
						);
					})}
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
						이 방명록을 삭제하시겠습니까?
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
						onClick={() => handleDelete(confirmDelete.commentId)}
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
