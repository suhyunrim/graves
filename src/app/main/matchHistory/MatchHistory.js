import React from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import withReducer from 'app/store/withReducer';
import MatchHistoryHeader from './MatchHistoryHeader';
import MatchHistoryTable from './MatchHistoryTable';
import reducer from './store/reducers';

const useStyles = makeStyles(theme => ({
	layoutRoot: {}
}));

function MatchHistory() {
	const classes = useStyles();

	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot
			}}
			header={<MatchHistoryHeader />}
			content={
				<div className="p-24">
					<MatchHistoryTable />
				</div>
			}
		/>
	);
}

export default withReducer('MatchHistory', reducer)(MatchHistory);
