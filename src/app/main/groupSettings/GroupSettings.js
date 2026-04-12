import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { Tabs, Tab } from '@material-ui/core';
import reducer from './store/reducers';
import GroupSettingsHeader from './GroupSettingsHeader';
import GroupInfoContent from './GroupInfoContent';
import GroupSettingsContent from './GroupSettingsContent';
import TempVoiceContent from './TempVoiceContent';
import AuditLogContent from './AuditLogContent';

const useStyles = makeStyles(() => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	},
	tabsWrapper: {
		padding: '0 28px',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
	},
	tabs: {
		minHeight: 44,
		'& .MuiTabs-indicator': {
			background: '#00d4ff',
			height: 3,
			borderRadius: '3px 3px 0 0'
		},
		'& .MuiTabs-scrollButtons': {
			color: 'rgba(255, 255, 255, 0.5)',
			'&.Mui-disabled': {
				opacity: 0.2
			}
		}
	},
	tab: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.5)',
		textTransform: 'none',
		minHeight: 44,
		padding: '8px 20px',
		'&.Mui-selected': {
			color: '#00d4ff'
		}
	}
}));

function GroupSettings() {
	const classes = useStyles();
	const [tab, setTab] = useState(0);

	const SUBTITLES = ['방 정보 및 설정', '그룹 멤버 관리', '임시 음성 채널 생성기 관리', '시스템 활동 로그'];

	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot
			}}
			header={<GroupSettingsHeader subtitle={SUBTITLES[tab]} showSearch={tab === 1} />}
			content={
				<>
					<div className={classes.tabsWrapper}>
						<Tabs
							className={classes.tabs}
							value={tab}
							onChange={(_, v) => setTab(v)}
							variant="scrollable"
							scrollButtons="auto"
						>
							<Tab className={classes.tab} label="방 설정" />
							<Tab className={classes.tab} label="멤버 관리" />
							<Tab className={classes.tab} label="디코 채널 관리" />
							<Tab className={classes.tab} label="시스템 로그" />
						</Tabs>
					</div>
					{tab === 0 && <GroupInfoContent />}
					{tab === 1 && <GroupSettingsContent />}
					{tab === 2 && <TempVoiceContent />}
					{tab === 3 && <AuditLogContent />}
				</>
			}
		/>
	);
}

export default withReducer('GroupSettings', reducer)(GroupSettings);
