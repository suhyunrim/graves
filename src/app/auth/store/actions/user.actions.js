import history from '@history';
import _ from '@lodash';
import React from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import * as FuseActions from 'app/store/actions/fuse';
import CamilleRiotAuthService from 'app/services/camilleRiotAuthService';
import { enableSampleMode, disableSampleMode } from 'app/main/sample/sampleStorage';

export const SET_TOKEN_DATA = '[USER] SET TOKEN DATA';
export const RETRIEVE_GROUP_LIST = '[USER] RETRIEVE GROUP LIST';
export const SET_DISCORD_USER_DATA = '[USER] SET DISCORD USER DATA';
export const SET_GROUP_LIST = '[USER] SET GROUP LIST';
export const REMOVE_USER_DATA = '[USER] REMOVE DATA';
export const USER_LOGGED_OUT = '[USER] LOGGED OUT';
export const CHANGE_GROUP = '[USER] CHANGE GROUP';
export const ENTER_SAMPLE_MODE = '[USER] ENTER SAMPLE MODE';

export function retrieveGroupList() {
	return dispatch =>
		import('app/utility/camilleAxios').then(({ default: createCamilleAxios }) => {
			return createCamilleAxios().get('/api/user/getGroupList');
		}).then(response => {
				const groupList = response.data.result;
				const noGroup = groupList.length === 0;
				if (noGroup) {
					dispatch(logoutUser());
					dispatch(
						FuseActions.openDialog({
							children: (
								<>
									<DialogTitle id="alert-dialog-title">에러 발생!</DialogTitle>
									<DialogContent>
										<DialogContentText id="alert-dialog-description">
											이 계정이 포함되어 있는 그룹이 없습니다. <br />
											그룹에 등록되어 있는 계정이어야 합니다. <br />
											그룹 관리자에게 문의하세요.
										</DialogContentText>
									</DialogContent>
									<DialogActions>
										<Button onClick={() => dispatch(FuseActions.closeDialog())} color="primary" autoFocus>
											확인
										</Button>
									</DialogActions>
								</>
							)
						})
					);
					return;
				}

				dispatch({
					type: RETRIEVE_GROUP_LIST,
					payload: groupList
				});
			})
			.catch(e => {
				console.error(e);
			});
}

export function retrieveDiscordUser() {
	return dispatch =>
		import('app/utility/camilleAxios').then(({ default: createCamilleAxios }) => {
			return createCamilleAxios().get('/api/auth/me');
		}).then(response => {
				const user = response.data.result;

				if (user.puuid) {
					CamilleRiotAuthService.setSession(user.puuid);
				}

				dispatch({
					type: SET_DISCORD_USER_DATA,
					payload: user
				});

				return dispatch(retrieveGroupList());
			})
			.catch(e => {
				return Promise.reject(e);
			});
}

export function updateUserSettings(settings) {
	return (dispatch, getState) => {
		const oldUser = getState().auth.user;
		const user = _.merge({}, oldUser, { data: { settings } });

		updateUserData(user, dispatch);

		// return dispatch(setUserData(user));
	};
}

export function updateUserShortcuts(shortcuts) {
	return (dispatch, getState) => {
		const { user } = getState().auth;
		const newUser = {
			...user,
			data: {
				...user.data,
				shortcuts
			}
		};

		updateUserData(newUser, dispatch);

		// return dispatch(setUserData(newUser));
	};
}
export function removeUserData() {
	return {
		type: REMOVE_USER_DATA
	};
}

export function enterSampleMode() {
	return dispatch => {
		enableSampleMode();
		dispatch({ type: ENTER_SAMPLE_MODE });
	};
}

// 데모(샘플) 모드 종료 — 서버 세션이 없으므로 로그아웃 절차 없이 로그인 페이지로 바로 이동
export function exitSampleMode() {
	return dispatch => {
		disableSampleMode();

		history.push({
			pathname: '/login'
		});

		dispatch(FuseActions.setInitialSettings());

		return dispatch({
			type: USER_LOGGED_OUT
		});
	};
}

export function logoutUser() {
	return (dispatch, getState) => {
		disableSampleMode();

		CamilleRiotAuthService.logout();

		history.push({
			pathname: '/'
		});

		dispatch(FuseActions.setInitialSettings());

		return dispatch({
			type: USER_LOGGED_OUT
		});
	};
}

export function changeGroup(groupId) {
	return dispatch => {
		return dispatch({
			type: CHANGE_GROUP,
			groupId
		});
	};
}

function updateUserData(user, dispatch) {
	if (!user.role || user.role.length === 0) {
		// is guest
		return;
	}

	switch (user.from) {
		case 'firebase': {
			break;
		}
		case 'auth0': {
			break;
		}
		default: {
			break;
		}
	}
}
