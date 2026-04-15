import React from 'react';

function FuseAnimateGroup({ children, ...rest }) {
	return <div {...rest}>{children}</div>;
}

export default React.memo(FuseAnimateGroup);
