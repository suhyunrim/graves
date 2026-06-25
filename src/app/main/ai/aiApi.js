import createCamilleAxios from 'app/utility/camilleAxios';

export const AI_QUESTION_MAX = 500;

// silentError: 400/500 시 전역 에러 다이얼로그로 튕기지 않고 호출자가 인라인 처리한다.
// withCredentials(camilleAxios 기본)로 세션 쿠키가 실려 백엔드가 "나/내" 질문자를 인식한다.
//
// messages: 이번 question을 push하기 "전"까지의 대화 [{role:'user'|'ai', text}].
//   - 'ai'→'assistant', text→content 로 매핑해 history로 전송(대화 맥락 유지).
//   - 이번 질문은 history에 넣지 않는다(question으로 따로 감).
//   - 에러 말풍선은 맥락이 아니므로 제외하고, 최근 12개만 보낸다.
export async function askAI(groupId, question, messages) {
	const history = (messages || [])
		.filter(m => !m.error)
		.slice(-12)
		.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));
	// timeout: AI 응답은 도구 호출 루프로 인스턴스 기본값(15초)을 넘길 수 있어 이 호출만 60초로 둔다.
	// (axios는 요청별 config가 인스턴스 기본을 덮어쓰므로 다른 API는 15초 유지)
	const res = await createCamilleAxios().post(
		'/api/ai/ask',
		{ groupId, question, history },
		{ silentError: true, timeout: 60000 }
	);
	return res.data.result; // { answer, toolCalls, used, remaining, limit }
}

// 카운트 소비 없이 오늘 남은 질문 횟수 조회. 미로그인(401)이면 호출 측에서 무시.
// groupId 불필요 — puuid(세션) 기준이다. limit === 0이면 무제한(remaining은 null).
export async function getQuota() {
	const res = await createCamilleAxios().get('/api/ai/quota', { silentError: true });
	return res.data.result; // { used, remaining, limit }
}
