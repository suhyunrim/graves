import * as Actions from '../actions';

const initialState = {
	data: null,
	myRanking: null,
	loading: false,
	position: 'TOP'
};

const positionRankingReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_POSITION_RANKING_LOADING: {
			return {
				...state,
				loading: true
			};
		}
		case Actions.GET_POSITION_RANKING: {
			return {
				...state,
				data: action.payload,
				myRanking: action.myRanking,
				loading: false
			};
		}
		case Actions.SET_POSITION: {
			return {
				...state,
				position: action.position
			};
		}
		default: {
			return state;
		}
	}
};

export default positionRankingReducer;
