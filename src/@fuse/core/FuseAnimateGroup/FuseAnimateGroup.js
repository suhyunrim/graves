import React from 'react';
import { VelocityTransitionGroup } from 'velocity-react';
import 'velocity-animate/velocity.ui';

const enterAnimationDefaults = {
	animation: 'transition.fadeIn',
	stagger: 50,
	duration: 200,
	display: null,
	visibility: 'visible',
	delay: 0
};

const leaveAnimationDefaults = {
	stagger: 50,
	duration: 200,
	display: null,
	visibility: 'visible',
	delay: 0
};

function FuseAnimateGroup({
	enter = enterAnimationDefaults,
	leave = leaveAnimationDefaults,
	easing = [0.4, 0.0, 0.2, 1],
	runOnMount = true,
	enterHideStyle = { visibility: 'visible' },
	enterShowStyle = { visibility: 'hidden' },
	...rest
}) {
	return (
		<VelocityTransitionGroup
			easing={easing}
			runOnMount={runOnMount}
			enterHideStyle={enterHideStyle}
			enterShowStyle={enterShowStyle}
			{...rest}
			enter={{ ...enterAnimationDefaults, ...enter }}
			leave={{ ...leaveAnimationDefaults, ...leave }}
		/>
	);
}

export default React.memo(FuseAnimateGroup);
