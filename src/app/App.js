import FuseAuthorization from '@fuse/core/FuseAuthorization';
import FuseLayout from '@fuse/core/FuseLayout';
import FuseTheme from '@fuse/core/FuseTheme';
import history from '@history';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import React from 'react';
import * as Sentry from '@sentry/react';
import Provider from 'react-redux/es/components/Provider';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import AppContext from './AppContext';
import { Auth } from './auth';
import routes from './fuse-configs/routesConfig';
import store from './store';
import './utility/getLatesetRiotDataVersion';
import './main/releaseNotes/releaseNoteBadge';

/** BrowserRouter 내부에서 navigate 함수를 @history 유틸리티에 등록 */
function NavigationSetter() {
	const navigate = useNavigate();
	React.useEffect(() => {
		history.setNavigate(navigate);
	}, [navigate]);
	return null;
}

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
				<Provider store={store}>
					<LocalizationProvider dateAdapter={AdapterMoment}>
						<Auth>
							<BrowserRouter>
								<NavigationSetter />
								<FuseAuthorization>
									<FuseTheme>
										<FuseLayout />
									</FuseTheme>
								</FuseAuthorization>
							</BrowserRouter>
						</Auth>
					</LocalizationProvider>
				</Provider>
			</AppContext.Provider>
		</Sentry.ErrorBoundary>
	);
};

export default App;
