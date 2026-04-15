import React from 'react';
import { VelocityComponent } from 'velocity-react';
import 'velocity-animate/velocity.ui';

const FuseAnimate = React.forwardRef(({
	animation = 'transition.fadeIn',
	runOnMount = true,
	targetQuerySelector = null,
	interruptBehavior = 'stop',
	visibility = 'visible',
	duration = 300,
	delay = 50,
	easing = [0.4, 0.0, 0.2, 1],
	display = null,
	children,
	...rest
}, ref) => {
	const clonedChildren = React.cloneElement(children, {
		style: {
			...children.style,
			visibility: 'hidden'
		}
	});
	return (
		<VelocityComponent
			ref={ref}
			animation={animation}
			runOnMount={runOnMount}
			targetQuerySelector={targetQuerySelector}
			interruptBehavior={interruptBehavior}
			visibility={visibility}
			duration={duration}
			delay={delay}
			easing={easing}
			display={display}
			{...rest}
		>
			{clonedChildren}
		</VelocityComponent>
	);
});

export default React.memo(FuseAnimate);
