import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { KeyboardDatePicker } from '@material-ui/pickers';
import moment from 'moment';
import reducer from './store/reducers';
import * as Actions from './store/actions';

const useStyles = makeStyles(theme => ({
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
		[theme.breakpoints.down('sm')]: {
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
		[theme.breakpoints.down('sm')]: {
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
		gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
		gap: 16,
		marginBottom: 28
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
		marginBottom: 8
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
	sectionGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(2, 1fr)',
		gap: 20,
		marginBottom: 20,
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr'
		}
	},
	card: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.15)',
		padding: 24,
		[theme.breakpoints.down('xs')]: {
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
		[theme.breakpoints.down('xs')]: {
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
		[theme.breakpoints.down('xs')]: {
			height: 220
		}
	},
	table: {
		width: '100%',
		borderCollapse: 'separate',
		borderSpacing: '0 6px'
	},
	th: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 600,
		color: 'rgba(255,255,255,0.5)',
		padding: '8px 12px',
		textAlign: 'left',
		borderBottom: '1px solid rgba(255,255,255,0.08)'
	},
	td: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		color: '#fff',
		padding: '10px 12px'
	},
	barInline: {
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	barBg: {
		flex: 1,
		height: 8,
		background: 'rgba(255,255,255,0.08)',
		borderRadius: 4,
		overflow: 'hidden'
	},
	barFill: {
		height: '100%',
		borderRadius: 4,
		transition: 'width 0.6s ease'
	},
	barLabel: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		minWidth: 48,
		textAlign: 'right'
	},
	setGrid: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: 12,
		[theme.breakpoints.down('xs')]: {
			gridTemplateColumns: '1fr'
		}
	},
	setCard: {
		background: 'rgba(255,255,255,0.04)',
		borderRadius: 12,
		padding: '16px 20px',
		textAlign: 'center'
	},
	setLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255,255,255,0.5)',
		marginBottom: 6
	},
	setCount: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '2.4rem',
		fontWeight: 700,
		color: '#fff'
	},
	setDetail: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255,255,255,0.4)',
		marginTop: 4
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
	},
	positionIcon: {
		width: 20,
		height: 20,
		verticalAlign: 'middle',
		marginRight: 6
	}
}));

const CHART_COLORS = {
	cyan: '#00d4ff',
	blue: '#0066ff',
	green: '#51cf66',
	yellow: '#ffd43b',
	red: '#ff6b6b',
	purple: '#9775fa',
	orange: '#ff922b'
};

const POSITION_LABELS = { TOP: '탑', JUNGLE: '정글', MID: '미드', ADC: '원딜', SUPPORT: '서포터' };
const POSITION_ICONS = {
	TOP: '/assets/images/positions/TOP.png',
	JUNGLE: '/assets/images/positions/JUNGLE.png',
	MID: '/assets/images/positions/MID.png',
	ADC: '/assets/images/positions/ADC.png',
	SUPPORT: '/assets/images/positions/SUPPORT.png'
};

const chartTooltipBase = {
	backgroundColor: 'rgba(15, 15, 26, 0.95)',
	titleFontColor: '#fff',
	titleFontSize: 14,
	titleFontFamily: '"Noto Sans KR", sans-serif',
	bodyFontColor: '#00d4ff',
	bodyFontSize: 14,
	bodyFontFamily: '"Rajdhani", sans-serif',
	borderColor: 'rgba(0, 212, 255, 0.3)',
	borderWidth: 1,
	cornerRadius: 8,
	displayColors: false,
	padding: 10
};

const gridLineStyle = {
	color: 'rgba(255, 255, 255, 0.05)',
	zeroLineColor: 'rgba(255, 255, 255, 0.1)'
};

const tickStyle = {
	fontColor: 'rgba(255, 255, 255, 0.6)',
	fontSize: 12,
	fontFamily: '"Noto Sans KR", sans-serif'
};

function getWinRateColor(rate) {
	if (rate >= 55) return CHART_COLORS.red;
	if (rate >= 52) return CHART_COLORS.orange;
	if (rate >= 48) return CHART_COLORS.green;
	return CHART_COLORS.cyan;
}

function BalanceReport() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const report = useSelector(({ BalanceReport: br }) => br.balanceReport.report);
	const loading = useSelector(({ BalanceReport: br }) => br.balanceReport.loading);
	const user = useSelector(state => state.auth.user);
	const groupId = user && user.reprGroup ? user.reprGroup.groupId : null;

	const [startDate, setStartDate] = useState(moment().subtract(3, 'months'));
	const [endDate, setEndDate] = useState(moment());

	const fetchReport = useCallback(() => {
		if (groupId) {
			dispatch(Actions.getBalanceReport(groupId, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')));
		}
	}, [dispatch, groupId, startDate, endDate]);

	useEffect(() => {
		fetchReport();
	}, [fetchReport]);

	function renderSummary() {
		if (!report) return null;
		const { summary, totalMatches } = report;
		return (
			<div className={classes.summaryGrid}>
				<div className={classes.summaryCard}>
					<div className={classes.summaryLabel}>총 매치 수</div>
					<div>
						<span className={classes.summaryValue}>{totalMatches}</span>
						<span className={classes.summaryUnit}>판</span>
					</div>
				</div>
				<div className={classes.summaryCard}>
					<div className={classes.summaryLabel}>레이팅 우위팀 승률</div>
					<div>
						<span className={classes.summaryValue} style={{ color: getWinRateColor(summary.favoredTeamWinRate) }}>
							{summary.favoredTeamWinRate.toFixed(1)}
						</span>
						<span className={classes.summaryUnit}>%</span>
					</div>
				</div>
				<div className={classes.summaryCard}>
					<div className={classes.summaryLabel}>평균 레이팅 차이</div>
					<div>
						<span className={classes.summaryValue}>{summary.avgRatingDiff.toFixed(1)}</span>
						<span className={classes.summaryUnit}>점</span>
					</div>
				</div>
			</div>
		);
	}

	function renderRatingBrackets() {
		if (!report || !report.ratingBrackets) return null;
		const { ratingBrackets } = report;
		const maxCount = Math.max(...ratingBrackets.map(b => b.count), 1);

		return (
			<div className={classes.card}>
				<div className={classes.cardTitle}>레이팅 차이 구간별 분석</div>
				<table className={classes.table}>
					<thead>
						<tr>
							<th className={classes.th}>구간</th>
							<th className={classes.th}>매치 수</th>
							<th className={classes.th} style={{ width: '45%' }}>
								우위팀 승률
							</th>
						</tr>
					</thead>
					<tbody>
						{ratingBrackets.map(b => (
							<tr key={b.label}>
								<td className={classes.td}>{b.label}</td>
								<td className={classes.td}>{b.count}판</td>
								<td className={classes.td}>
									<div className={classes.barInline}>
										<div className={classes.barBg} style={{ flex: `0 0 ${Math.round((b.count / maxCount) * 100)}%` }}>
											<div
												className={classes.barFill}
												style={{
													width: `${b.favoredWinRate}%`,
													background: getWinRateColor(b.favoredWinRate)
												}}
											/>
										</div>
										<span className={classes.barLabel} style={{ color: getWinRateColor(b.favoredWinRate) }}>
											{b.favoredWinRate.toFixed(1)}%
										</span>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}

	function renderTierSpread() {
		if (!report || !report.tierSpread) return null;
		const { tierSpread } = report;

		const data = {
			labels: tierSpread.map(t => t.label),
			datasets: [
				{
					label: '우위팀 승률',
					data: tierSpread.map(t => t.favoredWinRate),
					backgroundColor: tierSpread.map(t => `${getWinRateColor(t.favoredWinRate)}40`),
					borderColor: tierSpread.map(t => getWinRateColor(t.favoredWinRate)),
					borderWidth: 1.5
				}
			]
		};

		const options = {
			responsive: true,
			maintainAspectRatio: false,
			legend: { display: false },
			scales: {
				xAxes: [{ gridLines: gridLineStyle, ticks: tickStyle }],
				yAxes: [
					{
						gridLines: gridLineStyle,
						ticks: { ...tickStyle, min: 0, max: 100, callback: v => `${v}%` }
					}
				]
			},
			tooltips: {
				...chartTooltipBase,
				callbacks: {
					label: item => {
						const bracket = tierSpread[item.index];
						return `승률 ${bracket.favoredWinRate.toFixed(1)}% (${bracket.count}판)`;
					}
				}
			}
		};

		return (
			<div className={classes.card}>
				<div className={classes.cardTitle}>팀 내 티어 편차별 분석</div>
				<div className={classes.chartContainer}>
					<Bar data={data} options={options} />
				</div>
			</div>
		);
	}

	function renderPositionAnalysis() {
		if (!report || !report.positionAnalysis) return null;
		const { positionAnalysis } = report;

		return (
			<div className={classes.cardFull}>
				<div className={classes.cardTitle}>포지션 분석</div>
				<div className={classes.summaryGrid} style={{ marginBottom: 20 }}>
					<div className={classes.summaryCard} style={{ border: 'none', background: 'rgba(255,255,255,0.04)' }}>
						<div className={classes.summaryLabel}>평균 포지션 적합도</div>
						<div>
							<span className={classes.summaryValue} style={{ fontSize: '2.4rem' }}>
								{positionAnalysis.avgPositionScore.toFixed(0)}
							</span>
							<span className={classes.summaryUnit}>/ 500</span>
						</div>
					</div>
					<div className={classes.summaryCard} style={{ border: 'none', background: 'rgba(255,255,255,0.04)' }}>
						<div className={classes.summaryLabel}>평균 커버 포지션</div>
						<div>
							<span className={classes.summaryValue} style={{ fontSize: '2.4rem' }}>
								{positionAnalysis.avgPositionCoverage.toFixed(1)}
							</span>
							<span className={classes.summaryUnit}>/ 5</span>
						</div>
					</div>
				</div>
				<div className={classes.sectionGrid}>
					{renderScoreBrackets(positionAnalysis.scoreBrackets)}
					{renderOverlappedPositions(positionAnalysis.mostOverlappedPositions)}
				</div>
			</div>
		);
	}

	function renderScoreBrackets(scoreBrackets) {
		if (!scoreBrackets) return null;

		const data = {
			labels: scoreBrackets.map(s => s.label),
			datasets: [
				{
					data: scoreBrackets.map(s => s.count),
					backgroundColor: [
						CHART_COLORS.red,
						CHART_COLORS.orange,
						CHART_COLORS.yellow,
						CHART_COLORS.green,
						CHART_COLORS.cyan
					],
					borderWidth: 0
				}
			]
		};

		const options = {
			responsive: true,
			maintainAspectRatio: false,
			legend: {
				position: 'bottom',
				labels: {
					fontColor: 'rgba(255,255,255,0.6)',
					fontSize: 12,
					fontFamily: '"Noto Sans KR", sans-serif',
					padding: 16
				}
			},
			tooltips: {
				...chartTooltipBase,
				callbacks: {
					label: item => {
						const bracket = scoreBrackets[item.index];
						return `${bracket.count}판 (승률 ${bracket.favoredWinRate.toFixed(1)}%)`;
					}
				}
			}
		};

		return (
			<div>
				<div className={classes.cardTitle} style={{ fontSize: '1.5rem' }}>
					적합도 구간별 분포
				</div>
				<div style={{ height: 240 }}>
					<Doughnut data={data} options={options} />
				</div>
			</div>
		);
	}

	function renderOverlappedPositions(positions) {
		if (!positions) return null;
		const maxRate = Math.max(...positions.map(p => p.rate), 1);

		return (
			<div>
				<div className={classes.cardTitle} style={{ fontSize: '1.5rem' }}>
					포지션 겹침 빈도
				</div>
				<table className={classes.table}>
					<thead>
						<tr>
							<th className={classes.th}>포지션</th>
							<th className={classes.th}>횟수</th>
							<th className={classes.th} style={{ width: '50%' }}>
								비율
							</th>
						</tr>
					</thead>
					<tbody>
						{positions.map(p => (
							<tr key={p.position}>
								<td className={classes.td}>
									{POSITION_ICONS[p.position] && (
										<img src={POSITION_ICONS[p.position]} alt="" className={classes.positionIcon} />
									)}
									{POSITION_LABELS[p.position] || p.position}
								</td>
								<td className={classes.td}>{p.count}</td>
								<td className={classes.td}>
									<div className={classes.barInline}>
										<div className={classes.barBg}>
											<div
												className={classes.barFill}
												style={{
													width: `${(p.rate / maxRate) * 100}%`,
													background: CHART_COLORS.purple
												}}
											/>
										</div>
										<span className={classes.barLabel} style={{ color: CHART_COLORS.purple }}>
											{p.rate.toFixed(1)}%
										</span>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}

	function renderSetAnalysis() {
		if (!report || !report.setAnalysis) return null;
		const { setAnalysis } = report;

		return (
			<div className={classes.card}>
				<div className={classes.cardTitle}>세트 분석</div>
				<div className={classes.setGrid}>
					<div className={classes.setCard}>
						<div className={classes.setLabel}>총 세트</div>
						<div className={classes.setCount}>{setAnalysis.totalSets}</div>
					</div>
					<div className={classes.setCard}>
						<div className={classes.setLabel}>단독 매치</div>
						<div className={classes.setCount}>{setAnalysis.singleMatches}</div>
					</div>
					<div className={classes.setCard}>
						<div className={classes.setLabel}>2:0 세트</div>
						<div className={classes.setCount}>{setAnalysis.twoZero.count}</div>
						<div className={classes.setDetail}>
							우위팀 {setAnalysis.twoZero.favoredWin} / 열세팀 {setAnalysis.twoZero.underdogWin}
						</div>
					</div>
					<div className={classes.setCard}>
						<div className={classes.setLabel}>2:1 세트</div>
						<div className={classes.setCount}>{setAnalysis.twoOne.count}</div>
						<div className={classes.setDetail}>
							우위팀 {setAnalysis.twoOne.favoredWin} / 열세팀 {setAnalysis.twoOne.underdogWin}
						</div>
					</div>
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
					label: '우위팀 승률',
					data: monthlyTrend.map(m => m.favoredWinRate),
					fill: false,
					borderColor: CHART_COLORS.cyan,
					backgroundColor: CHART_COLORS.cyan,
					pointRadius: 5,
					pointHoverRadius: 8,
					pointBackgroundColor: CHART_COLORS.cyan,
					pointBorderColor: '#fff',
					pointBorderWidth: 2,
					tension: 0.3,
					yAxisID: 'winrate'
				},
				{
					label: '평균 레이팅 차이',
					data: monthlyTrend.map(m => m.avgRatingDiff),
					fill: true,
					borderColor: CHART_COLORS.purple,
					backgroundColor: `${CHART_COLORS.purple}20`,
					pointRadius: 5,
					pointHoverRadius: 8,
					pointBackgroundColor: CHART_COLORS.purple,
					pointBorderColor: '#fff',
					pointBorderWidth: 2,
					tension: 0.3,
					yAxisID: 'diff'
				}
			]
		};

		const options = {
			responsive: true,
			maintainAspectRatio: false,
			legend: {
				labels: {
					fontColor: 'rgba(255,255,255,0.6)',
					fontSize: 12,
					fontFamily: '"Noto Sans KR", sans-serif',
					padding: 20
				}
			},
			scales: {
				xAxes: [{ gridLines: gridLineStyle, ticks: tickStyle }],
				yAxes: [
					{
						id: 'winrate',
						position: 'left',
						gridLines: gridLineStyle,
						ticks: {
							...tickStyle,
							min: 30,
							max: 70,
							callback: v => `${v}%`
						}
					},
					{
						id: 'diff',
						position: 'right',
						gridLines: { drawOnChartArea: false },
						ticks: {
							...tickStyle,
							callback: v => `${v}점`
						}
					}
				]
			},
			tooltips: {
				...chartTooltipBase,
				mode: 'index',
				intersect: false,
				displayColors: true,
				callbacks: {
					label: item => {
						const m = monthlyTrend[item.index];
						if (item.datasetIndex === 0) return `승률 ${m.favoredWinRate.toFixed(1)}% (${m.matchCount}판)`;
						return `레이팅 차이 ${m.avgRatingDiff.toFixed(1)}점`;
					}
				}
			}
		};

		return (
			<div className={classes.cardFull}>
				<div className={classes.cardTitle}>월별 추이</div>
				<div className={classes.chartContainer} style={{ height: 320 }}>
					<Line data={data} options={options} />
				</div>
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
						<KeyboardDatePicker
							value={startDate}
							onChange={date => date && setStartDate(date)}
							format="YYYY-MM-DD"
							maxDate={endDate}
							autoOk
							variant="inline"
						/>
						<span className={classes.dateSep}>~</span>
						<KeyboardDatePicker
							value={endDate}
							onChange={date => date && setEndDate(date)}
							format="YYYY-MM-DD"
							minDate={startDate}
							maxDate={moment()}
							autoOk
							variant="inline"
						/>
					</div>

					{loading && (
						<div className={classes.loadingWrapper}>
							<CircularProgress style={{ color: '#00d4ff' }} />
						</div>
					)}

					{!loading && !report && (
						<div className={classes.emptyState}>
							<div className={classes.emptyText}>데이터가 없습니다</div>
						</div>
					)}

					{!loading && report && (
						<>
							{renderSummary()}
							{renderMonthlyTrend()}
							<div className={classes.sectionGrid}>
								{renderRatingBrackets()}
								{renderTierSpread()}
							</div>
							{renderPositionAnalysis()}
							<div className={classes.sectionGrid}>{renderSetAnalysis()}</div>
						</>
					)}
				</div>
			}
		/>
	);
}

export default withReducer('BalanceReport', reducer)(BalanceReport);
