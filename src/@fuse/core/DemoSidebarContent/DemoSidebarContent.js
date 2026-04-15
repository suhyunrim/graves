import _ from '@lodash';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';

function DemoSidebarContent() {
	function generate(element) {
		return _(30).times(value =>
			React.cloneElement(element, {
				key: value
			})
		);
	}

	return (
		<div>
			<List dense>
				{generate(
					<ListItem button>
						<ListItemText primary="Single-line item" />
					</ListItem>
				)}
			</List>
		</div>
	);
}

export default React.memo(DemoSidebarContent);
