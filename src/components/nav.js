import React from 'react';
import { Link } from "react-router-dom";

const Nav = ({ links }) => (
    <div class="nav">
        💋️.bio
        <ul>
            {links.map( ({ path, name }) => (
                <li><Link to={path}>{ name }</Link></li>
            ))}
        </ul>
    </div>
);

export default Nav;
