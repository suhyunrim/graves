import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchNotifications, fetchUnreadCount, readAllNotifications } from './notificationsApi';

const POLL_INTERVAL_MS = 60 * 1000;

export default function useNotifications({ enabled = true, onArrival } = {}) {
	const [unreadCount, setUnreadCount] = useState(0);
	const [groups, setGroups] = useState([]);
	const [loading, setLoading] = useState(false);
	const pollTimerRef = useRef(null);
	const pausedRef = useRef(false);
	// 폴링 중 unread count 증가를 감지해 onArrival로 새 알림 토스트를 띄운다.
	const prevCountRef = useRef(null);
	const onArrivalRef = useRef(onArrival);
	useEffect(() => {
		onArrivalRef.current = onArrival;
	}, [onArrival]);

	const refreshUnread = useCallback(async () => {
		if (!enabled) return;
		try {
			const result = await fetchUnreadCount();
			const count = result?.count || 0;
			setUnreadCount(count);
			// 첫 호출은 기준선만 잡고(접속 전 알림은 토스트 X), 이후 증가분만 새 알림으로 본다.
			const prev = prevCountRef.current;
			prevCountRef.current = count;
			if (prev != null && count > prev && onArrivalRef.current) {
				try {
					const list = await fetchNotifications(50);
					const fresh = Array.isArray(list) ? list : [];
					const newest = fresh.find(g => g.hasUnread) || fresh[0];
					if (newest) onArrivalRef.current(newest, count - prev);
				} catch (e) {
					// 목록 fetch 실패 시 토스트 생략
				}
			}
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
			prevCountRef.current = 0;
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
