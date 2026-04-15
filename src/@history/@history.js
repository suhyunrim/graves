/**
 * React Router v7 외부 navigation 유틸리티.
 * React 컴포넌트 밖(Redux actions, axios interceptor 등)에서
 * 프로그래밍 방식 네비게이션을 가능하게 한다.
 *
 * NavigationSetter 컴포넌트가 Router 내부에서 navigate 함수를 등록한다.
 */

let _navigate = null;

const history = {
	/** NavigationSetter에서 호출 — navigate 함수를 등록한다 */
	setNavigate(navigateFn) {
		_navigate = navigateFn;
	},

	push(to) {
		if (!_navigate) {
			console.warn('history.push called before NavigationSetter mounted');
			return;
		}
		if (typeof to === 'string') {
			_navigate(to);
		} else {
			// { pathname, state } 형태 지원
			_navigate(to.pathname || '/', { state: to.state });
		}
	},

	replace(to) {
		if (!_navigate) {
			console.warn('history.replace called before NavigationSetter mounted');
			return;
		}
		if (typeof to === 'string') {
			_navigate(to, { replace: true });
		} else {
			_navigate(to.pathname || '/', { replace: true, state: to.state });
		}
	},

	/** v5 호환 — location.state 직접 수정은 무시 (FuseAuthorization이 처리) */
	get location() {
		return window.location;
	}
};

export default history;
