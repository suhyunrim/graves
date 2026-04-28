import createCamilleAxios from 'app/utility/camilleAxios';

export function fetchProfileComments(groupId, puuid) {
	return createCamilleAxios()
		.get(`/api/profile/${groupId}/${puuid}/comments`, { silentError: true })
		.then(res => res.data.result);
}

export function createProfileComment(groupId, puuid, content, isSecret) {
	return createCamilleAxios()
		.post(
			`/api/profile/${groupId}/${puuid}/comments`,
			{ content, isSecret: !!isSecret },
			{ silentError: true }
		)
		.then(res => res.data.result);
}

export function deleteProfileComment(commentId) {
	return createCamilleAxios()
		.delete(`/api/profile/comments/${commentId}`, { silentError: true })
		.then(res => res.data.result);
}

export function toggleProfileCommentLike(commentId) {
	return createCamilleAxios()
		.post(`/api/profile/comments/${commentId}/like`, null, { silentError: true })
		.then(res => res.data.result);
}

export function fetchProfileCommentLikers(commentId) {
	return createCamilleAxios()
		.get(`/api/profile/comments/${commentId}/likes`, { silentError: true })
		.then(res => res.data.result);
}

export function recordProfileVisit(groupId, puuid) {
	return createCamilleAxios()
		.post(`/api/profile/${groupId}/${puuid}/visit`, null, { silentError: true })
		.then(res => res.data.result);
}

export function fetchProfileVisitStats(groupId, puuid) {
	return createCamilleAxios()
		.get(`/api/profile/${groupId}/${puuid}/stats`, { silentError: true })
		.then(res => res.data.result);
}
