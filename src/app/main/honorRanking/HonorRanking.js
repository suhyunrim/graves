import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import reducer from './store/reducers';
import HonorRankingHeader from './HonorRankingHeader';
import HonorRankingTable from './HonorRankingTable';

const useStyles = makeStyles(() => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	}
}));

function HonorRanking() {
	const classes = useStyles();

	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot
			}}
			header={<HonorRankingHeader />}
			content={<HonorRankingTable />}
		/>
	);
}

export default withReducer('HonorRanking', reducer)(HonorRanking);
