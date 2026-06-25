import axios from 'axios';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService';
import store from 'app/store';
import React from 'react';
import * as fuseActions from 'app/store/actions';
import history from '@history';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const createCamilleAxios = () => {
	// withCredentials: API(zeroboom.lol)와 프론트(graves.zeroboom.lol)가 cross-origin(같은 site)
	// 이라, 세션 쿠키(zb_session)를 요청에 실으려면 필요. 모바일 Safari가 localStorage를 비워도
	// 쿠키로 인증이 유지된다. (백엔드 CORS는 credentials 허용 + origin 반사)
	const instance = axios.create({ timeout: 15000, withCredentials: true });

	instance.defaults.baseURL = import.meta.env.VITE_CAMILLE_HOST;

	const discordToken = camilleRiotAuthService.getDiscordToken();
	if (discordToken) {
		instance.defaults.headers.common.Authorization = `Bearer ${discordToken}`;
	}

	const puuid = camilleRiotAuthService.getPuuid();
	if (puuid) {
		instance.defaults.headers.common.Puuid = puuid;
	}

	// 백엔드 JWT 슬라이딩 만료: 만료 임박 시 응답 헤더로 갱신된 토큰을 내려준다.
	// 헤더가 있으면 기존 키(camille_discord_token)에 그대로 덮어쓰고, 이 인스턴스의
	// default Authorization 도 갱신해 같은 인스턴스의 다음 요청부터 새 토큰이 실리게 한다.
	const applyRenewedToken = response => {
		const renewedToken = response && response.headers && response.headers['x-renewed-token'];
		if (renewedToken) {
			camilleRiotAuthService.setDiscordToken(renewedToken);
			instance.defaults.headers.common.Authorization = `Bearer ${renewedToken}`;
		}
	};

	instance.interceptors.response.use(
		response => {
			applyRenewedToken(response);
			return response;
		},
		error => {
			applyRenewedToken(error.response);

			// JWT 만료(401) → 로그아웃. 단 silentError(방문자 카운터 등 best-effort 호출)는 제외:
			// 그런 비핵심 호출이 401이라고 세션을 통째로 날려 /login으로 튕기면 안 된다.
			// (핵심 호출 getInfo 등은 silentError가 아니므로 만료 시 정상 로그아웃됨)
			if (
				error.response &&
				error.response.status === 401 &&
				camilleRiotAuthService.getDiscordToken() &&
				!(error.config && error.config.silentError)
			) {
				camilleRiotAuthService.logout();
				window.location.href = '/login';
				return Promise.reject(error);
			}

			const isServerDown = error.response && error.response.status >= 500 && error.response.status <= 599;
			if (isServerDown && !error.config.silentError) {
				history.replace('/maintenance');
				return Promise.reject(error);
			}

			if (error.config && error.config.silentError) {
				return Promise.reject(error);
			}
			store.dispatch(
				fuseActions.openDialog({
					children: (
						<>
							<DialogTitle id="alert-dialog-title">에러 발생!</DialogTitle>
							<DialogContent>
								<DialogContentText id="alert-dialog-description">
									{error.config.url} <br />
									{error.response ? error.response.status : ''}: {error.response ? error.response.data.result : ''}
								</DialogContentText>
							</DialogContent>
							<DialogActions>
								<Button onClick={() => store.dispatch(fuseActions.closeDialog())} color="primary" autoFocus>
									확인
								</Button>
							</DialogActions>
						</>
					)
				})
			);
			return Promise.reject(error);
		}
	);
	return instance;
};

export default createCamilleAxios;
