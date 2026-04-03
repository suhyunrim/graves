import axios from 'axios';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService';
import store from 'app/store';
import React from 'react';
import * as fuseActions from 'app/store/actions';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const createCamilleAxios = () => {
	const instance = axios.create();

	instance.defaults.baseURL = process.env.REACT_APP_CAMILLE_HOST;

	const discordToken = camilleRiotAuthService.getDiscordToken();
	if (discordToken) {
		instance.defaults.headers.common.Authorization = `Bearer ${discordToken}`;
	}

	const puuid = camilleRiotAuthService.getPuuid();
	if (puuid) {
		instance.defaults.headers.common.Puuid = puuid;
	}

	instance.interceptors.response.use(
		response => {
			return response;
		},
		error => {
			if (error.response && error.response.status === 401 && camilleRiotAuthService.getDiscordToken()) {
				camilleRiotAuthService.logout();
				window.location.href = '/login';
				return Promise.reject(error);
			}

			const isServerDown = !error.response || (error.response.status >= 500 && error.response.status <= 599);
			if (isServerDown) {
				store.dispatch(
					fuseActions.openDialog({
						children: (
							<>
								<DialogTitle style={{ textAlign: 'center', paddingTop: 32 }}>
									<span role="img" aria-label="tools" style={{ fontSize: '3rem' }}>&#x1F6E0;&#xFE0F;</span>
								</DialogTitle>
								<DialogContent style={{ textAlign: 'center', padding: '0 32px 8px' }}>
									<DialogContentText style={{ fontSize: '1.6rem', fontWeight: 600, color: '#333' }}>
										서버 점검 중입니다
									</DialogContentText>
									<DialogContentText style={{ fontSize: '1.2rem', color: '#888' }}>
										잠시 후 다시 시도해주세요.
									</DialogContentText>
								</DialogContent>
								<DialogActions style={{ justifyContent: 'center', paddingBottom: 24 }}>
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
