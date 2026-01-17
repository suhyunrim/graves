import FusePageCarded from '@fuse/core/FusePageCarded';
import withReducer from 'app/store/withReducer';
import React from 'react';
import reducer from './store/reducers';
import MatchHistoryHeader from './MatchHistoryHeader';
import MatchHistoryTable from './MatchHistoryTable';

function MatchHistory() {
	return (
		<FusePageCarded
			classes={{
				content: 'flex',
				header: 'min-h-72 h-72 sm:h-136 sm:min-h-136'
			}}
			header={<MatchHistoryHeader />}
			content={<MatchHistoryTable />}
			innerScroll
		/>
	);
}

export default withReducer('MatchHistory', reducer)(MatchHistory);
