import { fuseDark } from '@fuse/colors';
import _ from '@lodash';
import { lightBlue, red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

/**
 * SETTINGS DEFAULTS
 */
export const defaultSettings = {
	customScrollbars: true,
	animations: true,
	direction: 'ltr',
	theme: {
		main: 'default',
		navbar: 'mainThemeDark',
		toolbar: 'mainThemeLight',
		footer: 'mainThemeDark'
	}
};

export function getParsedQuerySettings() {
	const params = new URLSearchParams(window.location.search);
	const defaultSettingsParam = params.get('defaultSettings');

	if (defaultSettingsParam) {
		return JSON.parse(defaultSettingsParam);
	}
	return {};
}

/**
 * THEME DEFAULTS
 */
export const defaultThemeOptions = {
	typography: {
		fontFamily: ['Muli', 'Roboto', '"Helvetica"', 'Arial', 'sans-serif'].join(','),
		fontWeightLight: 300,
		fontWeightRegular: 400,
		fontWeightMedium: 600,
	}
};

export const mustHaveThemeOptions = {
	typography: {
		htmlFontSize: 10,
		body1: {
			fontSize: '1.4rem'
		},
		body2: {
			fontSize: '1.4rem'
		}
	},
	components: {
		MuiInputBase: {
			styleOverrides: {
				root: {
					lineHeight: '1.1876em' // MUI 4 기본값 복원 (MUI 9: 1.4375em)
				},
				input: {
					height: '1.1876em' // MUI 4 기본값 복원 (MUI 9: 1.4375em)
				}
			}
		},
		MuiFormLabel: {
			styleOverrides: {
				root: {
					lineHeight: 1 // MUI 4 기본값 복원
				}
			}
		},
		MuiListItem: {
			styleOverrides: {
				root: {
					paddingTop: 8, // MUI 4 기본값 복원
					paddingBottom: 8
				}
			}
		}
	}
};

export const defaultThemes = {
	default: {
		palette: {
			mode: 'light',
			primary: fuseDark,
			secondary: {
				light: lightBlue[400],
				main: lightBlue[600],
				dark: lightBlue[700]
			},
			error: red
		},
		status: {
			danger: 'orange'
		}
	},
	defaultDark: {
		palette: {
			mode: 'dark',
			primary: fuseDark,
			secondary: {
				light: lightBlue[400],
				main: lightBlue[600],
				dark: lightBlue[700]
			},
			error: red
		},
		status: {
			danger: 'orange'
		}
	}
};

export function extendThemeWithMixins(obj) {
	const theme = createTheme(obj);
	return {
		border: (width = 1) => ({
			borderWidth: width,
			borderStyle: 'solid',
			borderColor: theme.palette.divider
		}),
		borderLeft: (width = 1) => ({
			borderLeftWidth: width,
			borderStyle: 'solid',
			borderColor: theme.palette.divider
		}),
		borderRight: (width = 1) => ({
			borderRightWidth: width,
			borderStyle: 'solid',
			borderColor: theme.palette.divider
		}),
		borderTop: (width = 1) => ({
			borderTopWidth: width,
			borderStyle: 'solid',
			borderColor: theme.palette.divider
		}),
		borderBottom: (width = 1) => ({
			borderBottomWidth: width,
			borderStyle: 'solid',
			borderColor: theme.palette.divider
		})
	};
}

export function mainThemeVariations(theme) {
	return {
		mainThemeDark: createTheme(
			_.merge({}, defaultThemeOptions, theme, {
				palette: {
					mode: 'dark',
					background: {
						paper: '#1E2125',
						default: '#121212'
					}
				},
				...mustHaveThemeOptions
			})
		),
		mainThemeLight: createTheme(
			_.merge({}, defaultThemeOptions, theme, {
				palette: {
					mode: 'light',
					background: {
						paper: '#FFFFFF',
						default: '#F7F7F7'
					}
				},
				...mustHaveThemeOptions
			})
		)
	};
}
