import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';

export default function useToast() {
	const dispatch = useDispatch();

	return useMemo(() => {
		const show = (variant) => (message, options = {}) =>
			dispatch(Actions.showMessage({ message, variant, ...options }));

		return {
			success: show('success'),
			error: show('error'),
			warning: show('warning'),
			info: show('info'),
			show: (options) => dispatch(Actions.showMessage(options)),
			hide: () => dispatch(Actions.hideMessage())
		};
	}, [dispatch]);
}
