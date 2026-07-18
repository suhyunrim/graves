import React, { useEffect, useState } from 'react';
import { getItemIcon, getSpellIcon, getKeystoneIcon, loadPerkIcons } from '../challenge/ddragonUtils';

// 매치/스탯 표시 공용 헬퍼.
// 티어 표기, 포지션 정렬, KDA 지표 색상, 스펠·룬/아이템 아이콘 렌더를
// MatchList / MatchDetail / InternalMatchList / InternalChampions* 가 공유한다.

// ===== 티어 표시 =====
const tierColors = {
	IRON: '#5C5C5C',
	BRONZE: '#CD7F32',
	SILVER: '#C0C0C0',
	GOLD: '#FFD700',
	PLATINUM: '#00CED1',
	EMERALD: '#50C878',
	DIAMOND: '#B9F2FF',
	MASTER: '#9932CC',
	GRANDMASTER: '#FF4500',
	CHALLENGER: '#F0E68C'
};

export const getTierShortName = tier => {
	if (!tier) return '';
	const parts = tier.split(' ');
	const tierName = parts[0];
	const tierRank = parts[1];

	const tierMap = {
		IRON: 'I',
		BRONZE: 'B',
		SILVER: 'S',
		GOLD: 'G',
		PLATINUM: 'P',
		EMERALD: 'E',
		DIAMOND: 'D',
		MASTER: 'M',
		GRANDMASTER: 'GM',
		CHALLENGER: 'C'
	};

	const rankMap = {
		I: '1',
		II: '2',
		III: '3',
		IV: '4'
	};

	const shortTier = tierMap[tierName] || tierName.charAt(0);
	const shortRank = rankMap[tierRank] || '';

	return `${shortTier}${shortRank}`;
};

export const getTierIconName = tier => {
	if (!tier) return 'UNRANKED';
	return tier.split(' ')[0];
};

export const getTierColor = tier => {
	if (!tier) return '#fff';
	const tierName = tier.split(' ')[0];
	return tierColors[tierName] || '#fff';
};

// ===== 포지션 =====
// Riot 표준 포지션 키(대문자) → PositionIcon용 키(소문자).
// 표시/정렬은 항상 탑 → 정글 → 미드 → 원딜 → 서폿 순서 고정 (RankingHeader/MyInfo 와 동일).
export const POSITIONS = [
	{ key: 'TOP', icon: 'top' },
	{ key: 'JUNGLE', icon: 'jungle' },
	{ key: 'MIDDLE', icon: 'mid' },
	{ key: 'BOTTOM', icon: 'adc' },
	{ key: 'UTILITY', icon: 'support' }
];

export const POSITION_ORDER = POSITIONS.reduce((acc, pos, i) => {
	acc[pos.key] = i;
	return acc;
}, {});

export const POSITION_ICON_KEY = POSITIONS.reduce((acc, pos) => {
	acc[pos.key] = pos.icon;
	return acc;
}, {});

// 매치 데이터의 position이 없으면 수집 스탯의 position으로 폴백
export const getPlayerPosition = player => player.position || (player.stat && player.stat.position) || null;

// 포지션 지정 플레이어를 먼저(탑→서폿 순), 미지정(null/undefined)은 뒤에서 레이팅 내림차순.
export const sortPlayers = players =>
	[...players].sort((a, b) => {
		const ao = POSITION_ORDER[getPlayerPosition(a)];
		const bo = POSITION_ORDER[getPlayerPosition(b)];
		const aHas = ao !== undefined;
		const bHas = bo !== undefined;
		if (aHas && bHas) return ao - bo;
		if (aHas !== bHas) return aHas ? -1 : 1;
		return b.rating - a.rating;
	});

// ===== KDA/스탯 지표 =====
// KDA 배율 색상 (op.gg 관례: 높을수록 강조)
export const kdaRatioColor = ratio => {
	if (ratio == null) return '#ffd700'; // Perfect
	if (ratio >= 4) return '#ffd700';
	if (ratio >= 3) return '#00d4ff';
	if (ratio >= 2) return 'rgba(255, 255, 255, 0.85)';
	return 'rgba(255, 255, 255, 0.5)';
};

export const getKdaRatio = stat =>
	stat.deaths === 0 ? null : Math.round(((stat.kills + stat.assists) / stat.deaths) * 100) / 100;

export const formatK = v => {
	if (v == null) return '-';
	return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);
};

// 팀 킬 합 대비 킬관여율 (%)
export const getKillParticipation = (stat, teamPlayers) => {
	const teamKills = teamPlayers.reduce((sum, p) => sum + (p.stat ? p.stat.kills : 0), 0);
	if (teamKills <= 0) return null;
	return Math.round(((stat.kills + stat.assists) / teamKills) * 100);
};

// 닉네임의 라이엇 태그(#KR1 등) 제거 (hover title로만 노출)
export const stripTag = name => (name || '').split('#')[0];

// ===== 매치 시각 =====
// 표시/정렬 기준 시각. gameCreation(elise 수집으로 확인된 실제 게임 시작)이 있으면 우선하고,
// 없으면 createdAt(디스코드에서 플랜을 만든 시각)으로 폴백한다.
// 수집 이전 판은 gameCreation이 영원히 null이라 한 목록 안에 두 기준이 계속 섞인다
// (폴백 판은 실제 게임보다 보통 10~60분 이르게 표시된다).
export const getMatchTime = match => match.gameCreation || match.createdAt;

// 표시 시각 기준 최신순. 서버 페이지네이션이라 현재 페이지 안에서만 정렬된다
// (페이지 경계를 넘는 순서는 서버 ORDER BY에 달려 있음).
export const sortMatchesByTime = matches =>
	[...matches].sort((a, b) => new Date(getMatchTime(b)).getTime() - new Date(getMatchTime(a)).getTime());

// ===== 스펠/룬/아이템 아이콘 =====
// perk ID → 실제 아이콘 URL 조회 함수를 반환. 로드 전엔 정적 매핑 폴백.
export function usePerkIcons() {
	const [perkIcons, setPerkIcons] = useState({});

	useEffect(() => {
		let alive = true;
		loadPerkIcons().then(map => {
			if (alive) setPerkIcons(map);
		});
		return () => {
			alive = false;
		};
	}, []);

	return perkId => perkIcons[perkId] || getKeystoneIcon(perkId);
}

// 스펠(좌열) + 룬(우열) 2x2 아이콘. 스펠/룬 정보가 아예 없으면 렌더 안 함(구 수집분 호환)
export function SpellRuneGrid({ stat, getPerkIcon, gridClass, iconClass, emptyClass }) {
	if (stat.spell1Id == null && stat.runeKeystoneId == null) return null;
	const cells = [
		stat.spell1Id != null ? getSpellIcon(stat.spell1Id) : null,
		stat.runeKeystoneId != null ? getPerkIcon(stat.runeKeystoneId) : null,
		stat.spell2Id != null ? getSpellIcon(stat.spell2Id) : null,
		stat.runeSubStyleId != null ? getPerkIcon(stat.runeSubStyleId) : null
	];
	return (
		<div className={gridClass}>
			{cells.map((src, i) =>
				src ? (
					// eslint-disable-next-line react/no-array-index-key
					<img key={i} className={iconClass} src={src} alt="" />
				) : (
					// eslint-disable-next-line react/no-array-index-key
					<span key={i} className={emptyClass} />
				)
			)}
		</div>
	);
}

// 아이템 6칸 + 장신구. items 정보 없으면 렌더 안 함(구 수집분 호환)
// 중간에 빈 슬롯(0)이 있으면 채워진 아이템을 앞으로 당기고 빈 칸은 뒤로 몰아 표시.
export function ItemsRow({ stat, rowClass, imgClass, emptyClass, gapClass }) {
	if (!stat.items && stat.trinket == null) return null;
	const slots = (stat.items || []).filter(id => id).slice(0, 6);
	while (slots.length < 6) slots.push(0);
	return (
		<div className={rowClass}>
			{slots.map((id, i) =>
				id ? (
					// eslint-disable-next-line react/no-array-index-key
					<img key={i} className={imgClass} src={getItemIcon(id)} alt="" />
				) : (
					// eslint-disable-next-line react/no-array-index-key
					<span key={i} className={emptyClass} />
				)
			)}
			{stat.trinket ? (
				<img className={`${imgClass} ${gapClass}`} src={getItemIcon(stat.trinket)} alt="" />
			) : (
				<span className={`${emptyClass} ${gapClass}`} />
			)}
		</div>
	);
}
