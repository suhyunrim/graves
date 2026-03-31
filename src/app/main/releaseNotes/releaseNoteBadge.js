import axios from 'axios';
import store from 'app/store';
import * as fuseActions from 'app/store/actions';

const STORAGE_KEY = 'graves_last_seen_version';

axios.get('/release-notes.json').then(response => {
	const releases = response.data;
	if (!releases || releases.length === 0) return;

	const latestVersion = releases[0].version;
	const lastSeenVersion = localStorage.getItem(STORAGE_KEY);

	if (lastSeenVersion !== latestVersion) {
		store.dispatch(
			fuseActions.updateNavigationItem('release-notes-component', {
				badge: {
					title: 'N',
					bg: '#51cf66',
					fg: '#fff'
				}
			})
		);
	}
});
