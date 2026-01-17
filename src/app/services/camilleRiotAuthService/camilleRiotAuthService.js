import FuseUtils from '@fuse/utils/FuseUtils';

const CAMILLE_RIOT_PUUID_KEY = 'camille_riot_puuid';
/* eslint-disable camelcase */

class CamilleRiotAuthService extends FuseUtils.EventEmitter {
	init() {
		this.handleAuthentication();
	}

	handleAuthentication = () => {
		const puuid = this.getPuuid();

		if (!puuid) {
			this.emit('onNoAccessToken');
			return;
		}

		this.emit('onAutoLogin', true);
	};

	signInWithRiotId = riotId => {
		return new Promise((resolve, reject) => {
			const createCamilleAxios = require('app/utility/camilleAxios').default;
			createCamilleAxios()
				.post('/api/user/login', { riotId })
				.then(response => {
					if (response.status === 200) {
						this.setSession(response.data.puuid);
						resolve(response.data);
					} else {
						reject(response.data);
					}
				});
		});
	};

	setSession = puuid => {
		if (puuid) {
			localStorage.setItem(CAMILLE_RIOT_PUUID_KEY, puuid);
		} else {
			localStorage.removeItem(CAMILLE_RIOT_PUUID_KEY);
		}
	};

	logout = () => {
		this.setSession(null);
	};

	checkAuthenticated = () => {
		const puuid = this.getPuuid();
		if (!puuid) {
			this.logout();
			return false;
		}

		return true;
	};

	getPuuid = () => {
		return window.localStorage.getItem(CAMILLE_RIOT_PUUID_KEY);
	};
}

const instance = new CamilleRiotAuthService();

export default instance;
