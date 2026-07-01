import React from 'react';
import { makeStyles } from 'tss-react/mui';
import StarIcon from '@mui/icons-material/Star';
import PositionIcon from './PositionIcon';
import {
	getTierName,
	getTierLabel,
	getTierShortLabel,
	getTierEmblemUrl,
	displayNameForPuuid
} from './tournamentUtils';
import { getProfileIconUrl } from 'app/main/challenge/ddragonUtils';

// 참가팀 리스트(TournamentDetail)의 팀 카드 UI를 링크/수정·삭제 없이 재사용하는 컴포넌트.
// 승부예측 팝업 등에서 팀 로스터를 그대로 보여주는 용도.
const useStyles = makeStyles()(() => ({
	root: {
		minWidth: 0
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		gap: 6,
		marginBottom: 8
	},
	teamName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: '#00d4ff',
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	selectedStar: {
		fontSize: '1.35rem',
		color: '#ffd700',
		flexShrink: 0
	},
	tierBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 6,
		marginBottom: 10,
		padding: '3px 10px',
		borderRadius: 20,
		background: 'rgba(0, 0, 0, 0.3)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		letterSpacing: '0.02em',
		color: 'rgba(255, 255, 255, 0.85)'
	},
	tierEmblem: {
		width: 20,
		height: 20
	},
	memberList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 6
	},
	memberRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		padding: '2px 0',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.85)'
	},
	positionCell: {
		width: 22,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0
	},
	positionIcon: {
		width: 20,
		height: 20,
		color: '#00d4ff'
	},
	positionFallback: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '0.95rem',
		color: 'rgba(0, 212, 255, 0.7)',
		fontWeight: 600
	},
	avatar: {
		width: 24,
		height: 24,
		borderRadius: 6,
		flexShrink: 0
	},
	avatarPlaceholder: {
		width: 24,
		height: 24,
		borderRadius: 6,
		background: 'rgba(0, 212, 255, 0.15)',
		flexShrink: 0
	},
	memberName: {
		flex: 1,
		minWidth: 0,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	captainStar: {
		fontSize: '1.2rem',
		color: '#ffd700',
		flexShrink: 0
	},
	memberTier: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 4,
		flexShrink: 0
	},
	memberTierEmblem: {
		width: 18,
		height: 18,
		opacity: 0.9
	},
	memberTierShort: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.05rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.7)',
		letterSpacing: '0.02em',
		minWidth: 18,
		textAlign: 'right'
	}
}));

function TeamRosterCard({ team, selected = false }) {
	const { classes } = useStyles();
	if (!team) return null;

	const tierName = getTierName(team.avgRating);
	const tierLabel = getTierLabel(team.avgRating);
	const tierEmblem = tierName ? getTierEmblemUrl(tierName) : null;

	return (
		<div className={classes.root}>
			<div className={classes.header}>
				<span className={classes.teamName}>{team.name}</span>
				{selected && <StarIcon className={classes.selectedStar} />}
			</div>
			{tierLabel && (
				<div className={classes.tierBadge}>
					{tierEmblem && <img src={tierEmblem} alt={tierName} className={classes.tierEmblem} />}
					팀 평균 {tierLabel}
				</div>
			)}
			<div className={classes.memberList}>
				{(team.members || []).map(m => {
					const displayName = displayNameForPuuid(m.name, m.puuid);
					const avatarUrl = m.profileIconId ? getProfileIconUrl(m.profileIconId) : null;
					const memberTierName = getTierName(m.rating);
					const memberTierLabel = getTierLabel(m.rating);
					const memberTierShort = getTierShortLabel(m.rating);
					const memberTierEmblem = getTierEmblemUrl(memberTierName);
					const isCaptain = team.captainPuuid === m.puuid;
					return (
						<div key={m.puuid} className={classes.memberRow}>
							<div className={classes.positionCell}>
								<PositionIcon
									position={m.position}
									className={classes.positionIcon}
									fallbackClassName={classes.positionFallback}
								/>
							</div>
							{avatarUrl ? (
								<img src={avatarUrl} alt="" className={classes.avatar} />
							) : (
								<div className={classes.avatarPlaceholder} />
							)}
							<span className={classes.memberName}>{displayName}</span>
							{isCaptain && <StarIcon className={classes.captainStar} />}
							{memberTierShort && (
								<span className={classes.memberTier} title={memberTierLabel}>
									{memberTierEmblem && (
										<img src={memberTierEmblem} alt="" className={classes.memberTierEmblem} />
									)}
									<span className={classes.memberTierShort}>{memberTierShort}</span>
								</span>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default TeamRosterCard;
