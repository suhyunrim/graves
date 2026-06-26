import FuseSearch from '@fuse/core/FuseSearch';
import FuseShortcuts from '@fuse/core/FuseShortcuts';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import Toolbar from '@mui/material/Toolbar';
import NavbarMobileToggleButton from 'app/fuse-layouts/shared-components/NavbarMobileToggleButton';
import QuickPanelToggleButton from 'app/fuse-layouts/shared-components/quickPanel/QuickPanelToggleButton';
import UserMenu from 'app/fuse-layouts/shared-components/UserMenu';
import React from 'react';
import { useSelector } from 'react-redux';
import LanguageSwitcher from '../../shared-components/LanguageSwitcher';

const useStyles = makeStyles()((theme) => ({
	root: {
		background: 'linear-gradient(90deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
		borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
		boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
	},
	separator: {
		width: 1,
		height: 48,
		background: 'linear-gradient(180deg, transparent 0%, rgba(0, 212, 255, 0.3) 50%, transparent 100%)'
	},
	iconButton: {
		color: 'rgba(255, 255, 255, 0.7)',
		transition: 'all 0.3s ease',
		'&:hover': {
			color: '#00d4ff',
			background: 'rgba(0, 212, 255, 0.1)'
		}
	},
	// 모바일 햄버거 토글: iOS 인앱 웹뷰(디스코드/카톡)에서 좌상단 버튼이 안 눌리는 문제 대응.
	// 근본 원인 = iOS가 화면 왼쪽 가장자리 ~20pt를 '엣지 스와이프(뒤로가기)' 제스처용으로 선점 →
	//   그 띠에 걸친 햄버거 아이콘 탭이 제스처 인식기로 먹힌다(살짝 오른쪽을 누르면 정상).
	// 해법: 버튼을 그 엣지 띠 밖으로 충분히(24px) 밀어넣어 아이콘 전체가 제스처 영역을 벗어나게 한다.
	// touch-action/탭 하이라이트는 더블탭 지연·오버스크롤 케이스 보강용으로 함께 유지.
	mobileToggle: {
		touchAction: 'manipulation',
		WebkitTapHighlightColor: 'rgba(0, 212, 255, 0.3)',
		marginTop: 6,
		marginLeft: 24
	}
}));

function ToolbarLayout1(props) {
	const config = useSelector(({ fuse }) => fuse.settings.current.layout.config);
	const toolbarTheme = useSelector(({ fuse }) => fuse.settings.toolbarTheme);

	const { classes, cx } = useStyles(props);

	return (
        <StyledEngineProvider injectFirst>
            (<ThemeProvider theme={toolbarTheme}>
                <AppBar
                    id="fuse-toolbar"
                    className={classes.root}
                    position="relative"
                    elevation={0}
                >
                    <Toolbar className="p-0">
                        {config.navbar.display && config.navbar.position === 'left' && (
                            <Box sx={{ display: { lg: 'none' } }}>
                                <NavbarMobileToggleButton className={cx('w-64 h-64 p-0', classes.mobileToggle)} />
                                <div className={classes.separator} />
                            </Box>
                        )}

                        <div className="flex flex-1">
                            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                                <FuseShortcuts className="px-16" />
                            </Box>
                        </div>

                        <div className="flex items-center">
                            <UserMenu />

                            <div className={classes.separator} />

                            <FuseSearch />

                            <div className={classes.separator} />

                            <LanguageSwitcher />

                            <div className={classes.separator} />

                            <QuickPanelToggleButton />
                        </div>

                        {config.navbar.display && config.navbar.position === 'right' && (
                            <Box sx={{ display: { lg: 'none' } }}>
                                <NavbarMobileToggleButton />
                            </Box>
                        )}
                    </Toolbar>
                </AppBar>
            </ThemeProvider>)
        </StyledEngineProvider>
    );
}

export default React.memo(ToolbarLayout1);
