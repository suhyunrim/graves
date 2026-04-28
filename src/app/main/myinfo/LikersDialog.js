import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { formatDistanceToNow } from 'date-fns';
import koLocale from 'date-fns/locale/ko';
import { fetchProfileCommentLikers } from './profileApi';

const useStyles = makeStyles()(() => ({
	paper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		borderRadius: '20px',
		color: '#fff'
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.04em',
		padding: '24px 28px 4px',
		textShadow: '0 0 18px rgba(0, 212, 255, 0.3)',
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.4)',
		padding: '0 28px 12px'
	},
	content: {
		padding: '8px 28px 16px !important',
		minHeight: 120
	},
	emptyOrLoading: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 100,
		fontFamily: '"Noto Sans KR", sans-serif',
		color: 'rgba(255, 255, 255, 0.5)',
		fontSize: '1.25rem'
	},
	list: {
		display: 'flex',
		flexDirection: 'column',
		gap: 8
	},
	row: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '10px 14px',
		background: 'rgba(0, 0, 0, 0.22)',
		borderRadius: 10,
		fontFamily: '"Noto Sans KR", sans-serif'
	},
	name: {
		fontSize: '1.3rem',
		color: '#fff',
		fontWeight: 600
	},
	time: {
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.45)'
	},
	closeBtn: {
		color: 'rgba(255, 255, 255, 0.6)',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		borderRadius: 10,
		padding: '6px 22px',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		'&:hover': {
			color: '#00d4ff',
			borderColor: 'rgba(0, 212, 255, 0.4)',
			background: 'rgba(0, 212, 255, 0.08)'
		}
	}
}));

function formatTime(iso) {
	if (!iso) return '';
	try {
		return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: koLocale });
	} catch (e) {
		return '';
	}
}

function LikersDialog({ open, commentId, onClose }) {
	const { classes } = useStyles();
	const [likers, setLikers] = useState(null);

	useEffect(() => {
		if (!open || !commentId) return;
		setLikers(null);
		fetchProfileCommentLikers(commentId)
			.then(result => setLikers(result || []))
			.catch(() => setLikers([]));
	}, [open, commentId]);

	const total = Array.isArray(likers) ? likers.length : 0;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="xs"
			fullWidth
			slotProps={{ paper: { className: classes.paper } }}
		>
			<div className={classes.title}>
				<span role="img" aria-label="heart">❤️</span> 좋아요 {total > 0 ? total : ''}
			</div>
			<div className={classes.subtitle}>이 글을 좋아한 사람들</div>
			<DialogContent className={classes.content}>
				{likers === null && (
					<div className={classes.emptyOrLoading}>
						<CircularProgress size={20} style={{ color: '#00d4ff' }} />
					</div>
				)}
				{likers !== null && likers.length === 0 && (
					<div className={classes.emptyOrLoading}>아직 좋아요를 누른 사람이 없습니다.</div>
				)}
				{likers !== null && likers.length > 0 && (
					<div className={classes.list}>
						{likers.map(liker => (
							<div key={liker.likerDiscordId} className={classes.row}>
								<span className={classes.name}>{liker.likerName}</span>
								<span className={classes.time}>{formatTime(liker.createdAt)}</span>
							</div>
						))}
					</div>
				)}
			</DialogContent>
			<DialogActions style={{ padding: '8px 28px 20px' }}>
				<Button className={classes.closeBtn} onClick={onClose}>닫기</Button>
			</DialogActions>
		</Dialog>
	);
}

export default LikersDialog;
