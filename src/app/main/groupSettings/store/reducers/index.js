import { combineReducers } from 'redux';
import groupSettings from './groupSettings.reducer';
import tempVoice from './tempVoice.reducer';
import auditLog from './auditLog.reducer';

const reducer = combineReducers({
	groupSettings,
	tempVoice,
	auditLog
});

export default reducer;
