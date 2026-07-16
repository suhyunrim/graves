import axios from 'axios';
import getDataVersion from 'app/utility/getLatesetRiotDataVersion';

// 소환사 스펠 ID → Data Dragon 키 매핑
const SPELL_MAP = {
	1: 'SummonerBoost',
	3: 'SummonerExhaust',
	4: 'SummonerFlash',
	6: 'SummonerHaste',
	7: 'SummonerHeal',
	11: 'SummonerSmite',
	12: 'SummonerTeleport',
	14: 'SummonerDot',
	21: 'SummonerBarrier',
	32: 'SummonerSnowball'
};

export function getChampionIcon(championName) {
	const v = getDataVersion() || '14.10.1';
	return `https://ddragon.leagueoflegends.com/cdn/${v}/img/champion/${championName}.png`;
}

export function getItemIcon(itemId) {
	if (!itemId) return null;
	const v = getDataVersion() || '14.10.1';
	return `https://ddragon.leagueoflegends.com/cdn/${v}/img/item/${itemId}.png`;
}

export function getSpellIcon(spellId) {
	const key = SPELL_MAP[spellId];
	if (!key) return null;
	const v = getDataVersion() || '14.10.1';
	return `https://ddragon.leagueoflegends.com/cdn/${v}/img/spell/${key}.png`;
}

export function getProfileIconUrl(profileIconId) {
	if (profileIconId == null) return null;
	const v = getDataVersion() || '14.10.1';
	return `https://ddragon.leagueoflegends.com/cdn/${v}/img/profileicon/${profileIconId}.png`;
}

export function getKeystoneIcon(perkId) {
	// Community Dragon CDN for rune icons (more reliable than parsing runesReforged.json)
	return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/${getPerkPath(perkId)}`;
}

// 주요 키스톤/스타일 ID → 아이콘 경로 매핑
// 스타일(트리) 아이콘은 CDragon에서 "{7200번대 에셋ID}_{이름}.png" 형태 (예: 7202_sorcery.png).
// "sorcery/sorcery.png" 같은 경로는 존재하지 않음 — 키스톤만 하위 디렉토리 구조.
const PERK_STYLE_ICONS = {
	// Precision
	8000: '7201_precision',
	8005: 'precision/presstheattack/presstheattack',
	8008: 'precision/lethaltempo/lethaltempotemp',
	8010: 'precision/conqueror/conqueror',
	8021: 'precision/fleetfootwork/fleetfootwork',
	// Domination
	8100: '7200_domination',
	8112: 'domination/electrocute/electrocute',
	8124: 'domination/predator/predator',
	8128: 'domination/darkharvest/darkharvest',
	9923: 'domination/hailofblades/hailofblades',
	// Sorcery
	8200: '7202_sorcery',
	8214: 'sorcery/summonaery/summonaery',
	8229: 'sorcery/arcanecomet/arcanecomet',
	8230: 'sorcery/phaserush/stormraiderssurgeruneicon2',
	// Inspiration (에셋명은 whimsy)
	8300: '7203_whimsy',
	8351: 'inspiration/glacialaugment/glacialaugment',
	8360: 'inspiration/unsealedspellbook/unsealedspellbook',
	8369: 'inspiration/firststrike/firststrike',
	// Resolve
	8400: '7204_resolve',
	8437: 'resolve/graspoftheundying/graspoftheundying',
	8439: 'resolve/veteranaftershock/veteranaftershock',
	8465: 'resolve/guardian/guardian'
};

function getPerkPath(perkId) {
	const path = PERK_STYLE_ICONS[perkId];
	if (path) return `${path}.png`;
	return 'runesicon.png'; // 범용 룬 아이콘 (미매핑 ID 폴백)
}

export function formatKDA(kills, deaths, assists) {
	if (deaths === 0) return 'Perfect';
	return ((kills + assists) / deaths).toFixed(2);
}

export function formatCS(minions, neutralMinions, timePlayed) {
	const total = (minions || 0) + (neutralMinions || 0);
	const perMin = timePlayed > 0 ? (total / (timePlayed / 60)).toFixed(1) : '0.0';
	return { total, perMin };
}

function formatLargeNumber(n) {
	if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
	return String(n);
}

export function formatGold(gold) {
	return formatLargeNumber(gold);
}

export function formatDamage(dmg) {
	return formatLargeNumber(dmg);
}

export function formatGameDuration(seconds) {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${String(s).padStart(2, '0')}`;
}

export function getMultiKillBadge(participant) {
	if (participant.pentaKills > 0) return '펜타킬';
	if (participant.quadraKills > 0) return '쿼드라킬';
	if (participant.tripleKills > 0) return '트리플킬';
	if (participant.doubleKills > 0) return '더블킬';
	return null;
}

let championKeysPromise = null;

// DDragon 챔피언 숫자 ID → DDragon 키("Thresh") 매핑을 1회 로드해 캐시.
// 밴 목록처럼 championId(숫자)만 있는 데이터의 아이콘 렌더용.
export function loadChampionKeysById() {
	if (championKeysPromise) return championKeysPromise;
	championKeysPromise = axios
		.get('https://ddragon.leagueoflegends.com/api/versions.json')
		.then(res => {
			const v = (res.data && res.data[0]) || import.meta.env.VITE_RIOT_DATA_VERSION || '14.10.1';
			return axios.get(`https://ddragon.leagueoflegends.com/cdn/${v}/data/ko_KR/champion.json`);
		})
		.then(res => {
			const data = (res.data && res.data.data) || {};
			const map = {};
			Object.keys(data).forEach(id => {
				map[Number(data[id].key)] = id;
			});
			return map;
		})
		.catch(() => ({}));
	return championKeysPromise;
}

let championNamesPromise = null;

// DDragon ko_KR 챔피언 id → 한글명 매핑을 1회 로드해 캐시 (promise 공유).
export function loadChampionNames() {
	if (championNamesPromise) return championNamesPromise;
	championNamesPromise = axios
		.get('https://ddragon.leagueoflegends.com/api/versions.json')
		.then(res => {
			const v = (res.data && res.data[0]) || import.meta.env.VITE_RIOT_DATA_VERSION || '14.10.1';
			return axios.get(`https://ddragon.leagueoflegends.com/cdn/${v}/data/ko_KR/champion.json`);
		})
		.then(res => {
			const data = (res.data && res.data.data) || {};
			const map = {};
			Object.keys(data).forEach(id => {
				map[id] = data[id].name;
			});
			return map;
		})
		.catch(() => ({}));
	return championNamesPromise;
}
