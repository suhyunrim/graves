import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import * as userActions from 'app/auth/store/actions';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService';
import { isSampleMode } from 'app/main/sample/sampleStorage';
import * as Actions from 'app/store/actions';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class Auth extends Component {
	state = {
		waitAuthCheck: true
	};

	componentDidMount() {
		return Promise.all([this.camilleRiotAuthCheck()]).then(() => {
			this.setState({ waitAuthCheck: false });
		});
	}

	camilleRiotAuthCheck = () =>
		new Promise(resolve => {
			// 샘플 모드면 서버 인증을 건너뛰고 바로 샘플 유저 설정
			if (isSampleMode()) {
				this.props.enterSampleMode();
				resolve();
				return;
			}

			camilleRiotAuthService.init(success => {
				if (!success) {
					resolve();
				}
			});

			if (camilleRiotAuthService.checkAuthenticated()) {
				const authType = camilleRiotAuthService.getAuthType();
				if (authType === 'discord') {
					this.props
						.retrieveDiscordUser()
						.then(() => resolve())
						.catch(() => resolve());
				} else {
					this.props
						.retrieveGroupList()
						.then(() => resolve())
						.catch(() => resolve());
				}
			} else {
				resolve();
			}
		});

	render() {
		return this.state.waitAuthCheck ? <FuseSplashScreen /> : <>{this.props.children}</>;
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			logout: userActions.logoutUser,
			enterSampleMode: userActions.enterSampleMode,
			retrieveGroupList: userActions.retrieveGroupList,
			retrieveDiscordUser: userActions.retrieveDiscordUser,
			showMessage: Actions.showMessage,
			hideMessage: Actions.hideMessage
		},
		dispatch
	);
}

export default connect(null, mapDispatchToProps)(Auth);
