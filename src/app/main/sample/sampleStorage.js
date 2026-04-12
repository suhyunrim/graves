const SAMPLE_MODE_KEY = 'graves_sample_mode';
const SAMPLE_DATA_KEY = 'graves_sample_data';

export function isSampleMode() {
	return localStorage.getItem(SAMPLE_MODE_KEY) === 'true';
}

export function enableSampleMode() {
	localStorage.setItem(SAMPLE_MODE_KEY, 'true');
	// MyInfo 페이지에서 "나"를 식별하기 위해 puuid 설정
	localStorage.setItem('camille_riot_puuid', 'sample-puuid-01');
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
