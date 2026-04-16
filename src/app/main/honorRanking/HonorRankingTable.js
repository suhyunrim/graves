import FuseScrollbars from '@fuse/core/FuseScrollbars';
import _ from '@lodash';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from '@emotion/react';
import { withStyles } from 'tss-react/mui';
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from './store/actions';
import { RankingTableSkeleton } from '../components/SkeletonLoaders';

// keyframes 헬퍼로 애니메이션 정의 (tss-react는 JSS $ruleName 참조 미지원)
const fadeIn = keyframes`
	0% { opacity: 0; transform: translateY(20px); }
	100% { opacity: 1; transform: translateY(0); }
`;

const useStyles = makeStyles()((theme) => ({
	container: {
		padding: '28px',
		maxWidth: 1400,
		margin: '0 auto',
		width: '100%'
	},
	tableWrapper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 20,
		border: '1px solid rgba(255, 193, 7, 0.2)',
		overflow: 'hidden',
		animation: `${fadeIn} 0.6s ease`
	},
	rankingNumber: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		minWidth: 50,
		textAlign: 'center'
	},
	rankTop1: {
		color: '#FFD700',
		textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
	},
	rankTop2: {
		color: '#C0C0C0',
		textShadow: '0 0 10px rgba(192, 192, 192, 0.5)'
	},
	rankTop3: {
		color: '#CD7F32',
		textShadow: '0 0 10px rgba(205, 127, 50, 0.5)'
	},
	rankNormal: {
		color: 'rgba(255, 255, 255, 0.7)'
	},
	playerName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 600,
		color: '#fff'
	},
	titleCell: {
		display: 'flex',
		alignItems: 'center',
		gap: 8
	},
	titleEmoji: {
		fontSize: '1.6rem'
	},
	titleText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: '#ffc107'
	},
	statNumber: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.5rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.8)'
	},
	votesReceived: {
		color: '#ffc107'
	},
	votesGiven: {
		color: 'rgba(255, 255, 255, 0.5)'
	},
	pagination: {
		color: 'rgba(255, 255, 255, 0.7)',
		borderTop: '1px solid rgba(255, 255, 255, 0.1)',
		'& .MuiTablePagination-selectIcon': {
			color: 'rgba(255, 255, 255, 0.5)'
		},
		'& .MuiIconButton-root': {
			color: 'rgba(255, 255, 255, 0.5)'
		},
		'& .MuiIconButton-root.Mui-disabled': {
			color: 'rgba(255, 255, 255, 0.2)'
		},
		'& .MuiSelect-icon': {
			color: 'rgba(255, 255, 255, 0.5)'
		}
	},
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '80px 20px',
		textAlign: 'center'
	},
	emptyIcon: {
		fontSize: '5rem',
		marginBottom: 20,
		opacity: 0.5
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	// Mobile card styles
	mobileCardList: {
		padding: '16px'
	},
	mobileCard: {
		background: 'rgba(255, 255, 255, 0.03)',
		borderRadius: 16,
		padding: '16px',
		marginBottom: 12,
		border: '1px solid rgba(255, 255, 255, 0.08)',
		transition: 'all 0.2s ease',
		'&:hover': {
			background: 'rgba(255, 193, 7, 0.05)',
			borderColor: 'rgba(255, 193, 7, 0.2)'
		}
	},
	mobileCardTop: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		marginBottom: 12
	},
	mobileRankBadge: {
		width: 40,
		height: 40,
		borderRadius: 10,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		background: 'rgba(255, 255, 255, 0.1)'
	},
	mobileRankTop1: {
		background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
		color: '#000',
		boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)'
	},
	mobileRankTop2: {
		background: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)',
		color: '#000',
		boxShadow: '0 0 12px rgba(192, 192, 192, 0.4)'
	},
	mobileRankTop3: {
		background: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
		color: '#fff',
		boxShadow: '0 0 12px rgba(205, 127, 50, 0.4)'
	},
	mobilePlayerInfo: {
		flex: 1,
		minWidth: 0
	},
	mobilePlayerName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: '#fff',
		marginBottom: 2,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	mobileTitleRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 6
	},
	mobileTitleEmoji: {
		fontSize: '1.1rem'
	},
	mobileTitleText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: '#ffc107'
	},
	mobileStats: {
		display: 'flex',
		justifyContent: 'space-around',
		alignItems: 'center',
		paddingTop: 12,
		borderTop: '1px solid rgba(255, 255, 255, 0.08)'
	},
	mobileStatItem: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 2
	},
	mobileStatLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.85rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	mobileStatValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700
	},
	mobileVotesReceived: {
		color: '#ffc107'
	},
	mobileVotesGiven: {
		color: 'rgba(255, 255, 255, 0.6)'
	}
}));

const StyledTableCell = withStyles(TableCell, () => ({
	head: {
		backgroundColor: 'rgba(255, 193, 7, 0.08)',
		color: 'rgba(255, 255, 255, 0.7)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		borderBottom: '1px solid rgba(255, 193, 7, 0.15)',
		padding: '14px 24px'
	},
	body: {
		backgroundColor: 'transparent',
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		padding: '18px 24px'
	}
}));

const StyledTableRow = withStyles(TableRow, () => ({
	root: {
		transition: 'background-color 0.2s ease',
		'&:hover': {
			backgroundColor: 'rgba(255, 193, 7, 0.05)'
		}
	}
}));

const emojiAriaLabels = {
	'\u{1F31F}': 'glowing star',
	'\u{1F451}': 'crown',
	'\u{1F6E1}\uFE0F': 'shield',
	'\u2B50': 'star',
	'\u{1F91D}': 'handshake'
};

function getPeriodDates(period) {
	if (period !== 'all' && period.year != null) {
		const { year, month } = period;
		const pad = n => String(n).padStart(2, '0');
		const lastDay = new Date(year, month, 0).getDate();
		return {
			since: `${year}-${pad(month)}-01`,
			until: `${year}-${pad(month)}-${pad(lastDay)}`
		};
	}
	return { since: null, until: null };
}

function HonorRankingTable() {
	const { classes } = useStyles();
	const dispatch = useDispatch();

	const honorData = useSelector(({ HonorRanking }) => HonorRanking.honorRanking.data);
	const searchText = useSelector(({ HonorRanking }) => HonorRanking.honorRanking.searchText);
	const period = useSelector(({ HonorRanking }) => HonorRanking.honorRanking.period);
	const groupId = useSelector(state => state.auth.user.reprGroup.groupId);

	const [page, setPage] = useState(0);
	const rowsPerPage = 10;

	useEffect(() => {
		const { since, until } = getPeriodDates(period);
		dispatch(Actions.getHonorRanking(groupId, since, until));
	}, [dispatch, groupId, period]);

	const filteredData = useMemo(() => {
		if (!honorData) return null;
		if (searchText.length === 0) return honorData;
		return _.filter(honorData, item => item.name.toLowerCase().includes(searchText.toLowerCase()));
	}, [honorData, searchText]);

	useEffect(() => {
		setPage(0);
	}, [searchText, period]);

	const paginatedData = filteredData ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : [];

	function getRankClass(rank) {
		if (rank === 1) return classes.rankTop1;
		if (rank === 2) return classes.rankTop2;
		if (rank === 3) return classes.rankTop3;
		return classes.rankNormal;
	}

	function getMobileRankClass(rank) {
		if (rank === 1) return classes.mobileRankTop1;
		if (rank === 2) return classes.mobileRankTop2;
		if (rank === 3) return classes.mobileRankTop3;
		return '';
	}

	function renderTitle(title) {
		if (!title) return null;
		const ariaLabel = emojiAriaLabels[title.emoji] || 'badge';
		return (
			<div className={classes.titleCell}>
				<span role="img" aria-label={ariaLabel} className={classes.titleEmoji}>{title.emoji}</span>
				<span className={classes.titleText}>{title.title}</span>
			</div>
		);
	}

	function renderMobileTitle(title) {
		if (!title) return null;
		const ariaLabel = emojiAriaLabels[title.emoji] || 'badge';
		return (
			<div className={classes.mobileTitleRow}>
				<span role="img" aria-label={ariaLabel} className={classes.mobileTitleEmoji}>{title.emoji}</span>
				<span className={classes.mobileTitleText}>{title.title}</span>
			</div>
		);
	}

	if (filteredData === null) {
		return <RankingTableSkeleton />;
	}

	return (
        <div className={classes.container}>
            <div className={classes.tableWrapper}>
				{filteredData.length > 0 ? (
					<>
						{/* Desktop Table View */}
						<Box sx={{ display: { xs: 'none', md: 'block' } }}>
							<FuseScrollbars className="flex-grow overflow-x-auto">
								<Table>
									<TableHead>
										<TableRow>
											<StyledTableCell>순위</StyledTableCell>
											<StyledTableCell>소환사</StyledTableCell>
											<StyledTableCell>칭호</StyledTableCell>
											<StyledTableCell>받은 표</StyledTableCell>
											<StyledTableCell>투표 참여</StyledTableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{paginatedData.map((n, idx) => {
											const rank = page * rowsPerPage + idx + 1;
											return (
												<StyledTableRow key={n.puuid}>
													<StyledTableCell>
														<span className={`${classes.rankingNumber} ${getRankClass(rank)}`}>{rank}</span>
													</StyledTableCell>
													<StyledTableCell>
														<span className={classes.playerName}>{n.name}</span>
													</StyledTableCell>
													<StyledTableCell>
														{renderTitle(n.title)}
													</StyledTableCell>
													<StyledTableCell>
														<span className={`${classes.statNumber} ${classes.votesReceived}`}>{n.totalVotes}표</span>
													</StyledTableCell>
													<StyledTableCell>
														<span className={`${classes.statNumber} ${classes.votesGiven}`}>{n.givenVotes}회</span>
													</StyledTableCell>
												</StyledTableRow>
											);
										})}
									</TableBody>
								</Table>
							</FuseScrollbars>
						</Box>

						{/* Mobile Card View */}
						<Box sx={{ display: { md: 'none' } }}>
							<div className={classes.mobileCardList}>
								{paginatedData.map((n, idx) => {
									const rank = page * rowsPerPage + idx + 1;
									return (
										<div key={n.puuid} className={classes.mobileCard}>
											<div className={classes.mobileCardTop}>
												<div className={`${classes.mobileRankBadge} ${getMobileRankClass(rank)}`}>{rank}</div>
												<div className={classes.mobilePlayerInfo}>
													<div className={classes.mobilePlayerName}>{n.name}</div>
													{renderMobileTitle(n.title)}
												</div>
											</div>
											<div className={classes.mobileStats}>
												<div className={classes.mobileStatItem}>
													<span className={classes.mobileStatLabel}>받은 표</span>
													<span className={`${classes.mobileStatValue} ${classes.mobileVotesReceived}`}>{n.totalVotes}</span>
												</div>
												<div className={classes.mobileStatItem}>
													<span className={classes.mobileStatLabel}>투표 참여</span>
													<span className={`${classes.mobileStatValue} ${classes.mobileVotesGiven}`}>{n.givenVotes}</span>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</Box>

						<TablePagination
							className={classes.pagination}
							component="div"
							count={filteredData.length}
							rowsPerPage={rowsPerPage}
							rowsPerPageOptions={[]}
							page={page}
							backIconButtonProps={{ 'aria-label': 'Previous Page' }}
							nextIconButtonProps={{ 'aria-label': 'Next Page' }}
							onPageChange={(event, value) => setPage(value)}
						/>
					</>
				) : (
					<div className={classes.emptyState}>
						<div className={classes.emptyIcon}>
							<span role="img" aria-label="trophy">
								🏆
							</span>
						</div>
						<div className={classes.emptyText}>명예 랭킹 데이터가 없습니다</div>
					</div>
				)}
			</div>
        </div>
    );
}

export default HonorRankingTable;
