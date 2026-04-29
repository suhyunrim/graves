import { authRoles } from 'app/auth';
import React from 'react';

const LoginPageConfig = {
	settings: {
		layout: {
			config: {
				navbar: {
					display: false
				},
				toolbar: {
					display: false
				},
				footer: {
					display: false
				},
				leftSidePanel: {
					display: false
				},
				rightSidePanel: {
					display: false
				}
			}
		}
	},
	auth: authRoles.onlyGuest,
	routes: [
		{
			path: '/login',
			component: React.lazy(() => import('./LoginPage'))
		},
		{
			// 이미 RiotID로 로그인된 사용자도 Discord OAuth 콜백 처리는 가능해야 하므로 onlyGuest 가드를 풀어줌
			path: '/auth/callback',
			component: React.lazy(() => import('./AuthCallback')),
			auth: null
		}
	]
};

export default LoginPageConfig;
