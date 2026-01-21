import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import reducer from './store/reducers';
import MatchHistoryHeader from './MatchHistoryHeader';
import MatchHistoryTable from './MatchHistoryTable';

const useStyles = makeStyles(theme => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	}
}));

function MatchHistory() {
	const classes = useStyles();

	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot
			}}
			header={<MatchHistoryHeader />}
			content={<MatchHistoryTable />}
		/>
	);
}

export default withReducer('MatchHistory', reducer)(MatchHistory);
