import React, { useEffect, useState } from 'react';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonInput,
  IonItemDivider,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLabel
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

const ValidatableInput = ({ type="input", rows=4, validate=()=>true, errorMessage="", label, initialValue, updateValue }) => {
  const [ error, setError ] = useState("");
  const onBlur = e => {
    const value = e.target.value;
    if ( !validate(value) ) {
      setError( errorMessage );
    }
  }
  const onChange = e => {
    const value = e.target.value;
    if ( error && validate( value ) ) {
      setError("");
    }
    updateValue( value );
  }

  return <div className={"validatable-input"+(error ? " error" : "")}>
    <label>{label}</label>
    { type === "input" ? <input value={initialValue ? initialValue : ''} onChange={onChange} onBlur={onBlur} /> : null }
    { type === "textarea" ? <textarea rows={rows} value={initialValue} onChange={onChange} onBlur={onBlur}></textarea> : null }
    { error ? <span>{error}</span> : null }
  </div>
}

function isValidUrl(string) {
  if ( string === '' ) return true;

  try {
    new URL(string);
  } catch (e) {
    return false;  
  }
  return true;
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
    const autoSaveTimer = setInterval( saveSettings, 3000 );
    return () => clearInterval( autoSaveTimer );
  })

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Profile</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonItemDivider>Link on top of profile</IonItemDivider>
        <IonItem>
          <IonLabel>Link URL</IonLabel>
          <IonInput
            type="url"
            inputMode="url"
            pattern="https?://.*"
            value={ linkInBioPage.website }
            placeholder="https://mymakeupbusiness.com"
            onIonChange={ e => setLinkInBioPage(x => ({...x, website: e.target.value}) ) }></IonInput>
        </IonItem>
        <IonItem>
          <IonLabel>Button Text</IonLabel>
          <IonInput
            type="text"
            inputMode="text"
            value={ linkInBioPage.visitSiteButtonText }
            placeholder="Visit Website"
            onIonChange={ e => setLinkInBioPage(x => ({...x, visitSiteButtonText: e.target.value}) ) }></IonInput>
        </IonItem>
      </IonContent>
    </IonPage>
  )

  return <div>
    {/* <Header
        backIcon={<KeyboardArrowLeftRoundedIcon />}
        backText="Profile"
        backAction={ () => {saveSettings(); history.push('/')} }
        title="Settings"
        forwardText="Preview"
        forwardHref={"https://muah.bio/"+username} /> */}
    <div className="page settings">
      <ValidatableInput
        label="Website URL"
        validate={isValidUrl}
        errorMessage="Please insert a valid URL"
        initialValue={ linkInBioPage.website }
        updateValue={website => setLinkInBioPage(x => ({...x, website}) ) }
      />
      { linkInBioPage.website ?
        <ValidatableInput
          label="Button text"
          initialValue={ linkInBioPage.visitSiteButtonText }
          updateValue={visitSiteButtonText => setLinkInBioPage(x => ({...x, visitSiteButtonText}) ) }
        />
      : null}
      <ValidatableInput
        type="textarea"
        label="Affiliate Disclaimer text"
        initialValue={ linkInBioPage.disclaimer }
        updateValue={disclaimer => setLinkInBioPage(x => ({...x, disclaimer}) ) }
      />
      <br />
      <button style={{width: "100%", color: 'red', borderColor: "red"}} onClick={logOut}>Log out</button>
    </div>
  </div>
};

export default SettingsPage;
