import createCamilleAxios from 'app/utility/camilleAxios';

export function fetchNotifications(limit = 50) {
	return createCamilleAxios()
		.get(`/api/notifications`, { params: { limit }, silentError: true })
		.then(res => res.data.result);
}

export function fetchUnreadCount() {
	return createCamilleAxios()
		.get(`/api/notifications/unread-count`, { silentError: true })
		.then(res => res.data.result);
}

export function readAllNotifications() {
	return createCamilleAxios()
		.post(`/api/notifications/read-all`, null, { silentError: true })
		.then(res => res.data.result);
}

export function readNotification({ targetKey, type, id }) {
	const body = id != null ? { id } : { targetKey, type };
	return createCamilleAxios()
		.post(`/api/notifications/read`, body, { silentError: true })
		.then(res => res.data.result);
}
