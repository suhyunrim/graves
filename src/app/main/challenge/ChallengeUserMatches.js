import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, CircularProgress } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import reducer from './store/reducers';
import * as Actions from './store/actions';
import { formatShortDateTime } from './challengeUtils';

const DDRAGON_VERSION = '14.10.1';

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
	backLink: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.5)',
		textDecoration: 'none',
		marginBottom: 8,
		display: 'inline-block',
		'&:hover': { color: '#00d4ff' }
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '3.2rem',
		color: '#fff',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
		margin: 0,
		[theme.breakpoints.down('sm')]: {
			fontSize: '2.2rem'
		}
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginTop: 8
	},
	container: {
		padding: '28px',
		maxWidth: 1000,
		margin: '0 auto',
		width: '100%'
	},
	matchCard: {
		borderRadius: 16,
		padding: '20px 24px',
		marginBottom: 16,
		border: '1px solid',
		transition: 'transform 0.2s ease',
		'&:hover': {
			transform: 'translateY(-2px)'
		}
	},
	matchWin: {
		background: 'linear-gradient(135deg, rgba(77, 171, 247, 0.1) 0%, rgba(77, 171, 247, 0.03) 100%)',
		borderColor: 'rgba(77, 171, 247, 0.3)'
	},
	matchLose: {
		background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.03) 100%)',
		borderColor: 'rgba(255, 107, 107, 0.3)'
	},
	matchHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		marginBottom: 12,
		flexWrap: 'wrap'
	},
	resultBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		padding: '4px 14px',
		borderRadius: 8
	},
	winBadge: {
		background: 'rgba(77, 171, 247, 0.2)',
		color: '#4dabf7'
	},
	loseBadge: {
		background: 'rgba(255, 107, 107, 0.2)',
		color: '#ff6b6b'
	},
	championInfo: {
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	championIcon: {
		width: 40,
		height: 40,
		borderRadius: 10,
		border: '2px solid rgba(255, 255, 255, 0.2)'
	},
	championName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 600,
		color: '#fff'
	},
	kda: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.9)'
	},
	matchDate: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginLeft: 'auto'
	},
	groupMembers: {
		display: 'flex',
		gap: 16,
		flexWrap: 'wrap',
		paddingTop: 12,
		borderTop: '1px solid rgba(255, 255, 255, 0.08)'
	},
	memberChip: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		padding: '4px 10px',
		borderRadius: 8,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem'
	},
	allyChip: {
		background: 'rgba(77, 171, 247, 0.1)',
		color: '#4dabf7',
		border: '1px solid rgba(77, 171, 247, 0.2)'
	},
	enemyChip: {
		background: 'rgba(255, 107, 107, 0.1)',
		color: '#ff6b6b',
		border: '1px solid rgba(255, 107, 107, 0.2)'
	},
	memberIcon: {
		width: 20,
		height: 20,
		borderRadius: 4
	},
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '60px 20px',
		textAlign: 'center'
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	loadingWrapper: {
		display: 'flex',
		justifyContent: 'center',
		padding: 60
	}
}));

function getChampionIcon(championName) {
	return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${championName}.png`;
}

function ChallengeUserMatches() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const { challengeId, puuid } = useParams();
	const userMatches = useSelector(({ Challenge }) => Challenge.challenge.userMatches);
	const detail = useSelector(({ Challenge }) => Challenge.challenge.detail);
	const user = useSelector(state => state.auth.user);
	const groupId = user && user.reprGroup ? user.reprGroup.groupId : null;

	useEffect(() => {
		if (groupId) {
			dispatch(Actions.getUserMatches(groupId, challengeId, puuid));
			dispatch(Actions.getChallengeDetail(groupId, challengeId));
		}
	}, [dispatch, groupId, challengeId, puuid]);

	if (!groupId) {
		return (
			<FusePageSimple
				classes={{ root: classes.layoutRoot }}
				content={
					<div className={classes.loadingWrapper}>
						<CircularProgress style={{ color: '#00d4ff' }} />
					</div>
				}
			/>
		);
	}

	return (
		<FusePageSimple
			classes={{ root: classes.layoutRoot }}
			header={
				<div className={classes.headerRoot}>
					<Link to={`/challenge/${challengeId}`} className={classes.backLink}>
						&#8592; 리더보드로 돌아가기
					</Link>
					<Typography className={classes.title} variant="h4">
						{detail ? detail.title : 'Challenge'} - 전적
					</Typography>
					<Typography className={classes.subtitle}>
						{userMatches ? `${userMatches.length}경기` : '로딩 중...'}
					</Typography>
				</div>
			}
			content={
				<div className={classes.container}>
					{!userMatches ? (
						<div className={classes.loadingWrapper}>
							<CircularProgress style={{ color: '#00d4ff' }} />
						</div>
					) : userMatches.length === 0 ? (
						<div className={classes.emptyState}>
							<div className={classes.emptyText}>매치 기록이 없습니다</div>
						</div>
					) : (
						userMatches.map(match => (
							<div
								key={match.matchId}
								className={`${classes.matchCard} ${match.win ? classes.matchWin : classes.matchLose}`}
							>
								<div className={classes.matchHeader}>
									<span className={`${classes.resultBadge} ${match.win ? classes.winBadge : classes.loseBadge}`}>
										{match.win ? '승리' : '패배'}
									</span>
									<div className={classes.championInfo}>
										<img
											className={classes.championIcon}
											src={getChampionIcon(match.championName)}
											alt={match.championName}
										/>
										<span className={classes.championName}>{match.championName}</span>
									</div>
									<span className={classes.kda}>
										{match.kills}/{match.deaths}/{match.assists}
									</span>
									<span className={classes.matchDate}>{formatShortDateTime(match.gameCreation)}</span>
								</div>
								{match.groupMembers && match.groupMembers.length > 0 && (
									<div className={classes.groupMembers}>
										{match.groupMembers.map(member => (
											<div
												key={member.puuid}
												className={`${classes.memberChip} ${member.sameTeam ? classes.allyChip : classes.enemyChip}`}
											>
												<img
													className={classes.memberIcon}
													src={getChampionIcon(member.championName)}
													alt={member.championName}
												/>
												{member.name}
											</div>
										))}
									</div>
								)}
							</div>
						))
					)}
				</div>
			}
		/>
	);
}

export default withReducer('Challenge', reducer)(ChallengeUserMatches);
