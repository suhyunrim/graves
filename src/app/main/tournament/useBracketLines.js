import { useLayoutEffect, useRef, useState } from 'react';

// 매치/슬롯 박스의 위치를 측정해 SVG connector 라인 좌표를 만들어주는 훅.
// buildLines(containerEl, itemRefsObj) 가 [{x1,y1,x2,y2,finished,key}, ...] 를 돌려준다.
// container 사이즈가 바뀌면 ResizeObserver 로 다시 계산한다.
export default function useBracketLines(buildLines, deps) {
	const containerRef = useRef(null);
	const itemRefs = useRef({});
	const [lines, setLines] = useState([]);

	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!el) return undefined;

		function update() {
			setLines(buildLines(el, itemRefs.current) || []);
		}
		update();

		const ro = new ResizeObserver(update);
		ro.observe(el);
		// 라운드 박스 자체 크기 변화도 감지
		Object.values(itemRefs.current).forEach(node => {
			if (node) ro.observe(node);
		});
		return () => ro.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	return { containerRef, itemRefs, lines };
}

export function buildLinePath(x1, y1, x2, y2) {
	const mid = (x1 + x2) / 2;
	return `M ${x1} ${y1} H ${mid} V ${y2} H ${mid} L ${x2} ${y2}`;
}
