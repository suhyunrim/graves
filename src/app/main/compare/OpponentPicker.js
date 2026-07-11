import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { getProfileIconUrl } from 'app/main/challenge/ddragonUtils';
import { getTierName, getTierShortLabel, getTierEmblemUrl } from 'app/main/tournament/tournamentUtils';
import { fetchGroupMembers } from 'app/main/myinfo/profileApi';
import { fetchFavorites } from 'app/utility/favoritesApi';
import { Reveal, RevealGroup } from '../components/Reveal';

// 비교 상대 선택 — 대시보드의 유저 검색(UserSearchBar)/즐겨찾기와 같은 데이터·스타일을 재사용한다.
// anchorPuuid(비교 기준 A)는 후보에서 제외한다. 선택 시 onSelect(member) 호출.
const useStyles = makeStyles()((theme) => ({
	root: {
		maxWidth: 620,
		margin: '0 auto',
		padding: '40px 24px 60px',
		[theme.breakpoints.down('sm')]: {
			padding: '24px 12px 40px'
		}
	},
	prompt: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2rem',
		fontWeight: 700,
		color: '#fff',
		textAlign: 'center',
		marginBottom: 6,
		letterSpacing: '0.03em'
	},
	promptAnchor: {
		color: '#00d4ff'
	},
	promptSub: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.4)',
		textAlign: 'center',
		marginBottom: 28
	},
	searchField: {
		width: '100%',
		'& .MuiInputBase-root': {
			color: '#fff',
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.5rem',
			background: 'rgba(255, 255, 255, 0.04)',
			borderRadius: 12
		},
		'& .MuiInputBase-input::placeholder': {
			color: 'rgba(255, 255, 255, 0.4)',
			opacity: 1
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(255, 255, 255, 0.2)'
		},
		'& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.5)'
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: '#00d4ff'
		}
	},
	searchIcon: {
		color: 'rgba(0, 212, 255, 0.6)'
	},
	paper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		color: '#fff',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		borderRadius: 12,
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
		'& .MuiAutocomplete-noOptions': {
			color: 'rgba(255, 255, 255, 0.4)',
			fontFamily: '"Noto Sans KR", sans-serif'
		},
		'& .MuiAutocomplete-option': {
			fontFamily: '"Noto Sans KR", sans-serif',
			'&:hover, &.Mui-focused': {
				background: 'rgba(0, 212, 255, 0.08)'
			}
		}
	},
	option: {
		display: 'flex',
		alignItems: 'center',
		gap: 10,
		width: '100%'
	},
	optionAvatar: {
		width: 28,
		height: 28,
		borderRadius: '50%',
		border: '1px solid rgba(0, 212, 255, 0.3)'
	},
	optionName: {
		flex: 1,
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.9)',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	optionTier: {
		display: 'flex',
		alignItems: 'center',
		gap: 4
	},
	optionTierEmblem: {
		width: 20,
		height: 20
	},
	optionTierLabel: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 700,
		color: 'rgba(255, 255, 255, 0.7)'
	},
	favSection: {
		marginTop: 36
	},
	favTitle: {
		position: 'relative',
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		color: '#fff',
		letterSpacing: '0.04em',
		paddingLeft: 14,
		marginBottom: 14,
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
		cursor: 'pointer',
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
		gap: 2,
		alignItems: 'flex-start'
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
	}
}));

function OpponentPicker({ groupId, anchorPuuid, onSelect }) {
	const { classes } = useStyles();
	const [members, setMembers] = useState([]);
	const [favorites, setFavorites] = useState([]);
	const [inputValue, setInputValue] = useState('');
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!groupId) return;
		fetchGroupMembers(groupId)
			.then(list => setMembers(list || []))
			.catch(() => setMembers([]));
		fetchFavorites(groupId)
			.then(list => setFavorites(list || []))
			.catch(() => setFavorites([]));
	}, [groupId]);

	const anchor = members.find(m => m.puuid === anchorPuuid);
	const options = members.filter(m => m.puuid !== anchorPuuid);
	const favs = favorites.filter(f => f.puuid !== anchorPuuid);

	const renderTier = rating => {
		const tierName = getTierName(rating);
		if (!tierName) return null;
		return (
			<span className={classes.optionTier}>
				<img className={classes.optionTierEmblem} src={getTierEmblemUrl(tierName)} alt={tierName} />
				<span className={classes.optionTierLabel}>{getTierShortLabel(rating)}</span>
			</span>
		);
	};

	return (
		<div className={classes.root}>
			<Reveal>
				<div className={classes.prompt}>
					{anchor && <span className={classes.promptAnchor}>{anchor.name}</span>}
					{anchor ? ' 와(과) 비교할 상대' : '비교할 상대 선택'}
				</div>
			</Reveal>
			<Reveal delay={0.05}>
				<div className={classes.promptSub}>검색하거나 즐겨찾기에서 골라주세요</div>
			</Reveal>

			<Reveal delay={0.1}>
				<Autocomplete
					options={options}
					value={null}
					inputValue={inputValue}
					onInputChange={(_e, value, reason) => {
						setInputValue(reason === 'reset' ? '' : value);
					}}
					onChange={(_e, member) => {
						if (member) onSelect(member);
					}}
					open={open && inputValue.trim().length > 0}
					onOpen={() => setOpen(true)}
					onClose={() => setOpen(false)}
					getOptionLabel={m => (m && m.name) || ''}
					isOptionEqualToValue={(opt, val) => opt.puuid === val.puuid}
					noOptionsText="일치하는 멤버가 없습니다"
					forcePopupIcon={false}
					clearOnBlur
					blurOnSelect
					slotProps={{ paper: { className: classes.paper } }}
					renderOption={(props, member) => (
						<li {...props} key={member.puuid}>
							<div className={classes.option}>
								{member.profileIconId != null && (
									<img
										className={classes.optionAvatar}
										src={getProfileIconUrl(member.profileIconId)}
										alt=""
									/>
								)}
								<span className={classes.optionName}>{member.name}</span>
								{renderTier(member.rating)}
							</div>
						</li>
					)}
					renderInput={params => (
						<TextField
							{...params}
							className={classes.searchField}
							placeholder="유저 검색"
							InputProps={{
								...params.InputProps,
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon className={classes.searchIcon} />
									</InputAdornment>
								)
							}}
						/>
					)}
				/>
			</Reveal>

			{favs.length > 0 && (
				<div className={classes.favSection}>
					<Reveal delay={0.12}>
						<div className={classes.favTitle}>
							<span role="img" aria-label="star">
								⭐
							</span>
							즐겨찾기
						</div>
					</Reveal>
					<RevealGroup className={classes.cards}>
						{favs.map(fav => (
							<div
								key={fav.puuid}
								className={classes.card}
								role="button"
								tabIndex={0}
								onClick={() => onSelect(fav)}
								onKeyDown={e => e.key === 'Enter' && onSelect(fav)}
							>
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
									</span>
								</div>
							</div>
						))}
					</RevealGroup>
				</div>
			)}
		</div>
	);
}

export default OpponentPicker;
