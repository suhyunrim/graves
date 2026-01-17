const navigationConfig = [
	{
		id: 'menu',
		title: 'Menu',
		type: 'group',
		icon: 'apps',
		children: [
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
			}
		]
	}
];

export default navigationConfig;
