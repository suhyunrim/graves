import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import * as LoginActions from 'app/auth/store/actions/login.actions';
import { consumePostLoginReturnTo } from 'app/utility/discordAuth';

function AuthCallback() {
	const dispatch = useDispatch();
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const token = params.get('token');
		const returnTo = consumePostLoginReturnTo() || '/';

		if (!token) {
			navigate('/login', { replace: true });
			return;
		}

		dispatch(LoginActions.submitDiscordLogin(token)).then(() => {
			navigate(returnTo, { replace: true });
		});
	}, [dispatch, location.search, navigate]);

	return <FuseSplashScreen />;
}

export default AuthCallback;
