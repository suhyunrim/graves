import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import * as LoginActions from 'app/auth/store/actions/login.actions';
import history from '@history';

function AuthCallback() {
	const dispatch = useDispatch();
	const location = useLocation();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const token = params.get('token');

		if (token) {
			dispatch(LoginActions.submitDiscordLogin(token));
		} else {
			history.push('/login');
		}
	}, [dispatch, location.search]);

	return <FuseSplashScreen />;
}

export default AuthCallback;
