import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchNotifications, fetchUnreadCount, readAllNotifications } from './notificationsApi';

const POLL_INTERVAL_MS = 60 * 1000;

export default function useNotifications({ enabled = true } = {}) {
	const [unreadCount, setUnreadCount] = useState(0);
	const [groups, setGroups] = useState([]);
	const [loading, setLoading] = useState(false);
	const pollTimerRef = useRef(null);
	const pausedRef = useRef(false);

	const refreshUnread = useCallback(async () => {
		if (!enabled) return;
		try {
			const result = await fetchUnreadCount();
			setUnreadCount(result?.count || 0);
		} catch (e) {
			// 인증 만료 등은 axios 인터셉터에서 처리. 폴링은 조용히 실패.
		}
	}, [enabled]);

	const refreshList = useCallback(async () => {
		if (!enabled) return;
		setLoading(true);
		try {
			const result = await fetchNotifications(50);
			setGroups(Array.isArray(result) ? result : []);
		} catch (e) {
			// 목록 fetch 실패는 빈 패널로 표시 (axios 인터셉터가 dialog 처리)
		} finally {
			setLoading(false);
		}
	}, [enabled]);

	const markAllRead = useCallback(async () => {
		try {
			await readAllNotifications();
			setUnreadCount(0);
		} catch (e) {
			// noop
		}
	}, []);

	const pausePolling = useCallback(() => {
		pausedRef.current = true;
	}, []);

	const resumePolling = useCallback(() => {
		pausedRef.current = false;
	}, []);

	useEffect(() => {
		if (!enabled) return undefined;
		refreshUnread();
		pollTimerRef.current = setInterval(() => {
			if (!pausedRef.current) refreshUnread();
		}, POLL_INTERVAL_MS);
		return () => {
			if (pollTimerRef.current) clearInterval(pollTimerRef.current);
		};
	}, [enabled, refreshUnread]);

	return {
		unreadCount,
		groups,
		loading,
		refreshUnread,
		refreshList,
		markAllRead,
		pausePolling,
		resumePolling
	};
}
