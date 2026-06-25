import React from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from 'tss-react/mui';
import AiAssistantHeader from './AiAssistantHeader';
import AiChat from './AiChat';

const useStyles = makeStyles()(() => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	}
}));

function AiAssistant() {
	const { classes } = useStyles();

	return (
		<FusePageSimple
			classes={{ root: classes.layoutRoot }}
			header={<AiAssistantHeader />}
			content={<AiChat />}
		/>
	);
}

export default AiAssistant;
