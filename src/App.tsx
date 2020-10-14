// @ts-nocheck

import React, { useEffect, useState } from "react";
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';


import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { personCircle, cog } from 'ionicons/icons';

// Pages
import Profile from "./pages/profile";
import Settings from "./pages/settings";
import LoginScreen from './pages/loginScreen';
import AuthenticateInstagram from './pages/authenticateInstagram';
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

export default () => {
  const [ currentUser, setCurrentUser ] = useState( netlifyIdentity.currentUser() );
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
    if ( userInformation.instagram && userInformation.instagram.token ) {
      getIGMedia({token: userInformation.instagram.token}).then( posts => {
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
      setCurrentUser({
        id: "a6b974c7-397e-4f0e-8e59-70495cd7ce17"
      })
      return <p>Setting dev user...</p>
    } else {
      return <LoginScreen setCurrentUser={setCurrentUser} setUserInformation={setUserInformation} />
    }
  }

  // If we're logged in, fetch the user from the database
  if ( userInformation === null ) {
    getUser( currentUser.id ).then( userInformationResponse => {
      setUserInformation( userInformationResponse );
    });
    return <SplashScreen />
  }

  // If the user exists but they dont have an instagram token, they need to be authenticated
  const isConnectedToInstagram = !userInformation.instagram || !userInformation.instagram.token;
  if ( isConnectedToInstagram ) {
    return <AuthenticateInstagram currentUser={currentUser} setUserInformation={setUserInformation}  />
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/:tab(home)" exact={true} render={props => <div>
              <Profile
                {...props}
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
              <IonLabel>Profile</IonLabel>
            </IonTabButton>

            <IonTabButton tab="settings" href="/settings">
              <IonIcon icon={cog} />
              <IonLabel>Settings</IonLabel>
            </IonTabButton>

            {/* <IonTabButton tab="stats" href="/stats">
              <IonIcon icon={statsChart} />
              <IonLabel>Stats</IonLabel>
            </IonTabButton> */}
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}