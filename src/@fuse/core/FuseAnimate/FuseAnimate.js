import React, { useEffect, useRef } from 'react';

const FuseAnimate = React.forwardRef(({
	animation = 'transition.fadeIn',
	runOnMount = true,
	duration = 300,
	delay = 50,
	children,
	...rest
}, ref) => {
	const innerRef = useRef(null);
	const resolvedRef = ref || innerRef;

	useEffect(() => {
		if (!runOnMount) return;
		const el = resolvedRef.current;
		if (!el) return;

		el.style.opacity = '0';
		el.style.transition = `opacity ${duration}ms ease ${delay}ms`;

		requestAnimationFrame(() => {
			el.style.opacity = '1';
		});
	}, [runOnMount, duration, delay, resolvedRef]);

	return React.cloneElement(React.Children.only(children), { ref: resolvedRef, ...rest });
});

export default React.memo(FuseAnimate);
