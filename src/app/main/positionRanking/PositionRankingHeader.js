import React from 'react';
import { Typography, Tooltip, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { makeStyles } from 'tss-react/mui';
import { useDispatch, useSelector } from 'react-redux';
import PositionIcon from '../tournament/PositionIcon';
import * as Actions from './store/actions';

// Riot 표준 포지션 키 → 한글 라벨 + PositionIcon용 키(소문자).
// 표시는 항상 탑 → 정글 → 미드 → 원딜 → 서폿 순서 고정.
const POSITIONS = [
	{ key: 'TOP', label: '탑', icon: 'top' },
	{ key: 'JUNGLE', label: '정글', icon: 'jungle' },
	{ key: 'MIDDLE', label: '미드', icon: 'mid' },
	{ key: 'BOTTOM', label: '원딜', icon: 'adc' },
	{ key: 'UTILITY', label: '서폿', icon: 'support' }
];

const useStyles = makeStyles()((theme) => ({
	root: {
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
			fontSize: '2.75rem'
		}
	},
	subtitleRow: {
		display: 'flex',
		alignItems: 'center',
		marginTop: 10
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.6)',
		letterSpacing: '0.05em',
		[theme.breakpoints.down('md')]: {
			fontSize: '1.35rem'
		}
	},
	infoIcon: {
		color: 'rgba(255,255,255,0.3)',
		fontSize: '1.6rem',
		padding: 2,
		marginLeft: 4
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
	tabsRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginTop: 16,
		[theme.breakpoints.down('md')]: {
			flexWrap: 'wrap'
		}
	},
	positionChip: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		padding: '6px 16px',
		borderRadius: 16,
		background: 'rgba(255, 255, 255, 0.08)',
		border: '1px solid rgba(255, 255, 255, 0.1)',
		color: 'rgba(255, 255, 255, 0.7)',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 500,
		cursor: 'pointer',
		transition: 'all 0.2s ease',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.15)',
			borderColor: 'rgba(0, 212, 255, 0.3)'
		}
	},
	positionChipActive: {
		background: 'rgba(0, 212, 255, 0.2)',
		borderColor: '#00d4ff',
		color: '#00d4ff'
	},
	positionChipIcon: {
		width: 18,
		height: 18
	},
	// 칩에 이미 한글 라벨이 있으므로 아이콘 로드 실패 시 텍스트 fallback은 숨긴다
	positionChipIconFallback: {
		display: 'none'
	}
}));

function PositionRankingHeader() {
	const { classes } = useStyles();
	const dispatch = useDispatch();
	const position = useSelector(({ PositionRanking }) => PositionRanking.positionRanking.position);

	return (
		<div className={classes.root}>
			<Typography className={classes.title} variant="h4">
				Position Ranking
			</Typography>
			<div className={classes.subtitleRow}>
				<Typography className={classes.subtitle}>내전 포지션 포인트 순위</Typography>
				<Tooltip
					title={
						<>
							내전 결과를 자체 공식으로 환산한 포인트로 순위를 매기는 랭킹입니다.
							<br />
							10명의 포지션이 모두 정해진 내전만 반영됩니다.
							<br />
							포지션별 5판 이상 플레이한 유저만 표시됩니다.
						</>
					}
					classes={{ tooltip: classes.tooltip }}
					placement="bottom-start"
					arrow
					enterTouchDelay={0}
					leaveTouchDelay={5000}
				>
					<IconButton className={classes.infoIcon} size="small">
						<InfoOutlinedIcon style={{ fontSize: 'inherit' }} />
					</IconButton>
				</Tooltip>
			</div>
			<div className={classes.tabsRow}>
				{POSITIONS.map(pos => (
					<div
						key={pos.key}
						className={`${classes.positionChip} ${position === pos.key ? classes.positionChipActive : ''}`}
						onClick={() => dispatch(Actions.setPosition(pos.key))}
						role="button"
						tabIndex={0}
						onKeyDown={e => e.key === 'Enter' && dispatch(Actions.setPosition(pos.key))}
					>
						<PositionIcon
							position={pos.icon}
							className={classes.positionChipIcon}
							fallbackClassName={classes.positionChipIconFallback}
						/>
						{pos.label}
					</div>
				))}
			</div>
		</div>
	);
}

export default PositionRankingHeader;
