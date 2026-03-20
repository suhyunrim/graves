import FuseUtils from '@fuse/utils/FuseUtils';

const CAMILLE_RIOT_PUUID_KEY = 'camille_riot_puuid';
const DISCORD_TOKEN_KEY = 'camille_discord_token';
/* eslint-disable camelcase */

class CamilleRiotAuthService extends FuseUtils.EventEmitter {
	init() {
		this.handleAuthentication();
	}

	handleAuthentication = () => {
		const puuid = this.getPuuid();
		const discordToken = this.getDiscordToken();

		if (!puuid && !discordToken) {
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

	setDiscordToken = token => {
		if (token) {
			localStorage.setItem(DISCORD_TOKEN_KEY, token);
		} else {
			localStorage.removeItem(DISCORD_TOKEN_KEY);
		}
	};

	getDiscordToken = () => {
		return window.localStorage.getItem(DISCORD_TOKEN_KEY);
	};

	logout = () => {
		this.setSession(null);
		this.setDiscordToken(null);
	};

	checkAuthenticated = () => {
		const puuid = this.getPuuid();
		const discordToken = this.getDiscordToken();
		if (!puuid && !discordToken) {
			this.logout();
			return false;
		}

		return true;
	};

	getAuthType = () => {
		if (this.getDiscordToken()) return 'discord';
		if (this.getPuuid()) return 'riot';
		return null;
	};

	getPuuid = () => {
		return window.localStorage.getItem(CAMILLE_RIOT_PUUID_KEY);
	};
}

const instance = new CamilleRiotAuthService();

export default instance;
