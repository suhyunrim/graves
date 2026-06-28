import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from 'tss-react/mui';
import { Typography, Tooltip, IconButton } from '@mui/material';
import { BalanceReportSkeleton } from '../components/SkeletonLoaders';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import ChartCanvas from '../components/ChartCanvas';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	LineController,
	BarController,
	DoughnutController,
	Title,
	Tooltip as ChartTooltip,
	Filler,
	Legend
} from 'chart.js';
import { DatePicker } from '@mui/x-date-pickers';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	LineController,
	BarController,
	DoughnutController,
	Title,
	ChartTooltip,
	Filler,
	Legend
);
import { subMonths, format as formatDate, parse as parseDate } from 'date-fns';
import reducer from './store/reducers';
import * as Actions from './store/actions';
import { patchSearchParams } from 'app/utility/searchParamUtils';

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
		maxWidth: 1400,
		margin: '0 auto',
		width: '100%'
	},
	dateRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		marginBottom: 28,
		flexWrap: 'wrap',
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.3rem',
			background: 'rgba(255,255,255,0.06)',
			borderRadius: 12,
			padding: '2px 12px'
		},
		'& .MuiIconButton-root': {
			color: 'rgba(255,255,255,0.5)'
		},
		'& .MuiInput-underline:before': {
			borderBottom: '1px solid rgba(255,255,255,0.15)'
		},
		'& .MuiInput-underline:hover:not(.Mui-disabled):before': {
			borderBottom: '1px solid rgba(0,212,255,0.4)'
		},
		'& .MuiInput-underline:after': {
			borderBottom: '2px solid #00d4ff'
		}
	},
	dateSep: {
		color: 'rgba(255,255,255,0.4)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem'
	},
	summaryGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(5, 1fr)',
		gap: 16,
		marginBottom: 24,
		[theme.breakpoints.down('lg')]: {
			gridTemplateColumns: 'repeat(3, 1fr)'
		},
		[theme.breakpoints.down('md')]: {
			gridTemplateColumns: 'repeat(2, 1fr)'
		},
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr'
		}
	},
	summaryCard: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 16,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		padding: '20px 24px',
		textAlign: 'center'
	},
	summaryLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255,255,255,0.5)',
		marginBottom: 8,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 4
	},
	summaryValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '3rem',
		fontWeight: 700,
		color: '#00d4ff'
	},
	summaryUnit: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255,255,255,0.4)',
		marginLeft: 4
	},
	summarySub: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255,255,255,0.35)',
		marginTop: 4
	},
	grid2: {
		display: 'grid',
		gridTemplateColumns: 'repeat(2, 1fr)',
		gap: 20,
		marginBottom: 20,
		[theme.breakpoints.down('md')]: {
			gridTemplateColumns: '1fr'
		}
	},
	grid3: {
		display: 'grid',
		gridTemplateColumns: 'repeat(3, 1fr)',
		gap: 20,
		marginBottom: 20,
		[theme.breakpoints.down('md')]: {
			gridTemplateColumns: '1fr'
		}
	},
	card: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		padding: 24,
		[theme.breakpoints.down('sm')]: {
			padding: 16,
			borderRadius: 16
		}
	},
	cardFull: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		padding: 24,
		marginBottom: 20,
		[theme.breakpoints.down('sm')]: {
			padding: 16,
			borderRadius: 16
		}
	},
	cardTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff',
		marginBottom: 20,
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		'&::before': {
			content: '""',
			width: 4,
			height: 24,
			background: 'linear-gradient(180deg, #00d4ff, #0066ff)',
			borderRadius: 2
		}
	},
	chartContainer: {
		height: 280,
		position: 'relative',
		[theme.breakpoints.down('sm')]: {
			height: 220
		}
	},
	table: {
		width: '100%',
		borderCollapse: 'separate',
		borderSpacing: '0 4px'
	},
	th: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		color: 'rgba(255,255,255,0.5)',
		padding: '6px 10px',
		textAlign: 'left',
		borderBottom: '1px solid rgba(255,255,255,0.08)'
	},
	td: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: '#fff',
		padding: '8px 10px'
	},
	barInline: {
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	barBg: {
		flex: 1,
		height: 6,
		background: 'rgba(255,255,255,0.08)',
		borderRadius: 3,
		overflow: 'hidden'
	},
	barFill: {
		height: '100%',
		borderRadius: 3,
		transition: 'width 0.6s ease'
	},
	barLabel: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		minWidth: 44,
		textAlign: 'right'
	},
	infoIcon: {
		color: 'rgba(255,255,255,0.3)',
		fontSize: '1.4rem',
		padding: 2
	},
	tooltip: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		lineHeight: 1.5,
		padding: '8px 12px',
		maxWidth: 280,
		background: 'rgba(15, 15, 26, 0.95)',
		border: '1px solid rgba(0, 212, 255, 0.3)'
	},
	loadingWrapper: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 80
	},
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '80px 20px',
		textAlign: 'center'
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		color: 'rgba(255, 255, 255, 0.4)'
	}
}));

const COLORS = {
	cyan: '#00d4ff',
	blue: '#0066ff',
	green: '#51cf66',
	yellow: '#ffd43b',
	red: '#ff6b6b',
	purple: '#9775fa',
	orange: '#ff922b',
	gray: '#868e96'
};

const POSITION_LABELS = {
	TOP: '탑',
	JUNGLE: '정글',
	MID: '미드',
	MIDDLE: '미드',
	ADC: '원딜',
	BOTTOM: '원딜',
	SUPPORT: '서포터',
	UTILITY: '서포터'
};

const chartTooltipBase = {
	backgroundColor: 'rgba(15, 15, 26, 0.95)',
	titleColor: '#fff',
	titleFont: { size: 14, family: '"Noto Sans KR", sans-serif' },
	bodyColor: '#00d4ff',
	bodyFont: { size: 14, family: '"Rajdhani", sans-serif' },
	borderColor: 'rgba(0, 212, 255, 0.3)',
	borderWidth: 1,
	cornerRadius: 8,
	displayColors: false,
	padding: 10
};

const gridStyle = {
	color: 'rgba(255, 255, 255, 0.05)'
};

const tickStyle = {
	color: 'rgba(255, 255, 255, 0.6)',
	font: { size: 12, family: '"Noto Sans KR", sans-serif' }
};

function getWinRateColor(rate) {
	if (rate >= 55) return COLORS.red;
	if (rate >= 52) return COLORS.orange;
	if (rate >= 48) return COLORS.green;
	return COLORS.cyan;
}

// Chart.js v4 plugin: 50% 기준선
const baselinePlugin = {
	id: 'baselinePlug',
	afterDraw(chart) {
		const yAxis = chart.scales.y;
		if (!yAxis) return;
		const yPixel = yAxis.getPixelForValue(50);
		if (yPixel == null) return;
		const { ctx } = chart;
		ctx.save();
		ctx.beginPath();
		ctx.setLineDash([6, 4]);
		ctx.moveTo(chart.chartArea.left, yPixel);
		ctx.lineTo(chart.chartArea.right, yPixel);
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
		ctx.lineWidth = 1.5;
		ctx.stroke();
		ctx.restore();

		ctx.save();
		ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
		ctx.font = '11px "Noto Sans KR", sans-serif';
		ctx.textAlign = 'right';
		ctx.fillText('50%', chart.chartArea.right - 4, yPixel - 6);
		ctx.restore();
	}
};

function InfoTip({ title, classes }) {
	return (
		<Tooltip title={title} classes={{ tooltip: classes.tooltip }} placement="top" arrow>
			<IconButton className={classes.infoIcon} size="small">
				<InfoOutlinedIcon style={{ fontSize: 'inherit' }} />
			</IconButton>
		</Tooltip>
	);
}

function BalanceReport() {
	const { classes } = useStyles();
	const dispatch = useDispatch();
	const report = useSelector(({ BalanceReport: br }) => br.balanceReport.report);
	const loading = useSelector(({ BalanceReport: br }) => br.balanceReport.loading);
	const user = useSelector(state => state.auth.user);
	const groupId = user && user.reprGroup ? user.reprGroup.groupId : null;

	const [searchParams, setSearchParams] = useSearchParams();
	const didLoadRef = useRef(false);
	const parseDateParam = (key, fallback) => {
		const raw = searchParams.get(key);
		const d = raw ? parseDate(raw, 'yyyy-MM-dd', new Date()) : null;
		return d && !Number.isNaN(d.getTime()) ? d : fallback;
	};
	const [startDate, setStartDate] = useState(() => parseDateParam('start', subMonths(new Date(), 3)));
	const [endDate, setEndDate] = useState(() => parseDateParam('end', new Date()));

	const fetchReport = useCallback(() => {
		if (groupId) {
			dispatch(Actions.getBalanceReport(groupId, formatDate(startDate, 'yyyy-MM-dd'), formatDate(endDate, 'yyyy-MM-dd')));
		}
	}, [dispatch, groupId, startDate, endDate]);

	useEffect(() => {
		fetchReport();
	}, [fetchReport]);

	useEffect(() => {
		// 첫 마운트 땐 기본값을 URL에 박지 않는다(다른 화면과 일관). 날짜 변경 시에만 동기화.
		if (!didLoadRef.current) {
			didLoadRef.current = true;
			return;
		}
		patchSearchParams(setSearchParams, {
			start: formatDate(startDate, 'yyyy-MM-dd'),
			end: formatDate(endDate, 'yyyy-MM-dd')
		});
	}, [startDate, endDate]);

	function getBalanceColor(label) {
		if (label === '좋음') return COLORS.green;
		if (label === '보통') return COLORS.yellow;
		if (label === '나쁨') return COLORS.orange;
		if (label === '매우 나쁨') return COLORS.red;
		return COLORS.gray;
	}

	function renderSummary() {
		if (!report) return null;
		const { summary, setAnalysis, positionAnalysis } = report;
		const twoZeroRate = setAnalysis ? setAnalysis.twoZero.rate : 0;
		const twoOneRate = setAnalysis ? setAnalysis.twoOne.rate : 0;
		const balanceLabel = positionAnalysis ? positionAnalysis.avgPositionBalance : '-';

		return (
			<div className={classes.summaryGrid}>
				<div className={classes.summaryCard}>
					<div className={classes.summaryLabel}>
						총 경기 수
						<InfoTip title="경기: 같은 10명이 24시간 이내에 한 2~3판 묶음 (3판 2선)" classes={classes} />
					</div>
					<div>
						<span className={classes.summaryValue}>{setAnalysis ? setAnalysis.totalSets : 0}</span>
						<span className={classes.summaryUnit}>경기</span>
					</div>
				</div>
				<div className={classes.summaryCard}>
					<div className={classes.summaryLabel}>
						2:0 비율
						<InfoTip title="2:0으로 끝난 경기 비율. 낮을수록 접전이 많다는 의미" classes={classes} />
					</div>
					<div>
						<span className={classes.summaryValue} style={{ color: twoZeroRate > 60 ? COLORS.red : COLORS.green }}>
							{twoZeroRate.toFixed(1)}
						</span>
						<span className={classes.summaryUnit}>%</span>
					</div>
				</div>
				<div className={classes.summaryCard}>
					<div className={classes.summaryLabel}>2:1 비율</div>
					<div>
						<span className={classes.summaryValue} style={{ color: COLORS.cyan }}>
							{twoOneRate.toFixed(1)}
						</span>
						<span className={classes.summaryUnit}>%</span>
					</div>
				</div>
				<div className={classes.summaryCard}>
					<div className={classes.summaryLabel}>
						높은 팀 승률
						<InfoTip
							title="매칭 시점 팀 내전 티어 합이 높은 팀의 승률. 50%에 가까울수록 균형 잡힌 매칭"
							classes={classes}
						/>
					</div>
					<div>
						<span className={classes.summaryValue} style={{ color: getWinRateColor(summary.favoredTeamWinRate) }}>
							{summary.favoredTeamWinRate.toFixed(1)}
						</span>
						<span className={classes.summaryUnit}>%</span>
					</div>
					<div className={classes.summarySub}>
						예상 {summary.expectedWinRate ? summary.expectedWinRate.toFixed(1) : '-'}%
					</div>
				</div>
				<div className={classes.summaryCard}>
					<div className={classes.summaryLabel}>
						포지션 균형
						<InfoTip
							title="양팀의 메인 포지션 적합도 점수 차이 기반. 5개 포지션별 팀원의 메인 포지션 숙련도 합산 (최대 500)"
							classes={classes}
						/>
					</div>
					<div>
						<span className={classes.summaryValue} style={{ color: getBalanceColor(balanceLabel), fontSize: '2.4rem' }}>
							{balanceLabel}
						</span>
					</div>
				</div>
			</div>
		);
	}

	function renderRatingBrackets() {
		if (!report || !report.ratingBrackets) return null;
		const { ratingBrackets } = report;

		const data = {
			labels: ratingBrackets.map(b => b.label),
			datasets: [
				{
					type: 'bar',
					label: '실제 승률',
					data: ratingBrackets.map(b => b.favoredWinRate),
					backgroundColor: ratingBrackets.map(b => `${getWinRateColor(b.favoredWinRate)}60`),
					borderColor: ratingBrackets.map(b => getWinRateColor(b.favoredWinRate)),
					borderWidth: 1.5
				},
				{
					type: 'line',
					label: '예상 승률',
					data: ratingBrackets.map(b => b.expectedWinRate || 0),
					fill: false,
					borderColor: 'rgba(255, 255, 255, 0.5)',
					borderDash: [6, 4],
					borderWidth: 2,
					pointRadius: 6,
					pointBackgroundColor: '#fff',
					pointBorderColor: 'rgba(255, 255, 255, 0.8)',
					pointBorderWidth: 2
				}
			]
		};

		const options = {
			responsive: true,
			maintainAspectRatio: false,
			animation: false,
			plugins: {
				legend: {
					labels: {
						color: 'rgba(255,255,255,0.6)',
						font: { size: 11, family: '"Noto Sans KR", sans-serif' },
						padding: 16
					}
				},
				tooltip: {
					...chartTooltipBase,
					mode: 'index',
					intersect: false,
					displayColors: true,
					callbacks: {
						label: item => {
							const b = ratingBrackets[item.dataIndex];
							if (item.datasetIndex === 0) return `실제 ${b.favoredWinRate.toFixed(1)}% (${b.count}판)`;
							return `예상 ${(b.expectedWinRate || 0).toFixed(1)}%`;
						}
					}
				}
			},
			scales: {
				x: { grid: gridStyle, ticks: tickStyle },
				y: {
					grid: gridStyle,
					min: 0,
					max: 100,
					ticks: { ...tickStyle, stepSize: 25, callback: v => `${v}%` }
				}
			}
		};

		return (
			<div className={classes.card}>
				<div className={classes.cardTitle}>
					티어 차이별 높은 팀 승률
					<InfoTip
						title="실제 승률이 예상보다 높으면 티어 외 요소(포지션 등)가 영향을 주고 있다는 의미"
						classes={classes}
					/>
				</div>
				<div className={classes.chartContainer}>
					<ChartCanvas type="bar" data={data} options={options} plugins={[baselinePlugin]} />
				</div>
			</div>
		);
	}

	function renderPositionScoreImpact() {
		if (!report || !report.setAnalysis || !report.setAnalysis.positionScoreImpact) return null;
		const { positionScoreImpact } = report.setAnalysis;

		const data = {
			labels: positionScoreImpact.map(p => p.label),
			datasets: [
				{
					label: '2:0 비율',
					data: positionScoreImpact.map(p => p.twoZeroRate),
					backgroundColor: positionScoreImpact.map(p => {
						if (p.twoZeroRate >= 65) return `${COLORS.red}60`;
						if (p.twoZeroRate >= 55) return `${COLORS.orange}60`;
						return `${COLORS.green}60`;
					}),
					borderColor: positionScoreImpact.map(p => {
						if (p.twoZeroRate >= 65) return COLORS.red;
						if (p.twoZeroRate >= 55) return COLORS.orange;
						return COLORS.green;
					}),
					borderWidth: 1.5
				}
			]
		};

		const options = {
			responsive: true,
			maintainAspectRatio: false,
			animation: false,
			plugins: {
				legend: { display: false },
				tooltip: {
					...chartTooltipBase,
					callbacks: {
						label: item => {
							const p = positionScoreImpact[item.dataIndex];
							return `2:0 비율 ${p.twoZeroRate.toFixed(1)}% (${p.totalSets}경기)`;
						}
					}
				}
			},
			scales: {
				x: { grid: gridStyle, ticks: tickStyle },
				y: {
					grid: gridStyle,
					min: 0,
					max: 100,
					ticks: { ...tickStyle, stepSize: 25, callback: v => `${v}%` }
				}
			}
		};

		return (
			<div className={classes.card}>
				<div className={classes.cardTitle}>
					포지션 균형별 2:0 비율
					<InfoTip
						title="포지션 균형: 양팀의 포지션 적합도 점수 차이 기반 (5개 포지션별 팀원 최고 숙련도 합산, 최대 500). 균형이 나쁠수록 2:0으로 끝날 확률이 높음"
						classes={classes}
					/>
				</div>
				<div className={classes.chartContainer}>
					<ChartCanvas type="bar" data={data} options={options} plugins={[baselinePlugin]} />
				</div>
			</div>
		);
	}

	function renderMonthlyTrend() {
		if (!report || !report.monthlyTrend || report.monthlyTrend.length < 2) return null;
		const { monthlyTrend } = report;

		const data = {
			labels: monthlyTrend.map(m => m.month),
			datasets: [
				{
					label: '높은 팀 승률 (%)',
					data: monthlyTrend.map(m => m.favoredWinRate),
					fill: false,
					borderColor: COLORS.cyan,
					backgroundColor: COLORS.cyan,
					pointRadius: 5,
					pointHoverRadius: 8,
					pointBackgroundColor: COLORS.cyan,
					pointBorderColor: '#fff',
					pointBorderWidth: 2,
					tension: 0.3,
					yAxisID: 'winrate'
				},
				{
					label: '인당 평균 티어 차이',
					data: monthlyTrend.map(m => m.avgPerPlayerDiff || m.avgRatingDiff),
					fill: true,
					borderColor: COLORS.purple,
					backgroundColor: `${COLORS.purple}20`,
					pointRadius: 5,
					pointHoverRadius: 8,
					pointBackgroundColor: COLORS.purple,
					pointBorderColor: '#fff',
					pointBorderWidth: 2,
					tension: 0.3,
					yAxisID: 'diff',
					order: 1
				}
			]
		};

		const options = {
			responsive: true,
			maintainAspectRatio: false,
			animation: false,
			plugins: {
				legend: {
					labels: {
						color: 'rgba(255,255,255,0.6)',
						font: { size: 12, family: '"Noto Sans KR", sans-serif' },
						padding: 20
					}
				},
				tooltip: {
					...chartTooltipBase,
					mode: 'index',
					intersect: false,
					displayColors: true,
					callbacks: {
						label: item => {
							const m = monthlyTrend[item.dataIndex];
							if (item.datasetIndex === 0) return `승률 ${m.favoredWinRate.toFixed(1)}% (${m.matchCount}판)`;
							return `인당 차이 ${(m.avgPerPlayerDiff || m.avgRatingDiff).toFixed(1)}점`;
						}
					}
				}
			},
			scales: {
				x: { grid: gridStyle, ticks: tickStyle },
				winrate: {
					type: 'linear',
					position: 'left',
					grid: gridStyle,
					min: 30,
					max: 70,
					ticks: { ...tickStyle, callback: v => `${v}%` }
				},
				diff: {
					type: 'linear',
					position: 'right',
					grid: { drawOnChartArea: false },
					ticks: { ...tickStyle, callback: v => `${v}점` }
				}
			}
		};

		return (
			<div className={classes.cardFull}>
				<div className={classes.cardTitle}>월별 추이</div>
				<div className={classes.chartContainer} style={{ height: 320 }}>
					<ChartCanvas type="line" data={data} options={options} />
				</div>
			</div>
		);
	}

	function renderPositionOverlap() {
		if (!report || !report.positionAnalysis || !report.positionAnalysis.mostOverlappedPositions) return null;
		const { mostOverlappedPositions } = report.positionAnalysis;

		const data = {
			labels: mostOverlappedPositions.map(p => POSITION_LABELS[p.position] || p.position),
			datasets: [
				{
					data: mostOverlappedPositions.map(p => p.count),
					backgroundColor: [COLORS.red, COLORS.green, COLORS.cyan, COLORS.yellow, COLORS.purple],
					borderWidth: 0
				}
			]
		};

		const options = {
			responsive: true,
			maintainAspectRatio: false,
			animation: false,
			plugins: {
				legend: {
					position: 'bottom',
					labels: {
						color: 'rgba(255,255,255,0.6)',
						font: { size: 12, family: '"Noto Sans KR", sans-serif' },
						padding: 12
					}
				},
				tooltip: {
					...chartTooltipBase,
					callbacks: {
						label: item => {
							const p = mostOverlappedPositions[item.dataIndex];
							return `${p.count}회 (${p.rate.toFixed(1)}%)`;
						}
					}
				}
			}
		};

		return (
			<div className={classes.card}>
				<div className={classes.cardTitle}>포지션 겹침 빈도</div>
				<div style={{ height: 260 }}>
					<ChartCanvas type="doughnut" data={data} options={options} />
				</div>
			</div>
		);
	}

	function renderSetResult() {
		if (!report || !report.setAnalysis) return null;
		const { setAnalysis } = report;

		const data = {
			labels: ['2:0', '2:1', '미완료'],
			datasets: [
				{
					data: [setAnalysis.twoZero.count, setAnalysis.twoOne.count, setAnalysis.incomplete],
					backgroundColor: [COLORS.red, COLORS.cyan, COLORS.gray],
					borderWidth: 0
				}
			]
		};

		const options = {
			responsive: true,
			maintainAspectRatio: false,
			animation: false,
			plugins: {
				legend: {
					position: 'bottom',
					labels: {
						color: 'rgba(255,255,255,0.6)',
						font: { size: 12, family: '"Noto Sans KR", sans-serif' },
						padding: 12
					}
				},
				tooltip: {
					...chartTooltipBase,
					callbacks: {
						label: item => {
							const count = item.raw;
							const label = item.label;
							if (label === '2:0') {
								return `${count}경기 (우위 ${setAnalysis.twoZero.favoredWin} / 열세 ${setAnalysis.twoZero.underdogWin})`;
							}
							if (label === '2:1') {
								return `${count}경기 (우위 ${setAnalysis.twoOne.favoredWin} / 열세 ${setAnalysis.twoOne.underdogWin})`;
							}
							return `${count}경기`;
						}
					}
				}
			}
		};

		return (
			<div className={classes.card}>
				<div className={classes.cardTitle}>
					경기 결과 비율
					<InfoTip title="경기: 같은 10명이 24시간 이내에 연속으로 한 3판 2선 묶음" classes={classes} />
				</div>
				<div style={{ height: 260 }}>
					<ChartCanvas type="doughnut" data={data} options={options} />
				</div>
			</div>
		);
	}

	function renderTierSpread() {
		if (!report || !report.tierSpread) return null;
		const { tierSpread } = report;

		return (
			<div className={classes.card}>
				<div className={classes.cardTitle}>팀 내 티어 편차</div>
				<table className={classes.table}>
					<thead>
						<tr>
							<th className={classes.th}>구간</th>
							<th className={classes.th}>매치</th>
							<th className={classes.th} style={{ width: '45%' }}>
								높은 팀 승률
							</th>
						</tr>
					</thead>
					<tbody>
						{tierSpread.map(t => (
							<tr key={t.label}>
								<td className={classes.td} style={{ fontSize: '1.05rem' }}>
									{t.label}
								</td>
								<td className={classes.td}>{t.count}</td>
								<td className={classes.td}>
									{t.count > 0 ? (
										<div className={classes.barInline}>
											<div className={classes.barBg}>
												<div
													className={classes.barFill}
													style={{
														width: `${t.favoredWinRate}%`,
														background: getWinRateColor(t.favoredWinRate)
													}}
												/>
											</div>
											<span className={classes.barLabel} style={{ color: getWinRateColor(t.favoredWinRate) }}>
												{t.favoredWinRate.toFixed(1)}%
											</span>
										</div>
									) : (
										<span style={{ color: 'rgba(255,255,255,0.25)' }}>-</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}

	return (
		<FusePageSimple
			classes={{ root: classes.layoutRoot }}
			header={
				<div className={classes.headerRoot}>
					<Typography className={classes.title} variant="h4">
						Balancing Report
					</Typography>
					<Typography className={classes.subtitle}>매칭 밸런스 리포트</Typography>
				</div>
			}
			content={
				<div className={classes.container}>
					<div className={classes.dateRow}>
						<DatePicker
							value={startDate}
							onChange={date => date && setStartDate(date)}
							format="yyyy-MM-dd"
							maxDate={endDate}
							autoOk
							variant="inline"
						/>
						<span className={classes.dateSep}>~</span>
						<DatePicker
							value={endDate}
							onChange={date => date && setEndDate(date)}
							format="yyyy-MM-dd"
							minDate={startDate}
							maxDate={new Date()}
							autoOk
							variant="inline"
						/>
					</div>

					{loading && <BalanceReportSkeleton />}

					{!loading && !report && (
						<div className={classes.emptyState}>
							<div className={classes.emptyText}>데이터가 없습니다</div>
						</div>
					)}

					{!loading && report && (
						<>
							{renderSummary()}
							<div className={classes.grid2}>
								{renderRatingBrackets()}
								{renderPositionScoreImpact()}
							</div>
							{renderMonthlyTrend()}
							<div className={classes.grid3}>
								{renderPositionOverlap()}
								{renderSetResult()}
								{renderTierSpread()}
							</div>
						</>
					)}
				</div>
			}
		/>
	);
}

export default withReducer('BalanceReport', reducer)(BalanceReport);
