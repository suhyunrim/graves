import { useActionState } from 'react';

const INITIAL = { success: null, error: null, nonce: 0 };

export default function useSaveAction(actionFn) {
	const [state, runAction, isPending] = useActionState(async (_prev, payload) => {
		try {
			const result = await actionFn(payload);
			return { success: true, error: null, nonce: Date.now(), result };
		} catch (err) {
			const message = err?.response?.data?.result || err?.message || '저장에 실패했습니다.';
			return { success: false, error: message, nonce: Date.now() };
		}
	}, INITIAL);

	return [state, runAction, isPending];
}
