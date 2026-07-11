import React from 'react';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	LineController,
	Tooltip,
	Legend,
	Filler
} from 'chart.js';
import { getTierLabel } from 'app/main/tournament/tournamentUtils';
import ChartCanvas from '../components/ChartCanvas';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Tooltip, Legend, Filler);

// A/B 최근 100판 KST 일별 레이팅을 한 차트에 오버레이. 날짜 축은 두 시리즈의 합집합(정렬).
// 한 시리즈에만 있는 날짜는 null 로 두고 spanGaps 로 이어 그린다.
function RatingTrajectoryChart({ a, b, nameA, nameB, colorA, colorB }) {
	const seriesA = a || [];
	const seriesB = b || [];

	const dateSet = new Set();
	seriesA.forEach(p => dateSet.add(p.date));
	seriesB.forEach(p => dateSet.add(p.date));
	const labels = Array.from(dateSet).sort();

	const mapA = new Map(seriesA.map(p => [p.date, p.rating]));
	const mapB = new Map(seriesB.map(p => [p.date, p.rating]));
	const dataA = labels.map(d => (mapA.has(d) ? mapA.get(d) : null));
	const dataB = labels.map(d => (mapB.has(d) ? mapB.get(d) : null));

	const chartData = {
		labels: labels.map(d => d.slice(5)),
		datasets: [
			{
				label: nameA,
				data: dataA,
				spanGaps: true,
				borderColor: colorA,
				backgroundColor: 'transparent',
				tension: 0.35,
				borderWidth: 2.5,
				pointRadius: 3,
				pointHoverRadius: 7,
				pointBackgroundColor: colorA,
				pointBorderColor: '#0f0f1a',
				pointBorderWidth: 1
			},
			{
				label: nameB,
				data: dataB,
				spanGaps: true,
				borderColor: colorB,
				backgroundColor: 'transparent',
				tension: 0.35,
				borderWidth: 2.5,
				pointRadius: 3,
				pointHoverRadius: 7,
				pointBackgroundColor: colorB,
				pointBorderColor: '#0f0f1a',
				pointBorderWidth: 1
			}
		]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		animation: false,
		interaction: { mode: 'index', intersect: false },
		plugins: {
			legend: {
				display: true,
				labels: {
					color: 'rgba(255, 255, 255, 0.85)',
					font: { size: 15, family: '"Rajdhani", "Noto Sans KR", sans-serif' },
					usePointStyle: true,
					pointStyle: 'circle',
					padding: 18
				}
			},
			tooltip: {
				backgroundColor: 'rgba(15, 15, 26, 0.95)',
				titleColor: '#fff',
				titleFont: { size: 14, family: '"Noto Sans KR", sans-serif' },
				bodyColor: 'rgba(255, 255, 255, 0.9)',
				bodyFont: { size: 15, family: '"Rajdhani", sans-serif' },
				borderColor: 'rgba(0, 212, 255, 0.3)',
				borderWidth: 1,
				cornerRadius: 8,
				padding: 12,
				callbacks: {
					label: item => (item.parsed.y == null ? null : `${item.dataset.label}: ${getTierLabel(item.parsed.y)}`)
				}
			}
		},
		scales: {
			x: {
				grid: { color: 'rgba(255, 255, 255, 0.05)' },
				ticks: {
					color: 'rgba(255, 255, 255, 0.6)',
					font: { size: 13, family: '"Noto Sans KR", sans-serif' },
					maxRotation: 0,
					autoSkip: true,
					maxTicksLimit: 10
				}
			},
			y: {
				grid: { color: 'rgba(255, 255, 255, 0.05)' },
				ticks: {
					color: 'rgba(255, 255, 255, 0.6)',
					font: { size: 13, family: '"Rajdhani", sans-serif' },
					maxTicksLimit: 6,
					// 원시 레이팅 숫자 대신 티어 라벨로 표기. 인접 눈금이 같은 티어면 생략.
					callback: (value, index, ticks) => {
						const label = getTierLabel(value);
						if (index > 0 && getTierLabel(ticks[index - 1].value) === label) return '';
						return label;
					}
				}
			}
		}
	};

	return <ChartCanvas type="line" data={chartData} options={chartOptions} />;
}

export default RatingTrajectoryChart;
