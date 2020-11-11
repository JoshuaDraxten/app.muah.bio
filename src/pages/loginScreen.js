import getUser from '../api/getUser';

import React, { useState } from 'react';

import {
    IonPage,
    IonContent,
    IonHeader,
    IonLabel,
    IonToolbar,
    IonTitle,
    IonButton,
    IonGrid,
    IonRow,
    IonItem,
    IonInput,
    IonLoading,

} from '@ionic/react';

// Internationalization
import { Trans } from '@lingui/macro';
import { withI18n } from "@lingui/react"

import './loginScreen.css';

const LoginScreen = ({ i18n, setUserInformation }) => {
    const [ screenMode, setScreenMode ] = useState(0); // 0 = create account | 1 = log in
    const [ email, setEmail ] = useState('');
    const [ error, setError ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ isLoading, setIsLoading ] = useState( false );

    const translateError = ( error ) => {
        const translatedError = {
            "Signup requires a valid password": i18n._("Signup requires a valid password"),
            "A user with this email address has already been registered": i18n._("A user with this email address has already been registered"),

        }[error];

        if ( translatedError ) return translatedError;
        return error;
    }

    const handleLogin = e => {
        setIsLoading( true );
        if ( screenMode === 0 ) {
            window.auth.signup( email, password )
            .catch( err => {
                setIsLoading( false );
                setError( translateError( err.json.msg ) )
            })
            // We just created this account, so there is no user account associated with it
            .then( () => {
                window.auth.login( email, password, true ).then( () => {
                    setUserInformation({ error: "User doesnt exist" })
                })
             } )
        }

        if ( screenMode === 1 ) {
            window.auth.login( email, password, true )
                .catch( err => {
                    setIsLoading( false );
                    setError( translateError( err.json.msg ) )
                })
                .then( () => {
                    getUser().then( response => {
                        setUserInformation( response )
                    })
                })
        }


        e.preventDefault();
    }

    console.log( error )
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    { screenMode === 0 &&  <IonTitle><Trans>Sign Up</Trans></IonTitle> }
                    { screenMode === 1 &&  <IonTitle><Trans>Log In</Trans></IonTitle> }
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonGrid fixed>
                    <IonRow>
                        <form className="login-form" onSubmit={handleLogin}>
                            <IonItem>
                                <IonLabel position="stacked"><Trans>Your Email Address</Trans></IonLabel>
                                <IonInput
                                    type="email"
                                    inputMode="email"
                                    placeholder={i18n._("hello@example.com")}
                                    value={email}
                                    onIonChange={e => setEmail(e.target.value)}
                                />
                            </IonItem>
                            <IonItem>
                                <IonLabel position="stacked"><Trans>Your Password</Trans></IonLabel>
                                <IonInput
                                    type="password"
                                    inputMode="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onIonChange={e => setPassword(e.target.value)}
                                />
                            </IonItem>
                            { error ? <IonItem>
                                <p style={{color: "red"}}>
                                <Trans>Error</Trans>: {error}</p>
                                </IonItem> : null }
                            <br />
                            <IonButton expand="full" size="large" type="submit">
                                { screenMode === 0 &&  <Trans>Sign Up</Trans> }
                                { screenMode === 1 &&  <Trans>Log In</Trans> }
                            </IonButton>
                            
                            <button
                                type="button"
                                className="link-btn"
                                onClick={() => setScreenMode(mode => !mode*1) }
                                style={{ display: 'block', width: '100%', textAlign: 'center', padding: "20px" }} >
                                { screenMode === 0 && <>
                                    <Trans>Already have an account?</Trans> <Trans>Log In</Trans>
                                </> }
                                { screenMode === 1 && <>
                                    <Trans>Don't have an account yet?</Trans> <Trans>Sign Up</Trans>
                                </> }
                            </button>
                        </form>
                    </IonRow>
                </IonGrid>
                <IonLoading isOpen={isLoading} />
            </IonContent>
        </IonPage>
    );
}

export default withI18n()(LoginScreen)