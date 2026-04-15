import React from 'react';
import { NavLink } from 'react-router-dom';

const NavLinkAdapter = React.forwardRef((props, ref) => <NavLink ref={ref} {...props} />);

export default NavLinkAdapter;
