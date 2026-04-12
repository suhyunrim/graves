import React from 'react';

/**
 * React Suspense defaults
 * For to Avoid Repetition
 */ function FuseSuspense(props) {
	return <React.Suspense fallback={<div />}>{props.children}</React.Suspense>;
}

export default FuseSuspense;
