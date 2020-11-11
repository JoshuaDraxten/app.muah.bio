// @ts-nocheck

import React, { useEffect, useState } from "react";
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { personCircle, cog, cash } from 'ionicons/icons';

// Pages
import Profile from "./pages/profile";
import Settings from "./pages/settings";
import AffiliateSettings from './pages/affiliateSettings';
import LoginScreen from './pages/loginScreen';
import InstagramSetup from './pages/instagramSetup';
import SplashScreen from './pages/splashScreen';

// Api
import getUser from './api/getUser';
import addUserPost from "./api/addUserPost";
import updateUserPost from './api/updateUserPost';
import clientSideGetIGGosts from './api/clientSideGetIGPosts';

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
import { withI18n } from "@lingui/react"

// Netlify Authentication
import GoTrue from 'gotrue-js';
window.auth = new GoTrue({
  APIUrl: 'https://app.muah.bio/.netlify/identity',
  audience: '',
  setCookie: false,
});

// import netlifyIdentity from 'netlify-identity-widget';
// window.netlifyIdentity = netlifyIdentity;
// var userLang = ( navigator.language || navigator.userLanguage).slice(0,2);
// netlifyIdentity.init({ locale: userLang });

// function modifyNetlifyAuth(){
//   const tryAgainLater = () => {
//       setTimeout( modifyNetlifyAuth, 100 );
//       console.log("waiting...")
//       return;
//   }

//   const modal = document.getElementById("netlify-identity-widget");
//   if (!modal) return tryAgainLater()

//   const modalDocument = modal.contentDocument;
//   if ( modalDocument.body.innerHTML === '' ) return tryAgainLater();

//   // Remove close button and callout
//   [...modalDocument.querySelectorAll(".btnClose, .callOut")].forEach(
//     node => node.style.display = 'none'
//   );
// }
// modifyNetlifyAuth();

// // 🎶️ Do you beleive in magic ✨️ (Not yet I don't)
// import { Magic } from 'magic-sdk';
// const magic = new Magic('pk_live_452F1F42DDE138C5');
// window.magic = magic

const App = ({ i18n }) => {
  const [ isLoading, setIsLoading ] = useState( true );
  const [ token, setToken ] = useState('');
  const [ userInformation, setUserInformation ] = useState( null );

  if ( userInformation && userInformation.error === "User Does not exist" ) {
    window.auth.currentUser().logout();
    window.location = window.location.origin;
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

    console.log( userInformation );

    addUserPost({
      ig_username: userInformation.instagram.username,
      post,
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

    updateUserPost({
      token,
      post: postData,
      userEmail: userInformation.email
    });
  }

  // The first time userInformation loads
  const userInformationIsNull = userInformation === null || userInformation.error;
  useEffect(() => {
    if ( userInformationIsNull ) return;

    // Load posts
    clientSideGetIGGosts( userInformation.instagram.username ).then( posts => {
      const existingIds = userInformation.posts.map( post => post.id );

      posts.forEach( (post, position) => {
        if ( !existingIds.includes( post.id ) ) {
          console.log( "Adding post", post )
          post.products = []
          addPost({ post, position });
        }
      });

    });

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

  // netlifyIdentity.on('login', user => {
  //   console.log( 'logged in' );
  //   netlifyIdentity.close();
  //   setIsLoading( false );

    // getUser().then( response => {
    //     setUserInformation( response )
    // })
  // } );
  console.log( window.auth.currentUser() )
  if ( window.auth.currentUser() === null ) {
    return <LoginScreen setUserInformation={userInfo => {setUserInformation(userInfo); setIsLoading(false)}} />;
  }

  if ( userInformation === null ) {
    if ( !window.hasFetchedToken ) {
      // Prevent repeating this more than once
      window.hasFetchedToken = true;
      // const token = netlifyIdentity.currentUser().token.access_token;
      
      // setToken( token );

      getUser().then( userInfo => {
        setUserInformation( userInfo );
        setIsLoading( false )
      });
    }
    return <SplashScreen />
  }

  if ( userInformation.error ) {
    // Gotta initialize the user!
    return <InstagramSetup token={token} setUserInformation={setUserInformation} />
  }

  if ( isLoading === true ) {
    return <SplashScreen />
  }

  const hasAffiliateSetup = (
    Object.keys(userInformation.settings.affiliatePrograms).length > 0 &&
    (
      userInformation.settings.affiliatePrograms.amazon.trackingId ||
      userInformation.settings.affiliatePrograms.rakuten.token
    )
  );

  const profile = i18n._('profile');
  const settings = i18n._('settings');
  const affiliates = i18n._('affiliates');

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path={`/:tab(${profile})/:postId?`} exact={true} render={props => <div>
              <Profile
                {...props}
                userInformation={userInformation}
                username={userInformation.instagram.username}
                posts={userInformation.posts}
                updatePost={updatePost} />
            </div>} />
            <Route path={`/:tab(${settings})`} exact={true} render={ props =>
              <Settings {...props} userInformation={userInformation} setUserInformation={setUserInformation}/>
            }/>
            <Route path={`/:tab(${affiliates})`} exact={true} render={ props =>
              <AffiliateSettings
                {...props}
                hasAffiliateSetup={hasAffiliateSetup}
                userInformation={userInformation}
                setUserInformation={setUserInformation}/>
            }/>
            <Route render={() => <Redirect to={hasAffiliateSetup ? "/"+profile : "/"+affiliates} />} />
          </IonRouterOutlet>
          
          <IonTabBar slot="bottom">
            <IonTabButton tab="profile" href={"/"+profile}>
              <IonIcon icon={personCircle} />
              <IonLabel><Trans>Profile</Trans></IonLabel>
            </IonTabButton>

            <IonTabButton tab="affiliates" href={"/"+affiliates}>
              <IonIcon icon={cash} />
              <IonLabel><Trans>Affiliates</Trans></IonLabel>
            </IonTabButton>

            <IonTabButton tab="settings" href={"/"+settings}>
              <IonIcon icon={cog} />
              <IonLabel><Trans>Settings</Trans></IonLabel>
            </IonTabButton>

          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}

export default withI18n()(App);