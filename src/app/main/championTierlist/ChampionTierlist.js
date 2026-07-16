import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { getChampionIcon } from 'app/main/challenge/ddragonUtils';
import { fetchChampionTierlist } from './championTierlistApi';

const POSITION_FILTERS = [
	{ key: null, label: '전체' },
	{ key: 'TOP', label: '탑' },
	{ key: 'JUNGLE', label: '정글' },
	{ key: 'MIDDLE', label: '미드' },
	{ key: 'BOTTOM', label: '원딜' },
	{ key: 'UTILITY', label: '서폿' }
];

// score(승률 베이지안 보정 점수) → 티어 등급. 50이 평균 승률 근처.
// tint는 행 배경에 깔아 등급 그룹이 한눈에 구분되게 (뱃지 색만으로는 약함)
const getTier = score => {
	if (score >= 58) return { label: 'S', color: '#ffd700', tint: 'rgba(255, 215, 0, 0.08)' };
	if (score >= 53) return { label: 'A', color: '#00d4ff', tint: 'rgba(0, 212, 255, 0.08)' };
	if (score >= 48) return { label: 'B', color: '#00ff7f', tint: 'rgba(0, 255, 127, 0.07)' };
	if (score >= 43) return { label: 'C', color: 'rgba(255, 255, 255, 0.75)', tint: 'rgba(255, 255, 255, 0.03)' };
	return { label: 'D', color: '#ff6b6b', tint: 'rgba(255, 107, 107, 0.07)' };
};

const useStyles = makeStyles()((theme) => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	},
	headerRoot: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		padding: '24px 28px 20px',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '4rem',
		color: '#fff',
		textTransform: 'uppercase',
		letterSpacing: '0.15em',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
		margin: 0,
		[theme.breakpoints.down('md')]: {
			fontSize: '2.75rem',
			letterSpacing: '0.08em'
		}
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.6)',
		letterSpacing: '0.05em',
		marginTop: 10,
		[theme.breakpoints.down('md')]: {
			fontSize: '1.35rem'
		}
	},
	container: {
		padding: '28px',
		maxWidth: 1100,
		margin: '0 auto',
		width: '100%'
	},
	filterRow: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: 8,
		marginBottom: 12
	},
	filterBtn: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.6)',
		background: 'rgba(255, 255, 255, 0.04)',
		border: '1px solid rgba(255, 255, 255, 0.12)',
		borderRadius: 10,
		padding: '7px 18px',
		cursor: 'pointer',
		transition: 'all 0.2s ease',
		'&:hover': {
			color: '#00d4ff',
			borderColor: 'rgba(0, 212, 255, 0.4)'
		}
	},
	filterBtnActive: {
		color: '#000',
		background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
		borderColor: 'transparent',
		boxShadow: '0 4px 14px rgba(0, 212, 255, 0.25)',
		'&:hover': {
			color: '#000'
		}
	},
	metaCaption: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginBottom: 18
	},
	list: {
		display: 'flex',
		flexDirection: 'column',
		gap: 10
	},
	// background은 등급 틴트 합성 때문에 행마다 inline style로 지정 (여기 선언하면 항상 덮여서 죽은 스타일이 됨)
	row: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		borderRadius: 14,
		padding: '12px 18px',
		[theme.breakpoints.down('sm')]: {
			flexWrap: 'wrap',
			gap: 12,
			padding: '12px 14px'
		}
	},
	rankCol: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		minWidth: 74
	},
	rank: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.5)',
		width: 26,
		textAlign: 'center'
	},
	tierBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 700,
		width: 34,
		height: 34,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
		border: '1.5px solid currentColor'
	},
	champCol: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		flex: '1 1 auto',
		minWidth: 150
	},
	champImg: {
		width: 44,
		height: 44,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '2px solid rgba(0, 212, 255, 0.3)'
	},
	champName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.92)'
	},
	metrics: {
		display: 'flex',
		gap: 22,
		[theme.breakpoints.down('sm')]: {
			gap: 16,
			width: '100%',
			justifyContent: 'space-between'
		}
	},
	metric: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 2,
		minWidth: 48
	},
	metricLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.9rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	metricValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.9)'
	},
	winHigh: {
		color: '#00ff7f'
	},
	winLow: {
		color: 'rgba(255, 255, 255, 0.7)'
	},
	emptyState: {
		textAlign: 'center',
		padding: '80px 20px',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.4)'
	}
}));

function ChampionTierlist() {
	const { classes, cx } = useStyles();
	const user = useSelector(state => state.auth.user);
	const groupId = user && user.reprGroup ? user.reprGroup.groupId : null;

	const [position, setPosition] = useState(null);
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!groupId) return undefined;
		let alive = true;
		setLoading(true);
		fetchChampionTierlist(groupId, position)
			.then(result => {
				if (alive) {
					setData(result);
					setLoading(false);
				}
			})
			.catch(() => {
				if (alive) {
					setData(null);
					setLoading(false);
				}
			});
		return () => {
			alive = false;
		};
	}, [groupId, position]);

	const champions = (data && data.champions) || [];

	return (
		<FusePageSimple
			classes={{ root: classes.layoutRoot }}
			header={
				<div className={classes.headerRoot}>
					<Typography className={classes.title} variant="h4">
						Champion Tier List
					</Typography>
					<Typography className={classes.subtitle}>내전 챔피언 티어리스트</Typography>
				</div>
			}
			content={
				<div className={classes.container}>
					<div className={classes.filterRow}>
						{POSITION_FILTERS.map(f => (
							<button
								key={f.key || 'ALL'}
								type="button"
								className={cx(classes.filterBtn, position === f.key && classes.filterBtnActive)}
								onClick={() => setPosition(f.key)}
							>
								{f.label}
							</button>
						))}
					</div>

					{data && (
						<div className={classes.metaCaption}>
							총 {data.totalGames}판 집계 · 최소 {data.minGames}판 이상 챔피언만 · 점수순 정렬
						</div>
					)}

					{!loading && champions.length === 0 && (
						<div className={classes.emptyState}>
							아직 집계된 챔피언이 없습니다.
							<br />
							내전 상세 데이터가 더 쌓이면 표시됩니다.
						</div>
					)}

					{champions.length > 0 && (
						<div className={classes.list}>
							{champions.map((c, i) => {
								const tier = getTier(c.score);
								return (
									<div
										key={c.championId}
										className={classes.row}
										style={{
											background: `linear-gradient(0deg, ${tier.tint}, ${tier.tint}), linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`,
											borderLeft: `3px solid ${tier.color}`
										}}
									>
										<div className={classes.rankCol}>
											<span className={classes.rank}>{i + 1}</span>
											<span className={classes.tierBadge} style={{ color: tier.color }}>
												{tier.label}
											</span>
										</div>
										<div className={classes.champCol}>
											<img
												className={classes.champImg}
												src={getChampionIcon(c.championName)}
												alt={c.championKoName || c.championName}
												onError={e => {
													e.currentTarget.style.visibility = 'hidden';
												}}
											/>
											<span className={classes.champName}>{c.championKoName || c.championName}</span>
										</div>
										<div className={classes.metrics}>
											<div className={classes.metric}>
												<span className={classes.metricLabel}>픽률</span>
												<span className={classes.metricValue}>{c.pickRate}%</span>
											</div>
											<div className={classes.metric}>
												<span className={classes.metricLabel}>승률</span>
												<span className={cx(classes.metricValue, c.winRate >= 50 ? classes.winHigh : classes.winLow)}>
													{c.winRate}%
												</span>
											</div>
											<div className={classes.metric}>
												<span className={classes.metricLabel}>밴률</span>
												<span className={classes.metricValue}>{c.banRate}%</span>
											</div>
											<div className={classes.metric}>
												<span className={classes.metricLabel}>KDA</span>
												<span className={classes.metricValue}>{typeof c.kda === 'number' ? c.kda.toFixed(2) : '-'}</span>
											</div>
											<div className={classes.metric}>
												<span className={classes.metricLabel}>판수</span>
												<span className={classes.metricValue}>{c.games}</span>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			}
		/>
	);
}

export default ChampionTierlist;
