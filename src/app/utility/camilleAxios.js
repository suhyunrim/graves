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
	instance.defaults.headers.common.Puuid = camilleRiotAuthService.getPuuid();
	instance.interceptors.response.use(
		response => {
			return response;
		},
		error => {
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
