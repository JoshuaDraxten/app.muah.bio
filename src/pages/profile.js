import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonButton,
  IonButtons,
  IonLabel,
  IonToast,
  IonChip
} from '@ionic/react';
import './profile.css';
import EditPost from './editPost'

import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

// Internationalization
import { Trans } from '@lingui/macro';
import { withI18n } from "@lingui/react"

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}

const PostPreview = ({ url, post }) => (
  <Link to={url}
    key={post.id}
    className={"photo-grid__photo" + (post.products.length!==0 ? " published" : "")}
    style={{ backgroundImage: `linear-gradient(white, white), url('${ post.media_url }')` }}
  ></Link>
)

const Profile = ({ i18n, history, userInformation, username, posts, updatePost}) => {
  const { postId } = useParams();
  const openedPost = posts.map( post => post.id ).indexOf( postId );
  
  const [ showProfileUrlOptions, setShowProfileUrlOptions ] = useState({ opened: false, event: undefined });
  const [ toastMessage, setToastMessage ] = useState("");

  function openPopover( event ){
    event.persist();
    setShowProfileUrlOptions({open: true, event});
  }

  function copyToUrlToClipboard() {
    copyTextToClipboard("https://muah.bio/"+username);
    setToastMessage(i18n._("Your Muah.bio profile URL has been copied to your clipboard"));
    setShowProfileUrlOptions({open: false, event: undefined})
  }

  console.log( userInformation, posts )

  const daysTillTrialIsOver = 14 - Math.floor((new Date() - new Date( userInformation.createDate )) / ( 1000 * 60 * 60 * 24 ) )

  const noPublishedPosts = posts.filter( post => post.products.length > 0 ).length === 0;

  const hasAffiliateSetup = (
    Object.keys(userInformation.settings.affiliatePrograms).length > 0 &&
    (
      userInformation.settings.affiliatePrograms.amazon.trackingId ||
      userInformation.settings.affiliatePrograms.rakuten.token
    )
  );

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle><Trans>Profile</Trans></IonTitle>
          <IonButtons slot="end">
              <IonButton
                href={"https://muah.bio/"+username} target="_blank"
                button onClick={()=>setShowProfileUrlOptions({open: false, event: undefined})}
              >
                <IonLabel><Trans>View Your Page</Trans></IonLabel>
              </IonButton>
            </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonToast
        isOpen={toastMessage.length > 0}
        onDidDismiss={() => setToastMessage("")}
        message={toastMessage}
        duration={1000}
      />

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large"><Trans>Profile</Trans></IonTitle>
          </IonToolbar>
        </IonHeader>
        { noPublishedPosts || !hasAffiliateSetup ?
          <div className="disclaimer" style={{marginBottom: 0}}>
            {noPublishedPosts && <p><Trans>Welcome to Muah.bio! Greyed out posts have no products associated with them and will not show up on your page. Click on a post to add products.</Trans></p>}
            {!hasAffiliateSetup && <p><Trans>Remember to <b>connect your affiliate accounts</b> in settings to add products!</Trans></p>}
          </div>
        : null }
        { daysTillTrialIsOver > -1 &&
          <div className="trial-warning">
            <IonChip color={"warning"}><Trans>
              Your trial account expires in {daysTillTrialIsOver} days
            </Trans></IonChip>
          </div>}
        <IonGrid style={{maxWidth: 1000}}>
          <IonRow>
            {posts.map((post, index) => (
              <IonCol size="4" key={index}>
                <PostPreview url={`/${i18n._("profile")}/${post.id}`} post={post} />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        { openedPost !== -1 ? <IonModal isOpen={openedPost !== -1} onDidDismiss={() => history.push('/'+i18n._("profile")+'/')}>
          <EditPost
            userInformation={userInformation}
            post={posts[openedPost]}
            updatePost={updatePost}
            closePost={() => history.push('/'+i18n._("profile")+'/')} />
        </IonModal> : null}
      </IonContent>

    </>
  );
}
export default withI18n()(Profile);
