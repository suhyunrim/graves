import MomentUtils from '@date-io/moment';
import FuseAuthorization from '@fuse/core/FuseAuthorization';
import FuseLayout from '@fuse/core/FuseLayout';
import FuseTheme from '@fuse/core/FuseTheme';
import history from '@history';
import { createGenerateClassName, jssPreset, StylesProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { create } from 'jss';
import jssExtend from 'jss-plugin-extend';
import rtl from 'jss-rtl';
import React from 'react';
import * as Sentry from '@sentry/react';
import Provider from 'react-redux/es/components/Provider';
import { Router } from 'react-router-dom';
import AppContext from './AppContext';
import { Auth } from './auth';
import routes from './fuse-configs/routesConfig';
import store from './store';
import './utility/getLatesetRiotDataVersion';
import './main/releaseNotes/releaseNoteBadge';

const jss = create({
	...jssPreset(),
	plugins: [...jssPreset().plugins, jssExtend(), rtl()],
	insertionPoint: document.getElementById('jss-insertion-point')
});

const generateClassName = createGenerateClassName();

const SentryFallback = () => (
	<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
		<p>문제가 발생했습니다. 페이지를 새로고침해주세요.</p>
	</div>
);

const App = () => {
	return (
		<Sentry.ErrorBoundary fallback={SentryFallback}>
			<AppContext.Provider
				value={{
					routes
				}}
			>
				<StylesProvider jss={jss} generateClassName={generateClassName}>
					<Provider store={store}>
						<MuiPickersUtilsProvider utils={MomentUtils}>
							<Auth>
								<Router history={history}>
									<FuseAuthorization>
										<FuseTheme>
											<FuseLayout />
										</FuseTheme>
									</FuseAuthorization>
								</Router>
							</Auth>
						</MuiPickersUtilsProvider>
					</Provider>
				</StylesProvider>
			</AppContext.Provider>
		</Sentry.ErrorBoundary>
	);
};

export default App;
