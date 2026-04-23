import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from 'tss-react/mui';
import React from 'react';
import reducer from './store/reducers';
import AchievementUserRankingContent from './AchievementUserRankingContent';

const useStyles = makeStyles()({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	}
});

function AchievementUserRanking() {
	const { classes } = useStyles();

	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot
			}}
			content={<AchievementUserRankingContent />}
		/>
	);
}

export default withReducer('AchievementDashboard', reducer)(AchievementUserRanking);
