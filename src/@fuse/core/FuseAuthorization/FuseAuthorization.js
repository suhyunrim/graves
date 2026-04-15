import FuseUtils from '@fuse/utils';
import AppContext from 'app/AppContext';
import React, { useContext, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { matchRoutes, useLocation, useNavigate } from 'react-router-dom';

function FuseAuthorization({ children }) {
	const location = useLocation();
	const navigate = useNavigate();
	const userRole = useSelector(({ auth }) => auth.user.role);
	const { routes } = useContext(AppContext);
	const { pathname } = location;

	const matched = useMemo(() => {
		const matches = matchRoutes(routes, pathname);
		return matches?.[0] || null;
	}, [routes, pathname]);

	const accessGranted = matched ? FuseUtils.hasPermission(matched.route.auth, userRole) : true;

	useEffect(() => {
		if (!accessGranted) {
			if (!userRole || userRole.length === 0) {
				navigate('/login', { state: { redirectUrl: pathname } });
			} else {
				const redirectUrl = location.state?.redirectUrl || '/';
				navigate(redirectUrl);
			}
		}
	}, [accessGranted, userRole, pathname, navigate, location.state]);

	return accessGranted ? <>{children}</> : null;
}

export default FuseAuthorization;
