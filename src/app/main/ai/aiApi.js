import createCamilleAxios from 'app/utility/camilleAxios';

export const AI_QUESTION_MAX = 500;

// silentError: 400/500 시 전역 에러 다이얼로그로 튕기지 않고 호출자가 인라인 처리한다.
// withCredentials(camilleAxios 기본)로 세션 쿠키가 실려 백엔드가 "나/내" 질문자를 인식한다.
export async function askAI(groupId, question) {
	const res = await createCamilleAxios().post('/api/ai/ask', { groupId, question }, { silentError: true });
	return res.data.result; // { answer, toolCalls }
}
