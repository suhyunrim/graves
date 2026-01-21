import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import reducer from './store/reducers';
import RankingHeader from './RankingHeader';
import RankingTable from './RankingTable';

const useStyles = makeStyles(theme => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	}
}));

function Ranking() {
	const classes = useStyles();

	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot
			}}
			header={<RankingHeader />}
			content={<RankingTable />}
		/>
	);
}

export default withReducer('Ranking', reducer)(Ranking);
