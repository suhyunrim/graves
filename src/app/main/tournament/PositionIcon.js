import React, { useState } from 'react';
import { POSITION_LABELS } from './tournamentUtils';

// OnboardingSettingsDialog.js 와 동일한 검증된 URL. Riot 클라이언트 자산을
// CommunityDragon 이 미러링한 PNG.
const POSITION_CDN_KEY = {
	top: 'top',
	jungle: 'jungle',
	mid: 'middle',
	adc: 'bottom',
	support: 'utility'
};

function getPositionIconUrl(position) {
	const key = POSITION_CDN_KEY[position];
	if (!key) return null;
	return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-${key}.png`;
}

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
