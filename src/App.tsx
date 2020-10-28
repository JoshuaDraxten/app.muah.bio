// @ts-nocheck

import React, { useEffect, useState } from "react";
import {
  IonApp,
  // IonPopover,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonButton,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { personCircle, cog } from 'ionicons/icons';

// Pages
import Profile from "./pages/profile";
import Settings from "./pages/settings";
import LoginScreen from './pages/loginScreen';
// import AuthenticateInstagram from './pages/authenticateInstagram';
import SplashScreen from './pages/splashScreen';

import netlifyIdentity from 'netlify-identity-widget';

// Api
import getUser from './api/getUser';
import getIGMedia from "./api/getIGMedia";
import addUserPost from "./api/addUserPost";
import updateUserPost from './api/updateUserPost'

import { Route, Redirect } from "react-router-dom";

// Core CSS required for Ionic components to work properly
import '@ionic/react/css/core.css';

// Basic CSS for apps built with Ionic
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

// Optional CSS utils that can be commented out
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

// Theme variables
import './theme/variables.css';

// Internationalization
import { Trans } from '@lingui/macro';

// 🎶️ Do you beleive in magic ✨️
import { Magic } from 'magic-sdk';
const magic = new Magic('pk_test_547D3164C0086FB8');
window.magic = magic

export default () => {
  const [ isLoggedIn, setIsLoggedIn ] = useState( null );
  const [ userMetadata, setUserMetadata ] = useState( {} ); 

  const [ currentUser, setCurrentUser ] = useState( netlifyIdentity.currentUser() );
  const [ userInformation, setUserInformation ] = useState( null );

  console.log( isLoggedIn )

  if ( isLoggedIn === null ) {
    magic.user.isLoggedIn().then(setIsLoggedIn);
    return <p>Loading...</p>
  }

  if ( isLoggedIn === false ) {
    return <LoginScreen magic={magic} setIsLoggedIn={setIsLoggedIn} setCurrentUser={setCurrentUser} setUserInformation={setUserInformation} />
  }

  console.log( isLoggedIn )
  if ( isLoggedIn === true ) {
    magic.user.getMetadata().then( console.log )
    return <p>You are logged in! 🎉️</p>
  }

  // eslint-disable-next-line
  const addPost = ({ post, position=0 }) => {
    const { posts } = userInformation;

    let userInformationCopy = { ...userInformation }
    userInformationCopy.posts = [...posts];
    userInformationCopy.posts.splice( position, 0, post );
    userInformationCopy.posts.sort(
      (a,b) => new Date(b.timestamp)*1 - new Date(a.timestamp)*1
    );
    setUserInformation( userInformationCopy );

    addUserPost({
      post,
      userId: currentUser.id,
      position 
    });
  }

  const updatePost = ( postId, postData ) => {
    console.log("Calling update post")
    const { posts } = userInformation;
    const postIndex = posts.map( post => post.id ).indexOf( postId );
    
    let postsCopy = [...posts];
    postsCopy[postIndex] = postData;

    let userInformationCopy = { ...userInformation }
    userInformationCopy.posts = postsCopy;
    setUserInformation( userInformationCopy );

    updateUserPost({ post: postData, userId: currentUser.id });
  }

  // The first time userInformation loads
  const userInformationIsNull = userInformation === null || userInformation.error;
  useEffect(() => {
    if ( userInformationIsNull ) return;

    // Check if the instagram data has been updated
    if ( userInformation.instagram ) {
      getIGMedia(userInformation.instagram).then( posts => {
        console.log( posts )
        const existingIds = userInformation.posts.map( post => post.id );
        console.log("Checking for new posts")

        // If there's a new post, add it
        posts.forEach( (post, position) => {
          if ( !existingIds.includes( post.id ) ) {
            post.products = []
            addPost({ post, position });
          }
        });

      });
    }

    let userInformationCopy = { ...userInformation };
    userInformationCopy.posts.sort(
      (a,b) => new Date(b.timestamp)*1 - new Date(a.timestamp)*1
    );
    console.log( userInformationCopy.posts )
    if ( JSON.stringify(userInformationCopy.posts) !== JSON.stringify(userInformation.posts) ) {
      setUserInformation( userInformationCopy )
    }

  // I dont want any other variables as a dependancy so this only fires once
  // eslint-disable-next-line
  }, [userInformationIsNull])

  if ( !currentUser ) {
    if ( window.location.origin.match("http://") ) {
      // setCurrentUser({
      //   id: "be81a816-fd3f-4a41-858d-0bca5f028a0d"
      // })
      localStorage.removeItem('netlifySiteURL');
      // return <p>Setting dev user...</p>
    }
    return <LoginScreen setCurrentUser={setCurrentUser} setUserInformation={setUserInformation} />
  }

  // If we're logged in, fetch the user from the database
  if ( userInformation === null ) {
    getUser( netlifyIdentity.currentUser().id ).then( userInformationResponse => {
      setUserInformation( userInformationResponse );
    });
    return <SplashScreen />
  }

  console.log( userInformation )
  if ( userInformation.error ) {
    return <IonPage>
        <IonHeader mode="ios">
          <IonToolbar>
            <IonTitle><Trans>You are on the waitlist</Trans></IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ width: "100%", maxWidth: 600, position: "absolute", top: "50%", left: "50%", transform: "translateX(-50%) translateY(-50%)", textAlign: "center", padding: 20 }}>
            <h2><Trans>Muah.bio is currently invite only. We'll send you an invite in time</Trans></h2>
            <br /><br />
            <IonButton onClick={()=>{netlifyIdentity.logout();window.location = window.location.origin;}}><Trans>Log Out</Trans></IonButton>
          </div>
        </IonContent>
      </IonPage>
  }

  // // If the user exists but they dont have an instagram token, they need to be authenticated
  // const isConnectedToInstagram = !userInformation.instagram || !userInformation.instagram.token;
  // if ( isConnectedToInstagram ) {
  //   return <AuthenticateInstagram currentUser={currentUser} setUserInformation={setUserInformation}  />
  // }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/:tab(home)" exact={true} render={props => <div>
              <Profile
                {...props}
                userInformation={userInformation}
                username={userInformation.instagram.username}
                posts={userInformation.posts}
                updatePost={updatePost} />
            </div>} />
            <Route path="/:tab(settings)" exact={true} render={ props =>
              <Settings {...props} userInformation={userInformation} setUserInformation={setUserInformation}/>
            }/>
            <Route exact path="/" render={() => <Redirect to="/home" />} />
          </IonRouterOutlet>
          
          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home">
              <IonIcon icon={personCircle} />
              <IonLabel><Trans>Profile</Trans></IonLabel>
            </IonTabButton>

            <IonTabButton tab="settings" href="/settings">
              <IonIcon icon={cog} />
              <IonLabel><Trans>Settings</Trans></IonLabel>
            </IonTabButton>

            {/* <IonTabButton tab="stats" href="/stats">
              <IonIcon icon={statsChart} />
              <IonLabel>Stats</IonLabel>
            </IonTabButton> */}
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
      {/* <IonPopover
        isOpen={!userInformation.instagram}
      >
        Hello world
      </IonPopover> */}
    </IonApp>
  );
}