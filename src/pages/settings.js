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
  IonButton,
  IonItemDivider,
  IonButtons,
  IonToast
} from '@ionic/react';

import './settings.css';

import netlifyIdentity from 'netlify-identity-widget';

import updateSettings from '../api/updateSettings';

// import KeyboardArrowLeftRoundedIcon from '@material-ui/icons/KeyboardArrowLeftRounded';

const logOut = async () => {
  const confirmLogout = window.confirm( `Are you sure you want to log out?`);
  if ( !confirmLogout ) return;

  netlifyIdentity.logout();
  window.location = window.location.origin;
}

const SettingsPage = ({ userInformation, setUserInformation }) => {
  const [ linkInBioPage, setLinkInBioPage ] = useState( userInformation.settings.linkInBioPage );
  const [ affiliatePrograms, setAffiliatePrograms ] = useState( userInformation.settings.affiliatePrograms );
  
  const [ didUpdateSettings, setDidUpdateSettings ] = useState( false );
  const userId = userInformation._id;

  const saveSettings = () => {
    console.log("Saving...")
    const newSettings = { linkInBioPage, affiliatePrograms }

    updateSettings({ userId, settings: newSettings });
    let userInformationCopy = { ...userInformation };
    userInformationCopy.settings = newSettings;
    setUserInformation( userInformationCopy );

    setDidUpdateSettings(true);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
          <IonButtons slot="end">
            <IonButton>
              <div onClick={saveSettings}>Save</div>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="settings">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="container">
          <IonItemDivider>
            <IonLabel>Bio Page Display</IonLabel>
          </IonItemDivider>
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
          <IonItemDivider>
            <IonLabel>Affiliate Accounts</IonLabel>
          </IonItemDivider>
          <IonItem>
            <IonLabel position="stacked">Amazon Tracking ID</IonLabel>
            <IonTextarea
              value={ affiliatePrograms.amazon.trackingId }
              onIonChange={ e => 
                setAffiliatePrograms( x => ({
                  ...x,
                  amazon: {
                    ...affiliatePrograms.amazon,
                    trackingId: e.target.value
                  }
                }) )
              }></IonTextarea>
          </IonItem>
          <IonItem><span>You can find your Amazon Tracking ID by going <a href="https://affiliate-program.amazon.com/home/account/tag/manage" target="_blank" rel="noopener noreferrer">here</a></span></IonItem>
          <br />
          <IonItemDivider>
            <IonLabel>Your Account</IonLabel>
          </IonItemDivider>
          <br />
          <IonButton expand="block" color="danger" onClick={logOut}>Log Out</IonButton>
          <br />
        </div>

        <IonToast
          isOpen={didUpdateSettings}
          onDidDismiss={() => setDidUpdateSettings(false)}
          message="Settings Updated"
          duration={1000}
        ></IonToast>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
