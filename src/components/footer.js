import React from 'react';
import { Link } from "react-router-dom";

const FooterLink = ({link}) => <Link to={link.href} className="footer-link">
        { link.icon }
    </Link>

export default ({links}) => {
    console.log( links )
    return <div className="footer stick-to-bottom">{links.map((link, i) => <FooterLink link={link} key={i}/>)}</div>
}