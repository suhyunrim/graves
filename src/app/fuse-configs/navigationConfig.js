const navigationConfig = [
	{
		id: 'menu',
		title: '메뉴',
		type: 'group',
		icon: 'apps',
		children: [
			{
				id: 'dashboard-component',
				title: '대시보드',
				type: 'item',
				icon: 'dashboard',
				url: '/dashboard'
			},
			{
				id: 'myinfo-component',
				title: '내 정보',
				type: 'item',
				icon: 'face',
				url: '/myinfo'
			},
			{
				id: 'ranking-component',
				title: '랭킹',
				type: 'item',
				icon: 'format_list_numbered',
				url: '/ranking'
			},
			{
				id: 'position-ranking-component',
				title: '포지션 랭킹',
				type: 'item',
				icon: 'leaderboard',
				url: '/position-ranking'
			},
			{
				id: 'match-history-component',
				title: '내전 기록',
				type: 'item',
				icon: 'history',
				url: '/match-history'
			},
			{
				id: 'honor-ranking-component',
				title: '명예',
				type: 'item',
				icon: 'emoji_events',
				url: '/honor-ranking'
			},
			{
				id: 'achievement-dashboard-component',
				title: '업적',
				type: 'item',
				icon: 'workspace_premium',
				url: '/achievement-dashboard'
			},
			{
				id: 'ai-assistant-component',
				title: 'AI 도우미 (BETA)',
				type: 'item',
				icon: 'assistant',
				url: '/ai'
			},
			{
				id: 'challenge-component',
				title: '시즌전',
				type: 'item',
				icon: 'flag',
				url: '/challenge'
			},
			{
				id: 'tournament-component',
				title: '멸망전',
				type: 'item',
				icon: 'emoji_events',
				url: '/tournament'
			},
			{
				id: 'balance-report-component',
				title: '밸런스 리포트',
				type: 'item',
				icon: 'assessment',
				url: '/balance-report'
			},
			{
				id: 'group-settings-component',
				title: '그룹 설정',
				type: 'item',
				icon: 'settings',
				url: '/group-settings'
			},
			{
				id: 'release-notes-component',
				title: '패치 노트',
				type: 'item',
				icon: 'new_releases',
				url: '/release-notes'
			}
		]
	}
];

export default navigationConfig;
