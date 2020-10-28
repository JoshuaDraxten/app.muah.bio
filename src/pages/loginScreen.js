import netlifyIdentity from 'netlify-identity-widget';
import getUser from '../api/getUser';

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
    IonLabel,
    IonItem,
    IonInput,

} from '@ionic/react';

// Internationalization
import { Trans } from '@lingui/macro';

import './loginScreen.css';

export default ({ magic, setIsLoggedIn, setCurrentUser, setUserInformation }) => {
    const [ email, setEmail ] = useState('');
    const [ emailError ] = useState('');

    const handleLogin = async () => {
        console.log( email )
        const loginResponse = await magic.auth.loginWithMagicLink({ email }).catch(console.error);
        console.log("Testing 123", loginResponse)
        setIsLoggedIn(true);
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
                        <div className="login-form">
                            {/* <h2><Trans>Log in to your account</Trans></h2> */}
                            <IonItem>
                                {/* <IonLabel position="stacked"><Trans>Email Address</Trans></IonLabel> */}
                                <IonInput
                                    type="email"
                                    inputMode="email"
                                    pattern="abc."
                                    placeholder="Your Email Address"
                                    value={email}
                                    onIonChange={e => setEmail(e.target.value)}
                                />
                                { emailError ? <p style={{color: "red"}}>{emailError}</p> : null }
                            </IonItem>
                            <br />
                            <IonButton expand="full" size="large" onClick={handleLogin}><Trans>Log In</Trans></IonButton>
                        </div>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
}