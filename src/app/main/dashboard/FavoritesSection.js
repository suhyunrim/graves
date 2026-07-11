import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import StarIcon from '@mui/icons-material/Star';
import { getProfileIconUrl } from 'app/main/challenge/ddragonUtils';
import { getTierName, getTierShortLabel, getTierEmblemUrl } from 'app/main/tournament/tournamentUtils';
import { Reveal, RevealGroup } from '../components/Reveal';

const useStyles = makeStyles()(() => ({
	section: {
		marginBottom: 24
	},
	sectionTitle: {
		position: 'relative',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.05em',
		paddingLeft: 14,
		marginBottom: 12,
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
	count: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 400,
		color: 'rgba(255, 255, 255, 0.4)'
	},
	cards: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: 12
	},
	card: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		padding: '10px 14px',
		borderRadius: 12,
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		border: '1px solid rgba(0, 212, 255, 0.2)',
		textDecoration: 'none',
		transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
		'&:hover': {
			transform: 'translateY(-2px)',
			borderColor: 'rgba(0, 212, 255, 0.5)',
			boxShadow: '0 8px 20px rgba(0, 212, 255, 0.15)'
		}
	},
	avatar: {
		width: 36,
		height: 36,
		borderRadius: '50%',
		border: '1px solid rgba(0, 212, 255, 0.3)'
	},
	info: {
		display: 'flex',
		flexDirection: 'column',
		gap: 2
	},
	name: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.92)',
		lineHeight: 1.2
	},
	meta: {
		display: 'flex',
		alignItems: 'center',
		gap: 5
	},
	tierEmblem: {
		width: 18,
		height: 18
	},
	tierLabel: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.15rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.7)'
	},
	leftBadge: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		fontWeight: 600,
		color: '#ff6b6b',
		background: 'rgba(255, 107, 107, 0.12)',
		border: '1px solid rgba(255, 107, 107, 0.3)',
		borderRadius: 4,
		padding: '1px 6px'
	},
	removeBtn: {
		padding: 4,
		marginLeft: 2,
		color: '#ffd700',
		'&:hover': {
			color: 'rgba(255, 215, 0, 0.6)',
			background: 'rgba(255, 215, 0, 0.1)'
		}
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.4)',
		padding: '4px 0 4px 14px'
	}
}));

// 대시보드 즐겨찾기 목록 — 카드 클릭 시 프로필 이동, ★ 클릭 시 제거.
function FavoritesSection({ favorites, onRemove }) {
	const { classes } = useStyles();

	return (
		<div className={classes.section}>
			<Reveal>
				<div className={classes.sectionTitle}>
					<span role="img" aria-label="star">⭐</span>
					즐겨찾기
					{favorites.length > 0 && <span className={classes.count}>({favorites.length}/10)</span>}
				</div>
			</Reveal>
			{favorites.length === 0 ? (
				<Reveal delay={0.06}>
					<div className={classes.emptyText}>
						유저 검색에서 ★를 눌러 자주 보는 유저를 등록해 보세요 (최대 10명)
					</div>
				</Reveal>
			) : (
				<RevealGroup className={classes.cards}>
					{favorites.map(fav => (
						<Link key={fav.puuid} to={`/userinfo/${fav.puuid}`} className={classes.card}>
							{fav.profileIconId != null && (
								<img className={classes.avatar} src={getProfileIconUrl(fav.profileIconId)} alt="" />
							)}
							<div className={classes.info}>
								<span className={classes.name}>{fav.name}</span>
								<span className={classes.meta}>
									{getTierName(fav.rating) && (
										<>
											<img
												className={classes.tierEmblem}
												src={getTierEmblemUrl(getTierName(fav.rating))}
												alt={getTierName(fav.rating)}
											/>
											<span className={classes.tierLabel}>{getTierShortLabel(fav.rating)}</span>
										</>
									)}
									{fav.leftGuildAt != null && <span className={classes.leftBadge}>탈퇴</span>}
								</span>
							</div>
							<IconButton
								className={classes.removeBtn}
								size="small"
								aria-label="즐겨찾기 제거"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onRemove(fav);
								}}
							>
								<StarIcon fontSize="small" />
							</IconButton>
						</Link>
					))}
				</RevealGroup>
			)}
		</div>
	);
}

export default FavoritesSection;
