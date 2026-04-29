import createCamilleAxios from 'app/utility/camilleAxios';

export function fetchProfileComments(groupId, puuid) {
	return createCamilleAxios()
		.get(`/api/profile/${groupId}/${puuid}/comments`, { silentError: true })
		.then(res => res.data.result);
}

export function createProfileComment(groupId, puuid, content, isSecret, parentId = null) {
	return createCamilleAxios()
		.post(
			`/api/profile/${groupId}/${puuid}/comments`,
			{ content, isSecret: !!isSecret, parentId: parentId || null },
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

export function fetchGroupMembers(groupId) {
	// /members 는 admin 전용이라 일반 유저가 호출하면 401. 멘션 후보용 잔류 멤버 목록은 /active-members 사용.
	return createCamilleAxios()
		.get(`/api/group/${groupId}/active-members`, { silentError: true })
		.then(res => res.data.result);
}
