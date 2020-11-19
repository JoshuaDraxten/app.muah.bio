import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonInput,
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

import updateSettings from '../api/updateSettings';

// Internationalization
import { Trans } from '@lingui/macro';
import { withI18n } from "@lingui/react"

const SettingsPage = ({ i18n, userInformation, setUserInformation }) => {
  const logOut = async () => {
    const confirmLogout = window.confirm( i18n._("Are you sure you want to log out?") );
    if ( !confirmLogout ) return;
  
    window.auth.currentUser().logout();
    window.location = window.location.origin;
  }

  // Defaults
  const affiliateDefaults = { 
    rakuten: { token: '' },
    amazon: { trackingID: '' }
  }
  const [ linkInBioPage, setLinkInBioPage ] = useState( userInformation.settings.linkInBioPage );
  const affiliatePrograms  = { ...affiliateDefaults, ...userInformation.settings.affiliatePrograms };

  const [ didUpdateSettings, setDidUpdateSettings ] = useState( false );
  const userId = userInformation._id;

  const [ stripeUserPortal, setStripeUserPortal ] = useState( window.stripeUserPortal );

  const saveSettings = () => {
    console.log("Saving...")
    const newSettings = { linkInBioPage, affiliatePrograms }

    updateSettings({ userId, settings: newSettings });
    let userInformationCopy = { ...userInformation };
    userInformationCopy.settings = newSettings;
    setUserInformation( userInformationCopy );

    setDidUpdateSettings(true);
  }

  // Save in global variable so we dont have to fetch the portal again
  if (!window.stripeUserPortal) {
    fetch("/.netlify/functions/stripe-get-user-portal?customerId="+userInformation.stripeCustomerId)
    .then( async response => {
        window.stripeUserPortal = await response.text();
        setStripeUserPortal(window.stripeUserPortal)
    });
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle><Trans>Settings</Trans></IonTitle>
          <IonButtons slot="end">
            <IonButton>
              <div onClick={saveSettings}><Trans>Save</Trans></div>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="settings">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large"><Trans>Settings</Trans></IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="container">
          <IonItemDivider>
            <IonLabel><Trans>Bio Page Display</Trans></IonLabel>
          </IonItemDivider>
          <IonItem>
            <IonLabel position="stacked"><Trans>Your Website</Trans></IonLabel>
            <IonInput
              type="url"
              inputMode="url"
              pattern="https?://.*"
              value={ linkInBioPage.website }
              placeholder="https://mymakeupbusiness.com"
              onIonChange={ e => setLinkInBioPage(x => ({...x, website: e.target.value}) ) }></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked"><Trans>Button Text</Trans></IonLabel>
            <IonInput
              type="text"
              inputMode="text"
              value={ linkInBioPage.visitSiteButtonText }
              placeholder={i18n._("Visit Website")}
              onIonChange={ e => setLinkInBioPage(x => ({...x, visitSiteButtonText: e.target.value}) ) }></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked"><Trans>Affiliate Disclaimer Text</Trans></IonLabel>
            <IonTextarea
              value={ linkInBioPage.disclaimer }
              onIonChange={ e => setLinkInBioPage(x => ({...x, disclaimer: e.target.value}) ) }></IonTextarea>
          </IonItem>
          
          <IonItemDivider>
            <IonLabel><Trans>Your Account</Trans></IonLabel>
          </IonItemDivider>
          <br />
          <IonButton expand="block"  disabled={!stripeUserPortal} href={stripeUserPortal} target="_blank">
            <Trans>Manage Your Subscription</Trans>
          </IonButton>
          <br />
          <IonButton expand="block" color="danger" onClick={logOut}><Trans>Log Out</Trans></IonButton>
          <br /><br /><br /><br /><br />
        </div>
        <Trans render={ ({translation}) => 
          <IonToast
            isOpen={didUpdateSettings}
            onDidDismiss={() => setDidUpdateSettings(false)}
            message={translation}
            duration={1000}
          ></IonToast>
        }>Settings Updated</Trans>
      </IonContent>
    </>
  );
};

export default withI18n()(SettingsPage);
