import React from 'react';

const splashScreenStyle = {
    textAlign: "center",
    position: "relative",
    top: "50%",
    transform: "translateY(-75%)"
}
const splashScreenH2 = {
  fontSize: "48px",
  margin: 0
}

export default () => {
    return <div style={{height: "100vh"}}><div className="splash-screen" style={splashScreenStyle}>
        <img alt="" src="/images/icons-192.png"/>
        <h2 style={splashScreenH2}>Muah.bio</h2>
    </div></div>
}