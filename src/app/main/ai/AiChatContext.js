import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { askAI, AI_QUESTION_MAX } from './aiApi';
import AiAnswerToast from './AiAnswerToast';

// 탭 세션 동안 대화 유지(페이지 이동/새로고침엔 보존, 탭 닫으면 정리).
const CHAT_STORAGE_KEY = 'graves_ai_chat';

const AiChatContext = createContext(null);

export function useAiChat() {
	const ctx = useContext(AiChatContext);
	if (!ctx) {
		throw new Error('useAiChat must be used within AiChatProvider');
	}
	return ctx;
}

// 채팅 상태/요청을 라우터 위(전역)에 둬서 /ai를 떠나도 진행 중인 질문이 유지된다.
// 응답이 도착했을 때 사용자가 /ai에 없으면 클릭형 토스트로 알린다.
export function AiChatProvider({ children }) {
	const groupId = useSelector(state => state.auth.user?.reprGroup?.groupId);
	const navigate = useNavigate();
	const location = useLocation();

	// 응답 콜백 시점의 현재 경로를 참조하기 위해 ref로 추적(클로저 stale 방지).
	const pathRef = useRef(location.pathname);
	useEffect(() => {
		pathRef.current = location.pathname;
	}, [location.pathname]);

	const [messages, setMessages] = useState(() => {
		// 페이지 이동 후 복귀/새로고침 시 이전 대화 복원
		try {
			const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
			return saved ? JSON.parse(saved) : [];
		} catch (e) {
			return [];
		}
	});
	const [loading, setLoading] = useState(false);
	const [quota, setQuota] = useState(null);
	// 자리 비운 사이 도착한 답변 알림(클릭 시 /ai로 이동). null이면 토스트 숨김.
	const [arrived, setArrived] = useState(null);
	// 토스트로 진입했을 때 AiChat이 마지막 답변을 하이라이트하도록 1회성 신호.
	const [pendingFocus, setPendingFocus] = useState(false);

	useEffect(() => {
		try {
			sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
		} catch (e) {
			// 저장 실패(quota 등)는 무시 — 메모리 상태로만 동작
		}
	}, [messages]);

	// /ai로 들어오면 도착 토스트는 더 이상 필요 없으므로 닫는다.
	useEffect(() => {
		if (location.pathname === '/ai') setArrived(null);
	}, [location.pathname]);

	const send = useCallback(
		(text) => {
			const q = (text || '').trim();
			if (!q || loading || q.length > AI_QUESTION_MAX) return;

			// 새 질문 시작 — 이전 도착 토스트 정리
			setArrived(null);

			if (!groupId) {
				setMessages(prev => [
					...prev,
					{ role: 'user', text: q },
					{ role: 'ai', text: '로그인하고 그룹에 들어가야 답할 수 있어요.', error: true }
				]);
				return;
			}

			// messages는 이번 질문을 push하기 전 상태(클로저) → history로 그대로 전달(현재 질문 제외).
			const history = messages;
			setMessages(prev => [...prev, { role: 'user', text: q }]);
			setLoading(true);
			askAI(groupId, q, history)
				.then(result => {
					setMessages(prev => [...prev, { role: 'ai', text: result.answer }]);
					if (result.limit != null) {
						setQuota({ used: result.used, remaining: result.remaining, limit: result.limit });
					}
					// /ai를 보고 있지 않을 때만 알림(보고 있으면 인라인으로 이미 표시됨)
					if (pathRef.current !== '/ai') {
						setArrived({ text: result.answer });
					}
				})
				.catch(() => {
					setMessages(prev => [
						...prev,
						{ role: 'ai', text: '답변 생성에 실패했어요. 잠시 후 다시 시도해 주세요.', error: true }
					]);
					if (pathRef.current !== '/ai') {
						setArrived({ text: '답변 생성에 실패했어요. 잠시 후 다시 시도해 주세요.', error: true });
					}
				})
				.finally(() => setLoading(false));
		},
		[groupId, messages, loading]
	);

	const clearChat = useCallback(() => {
		// setMessages([]) → 저장 useEffect가 sessionStorage도 비움
		setMessages([]);
	}, []);

	// 토스트로 진입 시 AiChat이 소비하는 신호 리셋
	const consumeFocus = useCallback(() => setPendingFocus(false), []);

	const openChat = useCallback(() => {
		setArrived(null);
		setPendingFocus(true);
		navigate('/ai');
	}, [navigate]);

	const value = {
		messages,
		loading,
		quota,
		setQuota,
		send,
		clearChat,
		pendingFocus,
		consumeFocus
	};

	return (
		<AiChatContext.Provider value={value}>
			{children}
			<AiAnswerToast data={arrived} onOpen={openChat} onClose={() => setArrived(null)} />
		</AiChatContext.Provider>
	);
}

export default AiChatContext;
