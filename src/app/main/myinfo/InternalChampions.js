import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { getChampionIcon } from 'app/main/challenge/ddragonUtils';
import { kdaRatioColor, POSITION_ICON_KEY } from '../components/matchStatUtils';
import PositionIcon from '../tournament/PositionIcon';
import InternalChampionsDialog from './InternalChampionsDialog';
import { getChampBadges, getMetricColor } from './championBadges';

// 주 포지션 대표 지표 1개 (탑=맞라인 골드차 / 정글=오브젝트 장악 / 미드=킬관여 / 원딜=DPM / 서폿=분당시야).
// 모든 수치는 그 챔피언으로 플레이한 판들 기준 집계. 지정 지표가 null이거나 mainPosition이 없으면 DPM 폴백.
// 주의: goldDiff는 라인전 페이즈가 아니라 게임 전체 최종 골드 기준 맞라인 격차 (LCU에 시점 데이터 없음).
const getPositionStat = c => {
	const pct = v => `${v}%`;
	switch (c.mainPosition) {
		case 'TOP':
			if (c.laneGoldDiffAvg != null) {
				return {
					label: '맞라인 골드',
					value: `${c.laneGoldDiffAvg > 0 ? '+' : ''}${c.laneGoldDiffAvg}G`,
					color: c.laneGoldDiffAvg > 0 ? '#00ff7f' : c.laneGoldDiffAvg < 0 ? '#ff6b6b' : undefined,
					title: '게임 전체 최종 골드 기준, 맞라인 상대와의 차이 평균'
				};
			}
			break;
		case 'JUNGLE':
			if (c.objectiveShare != null) {
				return {
					label: '오브젝트 장악',
					value: pct(c.objectiveShare),
					color: getMetricColor('objectiveShare', c.objectiveShare),
					title: '내 게임에서 우리 팀이 가져간 에픽 몬스터(용·전령·유충·바론) 비율'
				};
			}
			break;
		case 'MIDDLE':
			if (c.killParticipation != null) {
				return {
					label: '킬관여',
					value: pct(c.killParticipation),
					color: getMetricColor('killParticipation', c.killParticipation),
					title: '팀 킬 중 킬/어시스트로 관여한 비율'
				};
			}
			break;
		case 'BOTTOM':
			if (c.dpm != null) {
				return { label: 'DPM', value: String(c.dpm), color: getMetricColor('dpm', c.dpm), title: '분당 챔피언 딜량' };
			}
			break;
		case 'UTILITY':
			if (c.visionPerMin != null) {
				return {
					label: '분당시야',
					value: String(c.visionPerMin),
					color: getMetricColor('visionPerMin', c.visionPerMin),
					title: '분당 시야 점수'
				};
			}
			break;
		default:
			break;
	}
	if (c.dpm != null) {
		return { label: 'DPM', value: String(c.dpm), color: getMetricColor('dpm', c.dpm), title: '분당 챔피언 딜량' };
	}
	return null;
};

const useStyles = makeStyles()((theme) => ({
	root: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		borderRadius: 16,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		padding: '16px 20px',
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		[theme.breakpoints.down('sm')]: {
			padding: '14px 16px',
			borderRadius: 14
		}
	},
	header: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.04em',
		textTransform: 'uppercase',
		display: 'flex',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 12,
		marginBottom: 10,
		'&::before': {
			content: '""',
			display: 'inline-block',
			width: 4,
			height: 20,
			borderRadius: 2,
			background: 'linear-gradient(180deg, #00d4ff, #0066ff)'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.4rem'
		}
	},
	showAllBtn: {
		marginLeft: 'auto',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.55)',
		background: 'rgba(255, 255, 255, 0.04)',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		borderRadius: 8,
		padding: '4px 14px',
		cursor: 'pointer',
		textTransform: 'none',
		letterSpacing: 'normal',
		transition: 'all 0.2s ease',
		'&:hover': {
			color: '#00d4ff',
			borderColor: 'rgba(0, 212, 255, 0.4)',
			background: 'rgba(0, 212, 255, 0.08)'
		}
	},
	list: {
		display: 'flex',
		flexDirection: 'column',
		flex: 1
	},
	row: {
		display: 'flex',
		alignItems: 'center',
		gap: 14,
		padding: '8px 4px',
		flex: 1,
		borderTop: '1px solid rgba(255, 255, 255, 0.05)',
		'&:first-of-type': {
			borderTop: 'none'
		},
		[theme.breakpoints.down('sm')]: {
			gap: 10
		}
	},
	champImg: {
		width: 42,
		height: 42,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '2px solid rgba(0, 212, 255, 0.3)',
		flexShrink: 0,
		[theme.breakpoints.down('sm')]: {
			width: 36,
			height: 36
		}
	},
	posSlot: {
		width: 18,
		height: 18,
		flexShrink: 0,
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	posIcon: {
		width: 18,
		height: 18,
		objectFit: 'contain'
	},
	posFallback: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.9rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.55)'
	},
	// 포지션 대표 지표 전용 컬럼 (가운데 공백 활용, KDA 컬럼과 동급 크기)
	posStatCol: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 1,
		minWidth: 110,
		flexShrink: 0,
		[theme.breakpoints.down('sm')]: {
			display: 'none'
		}
	},
	posStatBig: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.85)',
		whiteSpace: 'nowrap'
	},
	nameCol: {
		display: 'flex',
		flexDirection: 'column',
		gap: 1,
		flex: '1 1 auto',
		minWidth: 0
	},
	nameLine: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		minWidth: 0
	},
	champName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.92)',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	badge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.85rem',
		fontWeight: 700,
		padding: '1px 6px',
		borderRadius: 6,
		border: '1px solid currentColor',
		flexShrink: 0
	},
	subLine: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.02rem',
		color: 'rgba(255, 255, 255, 0.45)',
		whiteSpace: 'nowrap'
	},
	kdaCol: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 1,
		minWidth: 96,
		flexShrink: 0,
		[theme.breakpoints.down('sm')]: {
			minWidth: 78
		}
	},
	kdaRatio: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 700,
		whiteSpace: 'nowrap',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.1rem'
		}
	},
	wrCol: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-end',
		gap: 1,
		minWidth: 62,
		flexShrink: 0,
		[theme.breakpoints.down('sm')]: {
			minWidth: 48
		}
	},
	winRate: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700
	}
}));

// 내전 상세(헬퍼 수집) 기반 모스트 챔피언 — op.gg 스타일 가로 행 리스트.
// 좌측 내전 티어 카드와 나란히 배치되므로 height 100%로 채운다.
function InternalChampions({ champions, totalGames }) {
	const { classes } = useStyles();
	const [dialogOpen, setDialogOpen] = useState(false);
	const all = champions || [];
	const list = all.slice(0, 5);

	if (list.length === 0) {
		return null;
	}

	return (
		<div className={classes.root}>
			<div className={classes.header}>
				내전 모스트 챔피언
				<button type="button" className={classes.showAllBtn} onClick={() => setDialogOpen(true)}>
					전체 보기 ({all.length})
				</button>
			</div>
			<div className={classes.list}>
				{list.map(c => {
					const wr = typeof c.winRate === 'number' ? c.winRate : 0;
					const wrColor = wr >= 50 ? '#00ff7f' : 'rgba(255, 255, 255, 0.6)';
					const name = c.championKoName || c.championName;
					const badges = getChampBadges(c, totalGames);
					const posKey = POSITION_ICON_KEY[c.mainPosition];
					const posStat = getPositionStat(c);
					return (
						<div key={c.championId} className={classes.row}>
							<span className={classes.posSlot}>
								{posKey && (
									<PositionIcon position={posKey} className={classes.posIcon} fallbackClassName={classes.posFallback} />
								)}
							</span>
							<img
								className={classes.champImg}
								src={getChampionIcon(c.championName)}
								alt={name}
								onError={e => {
									e.currentTarget.style.visibility = 'hidden';
								}}
							/>
							<div className={classes.nameCol}>
								<div className={classes.nameLine}>
									<span className={classes.champName} title={name}>
										{name}
									</span>
									{badges.map(b => (
										<span key={b.key} className={classes.badge} style={{ color: b.color }}>
											{b.label}
										</span>
									))}
								</div>
								<span className={classes.subLine}>{c.csPerMin != null ? `CS/분 ${c.csPerMin}` : ''}</span>
							</div>
							<div className={classes.posStatCol}>
								{posStat && (
									<>
										<span
											className={classes.posStatBig}
											style={posStat.color ? { color: posStat.color } : undefined}
											title={posStat.title}
										>
											{posStat.value}
										</span>
										<span className={classes.subLine} title={posStat.title}>
											{posStat.label}
										</span>
									</>
								)}
							</div>
							<div className={classes.kdaCol}>
								<span
									className={classes.kdaRatio}
									style={{ color: typeof c.kda === 'number' ? kdaRatioColor(c.kda) : 'rgba(255, 255, 255, 0.5)' }}
								>
									{typeof c.kda === 'number' ? `${c.kda.toFixed(2)}:1 평점` : '-'}
								</span>
								<span className={classes.subLine}>
									{c.kills} / {c.deaths} / {c.assists}
								</span>
							</div>
							<div className={classes.wrCol}>
								<span className={classes.winRate} style={{ color: wrColor }}>
									{wr}%
								</span>
								<span className={classes.subLine}>
									{c.wins}승 {c.games - c.wins}패
								</span>
							</div>
						</div>
					);
				})}
			</div>
			<InternalChampionsDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				champions={all}
				totalGames={totalGames}
			/>
		</div>
	);
}

export default InternalChampions;
