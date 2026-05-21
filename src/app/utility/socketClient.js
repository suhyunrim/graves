import { io } from 'socket.io-client';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService';

let socketInstance = null;

export function getSocket() {
	if (socketInstance) return socketInstance;
	const host = import.meta.env.VITE_CAMILLE_HOST;
	const token = camilleRiotAuthService.getDiscordToken();
	const puuid = camilleRiotAuthService.getPuuid();
	socketInstance = io(host, {
		autoConnect: true,
		transports: ['websocket', 'polling'],
		auth: {
			token: token || undefined,
			puuid: puuid || undefined
		}
	});
	return socketInstance;
}

export function disconnectSocket() {
	if (socketInstance) {
		socketInstance.disconnect();
		socketInstance = null;
	}
}
