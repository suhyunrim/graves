import React from 'react';

const withRouterAndRef = WrappedComponent => {
	return React.forwardRef((props, ref) => <WrappedComponent {...props} ref={ref} />);
};

export default withRouterAndRef;
