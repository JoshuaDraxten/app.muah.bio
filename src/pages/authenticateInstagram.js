import React from "react";

import getShortLivedIGToken from '../api/getShortLivedIGToken';
import getLongLivedIGToken from "../api/getLongLivedIGToken";
import initializeUser from '../api/initializeUser';
import getUser from '../api/getUser';
import { IonApp, IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";

function initializationProcess({ code, userId, callback }) {
    // Validate the code
    getShortLivedIGToken({ code, redirect_uri: "https://app.muah.bio/" }).then( ({access_token, user_id}) => {
      getLongLivedIGToken( access_token ).then( ( response ) => {
        const { access_token, expires_in } = response;
        initializeUser({
          userId: userId,
          ig_token: access_token,
          // expires_in is in seconds, so we convert it to miliseconds
          ig_token_expires: new Date()*1 + expires_in*1000
        }).then( () => {
          getUser( user_id ).then( response => {
            callback( response )
          })
        });
      } );
    }).catch( console.error );
}

const connectToInstagramLink = ({client_id, redirect_uri}) => 
  `https://www.instagram.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=user_profile,user_media&response_type=code`;

export default ({ currentUser, setUserInformation }) => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if ( code ) {
      initializationProcess({
        code,
        userId: currentUser.id,
        callback: setUserInformation
      });

      return <div className="page">
        Setting your account up, one moment...
      </div>
    }

    return <IonApp>
      <IonPage>
        <IonHeader mode="ios">
          <IonToolbar>
            <IonTitle>One last step</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ width: "100%", maxWidth: 600, position: "absolute", top: "50%", left: "50%", transform: "translateX(-50%) translateY(-50%)", textAlign: "center", padding: 20 }}>
            <h2>Please connect your instagram account so that we can load your feed for your Muah.bio page</h2>
            <IonButton href={connectToInstagramLink({client_id: 399352408128696, redirect_uri: "https://app.muah.bio/"})}>Connect To Instagram</IonButton>
          </div>
        </IonContent>
      </IonPage>
    </IonApp>

    // return <div className="page">
    //   <p>Please connect your instagram account to start</p>
      // <a
      //   href={connectToInstagramLink({client_id: 399352408128696, redirect_uri: "https://app.muah.bio/"})}
      //   className="button">
      //     Connect To Instagram
      // </a>
    // </div>
}