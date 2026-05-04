import React, { useState } from 'react';
import { POSITION_LABELS, getPositionIconUrl } from './tournamentUtils';

// 포지션(top/jungle/mid/adc/support) 아이콘.
// CommunityDragon CDN 호출 실패 시 한국어 라벨 텍스트로 폴백한다.
function PositionIcon({ position, className, fallbackClassName }) {
	const [errored, setErrored] = useState(false);
	const url = getPositionIconUrl(position);
	const label = POSITION_LABELS[position] || position;

	if (!url || errored) {
		return <span className={fallbackClassName}>{label}</span>;
	}
	return (
		<img
			src={url}
			alt={label}
			className={className}
			onError={() => setErrored(true)}
		/>
	);
}

export default PositionIcon;
