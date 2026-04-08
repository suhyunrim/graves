import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import AboutContent from './AboutContent';

const useStyles = makeStyles({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0a0a14 0%, #0f0f1a 50%, #1a1a2e 100%)',
		minHeight: '100vh'
	}
});

function About() {
	const classes = useStyles();

	return <FusePageSimple classes={{ root: classes.layoutRoot }} content={<AboutContent />} />;
}

export default About;
