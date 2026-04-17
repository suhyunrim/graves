import React from 'react';
import { Button, CircularProgress } from '@mui/material';

function SaveButton({
	isPending = false,
	children = '저장',
	pendingLabel = '저장 중...',
	disabled,
	...props
}) {
	return (
		<Button {...props} disabled={isPending || disabled}>
			{isPending && (
				<CircularProgress size={16} style={{ color: 'currentColor', marginRight: 8 }} />
			)}
			{isPending ? pendingLabel : children}
		</Button>
	);
}

export default SaveButton;
