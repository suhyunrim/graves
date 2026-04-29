import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	Button,
	IconButton,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	CircularProgress
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import useToast from 'app/utility/useToast';
import * as Actions from './store/actions';

const MAX_LEN = 50;
const sanitize = value => value.replace(/[\r\n]+/g, ' ');

const fadeIn = keyframes`
	0% { opacity: 0; transform: translateY(4px); }
	100% { opacity: 1; transform: translateY(0); }
`;

const useStyles = makeStyles()(theme => ({
	root: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		flexWrap: 'wrap',
		animation: `${fadeIn} 0.3s ease`
	},
	quoteWrapper: {
		display: 'inline-flex',
		alignItems: 'flex-start',
		gap: 8,
		padding: '8px 16px',
		background: 'rgba(0, 212, 255, 0.08)',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		borderRadius: 12,
		maxWidth: '100%'
	},
	quoteIcon: {
		color: 'rgba(0, 212, 255, 0.55)',
		fontSize: '1.7rem',
		flexShrink: 0,
		marginTop: 2
	},
	quoteText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.9)',
		lineHeight: 1.5,
		wordBreak: 'break-word'
	},
	actionGroup: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4
	},
	iconButton: {
		color: 'rgba(255, 255, 255, 0.5)',
		padding: 6,
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.1)'
		}
	},
	deleteIcon: {
		color: 'rgba(255, 107, 107, 0.6)',
		'&:hover': {
			color: '#ff6b6b',
			background: 'rgba(255, 107, 107, 0.1)'
		}
	},
	addBtn: {
		color: 'rgba(0, 212, 255, 0.75)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		padding: '6px 14px',
		borderRadius: 999,
		border: '1px dashed rgba(0, 212, 255, 0.35)',
		textTransform: 'none',
		gap: 6,
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.08)',
			borderColor: '#00d4ff'
		},
		'& svg': {
			fontSize: '1.4rem'
		}
	},
	dialogPaper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		color: '#fff',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		borderRadius: '20px !important',
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 212, 255, 0.08)',
		overflow: 'hidden',
		position: 'relative',
		'&::before': {
			content: '""',
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			height: 1,
			background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent)'
		}
	},
	dialogTitleText: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.05em',
		textTransform: 'uppercase',
		padding: '24px 28px 4px',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
	},
	dialogSubtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.4)',
		padding: '0 28px 12px'
	},
	dialogContent: {
		padding: '8px 28px 20px !important'
	},
	textField: {
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.3rem',
			background: 'rgba(0, 0, 0, 0.25)',
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
	charCountRow: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginTop: 6,
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	charCountOver: {
		color: '#ff6b6b'
	},
	dialogActions: {
		padding: '12px 28px 24px'
	},
	cancelBtn: {
		color: 'rgba(255, 255, 255, 0.5)',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		borderRadius: 10,
		padding: '8px 22px',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		textTransform: 'none',
		transition: 'all 0.2s ease',
		'&:hover': {
			color: '#00d4ff',
			borderColor: 'rgba(0, 212, 255, 0.4)',
			background: 'rgba(0, 212, 255, 0.08)'
		}
	},
	saveBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.2rem',
		padding: '8px 26px',
		borderRadius: 10,
		textTransform: 'none',
		marginLeft: 8,
		boxShadow: '0 4px 18px rgba(0, 212, 255, 0.25)',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)',
			boxShadow: '0 6px 22px rgba(0, 212, 255, 0.4)'
		},
		'&.Mui-disabled': {
			background: 'rgba(255, 255, 255, 0.1)',
			color: 'rgba(255, 255, 255, 0.3)',
			boxShadow: 'none'
		}
	},
}));

function StatusMessage({ groupId, puuid, editable }) {
	const { classes, cx } = useStyles();
	const dispatch = useDispatch();
	const statusMessage = useSelector(({ MyInfo }) => MyInfo.myInfo.statusMessage);

	const [editOpen, setEditOpen] = useState(false);
	const [draft, setDraft] = useState('');
	const [saving, setSaving] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const toast = useToast();

	useEffect(() => {
		if (editOpen) {
			setDraft(statusMessage ? statusMessage.content : '');
		}
	}, [editOpen, statusMessage]);

	function showSnack(message, type = 'success') {
		if (type === 'error') toast.error(message);
		else toast.success(message);
	}

	function getApiErrorMessage(err) {
		if (err && err.response && err.response.data && typeof err.response.data.result === 'string') {
			return err.response.data.result;
		}
		return '서버 오류가 발생했습니다';
	}

	function handleSave() {
		const trimmed = draft.trim();
		if (!trimmed || saving) return;
		if (trimmed.length > MAX_LEN) return;

		setSaving(true);
		const isUpdate = Boolean(statusMessage);
		dispatch(Actions.updateStatusMessage(groupId, puuid, trimmed))
			.then(() => {
				setSaving(false);
				setEditOpen(false);
				showSnack(isUpdate ? '한마디가 수정되었습니다.' : '한마디가 등록되었습니다.');
			})
			.catch(err => {
				setSaving(false);
				showSnack(getApiErrorMessage(err), 'error');
			});
	}

	function handleDelete() {
		setConfirmDelete(false);
		dispatch(Actions.deleteStatusMessage(groupId, puuid))
			.then(() => showSnack('한마디가 삭제되었습니다.'))
			.catch(err => showSnack(getApiErrorMessage(err), 'error'));
	}

	if (!statusMessage && !editable) return null;

	const trimmedLen = draft.trim().length;
	const overLimit = trimmedLen > MAX_LEN;
	const saveDisabled = saving || trimmedLen === 0 || overLimit;

	return (
		<>
			<div className={classes.root}>
				{statusMessage ? (
					<>
						<div className={classes.quoteWrapper}>
							<FormatQuoteIcon className={classes.quoteIcon} />
							<div className={classes.quoteText}>{statusMessage.content}</div>
						</div>
						{editable && (
							<div className={classes.actionGroup}>
								<IconButton
									size="small"
									className={classes.iconButton}
									onClick={() => setEditOpen(true)}
									aria-label="한마디 수정"
								>
									<EditOutlinedIcon fontSize="small" />
								</IconButton>
								<IconButton
									size="small"
									className={cx(classes.iconButton, classes.deleteIcon)}
									onClick={() => setConfirmDelete(true)}
									aria-label="한마디 삭제"
								>
									<DeleteOutlineIcon fontSize="small" />
								</IconButton>
							</div>
						)}
					</>
				) : (
					editable && (
						<Button
							className={classes.addBtn}
							onClick={() => setEditOpen(true)}
							startIcon={<AddCircleOutlineIcon />}
						>
							한마디 등록하기
						</Button>
					)
				)}
			</div>

			<Dialog
				open={editOpen}
				onClose={() => !saving && setEditOpen(false)}
				maxWidth="sm"
				fullWidth
				slotProps={{ paper: { className: classes.dialogPaper } }}
			>
				<div className={classes.dialogTitleText}>
					{statusMessage ? '한마디 수정' : '한마디 등록'}
				</div>
				<div className={classes.dialogSubtitle}>
					최대 {MAX_LEN}자, 한 줄로 작성됩니다.
				</div>
				<DialogContent className={classes.dialogContent}>
					<TextField
						className={classes.textField}
						placeholder="지금 떠오르는 한마디를 적어보세요..."
						fullWidth
						variant="outlined"
						value={draft}
						onChange={e => setDraft(sanitize(e.target.value).slice(0, MAX_LEN))}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								e.preventDefault();
								if (!saveDisabled) handleSave();
							}
						}}
						inputProps={{ maxLength: MAX_LEN }}
						disabled={saving}
						autoFocus
					/>
					<div className={cx(classes.charCountRow, overLimit && classes.charCountOver)}>
						{trimmedLen} / {MAX_LEN}
					</div>
				</DialogContent>
				<DialogActions className={classes.dialogActions}>
					<Button className={classes.cancelBtn} onClick={() => setEditOpen(false)} disabled={saving}>
						취소
					</Button>
					<Button className={classes.saveBtn} onClick={handleSave} disabled={saveDisabled}>
						{saving ? <CircularProgress size={16} style={{ color: '#000' }} /> : statusMessage ? '수정' : '등록'}
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={confirmDelete}
				onClose={() => setConfirmDelete(false)}
				PaperProps={{
					style: {
						background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
						color: '#fff',
						border: '1px solid rgba(255, 107, 107, 0.3)',
						borderRadius: 16
					}
				}}
			>
				<DialogTitle style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>한마디 삭제</DialogTitle>
				<DialogContent>
					<DialogContentText
						style={{ fontFamily: '"Noto Sans KR", sans-serif', color: 'rgba(255, 255, 255, 0.7)' }}
					>
						한마디를 삭제하시겠습니까?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setConfirmDelete(false)}
						style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: '"Noto Sans KR", sans-serif' }}
					>
						취소
					</Button>
					<Button
						onClick={handleDelete}
						style={{ color: '#ff6b6b', fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 700 }}
					>
						삭제
					</Button>
				</DialogActions>
			</Dialog>

		</>
	);
}

export default StatusMessage;
