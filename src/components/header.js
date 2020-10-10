import React from 'react';

function Header({ backIcon, backText, backHref="#", backAction, title, forwardIcon, forwardText, forwardHref="#", forwardAction, forwardStyle, forwardDisabled }){
    return(
        <header style={{textAlign: "center" }}>
            {backAction||backHref ? <a href={backHref} target={backHref==="#" ? "" : "_blank"} className="header-back" onClick={backAction}>
                { backIcon ? backIcon : null }
                { backText }
            </a> : null }
            { title ? <h1>{ title }</h1> : null }
            { forwardAction||forwardHref ? <a href={forwardHref} target={forwardHref==="#" ? "" : "_blank"} style={forwardStyle} className={"header-forward" + ( forwardDisabled ? " disabled" : "" )} onClick={forwardAction}>
                { forwardText }&nbsp;
                { forwardIcon ? forwardIcon: null }
            </a> : null }
        </header>
    )
}

export default Header;