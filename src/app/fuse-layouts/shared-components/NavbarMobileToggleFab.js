import Fab from '@mui/material/Fab';
import Icon from '@mui/material/Icon';
import { makeStyles } from 'tss-react/mui';
import Tooltip from '@mui/material/Tooltip';
import * as Actions from 'app/store/actions';
import clsx from 'clsx';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useStyles = makeStyles()((theme) => ({
	buttonIcon: {
		fontSize: 18,
		transition: theme.transitions.create(['transform'], {
			easing: theme.transitions.easing.easeInOut,
			duration: theme.transitions.duration.short
		})
	},
	mobileButton: {
		height: 40,
		position: 'absolute',
		zIndex: 99,
		top: 12,
		width: 24,
		borderRadius: 38,
		padding: 8,
		backgroundColor: theme.palette.background.paper,
		transition: theme.transitions.create(['background-color', 'border-radius', 'width', 'min-width', 'padding'], {
			easing: theme.transitions.easing.easeInOut,
			duration: theme.transitions.duration.shorter
		}),
		'&:hover': {
			width: 52,
			paddingLeft: 8,
			paddingRight: 8
		},
		// iOS 왼쪽 엣지 스와이프(뒤로가기) 영역(~20pt)에 버튼(left:0, 24px)이 통째로 들어가
		// 아이폰 인앱 웹뷰에서 탭이 OS 제스처로 먹히던 문제 수정:
		//   가장자리에서 안쪽으로 빼고(left:16) 터치 영역을 키운다(width 24→40).
		//   더 이상 엣지 부착이 아니므로 좌측 모서리도 둥글게(기존 사각 모서리 제거).
		'&.left': {
			left: 16,
			width: 40,
			paddingLeft: 8
		},

		'&.right': {
			borderBottomRightRadius: 0,
			borderTopRightRadius: 0,
			paddingRight: 4,
			right: 0,
			'& $buttonIcon': {
				transform: 'rotate(-180deg)'
			}
		}
	}
}));

function NavbarMobileToggleFab(props) {
	const { classes } = useStyles(props);
	const config = useSelector(({ fuse }) => fuse.settings.current.layout.config);

	const dispatch = useDispatch();

	return (
		<Tooltip title="Show Navigation" placement={config.navbar.position === 'left' ? 'right' : 'left'}>
			<Fab
				className={clsx(classes.mobileButton, config.navbar.position, props.className)}
				onClick={ev => dispatch(Actions.navbarToggleMobile())}
				disableRipple
			>
				<Icon className={classes.buttonIcon} color="action">
					menu
				</Icon>
			</Fab>
		</Tooltip>
	);
}

export default NavbarMobileToggleFab;
