// @ts-nocheck

import React, { useEffect, useState } from "react";
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';


import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/react';
import { personCircle, map, informationCircle, cog, statsChart } from 'ionicons/icons';

// Pages
import Profile from "./pages/profile";
// import EditPost from "./pages/editPost";
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
    setUserInformation( userInformationCopy );

    addUserPost({
      post,
      userId: currentUser.id,
      position 
    });
  }

  const updatePost = ( postId, postData ) => {
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
  useEffect(() => {
    if ( userInformation === null ) return;

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
    } else {
      console.log( userInformation )
    }
  }, [userInformation !== null])

  if ( !currentUser ) {
    return <LoginScreen setCurrentUser={setCurrentUser} setUserInformation={setUserInformation} />
  }

  // If we're logged in, fetch the user from the database
  if ( userInformation === null ) {
    getUser( currentUser.id ).then( userInformationResponse => {
      setUserInformation( userInformationResponse );
    });
    return <SplashScreen />
  }

  // If the user exists but they dont have an instagram token, they need to be authenticated
  if ( !userInformation.instagram || !userInformation.instagram.token ) {
    return <AuthenticateInstagram currentUser={currentUser} setUserInformation={setUserInformation}  />
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/:tab(profile)" exact={true} render={props => 
              <Profile {...props} username={userInformation.instagram.username} posts={userInformation.posts} currentUser={currentUser} />
            } />
            <Route path="/:tab(settings)" exact={true} render={ props =>
              <Settings {...props} userInformation={userInformation} setUserInformation={setUserInformation}/>
            }/>
            <Route exact path="/" render={() => <Redirect to="/:tab(profile)" />} />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="profile" href="/profile">
              <IonIcon icon={personCircle} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>

            <IonTabButton tab="settings" href="/settings">
              <IonIcon icon={cog} />
              <IonLabel>Settings</IonLabel>
            </IonTabButton>

            <IonTabButton tab="stats" href="/stats">
              <IonIcon icon={statsChart} />
              <IonLabel>Stats</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}