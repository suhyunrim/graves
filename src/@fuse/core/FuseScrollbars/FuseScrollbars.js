import { makeStyles } from 'tss-react/mui';
import clsx from 'clsx';
import MobileDetect from 'mobile-detect';
import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import React, { createRef, useCallback, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import withRouterAndRef from '../withRouterAndRef/withRouterAndRef';

const md = new MobileDetect(window.navigator.userAgent);
const isMobile = md.mobile();

const handlerNameByEvent = {
	'ps-scroll-y': 'onScrollY',
	'ps-scroll-x': 'onScrollX',
	'ps-scroll-up': 'onScrollUp',
	'ps-scroll-down': 'onScrollDown',
	'ps-scroll-left': 'onScrollLeft',
	'ps-scroll-right': 'onScrollRight',
	'ps-y-reach-start': 'onYReachStart',
	'ps-y-reach-end': 'onYReachEnd',
	'ps-x-reach-start': 'onXReachStart',
	'ps-x-reach-end': 'onXReachEnd'
};
Object.freeze(handlerNameByEvent);

const useStyles = makeStyles()((theme) => ({
	root: {}
}));

const FuseScrollbars = React.forwardRef(({
	className: classNameProp = '',
	enable = true,
	scrollToTopOnChildChange = false,
	scrollToTopOnRouteChange = false,
	option = { wheelPropagation: true },
	customScrollbars,
	children,
	id,
	history,
	...restProps
}, forwardedRef) => {
	const ref = forwardedRef || createRef();
	const ps = useRef(null);
	const handlerByEvent = useRef(new Map());
	const { classes } = useStyles();

	const hookUpEvents = useCallback(() => {
		Object.keys(handlerNameByEvent).forEach(key => {
			const callback = restProps[handlerNameByEvent[key]];
			if (callback) {
				const handler = () => callback(ref.current);
				handlerByEvent.current.set(key, handler);
				ref.current.addEventListener(key, handler, false);
			}
		});
		// eslint-disable-next-line
    }, [ref]);

	const unHookUpEvents = useCallback(() => {
		handlerByEvent.current.forEach((value, key) => {
			if (ref.current) {
				ref.current.removeEventListener(key, value, false);
			}
		});
		handlerByEvent.current.clear();
	}, [ref]);

	const destroyPs = useCallback(() => {
		// console.info("destroy::ps");

		unHookUpEvents();

		if (!ps.current) {
			return;
		}
		ps.current.destroy();
		ps.current = null;
	}, [unHookUpEvents]);

	const createPs = useCallback(() => {
		// console.info("create::ps");

		if (isMobile || !ref || ps.current) {
			return;
		}

		ps.current = new PerfectScrollbar(ref.current, option);

		hookUpEvents();
	}, [hookUpEvents, option, ref]);

	useEffect(() => {
		function updatePs() {
			if (!ps.current) {
				return;
			}
			ps.current.update();
		}

		updatePs();
	});

	useEffect(() => {
		if (customScrollbars && enable !== false) {
			createPs();
		} else {
			destroyPs();
		}
	}, [createPs, customScrollbars, destroyPs, enable]);

	const scrollToTop = useCallback(() => {
		if (ref && ref.current) {
			ref.current.scrollTop = 0;
		}
	}, [ref]);

	useEffect(() => {
		if (scrollToTopOnChildChange) {
			scrollToTop();
		}
	}, [scrollToTop, children, scrollToTopOnChildChange]);

	useEffect(
		() =>
			history.listen(() => {
				if (scrollToTopOnRouteChange) {
					scrollToTop();
				}
			}),
		[scrollToTop, history, scrollToTopOnRouteChange]
	);

	useEffect(
		() => () => {
			destroyPs();
		},
		[destroyPs]
	);

	// console.info('render::ps');
	return (
		<div
			id={id}
			className={clsx(classes.root, classNameProp)}
			style={
				customScrollbars && enable !== false && !isMobile
					? {
							position: 'relative',
							overflow: 'hidden'
					  }
					: enable === false
					? { overflow: 'visible' }
					: {}
			}
			ref={ref}
		>
			{children}
		</div>
	);
});

function mapStateToProps({ fuse }) {
	return {
		customScrollbars: fuse.settings.current.customScrollbars
	};
}

export default connect(mapStateToProps, null, null, { forwardRef: true })(withRouterAndRef(FuseScrollbars));
