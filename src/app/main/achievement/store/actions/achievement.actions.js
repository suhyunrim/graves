import createCamilleAxios from 'app/utility/camilleAxios';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import { getSampleAchievementData } from 'app/main/sample/sampleData';

export const GET_ACHIEVEMENTS = '[ACHIEVEMENT] GET ACHIEVEMENTS';
export const GET_ACHIEVEMENTS_LOADING = '[ACHIEVEMENT] GET ACHIEVEMENTS LOADING';

export function getAchievements(groupId, puuid) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: GET_ACHIEVEMENTS_LOADING });
			setTimeout(() => dispatch({ type: GET_ACHIEVEMENTS, payload: getSampleAchievementData() }), 300);
		};
	}

	return dispatch => {
		dispatch({ type: GET_ACHIEVEMENTS_LOADING });

		const request = createCamilleAxios().get(`/api/achievement/${groupId}/${puuid}`);

		return request.then(response =>
			dispatch({
				type: GET_ACHIEVEMENTS,
				payload: response.data.result
			})
		);
	};
}
