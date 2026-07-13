import { isBefore, startOfDay } from 'date-fns';
import createCamilleAxios from 'app/utility/camilleAxios';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import {
	getSampleTournamentListData,
	getSampleTournamentDetailData,
	getSampleTournamentActiveMembersData
} from 'app/main/sample/sampleData';

export const LOADING_LIST = '[TOURNAMENT] LOADING LIST';
export const GET_TOURNAMENT_LIST = '[TOURNAMENT] GET TOURNAMENT LIST';
export const LOADING_DETAIL = '[TOURNAMENT] LOADING DETAIL';
export const GET_TOURNAMENT_DETAIL = '[TOURNAMENT] GET TOURNAMENT DETAIL';
export const CLEAR_TOURNAMENT_DETAIL = '[TOURNAMENT] CLEAR TOURNAMENT DETAIL';
export const SET_ACTIVE_MEMBERS = '[TOURNAMENT] SET ACTIVE MEMBERS';
export const SET_AUTO_ASSIGN = '[TOURNAMENT] SET AUTO ASSIGN';
export const CLEAR_AUTO_ASSIGN = '[TOURNAMENT] CLEAR AUTO ASSIGN';

export function getTournamentList(groupId) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: LOADING_LIST });
			setTimeout(() => dispatch({ type: GET_TOURNAMENT_LIST, payload: getSampleTournamentListData() }), 300);
		};
	}
	const request = createCamilleAxios().get(`/api/tournament/group/${groupId}`);
	return dispatch => {
		dispatch({ type: LOADING_LIST });
		return request.then(response =>
			dispatch({
				type: GET_TOURNAMENT_LIST,
				payload: response.data.tournaments || []
			})
		);
	};
}

export function getTournamentDetail(tournamentId) {
	if (isSampleMode()) {
		return dispatch => {
			dispatch({ type: LOADING_DETAIL });
			setTimeout(
				() => dispatch({ type: GET_TOURNAMENT_DETAIL, payload: getSampleTournamentDetailData(tournamentId) }),
				300
			);
		};
	}
	const request = createCamilleAxios().get(`/api/tournament/${tournamentId}`);
	return dispatch => {
		dispatch({ type: LOADING_DETAIL });
		return request.then(response =>
			dispatch({
				type: GET_TOURNAMENT_DETAIL,
				payload: response.data
			})
		);
	};
}

export function clearTournamentDetail() {
	return { type: CLEAR_TOURNAMENT_DETAIL };
}

// 경매 "강제 0원 자동 낙찰" 연출 트리거. 어드민은 next-candidate 응답의 autoAssigned로,
// 관전자는 소켓 'auction:auto-assign' 으로 동일 payload를 받아 같은 연출을 재생한다.
// (리듀서에서 puuid 기준으로 중복 재생을 막는다.)
export function showAutoAssign(payload) {
	return { type: SET_AUTO_ASSIGN, payload };
}

export function clearAutoAssign() {
	return { type: CLEAR_AUTO_ASSIGN };
}

// 토너먼트 팀원/후보 선택기 멤버 풀 — 개최일(heldAt) 기준 분기.
// 개최일이 과거(날짜 단위, 로컬 기준)면 과거 기록 소급 입력이므로 탈퇴자 포함 전원(all-members),
// 오늘/미래 또는 heldAt 없음(레거시 row 방어)이면 현역만(active-members).
// (멘션/태그 자동완성 등 다른 곳은 active-members 유지 — profileApi 참고.)
export function getActiveMembers(groupId, heldAt) {
	if (isSampleMode()) {
		return dispatch => {
			const members = getSampleTournamentActiveMembersData();
			dispatch({ type: SET_ACTIVE_MEMBERS, payload: members });
			return Promise.resolve(members);
		};
	}
	const isPastTournament = Boolean(heldAt) && isBefore(startOfDay(new Date(heldAt)), startOfDay(new Date()));
	const endpoint = isPastTournament ? 'all-members' : 'active-members';
	return dispatch =>
		createCamilleAxios()
			.get(`/api/group/${groupId}/${endpoint}`, { silentError: true })
			.then(response => {
				dispatch({ type: SET_ACTIVE_MEMBERS, payload: response.data.result || [] });
				return response.data.result;
			})
			.catch(() => {
				dispatch({ type: SET_ACTIVE_MEMBERS, payload: [] });
				return [];
			});
}

// === Mutations (return promise; caller handles success/error) ===

export function createTournament(body) {
	return createCamilleAxios().post('/api/tournament', body, { silentError: true });
}

export function deleteTournament(tournamentId) {
	return createCamilleAxios().delete(`/api/tournament/${tournamentId}`, { silentError: true });
}

export function updateTournament(tournamentId, body) {
	return createCamilleAxios().patch(`/api/tournament/${tournamentId}`, body, { silentError: true });
}

export function createTeam(tournamentId, body) {
	return createCamilleAxios().post(`/api/tournament/${tournamentId}/teams`, body, { silentError: true });
}

export function updateTeam(tournamentId, teamId, body) {
	return createCamilleAxios().patch(`/api/tournament/${tournamentId}/teams/${teamId}`, body, { silentError: true });
}

export function deleteTeam(tournamentId, teamId) {
	return createCamilleAxios().delete(`/api/tournament/${tournamentId}/teams/${teamId}`, { silentError: true });
}

export function startTournament(tournamentId, slotMapping, allowSingleTeam) {
	const body = allowSingleTeam ? { allowSingleTeam: true } : { slotMapping };
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/start`,
		body,
		{ silentError: true }
	);
}

export function startAuction(tournamentId) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/start-auction`,
		{},
		{ silentError: true }
	);
}

export function nextAuctionCandidate(tournamentId) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/auction/next-candidate`,
		{},
		{ silentError: true }
	);
}

export function startAuctionBid(tournamentId) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/auction/start-bid`,
		{},
		{ silentError: true }
	);
}

export function extendAuctionTime(tournamentId) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/auction/extend-time`,
		{},
		{ silentError: true }
	);
}

export function endAuctionBid(tournamentId) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/auction/end-bid`,
		{},
		{ silentError: true }
	);
}

export function placeAuctionBid(tournamentId, teamId, puuid, amount) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/auction/bid`,
		{ teamId, puuid, amount },
		{ silentError: true }
	);
}

export function undoAuctionBid(tournamentId, teamId, puuid) {
	return createCamilleAxios().delete(
		`/api/tournament/${tournamentId}/auction/bid`,
		{ data: { teamId, puuid }, silentError: true }
	);
}

export function completeAuction(tournamentId) {
	return createCamilleAxios().post(
		`/api/tournament/${tournamentId}/auction/complete`,
		{},
		{ silentError: true }
	);
}

export function updateMatchResult(matchId, team1Score, team2Score) {
	return createCamilleAxios().patch(
		`/api/tournament/matches/${matchId}`,
		{ team1Score, team2Score },
		{ silentError: true }
	);
}

export function updateMatchSchedule(matchId, scheduledAt) {
	return createCamilleAxios().patch(
		`/api/tournament/matches/${matchId}/schedule`,
		{ scheduledAt },
		{ silentError: true }
	);
}

export function createScrim(tournamentId, body) {
	return createCamilleAxios().post(`/api/tournament/${tournamentId}/scrims`, body, { silentError: true });
}

export function updateScrim(tournamentId, scrimId, body) {
	return createCamilleAxios().patch(`/api/tournament/${tournamentId}/scrims/${scrimId}`, body, { silentError: true });
}

export function deleteScrim(tournamentId, scrimId) {
	return createCamilleAxios().delete(`/api/tournament/${tournamentId}/scrims/${scrimId}`, { silentError: true });
}

export function putPredictions(tournamentId, predictions) {
	return createCamilleAxios().put(
		`/api/tournament/${tournamentId}/predictions`,
		{ predictions },
		{ silentError: true }
	);
}

// AI 승부예측 조회 — 저장된 기록만 읽는 가벼운 API. 매치 시작 전까지 서버가
// 스크림 반영으로 갱신하므로 클라이언트 캐시 없이 팝업 열 때마다 호출한다.
export function getAiPrediction(tournamentId, matchId) {
	return createCamilleAxios().get(
		`/api/tournament/${tournamentId}/matches/${matchId}/ai-prediction`,
		{ silentError: true }
	);
}
