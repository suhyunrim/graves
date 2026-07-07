import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from 'tss-react/mui';
import React from 'react';
import reducer from './store/reducers';
import PositionRankingHeader from './PositionRankingHeader';
import PositionRankingTable from './PositionRankingTable';

const useStyles = makeStyles()((theme) => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	}
}));

function PositionRanking() {
	const { classes } = useStyles();

	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot
			}}
			header={<PositionRankingHeader />}
			content={<PositionRankingTable />}
		/>
	);
}

export default withReducer('PositionRanking', reducer)(PositionRanking);
