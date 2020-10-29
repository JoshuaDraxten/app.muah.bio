// import netlifyIdentity from 'netlify-identity-widget';
// import getUser from '../api/getUser';

import React, { useState } from 'react';

import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonGrid,
    IonRow,
    IonItem,
    IonInput,

} from '@ionic/react';

// Internationalization
import { Trans } from '@lingui/macro';
import { withI18n } from "@lingui/react"

import './loginScreen.css';

const LoginScreen = ({ i18n, magic, setIsLoggedIn, setCurrentUser, setUserInformation }) => {
    const [ email, setEmail ] = useState('');
    const [ emailError ] = useState('');

    const handleLogin = e => {
        magic.auth.loginWithMagicLink({ email })
            .catch(console.error)
            .then(() => setIsLoggedIn(true));
        
        e.preventDefault();
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle><Trans>Log In or Sign Up</Trans></IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonGrid fixed>
                    <IonRow>
                        <form className="login-form" onSubmit={handleLogin}>
                            {/* <h2><Trans>Log in to your account</Trans></h2> */}
                            <IonItem>
                                {/* <IonLabel position="stacked"><Trans>Email Address</Trans></IonLabel> */}
                                <IonInput
                                    type="email"
                                    inputMode="email"
                                    placeholder={i18n._("Your Email Address")}
                                    value={email}
                                    onIonChange={e => setEmail(e.target.value)}
                                />
                                { emailError ? <p style={{color: "red"}}>{emailError}</p> : null }
                            </IonItem>
                            <br />
                            <IonButton expand="full" size="large" type="submit"><Trans>Log In</Trans></IonButton>
                        </form>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
}

export default withI18n()(LoginScreen)