import { combineReducers } from 'redux';
import groupSettings from './groupSettings.reducer';
import groupInfo from './groupInfo.reducer';
import tempVoice from './tempVoice.reducer';
import auditLog from './auditLog.reducer';

const reducer = combineReducers({
	groupSettings,
	groupInfo,
	tempVoice,
	auditLog
});

export default reducer;
