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

import { personCircle, cog } from 'ionicons/icons';

// Pages
import Profile from "./pages/profile";
import Settings from "./pages/settings";
// import LoginScreen from './pages/loginScreen';
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

// Netlify Authentication
import netlifyIdentity from 'netlify-identity-widget';
window.netlifyIdentity = netlifyIdentity;
var userLang = ( navigator.language || navigator.userLanguage).slice(0,2);
netlifyIdentity.init({ locale: userLang });

function modifyNetlifyAuth(){
  const tryAgainLater = () => {
      setTimeout( modifyNetlifyAuth, 100 );
      console.log("waiting...")
      return;
  }

  const modal = document.getElementById("netlify-identity-widget");
  if (!modal) return tryAgainLater()

  const modalDocument = modal.contentDocument;
  if ( modalDocument.body.innerHTML === '' ) return tryAgainLater();

  // Remove close button and callout
  [...modalDocument.querySelectorAll(".btnClose, .callOut")].forEach(
    node => node.style.display = 'none'
  );
}
modifyNetlifyAuth();

// // 🎶️ Do you beleive in magic ✨️ (Not yet I don't)
// import { Magic } from 'magic-sdk';
// const magic = new Magic('pk_live_452F1F42DDE138C5');
// window.magic = magic

export default () => {
  const [ isLoading, setIsLoading ] = useState( true );
  const [ token, setToken ] = useState('');
  const [ userInformation, setUserInformation ] = useState( null );

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
      ig_username: userInformation.instagram.username,
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

    // TODO: Do this later
    // // Check if the instagram data has been updated
    // if ( userInformation.instagram ) {
    //   getIGMedia(userInformation.instagram).then( posts => {
    //     console.log( posts )
    //     const existingIds = userInformation.posts.map( post => post.id );
    //     console.log("Checking for new posts")

    //     // If there's a new post, add it
        // posts.forEach( (post, position) => {
        //   if ( !existingIds.includes( post.id ) ) {
        //     post.products = []
        //     addPost({ post, position });
        //   }
        // });

    //   });
    // }

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

  netlifyIdentity.on('login', user => {
    console.log( 'logged in' );
    netlifyIdentity.close();
    setIsLoading( false );

    getUser().then( response => {
        setUserInformation( response )
    })
  } );
  if ( netlifyIdentity.currentUser() === null ) {
    netlifyIdentity.open();
    return null;
  }

  if ( userInformation === null ) {
    if ( !window.hasFetchedToken ) {
      // Prevent repeating this more than once
      window.hasFetchedToken = true;
      const token = netlifyIdentity.currentUser().token.access_token;
      
      setToken( token );

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

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/:tab(profile)/:postId?" exact={true} render={props => <div>
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
            <Route exact path="/" render={() => <Redirect to="/profile" />} />
          </IonRouterOutlet>
          
          <IonTabBar slot="bottom">
            <IonTabButton tab="profile" href="/profile">
              <IonIcon icon={personCircle} />
              <IonLabel><Trans>Profile</Trans></IonLabel>
            </IonTabButton>

            <IonTabButton tab="settings" href="/settings">
              <IonIcon icon={cog} />
              <IonLabel><Trans>Settings</Trans></IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}