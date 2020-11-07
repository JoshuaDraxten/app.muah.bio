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

const AffiliateSettingsPage = ({ hasAffiliateSetup, userInformation, setUserInformation }) => {

  // Defaults
  const affiliateDefaults = { 
    rakuten: { token: '' },
    amazon: { trackingID: '' }
  }
  const [ linkInBioPage, setLinkInBioPage ] = useState( userInformation.settings.linkInBioPage );
  const [ affiliatePrograms, setAffiliatePrograms ] = useState( { ...affiliateDefaults, ...userInformation.settings.affiliatePrograms });

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
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle><Trans>Affiliates</Trans></IonTitle>
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
            <IonTitle size="large"><Trans>Affiliates</Trans></IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="container">
            {!hasAffiliateSetup && 
                <div style={{padding: "0 20px"}}>
                    <p><Trans>
                        If you dont have an affiliate relationship with anyone, you can 
                        <a target="_blank" rel="noopener noreferrer" href="https://cli.linksynergy.com/cli/publisher/registration/registration.php?mid=2417">
                            apply to Sephora
                        </a> or 
                        <a target="_blank" rel="noopener noreferrer" href="https://affiliate-program.amazon.com/">
                            to Amazon
                        </a>
                    </Trans></p>
                </div>
            }
          <IonItemDivider>
            <IonLabel><Trans>Amazon Affiliate Account</Trans></IonLabel>
          </IonItemDivider>
          <IonItem>
            <IonLabel position="stacked"><Trans>Amazon Tracking ID</Trans></IonLabel>
            <IonTextarea
              value={ affiliatePrograms.amazon.trackingID }
              onIonChange={ e => 
                setAffiliatePrograms( x => ({
                  ...x,
                  amazon: {
                    ...affiliatePrograms.amazon,
                    trackingID: e.target.value
                  }
                }) )
              }></IonTextarea>
          </IonItem>
          <IonItem><span><Trans>You can find your Amazon Tracking ID by going <a href="https://affiliate-program.amazon.com/home/account/tag/manage" target="_blank" rel="noopener noreferrer">here</a></Trans></span></IonItem>
          
          <IonItemDivider>
            <IonLabel className="ion-text-wrap"><Trans>Rakuten Affiliate Account</Trans> <span style={{whiteSpace: "nowrap"}}>(Sephora, Benefit, e.l.f., <Trans>etc</Trans>)</span></IonLabel>
          </IonItemDivider>
          <IonItem>
            <IonLabel position="stacked"><Trans>Rakuten Web Services Token</Trans></IonLabel>
            <IonTextarea
              value={ affiliatePrograms.rakuten.token }
              onIonChange={ e => 
                setAffiliatePrograms( x => ({
                  ...x,
                  rakuten: {
                    ...affiliatePrograms.rakuten,
                    token: e.target.value
                  }
                }) )
              }></IonTextarea>
          </IonItem>
          <IonItem><p><Trans>You can find your Rakuten Web Services Token by going to <a href="https://cli.linksynergy.com/cli/publisher/links/webServices.php" target="_blank" rel="noopener noreferrer">Links &gt; Web Services</a> page in the rakuten advertizing dashboard</Trans></p></IonItem>
        </div>
        <Trans render={ ({translation}) => 
          <IonToast
            isOpen={didUpdateSettings}
            onDidDismiss={() => setDidUpdateSettings(false)}
            message={translation}
            duration={1000}
          ></IonToast>
        }>Affiliate Accounts Updated</Trans>
      </IonContent>
    </>
  );
};

export default withI18n()(AffiliateSettingsPage);
