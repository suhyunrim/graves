import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getTierName, getTierShortLabel, getTierEmblemUrl } from 'app/main/tournament/tournamentUtils';
import PositionIcon from '../tournament/PositionIcon';
import { fetchEntangledMatches } from './compareApi';

const A_COLOR = '#00d4ff';
const B_COLOR = '#ff6b9a';
const GOOD_COLOR = '#00ff7f';
const BAD_COLOR = '#ff6b6b';
const PAGE_SIZE = 10;

// Riot 표준 포지션 키(대문자) → PositionIcon용 소문자 키.
const POSITION_ICON = { TOP: 'top', JUNGLE: 'jungle', MIDDLE: 'mid', BOTTOM: 'adc', UTILITY: 'support' };
// 로스터 정렬 순서(탑→정글→미드→원딜→서폿). 포지션 미상은 뒤로.
const POSITION_ORDER = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
const posRank = pos => {
	const i = POSITION_ORDER.indexOf(pos);
	return i === -1 ? POSITION_ORDER.length : i;
};
// 닉네임#태그(Riot ID)에서 #태그(tagLine) 제거.
const stripTag = name => (name ? name.split('#')[0] : name);

function fmtDate(v) {
	if (!v) return '-';
	const d = new Date(v);
	if (Number.isNaN(d.getTime())) return '-';
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${d.getFullYear()}.${mm}.${dd}`;
}

const useStyles = makeStyles()((theme) => ({
	section: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		border: '1px solid rgba(0, 212, 255, 0.15)',
		borderRadius: 18,
		padding: '22px 24px',
		[theme.breakpoints.down('sm')]: {
			padding: '16px 14px',
			borderRadius: 14
		}
	},
	title: {
		position: 'relative',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.7rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.03em',
		paddingLeft: 14,
		marginBottom: 18,
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		'&::before': {
			content: '""',
			position: 'absolute',
			left: 0,
			top: 2,
			bottom: 2,
			width: 4,
			borderRadius: 2,
			background: 'linear-gradient(180deg, #00d4ff, #0066ff)'
		}
	},
	countLabel: {
		fontSize: '1.2rem',
		fontWeight: 400,
		color: 'rgba(255, 255, 255, 0.45)'
	},
	stateText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		color: 'rgba(255, 255, 255, 0.4)',
		padding: '10px 2px'
	},
	list: {
		display: 'flex',
		flexDirection: 'column'
	},
	row: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		padding: '11px 6px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		cursor: 'pointer',
		background: 'none',
		border: 'none',
		borderRadius: 8,
		width: '100%',
		textAlign: 'left',
		transition: 'background 0.15s ease',
		'&:hover': {
			background: 'rgba(255, 255, 255, 0.03)'
		},
		[theme.breakpoints.down('sm')]: {
			flexWrap: 'wrap',
			gap: 8
		}
	},
	result: {
		flex: 1,
		minWidth: 110,
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.9)'
	},
	pvp: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		flexShrink: 0
	},
	pvpSide: {
		display: 'flex',
		alignItems: 'center',
		gap: 4
	},
	posIcon: {
		width: 18,
		height: 18
	},
	tierEmblem: {
		width: 18,
		height: 18
	},
	posFallback: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	tierText: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 700
	},
	pvpDivider: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.3)'
	},
	date: {
		flexShrink: 0,
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		minWidth: 90,
		textAlign: 'right'
	},
	chevron: {
		flexShrink: 0,
		color: 'rgba(255, 255, 255, 0.35)',
		transition: 'transform 0.2s ease',
		'& svg': { fontSize: '2rem' }
	},
	chevronOpen: {
		transform: 'rotate(180deg)',
		color: '#00d4ff'
	},
	roster: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: 12,
		padding: '12px 6px 18px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		[theme.breakpoints.down('sm')]: {
			gridTemplateColumns: '1fr'
		}
	},
	team: {
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.07)',
		borderRadius: 12,
		padding: '10px 12px'
	},
	teamHeader: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		marginBottom: 8,
		letterSpacing: '0.03em'
	},
	player: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		padding: '4px 6px',
		borderRadius: 8
	},
	playerHi: {
		border: '1px solid var(--hi)',
		background: 'var(--hi-bg)'
	},
	playerPos: {
		width: 18,
		height: 18,
		flexShrink: 0
	},
	playerName: {
		flex: 1,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.85)',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	playerTierWrap: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4,
		flexShrink: 0
	},
	playerTier: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.5)'
	},
	pager: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 16,
		marginTop: 16
	},
	pageBtn: {
		background: 'rgba(0, 212, 255, 0.1)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		color: '#00d4ff',
		borderRadius: 8,
		cursor: 'pointer',
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		padding: '4px 14px',
		'&:hover:not(:disabled)': {
			background: 'rgba(0, 212, 255, 0.2)'
		},
		'&:disabled': {
			opacity: 0.3,
			cursor: 'default'
		}
	},
	pageInfo: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.7)',
		minWidth: 70,
		textAlign: 'center'
	}
}));

function EntangledMatches({ groupId, puuidA, puuidB, nameA, nameB, className, style }) {
	const { classes, cx } = useStyles();
	const [page, setPage] = useState(0);
	const [expandedId, setExpandedId] = useState(null);
	const [state, setState] = useState({ loading: false, error: null, result: null });

	useEffect(() => {
		if (!groupId || !puuidA || !puuidB) return undefined;
		let cancelled = false;
		setState(s => ({ ...s, loading: true, error: null }));
		fetchEntangledMatches(groupId, puuidA, puuidB, page, PAGE_SIZE)
			.then(result => {
				if (!cancelled) setState({ loading: false, error: null, result });
			})
			.catch(err => {
				if (!cancelled) setState({ loading: false, error: err?.response?.status || 0, result: null });
			});
		return () => {
			cancelled = true;
		};
	}, [groupId, puuidA, puuidB, page]);

	const changePage = next => {
		setExpandedId(null);
		setPage(next);
	};

	const result = state.result;
	const total = result ? result.total : 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const renderTierText = (rating, color) => (
		<span className={classes.tierText} style={{ color }}>
			{getTierShortLabel(rating) || '-'}
		</span>
	);

	const renderSide = (player, color) => {
		if (!player) return null;
		const icon = player.position ? POSITION_ICON[player.position] : null;
		const tierName = getTierName(player.rating);
		return (
			<span className={classes.pvpSide}>
				{icon && <PositionIcon position={icon} className={classes.posIcon} />}
				{tierName && <img className={classes.tierEmblem} src={getTierEmblemUrl(tierName)} alt={tierName} />}
				{renderTierText(player.rating, color)}
			</span>
		);
	};

	const renderRoster = item => {
		// A가 속한 팀을 위로.
		const teams = [...item.teams].sort((x, y) => {
			const xa = x.players.some(p => p.isA) ? 0 : 1;
			const ya = y.players.some(p => p.isA) ? 0 : 1;
			return xa - ya;
		});
		return (
			<div className={classes.roster}>
				{teams.map(team => (
					<div className={classes.team} key={team.teamNo}>
						<div className={classes.teamHeader} style={{ color: team.won ? GOOD_COLOR : BAD_COLOR }}>
							{team.won ? '승리 팀' : '패배 팀'}
						</div>
						{[...team.players].sort((p1, p2) => posRank(p1.position) - posRank(p2.position)).map(pl => {
							const icon = pl.position ? POSITION_ICON[pl.position] : null;
							const hi = pl.isA ? A_COLOR : pl.isB ? B_COLOR : null;
							const plTierName = getTierName(pl.rating);
							return (
								<div
									className={cx(classes.player, hi && classes.playerHi)}
									key={pl.puuid}
									style={hi ? { '--hi': `${hi}66`, '--hi-bg': `${hi}14` } : undefined}
								>
									{icon ? (
										<PositionIcon
											position={icon}
											className={classes.playerPos}
											fallbackClassName={classes.posFallback}
										/>
									) : (
										<span className={classes.playerPos} />
									)}
									<span
										className={classes.playerName}
										style={hi ? { color: hi, fontWeight: 700 } : undefined}
									>
										{stripTag(pl.name)}
									</span>
									<span className={classes.playerTierWrap}>
										{plTierName && (
											<img
												className={classes.tierEmblem}
												src={getTierEmblemUrl(plTierName)}
												alt={plTierName}
											/>
										)}
										<span className={classes.playerTier}>{getTierShortLabel(pl.rating) || '-'}</span>
									</span>
								</div>
							);
						})}
					</div>
				))}
			</div>
		);
	};

	const renderRow = item => {
		const all = item.teams.flatMap(t => t.players);
		const aPlayer = all.find(p => p.isA);
		const bPlayer = all.find(p => p.isB);
		let resultText;
		let resultColor = 'rgba(255,255,255,0.9)';
		if (item.sameTeam) {
			resultText = item.aWon ? '함께 승리' : '함께 패배';
			resultColor = item.aWon ? GOOD_COLOR : BAD_COLOR;
		} else {
			resultText = item.aWon ? `${nameA} 승` : `${nameB} 승`;
			resultColor = item.aWon ? A_COLOR : B_COLOR;
		}
		const open = expandedId === item.gameId;
		return (
			<React.Fragment key={item.gameId}>
				<button
					type="button"
					className={classes.row}
					onClick={() => setExpandedId(open ? null : item.gameId)}
					aria-expanded={open}
				>
					<span className={classes.result} style={{ color: resultColor }}>
						{resultText}
					</span>
					<span className={classes.pvp}>
						{renderSide(aPlayer, A_COLOR)}
						<span className={classes.pvpDivider}>vs</span>
						{renderSide(bPlayer, B_COLOR)}
					</span>
					<span className={classes.date}>{fmtDate(item.date)}</span>
					<span className={cx(classes.chevron, open && classes.chevronOpen)}>
						<ExpandMoreIcon />
					</span>
				</button>
				{open && renderRoster(item)}
			</React.Fragment>
		);
	};

	const items = result ? result.items : [];

	return (
		<div className={cx(classes.section, className)} style={style}>
			<div className={classes.title}>
				<span role="img" aria-label="scroll">
					📜
				</span>
				얽힌 경기 히스토리
				{total > 0 && <span className={classes.countLabel}>총 {total}경기</span>}
			</div>

			{state.error ? (
				<div className={classes.stateText}>경기 기록을 불러오지 못했어요.</div>
			) : items.length === 0 ? (
				<div className={classes.stateText}>{state.loading ? '불러오는 중…' : '얽힌 경기가 없어요.'}</div>
			) : (
				<>
					<div className={classes.list}>{items.map(renderRow)}</div>
					{pageCount > 1 && (
						<div className={classes.pager}>
							<button
								type="button"
								className={classes.pageBtn}
								onClick={() => changePage(page - 1)}
								disabled={page <= 0 || state.loading}
								aria-label="이전 페이지"
							>
								◀
							</button>
							<span className={classes.pageInfo}>
								{page + 1} / {pageCount}
							</span>
							<button
								type="button"
								className={classes.pageBtn}
								onClick={() => changePage(page + 1)}
								disabled={page >= pageCount - 1 || state.loading}
								aria-label="다음 페이지"
							>
								▶
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}

export default EntangledMatches;
