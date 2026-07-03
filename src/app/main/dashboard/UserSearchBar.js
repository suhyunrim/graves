import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { getProfileIconUrl } from 'app/main/challenge/ddragonUtils';
import { getTierName, getTierShortLabel, getTierEmblemUrl } from 'app/main/tournament/tournamentUtils';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import { getSampleTournamentActiveMembersData } from 'app/main/sample/sampleData';
import { fetchGroupMembers } from 'app/main/myinfo/profileApi';

const useStyles = makeStyles()((theme) => ({
	root: {
		width: 520,
		maxWidth: '100%',
		marginBottom: 24,
		[theme.breakpoints.down('sm')]: {
			width: '100%'
		}
	},
	searchField: {
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
	starBtn: {
		padding: 4,
		color: 'rgba(255, 255, 255, 0.3)',
		'&:hover': {
			color: '#ffd700',
			background: 'rgba(255, 215, 0, 0.1)'
		}
	},
	starBtnActive: {
		color: '#ffd700'
	}
}));

// 대시보드 유저 검색 — active-members를 한 번 받아 클라이언트 필터링으로 자동완성.
// onToggleFavorite가 없으면(비로그인) 별 토글을 숨긴다.
function UserSearchBar({ groupId, favoritePuuids, onToggleFavorite }) {
	const { classes, cx } = useStyles();
	const navigate = useNavigate();
	const [members, setMembers] = useState([]);
	const [inputValue, setInputValue] = useState('');
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!groupId) return;
		if (isSampleMode()) {
			setMembers(getSampleTournamentActiveMembersData());
			return;
		}
		fetchGroupMembers(groupId)
			.then(list => setMembers(list || []))
			.catch(() => setMembers([]));
	}, [groupId]);

	const renderTier = (member) => {
		const tierName = getTierName(member.rating);
		if (!tierName) return null;
		return (
			<span className={classes.optionTier}>
				<img className={classes.optionTierEmblem} src={getTierEmblemUrl(tierName)} alt={tierName} />
				<span className={classes.optionTierLabel}>{getTierShortLabel(member.rating)}</span>
			</span>
		);
	};

	return (
		<Autocomplete
			className={classes.root}
			options={members}
			value={null}
			inputValue={inputValue}
			onInputChange={(_e, value, reason) => {
				// 선택(reset)으로 인한 입력값 반영은 무시하고 검색창을 비운다.
				setInputValue(reason === 'reset' ? '' : value);
			}}
			onChange={(_e, member) => {
				if (member) navigate(`/userinfo/${member.puuid}`);
			}}
			open={open && inputValue.trim().length > 0}
			onOpen={() => setOpen(true)}
			onClose={() => setOpen(false)}
			getOptionLabel={(m) => (m && m.name) || ''}
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
							<img className={classes.optionAvatar} src={getProfileIconUrl(member.profileIconId)} alt="" />
						)}
						<span className={classes.optionName}>{member.name}</span>
						{renderTier(member)}
						{onToggleFavorite && (
							<IconButton
								className={cx(classes.starBtn, favoritePuuids.has(member.puuid) && classes.starBtnActive)}
								size="small"
								aria-label="즐겨찾기 토글"
								onMouseDown={(e) => {
									e.preventDefault();
									e.stopPropagation();
								}}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onToggleFavorite(member);
								}}
							>
								{favoritePuuids.has(member.puuid) ? (
									<StarIcon fontSize="small" />
								) : (
									<StarBorderIcon fontSize="small" />
								)}
							</IconButton>
						)}
					</div>
				</li>
			)}
			renderInput={(params) => (
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
	);
}

export default UserSearchBar;
