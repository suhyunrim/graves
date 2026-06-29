import React from 'react';
import { keyframes } from '@emotion/react';
import { makeStyles } from 'tss-react/mui';

// 진입(fade-in) 애니메이션 공통 모듈.
// 새 컨텐츠마다 animation/opacity/animationDelay 를 손으로 붙이다 누락되는 문제를 막기 위해,
// 컨테이너를 <RevealGroup> 으로 감싸면 직계 자식이 자동으로 staggered fade-in 된다.
// keyframes 는 여기서 한 번만 정의하고, 각 화면에서 새로 정의하지 말 것.
//
// 주의: emotion keyframes 는 makeStyles(css) 컨텍스트에서 써야 @keyframes 가 실제로 주입된다.
// inline style 의 animation 으로 쓰면 이름만 들어가고 정의가 빠져 동작하지 않으므로,
// 여기서는 animation/opacity 는 클래스로 입히고 가변값(animation-delay, 이동거리)만 inline 으로 준다.
//
// 이동 거리는 CSS 변수(--reveal-distance)로 받는다. distance prop 으로 요소별로 조절(기본 24px).

export const fadeInUp = keyframes`
	0% { opacity: 0; transform: translateY(var(--reveal-distance, 24px)); }
	100% { opacity: 1; transform: translateY(0); }
`;

export const fadeIn = keyframes`
	0% { opacity: 0; }
	100% { opacity: 1; }
`;

const useStyles = makeStyles()(() => ({
	reveal: {
		animation: `${fadeInUp} 0.5s ease forwards`,
		opacity: 0
	}
}));

function withReveal(classes, cx, child, delaySec, distance) {
	const extra = {};
	if (distance != null) extra['--reveal-distance'] = `${distance}px`;
	return React.cloneElement(child, {
		className: cx(classes.reveal, child.props.className),
		style: { animationDelay: `${delaySec}s`, ...extra, ...child.props.style }
	});
}

// 단일 요소를 진입 fade-in. 자식 요소에 클래스/딜레이를 주입한다(추가 래퍼 없음 → 레이아웃 유지).
//   <Reveal delay={0.05} distance={8}><div className={classes.title}>...</div></Reveal>
export function Reveal({ children, delay = 0, distance }) {
	const { classes, cx } = useStyles();
	if (!React.isValidElement(children)) return children;
	return withReveal(classes, cx, children, delay, distance);
}

// 컨테이너. 직계 자식들을 순서대로 staggered fade-in 시킨다.
// 기존 컨테이너 div 를 그대로 대체하면 된다(className/style 전달, 레이아웃 동일):
//   <RevealGroup className={classes.cardsGrid} distance={30}>
//     <div className={classes.card}>...</div>   // 새 카드를 추가해도 자동으로 애니 적용됨
//   </RevealGroup>
export function RevealGroup({ children, step = 0.06, distance, component: Comp = 'div', className, style, ...rest }) {
	const { classes, cx } = useStyles();
	const items = React.Children.toArray(children).filter(React.isValidElement);
	return (
		<Comp className={className} style={style} {...rest}>
			{items.map((child, i) => withReveal(classes, cx, child, i * step, distance))}
		</Comp>
	);
}
