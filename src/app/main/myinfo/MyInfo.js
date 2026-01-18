import React, { useEffect } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { Grid, Card, CardContent, Typography, CardMedia, withStyles } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import withReducer from 'app/store/withReducer';
import getLatesetRiotDataVersion from 'app/utility/getLatesetRiotDataVersion';
import MyInfoHeader from './MyInfoHeader';
import MyInfoTable from './MyInfoTable';
import RatingChart from './RatingChart';
import reducer from './store/reducers';
import * as Actions from './store/actions';

const useStyles = makeStyles(theme => ({
	layoutRoot: {},
	media: {
		alignItems: 'center',
		padding: 10,
		width: 150,
		height: 150
	},
	card: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minWidth: 300,
		minHeight: 180
	},
	details: {
		display: 'flex',
		flexDirection: 'column'
	},
	content: {
		flex: '1 0 auto'
	}
}));

const TierTextTypography = withStyles({
	root: {
		color: '#4374D9',
		fontWeight: 'bold'
	}
})(Typography);

const RatingTextTypography = withStyles({
	root: {
		fontWeight: 'bold'
	}
})(Typography);

function MyInfoPage(props) {
	const classes = useStyles(props);

	const dispatch = useDispatch();

	const user = useSelector(state => state.auth.user);
	const scoreInfo = useSelector(({ MyInfo }) => MyInfo.myInfo.scoreInfo);
	const summonerInfo = useSelector(({ MyInfo }) => MyInfo.myInfo.summonerInfo);

	const getSoloRankTierName = () => {
		const tier = summonerInfo.rankTier;
		if (tier === 'UNRANKED') return 'UNRANKED';

		return tier.split(' ')[0];
	};

	const getRatingTierName = () => {
		return scoreInfo.ratingTier.split(' ')[0];
	};

	const getProfileIconURI = () => {
		return `https://ddragon.leagueoflegends.com/cdn/${getLatesetRiotDataVersion()}/img/profileicon/${summonerInfo.profileIconId}.png`;
	};

	useEffect(() => {
		dispatch(Actions.getMyInfo(user.reprGroup.groupId));
	}, [dispatch, user]);

	if (!scoreInfo) {
		return <FuseLoading />;
	}

	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot
			}}
			header={<MyInfoHeader />}
			content={
				<div className="p-24">
					<Grid container spacing={2} direction="row" justify="flex-start" alignItems="flex-start">
						<Grid item key={0}>
							<img width="128" height="128" src={getProfileIconURI()} alt="ProfileIcon" />
						</Grid>
						<Grid item key={1}>
							<Typography variant="h4">{summonerInfo.name}</Typography>
							<Typography variant="body2" color="textSecondary" gutterBottom>
								Lv. {summonerInfo.summonerLevel}
							</Typography>
						</Grid>
					</Grid>
					<br />
					<Grid container spacing={2} direction="row" justify="flex-start" alignItems="flex-start">
						<Grid item key={0}>
							<Card className={classes.card}>
								<CardMedia
									className={classes.media}
									component="img"
									src={`/assets/images/ranked-emblems/Emblem_${getSoloRankTierName()}.png`}
								/>
								<div className={classes.details}>
									<CardContent className={classes.content}>
										<Typography variant="h6" color="textSecondary">
											Solo Rank
										</Typography>
										<TierTextTypography variant="h5" gutterBottom>
											{summonerInfo.rankTier}
										</TierTextTypography>
										<Typography variant="body2" color="textSecondary" component="p">
											{summonerInfo.rankWin}승 {summonerInfo.rankLose}패
										</Typography>
										<Typography variant="body2" color="textSecondary" component="p">
											승률 {summonerInfo.rankWin + summonerInfo.rankLose > 0 ? `${Math.ceil((summonerInfo.rankWin / (summonerInfo.rankWin + summonerInfo.rankLose)) * 100)}%` : '-'}
										</Typography>
									</CardContent>
								</div>
							</Card>
						</Grid>
						<Grid item key={1}>
							<Card className={classes.card}>
								<CardMedia
									className={classes.media}
									component="img"
									src={`/assets/images/ranked-emblems/Emblem_${getRatingTierName()}.png`}
								/>
								<div className={classes.details}>
									<CardContent className={classes.content}>
										<Typography variant="h6" color="textSecondary">
											Custom Rating
										</Typography>
										<TierTextTypography variant="h5" color="primary" gutterBottom>
											{scoreInfo.ratingTier}
										</TierTextTypography>
										<RatingTextTypography variant="body1" gutterBottom>
											{scoreInfo.defaultRating + scoreInfo.additionalRating}p ({scoreInfo.defaultRating}{' '}
											{scoreInfo.additionalRating >= 0 ? '+ ' : '- '}
											{Math.abs(scoreInfo.additionalRating)})
										</RatingTextTypography>
										<Typography variant="body2" color="textSecondary">
											{scoreInfo.win}승 {scoreInfo.lose}패
										</Typography>
										<Typography variant="body2" color="textSecondary">
											승률 {scoreInfo.win + scoreInfo.lose > 0 ? `${Math.ceil((scoreInfo.win / (scoreInfo.win + scoreInfo.lose)) * 100)}%` : '-'}
										</Typography>
									</CardContent>
								</div>
							</Card>
						</Grid>
					</Grid>
					<br />
					<MyInfoTable />
					<br />
					<RatingChart />
				</div>
			}
		/>
	);
}

export default withReducer('MyInfo', reducer)(MyInfoPage);
