import React from 'react';
import { makeStyles } from 'tss-react/mui';
import useMediaQuery from '@mui/material/useMediaQuery';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { getChampionIcon } from 'app/main/challenge/ddragonUtils';
import useDialogStyles from '../components/dialogStyles';
import { POSITION_ICON_KEY } from '../components/matchStatUtils';
import PositionIcon from '../tournament/PositionIcon';
import { getChampBadges, getMetricColor } from './championBadges';

const useStyles = makeStyles()(() => ({
	// 표준 cyan 다이얼로그(useDialogStyles) 위에 이 다이얼로그 고유 오버라이드만 유지
	paperWide: {
		width: '100%',
		maxWidth: 900
	},
	contentScroll: {
		overflowY: 'auto',
		maxHeight: '60vh'
	},
	actionsRow: {
		display: 'flex',
		justifyContent: 'flex-end'
	},
	scrollX: {
		overflowX: 'auto'
	},
	table: {
		width: '100%',
		borderCollapse: 'collapse'
	},
	th: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.5)',
		textTransform: 'uppercase',
		letterSpacing: '0.05em',
		textAlign: 'right',
		padding: '8px 10px',
		borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
		whiteSpace: 'nowrap'
	},
	thChamp: {
		textAlign: 'left'
	},
	td: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.3rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.85)',
		textAlign: 'right',
		padding: '8px 10px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		whiteSpace: 'nowrap'
	},
	champCell: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		textAlign: 'left'
	},
	champImg: {
		width: 36,
		height: 36,
		borderRadius: '50%',
		objectFit: 'cover',
		border: '2px solid rgba(0, 212, 255, 0.3)',
		flexShrink: 0
	},
	champName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.25rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.92)',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		maxWidth: 120
	},
	champNameNarrow: {
		maxWidth: 80
	},
	badge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.9rem',
		fontWeight: 700,
		padding: '2px 7px',
		borderRadius: 6,
		border: '1px solid currentColor',
		flexShrink: 0
	},
	kdaDetail: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	posSlot: {
		width: 16,
		height: 16,
		flexShrink: 0,
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	posIcon: {
		width: 16,
		height: 16,
		objectFit: 'contain'
	},
	posFallback: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '0.85rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.55)'
	},
	winHigh: {
		color: '#00ff7f'
	},
	// ===== 모바일 컴팩트 목록 (sm 미만) =====
	mList: {
		display: 'flex',
		flexDirection: 'column'
	},
	mRow: {
		padding: '8px 0',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
		'&:last-of-type': {
			borderBottom: 'none'
		}
	},
	mTop: {
		display: 'flex',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 8
	},
	mGames: {
		marginLeft: 'auto',
		flexShrink: 0,
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.85)'
	},
	mStats: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.55)',
		lineHeight: 1.6,
		paddingLeft: 24,
		marginTop: 2
	},
	mStatValue: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.85)'
	}
}));

// 내전 챔피언 전체 목록 다이얼로그 (판수순, op.gg식 상세 지표)
function InternalChampionsDialog({ open, onClose, champions, totalGames }) {
	const { classes, cx } = useStyles();
	const { classes: dialogClasses } = useDialogStyles();
	const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));
	const list = champions || [];

	// 포지션 + 챔프 아이콘 + 이름 + 뱃지 — 테이블/모바일 공용
	const renderChampIdentity = c => {
		const name = c.championKoName || c.championName;
		const badges = getChampBadges(c, totalGames);
		const posKey = POSITION_ICON_KEY[c.mainPosition];
		return (
			<>
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
				<span className={cx(classes.champName, isMobile && classes.champNameNarrow)} title={name}>
					{name}
				</span>
				{badges.map(b => (
					<span key={b.key} className={classes.badge} style={{ color: b.color }}>
						{b.label}
					</span>
				))}
			</>
		);
	};

	const renderTable = () => (
		<div className={classes.scrollX}>
			<table className={classes.table}>
				<thead>
					<tr>
						<th className={`${classes.th} ${classes.thChamp}`}>챔피언</th>
						<th className={classes.th}>판수</th>
						<th className={classes.th}>승률</th>
						<th className={classes.th}>KDA</th>
						<th className={classes.th}>평균 K / D / A</th>
						<th className={classes.th}>킬관여</th>
						<th className={classes.th}>DPM</th>
						<th className={classes.th}>GPM</th>
						<th className={classes.th}>CS/분</th>
					</tr>
				</thead>
				<tbody>
					{list.map(c => (
						<tr key={c.championId}>
							<td className={classes.td}>
								<div className={classes.champCell}>{renderChampIdentity(c)}</div>
							</td>
							<td className={classes.td}>{c.games}</td>
							<td className={`${classes.td} ${c.winRate >= 50 ? classes.winHigh : ''}`}>{c.winRate}%</td>
							<td className={classes.td}>{typeof c.kda === 'number' ? c.kda.toFixed(2) : '-'}</td>
							<td className={classes.td}>
								<span className={classes.kdaDetail}>
									{c.kills} / {c.deaths} / {c.assists}
								</span>
							</td>
							<td className={classes.td} style={{ color: getMetricColor('killParticipation', c.killParticipation) }}>
								{c.killParticipation != null ? `${c.killParticipation}%` : '-'}
							</td>
							<td className={classes.td} style={{ color: getMetricColor('dpm', c.dpm) }}>
								{c.dpm != null ? c.dpm : '-'}
							</td>
							<td className={classes.td}>{c.gpm != null ? c.gpm : '-'}</td>
							<td className={classes.td}>{c.csPerMin != null ? c.csPerMin : '-'}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);

	// 모바일: 가로 스크롤 테이블 대신 챔피언별 2줄 세로 스택
	const renderMobileList = () => (
		<div className={classes.mList}>
			{list.map(c => (
				<div key={c.championId} className={classes.mRow}>
					<div className={classes.mTop}>
						{renderChampIdentity(c)}
						<span className={classes.mGames}>
							{c.games}판 · <span className={c.winRate >= 50 ? classes.winHigh : undefined}>{c.winRate}%</span>
						</span>
					</div>
					<div className={classes.mStats}>
						KDA <span className={classes.mStatValue}>{typeof c.kda === 'number' ? c.kda.toFixed(2) : '-'}</span>{' '}
						({c.kills} / {c.deaths} / {c.assists})
						{c.killParticipation != null && (
							<>
								{' · 킬관여 '}
								<span
									className={classes.mStatValue}
									style={{ color: getMetricColor('killParticipation', c.killParticipation) }}
								>
									{c.killParticipation}%
								</span>
							</>
						)}
						{c.dpm != null && (
							<>
								{' · DPM '}
								<span className={classes.mStatValue} style={{ color: getMetricColor('dpm', c.dpm) }}>
									{c.dpm}
								</span>
							</>
						)}
						{c.gpm != null && (
							<>
								{' · GPM '}
								<span className={classes.mStatValue}>{c.gpm}</span>
							</>
						)}
						{c.csPerMin != null && (
							<>
								{' · CS/분 '}
								<span className={classes.mStatValue}>{c.csPerMin}</span>
							</>
						)}
					</div>
				</div>
			))}
		</div>
	);

	return (
		<Dialog open={open} onClose={onClose} classes={{ paper: cx(dialogClasses.paperCyan, classes.paperWide) }}>
			<div className={dialogClasses.titleCyan}>내전 챔피언 전체 보기</div>
			<div className={dialogClasses.subtitle}>
				{list.length}챔피언 · 수집 {totalGames}판 기준
			</div>
			<div className={cx(dialogClasses.contentPad, classes.contentScroll)}>
				{isMobile ? renderMobileList() : renderTable()}
			</div>
			<div className={cx(dialogClasses.actionsPad, classes.actionsRow)}>
				<Button className={dialogClasses.cancelBtn} onClick={onClose}>
					닫기
				</Button>
			</div>
		</Dialog>
	);
}

export default InternalChampionsDialog;
