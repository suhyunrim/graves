import { combineReducers } from 'redux';
import groupSettings from './groupSettings.reducer';
import tempVoice from './tempVoice.reducer';

const reducer = combineReducers({
	groupSettings,
	tempVoice
});

export default reducer;
