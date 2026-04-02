import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Button, Snackbar } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import PeopleIcon from '@material-ui/icons/People';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import reducer from './store/reducers';
import * as Actions from './store/actions';
import ChallengeFormDialog from './ChallengeFormDialog';
import { gameTypeLabels, statusLabels, statusColors, formatDateRange, getDday } from './challengeUtils';

const useStyles = makeStyles(theme => ({
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
		[theme.breakpoints.down('sm')]: {
			fontSize: '2.75rem'
		}
	},
	subtitleRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 10
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.6)',
		letterSpacing: '0.05em',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.35rem'
		}
	},
	createBtn: {
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		color: '#000',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.2rem',
		padding: '8px 20px',
		borderRadius: 12,
		textTransform: 'none',
		'&:hover': {
			background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)'
		},
		[theme.breakpoints.down('xs')]: {
			fontSize: '1rem',
			padding: '6px 14px'
		}
	},
	container: {
		padding: '28px',
		maxWidth: 1400,
		margin: '0 auto',
		width: '100%'
	},
	cardGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
		gap: 20,
		[theme.breakpoints.down('xs')]: {
			gridTemplateColumns: '1fr'
		}
	},
	card: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.2)',
		padding: '24px',
		transition: 'all 0.3s ease',
		textDecoration: 'none',
		display: 'block',
		'&:hover': {
			borderColor: 'rgba(0, 212, 255, 0.5)',
			transform: 'translateY(-4px)',
			boxShadow: '0 8px 30px rgba(0, 212, 255, 0.15)'
		}
	},
	cardHeader: {
		display: 'flex',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		marginBottom: 12
	},
	cardTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff',
		lineHeight: 1.3
	},
	statusBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		padding: '4px 12px',
		borderRadius: 20,
		whiteSpace: 'nowrap',
		flexShrink: 0,
		marginLeft: 12
	},
	gameTypeBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 500,
		padding: '3px 10px',
		borderRadius: 8,
		background: 'rgba(0, 212, 255, 0.15)',
		color: '#00d4ff',
		display: 'inline-block',
		marginBottom: 12
	},
	cardDate: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)',
		marginBottom: 8
	},
	cardFooter: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 16,
		paddingTop: 12,
		borderTop: '1px solid rgba(255, 255, 255, 0.08)'
	},
	participantCount: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.6)'
	},
	dday: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#00d4ff'
	},
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '80px 20px',
		textAlign: 'center'
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	snackbar: {
		'& .MuiSnackbarContent-root': {
			background: '#51cf66',
			color: '#000',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontWeight: 600,
			fontSize: '1.2rem'
		}
	}
}));

function ChallengeList() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const list = useSelector(({ Challenge }) => Challenge.challenge.list);
	const user = useSelector(state => state.auth.user);
	const groupId = user && user.reprGroup ? user.reprGroup.groupId : null;
	const [formOpen, setFormOpen] = useState(false);
	const [snackMessage, setSnackMessage] = useState('');

	useEffect(() => {
		if (groupId) {
			dispatch(Actions.getChallengeList(groupId));
		}
	}, [dispatch, groupId]);

	function handleCreateSuccess() {
		setFormOpen(false);
		setSnackMessage('챌린지가 생성되었습니다.');
		if (groupId) {
			dispatch(Actions.getChallengeList(groupId));
		}
	}

	return (
		<FusePageSimple
			classes={{ root: classes.layoutRoot }}
			header={
				<div className={classes.headerRoot}>
					<Typography className={classes.title} variant="h4">
						Challenge
					</Typography>
					<div className={classes.subtitleRow}>
						<Typography className={classes.subtitle}>챌린지 이벤트</Typography>
						{user && user.role && user.role.includes('admin') && (
							<Button className={classes.createBtn} onClick={() => setFormOpen(true)} startIcon={<AddIcon />}>
								챌린지 생성
							</Button>
						)}
					</div>
				</div>
			}
			content={
				<div className={classes.container}>
					{list && list.length > 0 ? (
						<div className={classes.cardGrid}>
							{list.map(c => {
								const statusColor = statusColors[c.status] || '#868e96';
								const dday = c.status === 'active' ? getDday(c.endAt) : null;

								return (
									<Link key={c.id} to={`/challenge/${c.id}`} className={classes.card}>
										<div className={classes.cardHeader}>
											<span className={classes.cardTitle}>{c.title}</span>
											<span
												className={classes.statusBadge}
												style={{
													background: `${statusColor}20`,
													color: statusColor,
													border: `1px solid ${statusColor}40`
												}}
											>
												{statusLabels[c.status] || c.status}
											</span>
										</div>
										<span className={classes.gameTypeBadge}>
											{gameTypeLabels[c.gameType] || c.gameType}
										</span>
										<div className={classes.cardDate}>{formatDateRange(c.startAt, c.endAt)}</div>
										<div className={classes.cardFooter}>
											<span className={classes.participantCount}>
												<PeopleIcon style={{ fontSize: '1.4rem' }} />
												{c.activePlayerCount}명
											</span>
											{dday && <span className={classes.dday}>{dday}</span>}
										</div>
									</Link>
								);
							})}
						</div>
					) : (
						<div className={classes.emptyState}>
							<div className={classes.emptyText}>등록된 챌린지가 없습니다</div>
						</div>
					)}
					{formOpen && (
						<ChallengeFormDialog
							open={formOpen}
							onClose={() => setFormOpen(false)}
							onSuccess={handleCreateSuccess}
							groupId={groupId}
						/>
					)}
					<Snackbar
						className={classes.snackbar}
						open={Boolean(snackMessage)}
						autoHideDuration={3000}
						onClose={() => setSnackMessage('')}
						message={snackMessage}
					/>
				</div>
			}
		/>
	);
}

export default withReducer('Challenge', reducer)(ChallengeList);
