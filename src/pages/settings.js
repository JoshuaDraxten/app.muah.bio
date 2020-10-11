import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonInput,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonTextarea,
  IonButton
} from '@ionic/react';

import netlifyIdentity from 'netlify-identity-widget';

import updateLinkInBioSettings from '../api/updateLinkInBioSettings';

// import KeyboardArrowLeftRoundedIcon from '@material-ui/icons/KeyboardArrowLeftRounded';

const logOut = async () => {
  const confirmLogout = window.confirm( `Are you sure you want to log out?`);
  if ( !confirmLogout ) return;

  netlifyIdentity.logout();
  window.location = window.location.origin;
}

const SettingsPage = ({ history, userInformation, setUserInformation }) => {
  const [ linkInBioPage, setLinkInBioPage ] = useState( userInformation.settings.linkInBioPage );
  const userId = userInformation._id;
  // const username = userInformation.instagram.username;
  const saveSettings = () => {
    if ( JSON.stringify(userInformation.settings.linkInBioPage) === JSON.stringify(linkInBioPage) ) return;

    updateLinkInBioSettings({ userId, linkInBioPage });
    let userInformationCopy = { ...userInformation };
    userInformationCopy.settings.linkInBioPage = linkInBioPage;
    setUserInformation( userInformationCopy )
  }

  // Autosave
  useEffect(() => {
    const autoSaveTimer = setInterval( saveSettings, 500 );
    return () => clearInterval( autoSaveTimer );
  })

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        {/* <IonItemDivider>Button on top of your profile</IonItemDivider> */}
        <IonItem>
          <IonLabel position="stacked">Your Website</IonLabel>
          <IonInput
            type="url"
            inputMode="url"
            pattern="https?://.*"
            value={ linkInBioPage.website }
            placeholder="https://mymakeupbusiness.com"
            onIonChange={ e => setLinkInBioPage(x => ({...x, website: e.target.value}) ) }></IonInput>
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Button Text</IonLabel>
          <IonInput
            type="text"
            inputMode="text"
            value={ linkInBioPage.visitSiteButtonText }
            placeholder="Visit Website"
            onIonChange={ e => setLinkInBioPage(x => ({...x, visitSiteButtonText: e.target.value}) ) }></IonInput>
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Affiliate Disclaimer Text</IonLabel>
          <IonTextarea
            value={ linkInBioPage.disclaimer }
            onIonChange={ e => setLinkInBioPage(x => ({...x, disclaimer: e.target.value}) ) }></IonTextarea>
        </IonItem>
        <br />
        <IonButton expand="block" color="danger" onClick={logOut}>Log Out</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
