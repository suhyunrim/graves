import createCamilleAxios from 'app/utility/camilleAxios';

export const GET_ACHIEVEMENTS = '[ACHIEVEMENT] GET ACHIEVEMENTS';
export const GET_ACHIEVEMENTS_LOADING = '[ACHIEVEMENT] GET ACHIEVEMENTS LOADING';

export function getAchievements(groupId, puuid) {
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
