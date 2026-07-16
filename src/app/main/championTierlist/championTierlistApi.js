import createCamilleAxios from 'app/utility/camilleAxios';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import { getSampleTierlist } from 'app/main/sample/sampleData';

export function fetchChampionTierlist(groupId, position, minGames) {
	if (isSampleMode()) {
		return Promise.resolve(getSampleTierlist(position));
	}

	const params = { groupId };
	if (position) params.position = position;
	if (minGames != null) params.minGames = minGames;

	return createCamilleAxios()
		.get('/api/champions/tierlist', { params, silentError: true })
		.then(res => res.data.result);
}
