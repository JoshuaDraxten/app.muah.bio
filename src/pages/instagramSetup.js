import React, { useState } from 'react';
import clientSideGetIGGosts from '../api/clientSideGetIGPosts';
import { i18n } from "@lingui/core";

import initializeUser from '../api/initializeUser';

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
    IonLoading
} from '@ionic/react';

// Internationalization
import { Trans } from '@lingui/macro';

import './loginScreen.css';

export default ({ token, setUserInformation }) => {
    const [ instagramTag, setInstagramTag ] = useState('');
    const [ tagError, setTagError ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);

    const handleSetup = async () => {
        setIsLoading( true )
        // Get the posts, if there is none, throw an error
        try {
            const posts = await clientSideGetIGGosts( instagramTag );
            for (let i = 0; i < posts.length; i++) {
                const post = posts[i];
                const newMediaUrl = await fetch(`/.netlify/functions/cache-ig-photo?username=${instagramTag}&postId=${post.id}&url=${encodeURIComponent(post.media_url)}`).then( response => response.text() );
                post.media_url = newMediaUrl;
                console.log(`Cached photo ${i+1} of ${posts.length}`)
            }
            const userInformation = await initializeUser({ posts, ig_username: instagramTag, token });
            setUserInformation( userInformation );
            setIsLoading( false );
        } catch (error) {
            setTagError( i18n._("Instagram account doesnt exist or you are on a computer blocked by Instagram") );
        }
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle><Trans>One more thing</Trans></IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonGrid fixed>
                    <IonRow>
                        <div className="login-form">
                            <h2><Trans>Connect your instagram account to start tagging your posts</Trans></h2>
                            <IonItem>
                                {/* <IonLabel position="stacked"><Trans>Email Address</Trans></IonLabel> */}
                                <IonInput
                                    type="text"
                                    placeholder="Your Instagram Username"
                                    value={instagramTag}
                                    onIonChange={e => setInstagramTag(e.target.value)}
                                />
                            </IonItem>
                            { tagError ? <p style={{color: "red"}}>{tagError}</p> : null }
                            <br />
                            <IonButton expand="full" size="large" onClick={handleSetup}><Trans>Connect</Trans></IonButton>
                        </div>
                    </IonRow>
                </IonGrid>
                <IonLoading
                    isOpen={isLoading}
                    onDidDismiss={() => setIsLoading(false)}
                    message={i18n._("Loading your profile. This can take up to 60 seconds.")}
                    // duration={20000}
                />
            </IonContent>
        </IonPage>
    );
}