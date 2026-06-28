import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { makeStyles } from 'tss-react/mui';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MatchHistorySkeleton } from '../components/SkeletonLoaders';
import MatchList, { getTierIconName, getTierColor, getTierShortName } from '../components/MatchList';
import useDialogStyles from '../components/dialogStyles';
import * as Actions from './store/actions';

const useStyles = makeStyles()((theme) => ({
	dialogPaperWidth: {
		minWidth: 360,
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 16
		}
	},
	dialogContent: {
		paddingTop: '24px !important'
	},
	dialogInput: {
		'& .MuiInputBase-root': {
			color: '#fff'
		},
		'& .MuiInputLabel-root': {
			color: 'rgba(255, 255, 255, 0.6)'
		},
		'& .MuiInput-underline:before': {
			borderBottomColor: 'rgba(255, 255, 255, 0.2)'
		},
		'& .MuiInput-underline:hover:before': {
			borderBottomColor: 'rgba(0, 212, 255, 0.5)'
		},
		'& .MuiInput-underline:after': {
			borderBottomColor: '#00d4ff'
		}
	},
	formLabel: {
		color: 'rgba(255, 255, 255, 0.7)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		'&.Mui-focused': {
			color: '#00d4ff'
		}
	},
	radioLabel: {
		color: '#fff',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem'
	},
	radio: {
		color: 'rgba(255, 255, 255, 0.4)',
		'&.Mui-checked': {
			color: '#00d4ff'
		}
	}
}));

function MatchHistoryTable() {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();
	const dispatch = useDispatch();

	const user = useSelector(state => state.auth.user);
	const matches = useSelector(({ MatchHistory }) => MatchHistory.matchHistory.matches);
	const total = useSelector(({ MatchHistory }) => MatchHistory.matchHistory.total);
	const serverPage = useSelector(({ MatchHistory }) => MatchHistory.matchHistory.page);
	const searchText = useSelector(({ MatchHistory }) => MatchHistory.matchHistory.searchText);

	const isAdmin = user?.reprGroup?.isAdmin;

	const rowsPerPage = 10;
	const debounceTimer = useRef(null);

	// 복제 관련 상태
	const [menuAnchorEl, setMenuAnchorEl] = useState(null);
	const [menuMatch, setMenuMatch] = useState(null);
	const [dupDialogOpen, setDupDialogOpen] = useState(false);
	const [dupDate, setDupDate] = useState('');
	const [dupWinTeam, setDupWinTeam] = useState('1');
	const [dupLoading, setDupLoading] = useState(false);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

	const handleMenuOpen = (event, match) => {
		event.stopPropagation();
		setMenuAnchorEl(event.currentTarget);
		setMenuMatch(match);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
		setMenuMatch(null);
	};

	const toLocalDatetimeString = date => {
		const d = new Date(date);
		const pad = n => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
			d.getMinutes()
		)}`;
	};

	const handleDuplicateClick = () => {
		setMenuAnchorEl(null);
		const baseDate = new Date(menuMatch.createdAt);
		baseDate.setSeconds(baseDate.getSeconds() + 30);
		setDupDate(toLocalDatetimeString(baseDate));
		setDupWinTeam(String(menuMatch.winTeam));
		setDupDialogOpen(true);
	};

	const handleDupDialogClose = () => {
		setDupDialogOpen(false);
		setMenuMatch(null);
	};

	const handleDuplicateSubmit = () => {
		if (!menuMatch || !dupDate) return;
		setDupLoading(true);
		const dateToSend = new Date(dupDate).toISOString();
		dispatch(Actions.duplicateMatch(user.reprGroup.groupId, menuMatch.gameId, dateToSend, Number(dupWinTeam)))
			.then(() => {
				setDupDialogOpen(false);
				setMenuMatch(null);
				dispatch(Actions.getMatchHistory(user.reprGroup.groupId, 1, rowsPerPage, searchText));
			})
			.finally(() => {
				setDupLoading(false);
			});
	};

	const handleCancelClick = () => {
		setMenuAnchorEl(null);
		setCancelDialogOpen(true);
	};

	const handleCancelDialogClose = () => {
		setCancelDialogOpen(false);
		setMenuMatch(null);
	};

	const handleCancelSubmit = () => {
		if (!menuMatch) return;
		const groupId = user.reprGroup.groupId;
		const matchId = menuMatch.gameId;
		setCancelDialogOpen(false);
		setMenuMatch(null);
		dispatch(Actions.cancelMatch(groupId, matchId)).catch(() => {
			dispatch(Actions.getMatchHistory(groupId, serverPage, rowsPerPage, searchText));
		});
	};

	useEffect(() => {
		// 모바일 쿠키 세션 복원 중엔 reprGroup이 아직 없을 수 있다. 준비되면 user 변경으로 재실행.
		if (!user?.reprGroup?.groupId) return;
		dispatch(Actions.getMatchHistory(user.reprGroup.groupId, 1, rowsPerPage));
	}, [dispatch, user]);

	useEffect(() => {
		if (!user?.reprGroup?.groupId) return undefined;
		if (debounceTimer.current) clearTimeout(debounceTimer.current);
		debounceTimer.current = setTimeout(() => {
			dispatch(Actions.getMatchHistory(user.reprGroup.groupId, 1, rowsPerPage, searchText));
		}, 400);
		return () => clearTimeout(debounceTimer.current);
	}, [searchText, dispatch, user]);

	const handleChangePage = newPage => {
		dispatch(Actions.getMatchHistory(user.reprGroup.groupId, newPage, rowsPerPage, searchText));
	};

	if (!matches) {
		return <MatchHistorySkeleton />;
	}

	const renderDuplicateDialog = () => (
		<>
			<Menu
				anchorEl={menuAnchorEl}
				open={Boolean(menuAnchorEl)}
				onClose={handleMenuClose}
				slotProps={{ paper: { className: dialogClasses.menuPaper } }}
			>
				<MenuItem
					onClick={handleDuplicateClick}
					style={{ fontFamily: '"Noto Sans KR", sans-serif', fontSize: '1.2rem' }}
				>
					<span role="img" aria-label="copy" style={{ marginRight: 8 }}>
						📋
					</span>
					복제
				</MenuItem>
				{menuMatch && menuMatch.winTeam && (
					<MenuItem
						onClick={handleCancelClick}
						style={{ fontFamily: '"Noto Sans KR", sans-serif', fontSize: '1.2rem', color: '#ff5252' }}
					>
						<span role="img" aria-label="cancel" style={{ marginRight: 8 }}>
							❌
						</span>
						취소
					</MenuItem>
				)}
			</Menu>
			<Dialog
				open={dupDialogOpen}
				onClose={handleDupDialogClose}
				classes={{ paper: cx(dialogClasses.paperCyan, classes.dialogPaperWidth) }}
			>
				<DialogTitle className={dialogClasses.titleCyan}>매치 복제</DialogTitle>
				<DialogContent className={classes.dialogContent}>
					{menuMatch && (
						<div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
							{[menuMatch.team1, menuMatch.team2].map((team, ti) => (
								<div key={ti} style={{ flex: 1 }}>
									<div
										style={{
											fontFamily: '"Rajdhani", sans-serif',
											fontSize: '1.1rem',
											fontWeight: 700,
											color: 'rgba(255,255,255,0.7)',
											marginBottom: 8
										}}
									>
										<span role="img" aria-label={ti === 0 ? 'dog' : 'cat'}>
											{ti === 0 ? '🐶' : '🐱'}
										</span>{' '}
										Team {ti + 1}
									</div>
									{[...team.players]
										.sort((a, b) => b.rating - a.rating)
										.map(player => (
											<div
												key={player.puuid}
												style={{
													display: 'flex',
													alignItems: 'center',
													gap: 6,
													padding: '3px 0',
													fontFamily: '"Noto Sans KR", sans-serif',
													fontSize: '1.1rem',
													color: '#fff'
												}}
											>
												<img
													src={`/assets/images/ranked-emblems/Emblem_${getTierIconName(player.tier)}.webp`}
													alt={player.tier}
													style={{ width: 20, height: 20 }}
												/>
												<span
													style={{
														color: getTierColor(player.tier),
														fontFamily: '"Rajdhani", sans-serif',
														fontWeight: 700,
														fontSize: '1rem'
													}}
												>
													{getTierShortName(player.tier)}
												</span>
												<span>{player.name}</span>
											</div>
										))}
								</div>
							))}
						</div>
					)}
					<TextField
						label="날짜 및 시간"
						type="datetime-local"
						value={dupDate}
						onChange={e => setDupDate(e.target.value)}
						className={classes.dialogInput}
						fullWidth
						InputLabelProps={{ shrink: true }}
						style={{ marginBottom: 24 }}
					/>
					<FormControl component="fieldset">
						<FormLabel component="legend" className={classes.formLabel}>
							승리팀
						</FormLabel>
						<RadioGroup row value={dupWinTeam} onChange={e => setDupWinTeam(e.target.value)}>
							<FormControlLabel
								value="1"
								control={<Radio className={classes.radio} />}
								label={
									<span className={classes.radioLabel}>
										<span role="img" aria-label="dog">
											🐶
										</span>{' '}
										Team 1
									</span>
								}
							/>
							<FormControlLabel
								value="2"
								control={<Radio className={classes.radio} />}
								label={
									<span className={classes.radioLabel}>
										<span role="img" aria-label="cat">
											🐱
										</span>{' '}
										Team 2
									</span>
								}
							/>
						</RadioGroup>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDupDialogClose} className={dialogClasses.cancelBtn}>
						취소
					</Button>
					<Button
						onClick={handleDuplicateSubmit}
						className={dialogClasses.saveBtn}
						disabled={!dupDate || dupLoading}
					>
						{dupLoading ? <CircularProgress size={20} color="inherit" /> : '복제'}
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog
				open={cancelDialogOpen}
				onClose={handleCancelDialogClose}
				slotProps={{ paper: { className: dialogClasses.paperDestructive } }}
			>
				<DialogTitle className={dialogClasses.titleDestructive} style={{ color: '#ff6b6b' }}>
					매치 취소
				</DialogTitle>
				<DialogContent>
					<span
						style={{ fontFamily: '"Noto Sans KR", sans-serif', fontSize: '1.3rem', color: 'rgba(255,255,255,0.7)' }}
					>
						정말 이 매치를 취소하시겠습니까?
						<br />
						<span style={{ color: '#ff5252', fontSize: '1.1rem' }}>
							레이팅이 롤백되고 명예 투표 데이터가 삭제됩니다.
						</span>
					</span>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCancelDialogClose} className={dialogClasses.destructiveCancelBtn}>
						아니오
					</Button>
					<Button onClick={handleCancelSubmit} className={dialogClasses.destructiveConfirmBtn}>
						취소하기
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);

	return (
		<>
			{isAdmin && renderDuplicateDialog()}
			<MatchList
				matches={matches}
				total={total}
				page={serverPage}
				rowsPerPage={rowsPerPage}
				onPageChange={handleChangePage}
				isAdmin={isAdmin}
				onMenuOpen={handleMenuOpen}
				isHighlighted={p => !!searchText && p.name.toLowerCase().includes(searchText.toLowerCase())}
			/>
		</>
	);
}

export default MatchHistoryTable;
