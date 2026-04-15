import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from 'tss-react/mui';
import React from 'react';
import reducer from './store/reducers';
import AchievementContent from './AchievementContent';

const useStyles = makeStyles({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	}
});

function Achievement() {
	const { classes } = useStyles();

	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot
			}}
			content={<AchievementContent />}
		/>
	);
}

export default withReducer('Achievement', reducer)(Achievement);
