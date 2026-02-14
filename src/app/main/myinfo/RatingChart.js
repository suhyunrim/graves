import React from 'react';
import { Line } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	chartCard: {
		marginTop: 24,
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.2)',
		padding: 28,
		animation: '$fadeIn 0.6s ease',
		animationDelay: '0.3s',
		animationFillMode: 'backwards'
	},
	'@keyframes fadeIn': {
		'0%': { opacity: 0, transform: 'translateY(20px)' },
		'100%': { opacity: 1, transform: 'translateY(0)' }
	},
	chartTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2.1rem',
		fontWeight: 700,
		color: '#fff',
		marginBottom: 28,
		display: 'flex',
		alignItems: 'center',
		gap: 14,
		'&::before': {
			content: '""',
			width: 5,
			height: 32,
			background: 'linear-gradient(180deg, #00d4ff, #0066ff)',
			borderRadius: 2
		}
	},
	chartContainer: {
		height: 420,
		position: 'relative'
	},
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '70px 20px',
		textAlign: 'center'
	},
	emptyIcon: {
		fontSize: '4.5rem',
		marginBottom: 20,
		opacity: 0.5
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		color: 'rgba(255, 255, 255, 0.4)'
	}
}));

const tierConfig = {
	IRON: { base: 200, color: '#5C5C5C' },
	BRONZE: { base: 300, color: '#8B4513' },
	SILVER: { base: 400, color: '#A0A0A0' },
	GOLD: { base: 500, color: '#FFD700' },
	PLATINUM: { base: 600, color: '#00CED1' },
	EMERALD: { base: 700, color: '#50C878' },
	DIAMOND: { base: 800, color: '#B9F2FF' },
	MASTER: { base: 900, color: '#9932CC' },
	GRANDMASTER: { base: 1000, color: '#FF4500' },
	CHALLENGER: { base: 1150, color: '#F0E68C' }
};

const tierOrder = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];

function RatingChart() {
	const classes = useStyles();
	const ratingHistory = useSelector(({ MyInfo }) => MyInfo.myInfo.ratingHistory);

	const getTierFromRating = rating => {
		const entries = Object.entries(tierConfig).sort((a, b) => b[1].base - a[1].base);
		for (const [name, config] of entries) {
			if (rating >= config.base) {
				if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(name)) {
					return { tier: name, division: '', lp: Math.floor((rating - config.base) * 4) };
				}
				const divisionIndex = Math.floor((rating - config.base) / 25);
				const divisions = ['IV', 'III', 'II', 'I'];
				const division = divisions[Math.min(divisionIndex, 3)];
				const lp = Math.floor((rating - config.base) % 25 * 4);
				return { tier: name, division, lp };
			}
		}
		return { tier: 'IRON', division: 'IV', lp: 0 };
	};

	const ratingToTierValue = rating => {
		const tierInfo = getTierFromRating(rating);
		const tierIndex = tierOrder.indexOf(tierInfo.tier);
		let value = tierIndex * 4;

		if (!['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tierInfo.tier)) {
			const divisionMap = { IV: 0, III: 1, II: 2, I: 3 };
			value += divisionMap[tierInfo.division] || 0;
			value += tierInfo.lp / 100;
		} else {
			const currentBase = tierConfig[tierInfo.tier].base;
			const nextTierName = tierOrder[tierIndex + 1];
			const nextBase = nextTierName ? tierConfig[nextTierName].base : currentBase + 200;
			value += Math.min(((rating - currentBase) / (nextBase - currentBase)) * 4, 3.99);
		}

		return value;
	};

	const tierValueToLabel = value => {
		const tierIndex = Math.floor(value / 4);
		const subIndex = Math.floor(value % 4);
		const divisions = ['IV', 'III', 'II', 'I'];

		if (tierIndex >= tierOrder.length) return 'CHALLENGER';
		const tier = tierOrder[tierIndex];

		if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier)) {
			const currentBase = tierConfig[tier].base;
			const nextTierName = tierOrder[tierIndex + 1];
			const nextBase = nextTierName ? tierConfig[nextTierName].base : currentBase + 200;
			const lp = Math.round(subIndex * ((nextBase - currentBase) * 4) / 4);
			return `${tier} ${lp}LP`;
		}
		return `${tier} ${divisions[subIndex]}`;
	};

	if (!ratingHistory || ratingHistory.length === 0) {
		return (
			<div className={classes.chartCard}>
				<div className={classes.chartTitle}>Rating History</div>
				<div className={classes.emptyState}>
					<div className={classes.emptyIcon}><span role="img" aria-label="chart">📊</span></div>
					<div className={classes.emptyText}>매치 데이터가 없습니다</div>
				</div>
			</div>
		);
	}

	const dailyHistory = ratingHistory.map(h => ({
		...h,
		dateLabel: h.date.slice(5)
	}));

	const tierValues = dailyHistory.map(h => ratingToTierValue(h.rating));
	const minTierValue = Math.floor(Math.min(...tierValues)) - 1;
	const maxTierValue = Math.ceil(Math.max(...tierValues)) + 1;

	const chartData = {
		labels: dailyHistory.map(h => h.dateLabel),
		datasets: [
			{
				label: 'Tier',
				data: tierValues,
				fill: true,
				borderColor: '#00d4ff',
				backgroundColor: 'rgba(0, 212, 255, 0.1)',
				tension: 0.4,
				pointRadius: 6,
				pointHoverRadius: 10,
				pointBackgroundColor: '#00d4ff',
				pointBorderColor: '#fff',
				pointBorderWidth: 2,
				pointHoverBackgroundColor: '#fff',
				pointHoverBorderColor: '#00d4ff',
				pointHoverBorderWidth: 3
			}
		]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		legend: {
			display: false
		},
		scales: {
			xAxes: [{
				gridLines: {
					color: 'rgba(255, 255, 255, 0.05)',
					zeroLineColor: 'rgba(255, 255, 255, 0.1)'
				},
				ticks: {
					fontColor: 'rgba(255, 255, 255, 0.6)',
					fontSize: 15,
					fontFamily: '"Noto Sans KR", sans-serif'
				}
			}],
			yAxes: [{
				gridLines: {
					color: 'rgba(255, 255, 255, 0.05)',
					zeroLineColor: 'rgba(255, 255, 255, 0.1)'
				},
				ticks: {
					min: Math.max(0, minTierValue),
					max: maxTierValue,
					stepSize: 1,
					callback: value => tierValueToLabel(value),
					fontColor: 'rgba(255, 255, 255, 0.6)',
					fontSize: 14,
					fontFamily: '"Rajdhani", sans-serif'
				}
			}]
		},
		tooltips: {
			backgroundColor: 'rgba(15, 15, 26, 0.95)',
			titleFontColor: '#fff',
			titleFontSize: 16,
			titleFontFamily: '"Noto Sans KR", sans-serif',
			bodyFontColor: '#00d4ff',
			bodyFontSize: 18,
			bodyFontFamily: '"Rajdhani", sans-serif',
			borderColor: 'rgba(0, 212, 255, 0.3)',
			borderWidth: 1,
			cornerRadius: 8,
			displayColors: false,
			padding: 14,
			callbacks: {
				label: (tooltipItem) => {
					const index = tooltipItem.index;
					const rating = dailyHistory[index].rating;
					const tierInfo = getTierFromRating(rating);
					const tierLabel = tierInfo.division
						? `${tierInfo.tier} ${tierInfo.division} ${tierInfo.lp}LP`
						: `${tierInfo.tier} ${tierInfo.lp}LP`;
					return `${tierLabel} (${rating}p)`;
				}
			}
		}
	};

	return (
		<div className={classes.chartCard}>
			<div className={classes.chartTitle}>Rating History</div>
			<div className={classes.chartContainer}>
				<Line data={chartData} options={chartOptions} />
			</div>
		</div>
	);
}

export default RatingChart;
