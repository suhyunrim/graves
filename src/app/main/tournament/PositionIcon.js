import React from 'react';
import { POSITION_LABELS } from './tournamentUtils';

// fill="currentColor" 라 부모의 CSS color 속성으로 색을 제어한다.
const POSITION_SHAPES = {
	top: <path d="M3 3 H11 V11 H3 Z" />,
	jungle: (
		<path d="M12 2 L14.5 9 L22 9 L16 13 L18.5 21 L12 16.5 L5.5 21 L8 13 L2 9 L9.5 9 Z" />
	),
	mid: <path d="M12 3 L21 12 L12 21 L3 12 Z" />,
	adc: <path d="M13 13 H21 V21 H13 Z" />,
	support: <path d="M10 3 H14 V10 H21 V14 H14 V21 H10 V14 H3 V10 H10 Z" />
};

function PositionIcon({ position, className, fallbackClassName }) {
	const shape = POSITION_SHAPES[position];
	const label = POSITION_LABELS[position] || position;
	if (!shape) {
		return <span className={fallbackClassName}>{label}</span>;
	}
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			role="img"
			aria-label={label}
		>
			{shape}
		</svg>
	);
}

export default PositionIcon;
