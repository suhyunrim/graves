import FuseHighlight from '@fuse/core/FuseHighlight';
import AppBar from '@mui/material/AppBar';
import Card from '@mui/material/Card';
import Icon from '@mui/material/Icon';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import React, { useState } from 'react';
import DemoFrame from './DemoFrame';

function FuseExample(props) {
	const { component: Component, raw, iframe, className, currentTabIndex = 0 } = props;
	const [currentTab, setCurrentTab] = useState(currentTabIndex);

	function handleChange(event, value) {
		setCurrentTab(value);
	}

	return (
		<Card className={className}>
			<AppBar position="static" color="default" elevation={0}>
				<Tabs
					classes={{
						root: 'border-b-1',
						flexContainer: 'justify-end'
					}}
					value={currentTab}
					onChange={handleChange}
				>
					{Component && <Tab classes={{ root: 'min-w-64' }} icon={<Icon>remove_red_eye</Icon>} />}
					{raw && <Tab classes={{ root: 'min-w-64' }} icon={<Icon>code</Icon>} />}
				</Tabs>
			</AppBar>
			<div className="flex justify-center">
				<div className={currentTab === 0 ? 'flex flex-1' : 'hidden'}>
					{Component &&
						(iframe ? (
							<DemoFrame>
								<Component />
							</DemoFrame>
						) : (
							<div className="p-24 flex flex-1 justify-center">
								<Component />
							</div>
						))}
				</div>
				<div className={currentTab === 1 ? 'flex flex-1' : 'hidden'}>
					{raw && (
						<div className="flex flex-1">
							<FuseHighlight component="pre" className="language-javascript w-full">
								{raw.default}
							</FuseHighlight>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
}

export default FuseExample;
