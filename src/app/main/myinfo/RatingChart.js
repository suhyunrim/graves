import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FuseLoading from '@fuse/core/FuseLoading';
import createCamilleAxios from 'app/utility/camilleAxios';

const useStyles = makeStyles(theme => ({
	chartCard: {
		marginTop: 16
	},
	chartContainer: {
		height: 400
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
	const user = useSelector(state => state.auth.user);
	const [ratingHistory, setRatingHistory] = useState(null);
	const [loading, setLoading] = useState(true);

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
		} else {
			value += 3;
		}

		value += tierInfo.lp / 100;
		return value;
	};

	const tierValueToLabel = value => {
		const tierIndex = Math.floor(value / 4);
		const divisionIndex = Math.floor(value % 4);
		const divisions = ['IV', 'III', 'II', 'I'];

		if (tierIndex >= tierOrder.length) return 'CHALLENGER';
		const tier = tierOrder[tierIndex];

		if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier)) {
			return tier;
		}
		return `${tier} ${divisions[divisionIndex]}`;
	};

	useEffect(() => {
		const fetchMatchHistory = async () => {
			try {
				const response = await createCamilleAxios().get(`/api/match/history/${user.reprGroup.groupId}`);
				if (response.status === 200) {
					const matches = response.data.matches;
					const myPuuid = localStorage.getItem('camille_riot_puuid');

					const history = [];

					const reversedMatches = [...matches].reverse();

					for (const match of reversedMatches) {
						let playerData = match.team1.players.find(p => p.puuid === myPuuid);
						let ratingChange = match.team1.ratingChange;

						if (!playerData) {
							playerData = match.team2.players.find(p => p.puuid === myPuuid);
							ratingChange = match.team2.ratingChange;
						}

						if (playerData) {
							history.push({
								date: new Date(match.createdAt),
								rating: playerData.rating,
								ratingChange,
								gameId: match.gameId
							});
						}
					}

					setRatingHistory(history);
				}
			} catch (error) {
				console.error('Failed to fetch match history:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchMatchHistory();
	}, [user]);

	if (loading) {
		return <FuseLoading />;
	}

	if (!ratingHistory || ratingHistory.length === 0) {
		return (
			<Card className={classes.chartCard}>
				<CardContent>
					<Typography variant="h6">Rating History</Typography>
					<Typography color="textSecondary">No match data available</Typography>
				</CardContent>
			</Card>
		);
	}

	// 날짜별로 그룹핑하여 그날 마지막 판의 데이터만 추출
	const groupByDate = (history) => {
		const grouped = {};
		history.forEach(h => {
			const dateKey = h.date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
			grouped[dateKey] = h; // 나중 데이터가 덮어씀 (마지막 판)
		});
		return Object.entries(grouped)
			.sort((a, b) => a[0].localeCompare(b[0])) // 날짜순 정렬
			.slice(-10) // 최근 10개만
			.map(([dateKey, data]) => ({
				...data,
				dateLabel: dateKey.slice(5) // MM-DD 형식으로 표시
			}));
	};

	const dailyHistory = groupByDate(ratingHistory);

	const tierValues = dailyHistory.map(h => ratingToTierValue(h.rating));
	const minTierValue = Math.floor(Math.min(...tierValues)) - 1;
	const maxTierValue = Math.ceil(Math.max(...tierValues)) + 1;

	const chartData = {
		labels: dailyHistory.map(h => h.dateLabel),
		datasets: [
			{
				label: 'Tier',
				data: tierValues,
				fill: false,
				borderColor: '#4374D9',
				backgroundColor: '#4374D9',
				tension: 0.1,
				pointRadius: 4,
				pointHoverRadius: 6
			}
		]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			yAxes: [{
				ticks: {
					min: Math.max(0, minTierValue),
					max: maxTierValue,
					stepSize: 1,
					callback: value => tierValueToLabel(value)
				}
			}]
		},
		tooltips: {
			callbacks: {
				label: (tooltipItem, data) => {
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
		<Card className={classes.chartCard}>
			<CardContent>
				<Typography variant="h6" gutterBottom>Rating History</Typography>
				<div className={classes.chartContainer}>
					<Line data={chartData} options={chartOptions} />
				</div>
			</CardContent>
		</Card>
	);
}

export default RatingChart;
