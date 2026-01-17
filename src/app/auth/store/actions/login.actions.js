import camilleRiotAuthService from 'app/services/camilleRiotAuthService';
import * as UserActions from './user.actions';

export const TRY_LOGIN = 'TRY_LOGIN';
export const LOGIN_ERROR = 'LOGIN_ERROR';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';

export function submitLogin({ riotId }) {
	return dispatch => {
		dispatch({
			type: TRY_LOGIN
		});

		camilleRiotAuthService
			.signInWithRiotId(riotId)
			.then(user => {
				dispatch(UserActions.retrieveGroupList());

				return dispatch({
					type: LOGIN_SUCCESS,
					payload: user
				});
			})
			.catch(error => {
				return dispatch({
					type: LOGIN_ERROR,
					payload: error
				});
			});
	};
}
