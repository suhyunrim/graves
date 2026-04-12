const SAMPLE_MODE_KEY = 'graves_sample_mode';
const SAMPLE_DATA_KEY = 'graves_sample_data';
export const SAMPLE_MY_PUUID = 'sample-puuid-01';

export function isSampleMode() {
	return localStorage.getItem(SAMPLE_MODE_KEY) === 'true';
}

export function enableSampleMode() {
	localStorage.setItem(SAMPLE_MODE_KEY, 'true');
	localStorage.setItem('camille_riot_puuid', SAMPLE_MY_PUUID);
}

export function disableSampleMode() {
	localStorage.removeItem(SAMPLE_MODE_KEY);
	localStorage.removeItem(SAMPLE_DATA_KEY);
	// enableSampleMode에서 설정한 puuid 정리
	const currentPuuid = localStorage.getItem('camille_riot_puuid');
	if (currentPuuid && currentPuuid.startsWith('sample-')) {
		localStorage.removeItem('camille_riot_puuid');
	}
}

export function getSampleData(key) {
	const stored = localStorage.getItem(SAMPLE_DATA_KEY);
	if (!stored) return null;
	try {
		const parsed = JSON.parse(stored);
		return parsed[key] || null;
	} catch (e) {
		return null;
	}
}

export function setSampleData(key, data) {
	let stored;
	try {
		stored = JSON.parse(localStorage.getItem(SAMPLE_DATA_KEY) || '{}');
	} catch (e) {
		stored = {};
	}
	stored[key] = data;
	localStorage.setItem(SAMPLE_DATA_KEY, JSON.stringify(stored));
}
