import createCamilleAxios from 'app/utility/camilleAxios';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import { getSampleMyInfoData } from 'app/main/sample/sampleData';


export const GET_MYINFO = '[MYINFO] GET MYINFO';
export const REFRESH_CHAMPION_SCORES = '[MYINFO] REFRESH CHAMPION SCORES';
export const TRY_REFRESH_CHAMPION_SCORES = '[MYINFO] TRY REFRESH CHAMPION SCORES';
export const SET_SUB_ACCOUNT = '[MYINFO] SET SUB ACCOUNT';
export const SET_STATUS_MESSAGE = '[MYINFO] SET STATUS MESSAGE';

// const getTotalMatchCount = champData => champData.win + champData.lose;
// const getWinRate = champData => Math.ceil((champData.win / getTotalMatchCount(champData)) * 100);
// const getAverageKills = champData => champData.kills / getTotalMatchCount(champData);
// const getAverageDeaths = champData => champData.deaths / getTotalMatchCount(champData);
// const getAverageAssists = champData => champData.assists / getTotalMatchCount(champData);
// const getKDA = champData => (getAverageKills(champData) + getAverageAssists(champData)) / getAverageDeaths(champData);

export function getMyInfo(groupId, puuid) {
	if (isSampleMode()) {
		return dispatch => {
			setTimeout(() => {
				dispatch({
					type: GET_MYINFO,
					payload: getSampleMyInfoData(puuid)
				});
			}, 300);
		};
	}

	const params = { groupId };
	if (puuid) params.puuid = puuid;
	const request = createCamilleAxios().get('/api/user/getInfo', {
		params
	});

	return dispatch =>
		request.then(response => {
			if (response.status !== 200) return;

			const result = response.data.result;
			// let champScoreArray = result.championScore;
			// champScoreArray = champScoreArray.sort((a, b) => {
			// 	const aTotal = getTotalMatchCount(a);
			// 	const bTotal = getTotalMatchCount(b);
			// 	if (aTotal !== bTotal) return bTotal - aTotal;

			// 	return b.win - a.win;
			// });
			// champScoreArray = champScoreArray.map((elem, index) => {
			// 	return {
			// 		...elem,
			// 		totalMatchCount: getTotalMatchCount(elem),
			// 		winRate: getWinRate(elem),
			// 		averageKills: getAverageKills(elem),
			// 		averageDeaths: getAverageDeaths(elem),
			// 		averageAssists: getAverageAssists(elem),
			// 		kda: getKDA(elem),
			// 		index: index + 1
			// 	};
			// });

			// result.championScore = champScoreArray;

			dispatch({
				type: GET_MYINFO,
				payload: result
			});
		});
}

export function registerSubAccount(riotId, groupId) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: SET_SUB_ACCOUNT, payload: { name: riotId } });
			return Promise.resolve({ message: '부캐가 등록되었습니다. (샘플)' });
		};
	}

	const request = createCamilleAxios().post('/api/user/sub-account', { riotId, groupId }, { silentError: true });

	return dispatch =>
		request.then(response => {
			dispatch({
				type: SET_SUB_ACCOUNT,
				payload: response.data.result.subAccount
			});
			return response.data.result;
		});
}

export function removeSubAccount(groupId) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: SET_SUB_ACCOUNT, payload: null });
			return Promise.resolve();
		};
	}

	const request = createCamilleAxios().delete('/api/user/sub-account', { data: { groupId }, silentError: true });

	return dispatch =>
		request.then(() => {
			dispatch({
				type: SET_SUB_ACCOUNT,
				payload: null
			});
		});
}

export function updateStatusMessage(groupId, puuid, content) {
	if (isSampleMode()) {
		return dispatch => {
			const payload = { content, updatedAt: new Date().toISOString() };
			dispatch({ type: SET_STATUS_MESSAGE, payload });
			return Promise.resolve(payload);
		};
	}

	const request = createCamilleAxios().put(
		'/api/user/status-message',
		{ groupId, puuid, content },
		{ silentError: true }
	);

	return dispatch =>
		request.then(response => {
			const result = response.data.result;
			dispatch({ type: SET_STATUS_MESSAGE, payload: result });
			return result;
		});
}

export function deleteStatusMessage(groupId, puuid) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: SET_STATUS_MESSAGE, payload: null });
			return Promise.resolve();
		};
	}

	const request = createCamilleAxios().delete('/api/user/status-message', {
		data: { groupId, puuid },
		silentError: true
	});

	return dispatch =>
		request.then(() => {
			dispatch({ type: SET_STATUS_MESSAGE, payload: null });
		});
}

export function refreshChampionScores(groupId) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: TRY_REFRESH_CHAMPION_SCORES });
			setTimeout(() => dispatch({ type: REFRESH_CHAMPION_SCORES }), 500);
		};
	}

	return dispatch => {
		dispatch({
			type: TRY_REFRESH_CHAMPION_SCORES
		});

		const request = createCamilleAxios().post('/api/user/calculateChampionScore', new URLSearchParams({ groupId }).toString());

		request.then(response => {
			if (response.status !== 200) return;

			dispatch({
				type: REFRESH_CHAMPION_SCORES
			});
		});
	};
}
