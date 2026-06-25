import React from 'react';

// auth: null — 비로그인도 접근 가능(단 "나/내" 질문은 세션이 있어야 풀린다).
const AiAssistantConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: '/ai',
			auth: null,
			component: React.lazy(() => import('./AiAssistant'))
		}
	]
};

export default AiAssistantConfig;
