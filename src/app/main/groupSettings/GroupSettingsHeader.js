import React, { useState, useMemo, useEffect } from 'react';
import { Typography, InputBase } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch, useSelector } from 'react-redux';
import debounce from 'lodash/debounce';
import * as Actions from './store/actions';

const useStyles = makeStyles()((theme) => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		maxWidth: '100%',
		boxSizing: 'border-box',
		padding: '24px 28px 20px',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
		overflow: 'hidden',
		[theme.breakpoints.down('sm')]: {
			padding: '20px 16px 16px'
		}
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
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		[theme.breakpoints.down('md')]: {
			fontSize: '2.75rem'
		},
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.8rem',
			letterSpacing: '0.04em'
		}
	},
	subtitleRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		marginTop: 10,
		[theme.breakpoints.down('md')]: {
			flexDirection: 'column',
			alignItems: 'flex-start',
			gap: 12
		}
	},
	subtitle: {
		position: 'absolute',
		left: 0,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.6)',
		letterSpacing: '0.05em',
		[theme.breakpoints.down('md')]: {
			position: 'static',
			fontSize: '1.35rem'
		}
	},
	searchWrapper: {
		display: 'flex',
		alignItems: 'center',
		background: 'rgba(255, 255, 255, 0.05)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		borderRadius: 12,
		padding: '8px 16px',
		width: 450,
		maxWidth: 'calc(100% - 300px)',
		transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
		'&:focus-within': {
			borderColor: 'rgba(0, 212, 255, 0.6)',
			boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)'
		},
		[theme.breakpoints.down('md')]: {
			width: '100%',
			maxWidth: '100%'
		}
	},
	searchIcon: {
		color: 'rgba(255, 255, 255, 0.4)',
		marginRight: 10,
		fontSize: '1.4rem'
	},
	searchInput: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: '#fff',
		flex: 1,
		'&::placeholder': {
			color: 'rgba(255, 255, 255, 0.4)'
		}
	}
}));

function GroupSettingsHeader({ subtitle, showSearch }) {
	const { classes } = useStyles();
	const dispatch = useDispatch();
	const reduxSearchText = useSelector(({ GroupSettings }) => GroupSettings.groupSettings.searchText);
	// 입력값은 로컬 state로 즉시 반영하고, 실제 필터를 트리거하는 redux 반영은 디바운스한다.
	// (매 키 입력마다 SET_SEARCH_TEXT 디스패치 → 220행 목록 전체 재렌더되던 문제 방지)
	const [localSearch, setLocalSearch] = useState(reduxSearchText);

	const debouncedDispatch = useMemo(
		() => debounce(value => dispatch(Actions.setSearchText(value)), 250),
		[dispatch]
	);

	useEffect(() => () => debouncedDispatch.cancel(), [debouncedDispatch]);

	const handleSearchChange = ev => {
		const { value } = ev.target;
		setLocalSearch(value);
		debouncedDispatch(value);
	};

	return (
		<div className={classes.root}>
			<Typography className={classes.title} variant="h4">
				Group Settings
			</Typography>
			<div className={classes.subtitleRow}>
				<Typography className={classes.subtitle}>{subtitle}</Typography>
				{showSearch && (
					<div className={classes.searchWrapper}>
						<SearchIcon className={classes.searchIcon} />
						<InputBase
							className={classes.searchInput}
							placeholder="소환사 검색..."
							value={localSearch}
							onChange={handleSearchChange}
							inputProps={{ 'aria-label': 'search' }}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export default GroupSettingsHeader;
