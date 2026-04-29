const RETURN_TO_KEY = 'postLoginReturnTo';

export default function startDiscordLogin(returnTo) {
	if (returnTo) {
		window.localStorage.setItem(RETURN_TO_KEY, returnTo);
	} else {
		window.localStorage.removeItem(RETURN_TO_KEY);
	}
	window.location.href = `${import.meta.env.VITE_CAMILLE_HOST}api/auth/discord`;
}

export function consumePostLoginReturnTo() {
	const value = window.localStorage.getItem(RETURN_TO_KEY);
	window.localStorage.removeItem(RETURN_TO_KEY);
	return value;
}
