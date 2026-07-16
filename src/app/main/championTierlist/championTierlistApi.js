import createCamilleAxios from 'app/utility/camilleAxios';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import { getSampleTierlist } from 'app/main/sample/sampleData';

export function fetchChampionTierlist(groupId, position) {
	if (isSampleMode()) {
		return Promise.resolve(getSampleTierlist(position));
	}

	const params = { groupId };
	if (position) params.position = position;

	return createCamilleAxios()
		.get('/api/champions/tierlist', { params, silentError: true })
		.then(res => res.data.result);
}
