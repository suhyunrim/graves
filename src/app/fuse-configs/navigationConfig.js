const navigationConfig = [
	{
		id: 'menu',
		title: 'Menu',
		type: 'group',
		icon: 'apps',
		children: [
			{
				id: 'dashboard-component',
				title: 'Dashboard',
				type: 'item',
				icon: 'dashboard',
				url: '/dashboard'
			},
			{
				id: 'myinfo-component',
				title: 'MyInfo',
				type: 'item',
				icon: 'face',
				url: '/myinfo'
			},
			{
				id: 'ranking-component',
				title: 'Ranking',
				type: 'item',
				icon: 'format_list_numbered',
				url: '/ranking'
			},
			{
				id: 'match-history-component',
				title: 'Match History',
				type: 'item',
				icon: 'history',
				url: '/match-history'
			},
			{
				id: 'honor-ranking-component',
				title: 'Honor',
				type: 'item',
				icon: 'emoji_events',
				url: '/honor-ranking'
			},
			{
				id: 'achievement-dashboard-component',
				title: 'Achievements',
				type: 'item',
				icon: 'workspace_premium',
				url: '/achievement-dashboard'
			},
			{
				id: 'challenge-component',
				title: 'Challenge',
				type: 'item',
				icon: 'flag',
				url: '/challenge'
			},
			{
				id: 'balance-report-component',
				title: 'Balancing Report',
				type: 'item',
				icon: 'assessment',
				url: '/balance-report'
			},
			{
				id: 'group-settings-component',
				title: 'Group Settings',
				type: 'item',
				icon: 'settings',
				url: '/group-settings'
			},
			{
				id: 'release-notes-component',
				title: 'Release Notes',
				type: 'item',
				icon: 'new_releases',
				url: '/release-notes'
			}
		]
	}
];

export default navigationConfig;
