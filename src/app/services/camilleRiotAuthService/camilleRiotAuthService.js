import FuseUtils from '@fuse/utils/FuseUtils';

const CAMILLE_RIOT_TOKEN_KEY = 'camille_riot_token';
const CAMILLE_RIOT_TOKEN_EXPIRES_AT = 'camille_riot_token_expires_at';
const qs = require('querystring');
/* eslint-disable camelcase */

class CamilleRiotAuthService extends FuseUtils.EventEmitter {
	init() {
		this.handleAuthentication();
	}

	handleAuthentication = () => {
		const accessToken = this.getAccessToken();

		if (!accessToken) {
			this.emit('onNoAccessToken');
			return;
		}

		if (this.isAuthTokenValid(accessToken)) {
			this.setSession(accessToken);
			this.emit('onAutoLogin', true);
		} else {
			this.setSession(null);
			this.emit('onAutoLogout', 'accessToken expired');
		}
	};

	signInWithRiotId = riotId => {
		return new Promise((resolve, reject) => {
			const createCamilleAxios = require('app/utility/camilleAxios').default;
			createCamilleAxios()
				.post('/api/user/login', { riotId })
				.then(response => {
					if (response.status === 200) {
						this.setSession(response.data.loginResult.token);
						resolve(response.data);
					} else {
						reject(response.data);
					}
				});
		});
	};

	setSession = accessToken => {
		if (accessToken) {
			localStorage.setItem(CAMILLE_RIOT_TOKEN_KEY, accessToken);

			const expiresAt = new Date();
			expiresAt.setHours(expiresAt.getHours() + 6);
			localStorage.setItem(CAMILLE_RIOT_TOKEN_EXPIRES_AT, expiresAt.getTime());
		} else {
			localStorage.removeItem(CAMILLE_RIOT_TOKEN_KEY);
			localStorage.removeItem(CAMILLE_RIOT_TOKEN_EXPIRES_AT);
		}
	};

	logout = () => {
		this.setSession(null);
	};

	checkAuthenticated = () => {
		const accessToken = this.getAccessToken();
		if (!this.isAuthTokenValid(accessToken)) {
			this.logout();
			return false;
		}

		return true;
	};

	isAuthTokenValid = access_token => {
		const expiresAt = Number(localStorage.getItem(CAMILLE_RIOT_TOKEN_EXPIRES_AT));
		const isExpired = new Date().getTime() >= expiresAt;
		if (isExpired) return false;

		return !!access_token;
	};

	getAccessToken = () => {
		return window.localStorage.getItem(CAMILLE_RIOT_TOKEN_KEY);
	};
}

const instance = new CamilleRiotAuthService();

export default instance;
