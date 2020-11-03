import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonButton,
  IonButtons,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  IonToast
} from '@ionic/react';
import './profile.css';
import EditPost from './editPost'

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

const PostPreview = ({ post, onClick }) => (
  <div onClick={onClick} to={"/edit/"+post.id}
    key={post.id}
    className={"photo-grid__photo" + (post.products.length!==0 ? " published" : "")}
    style={{ backgroundImage: `linear-gradient(white, white), url('${ post.media_url }')` }}
  ></div>
)

const Profile = ({ i18n, userInformation, username, posts, updatePost}) => {
  const [ openedPost, setOpenedPost ] = useState( false );
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

  const noPublishedPosts = posts.filter( post => post.products.length > 0 ).length === 0;

  const hasAffiliateSetup = (
    Object.keys(userInformation.settings.affiliatePrograms).length > 0 &&
    (
      userInformation.settings.affiliatePrograms.amazon.trackingId ||
      userInformation.settings.affiliatePrograms.rakuten.token
    )
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="hide-title-on-ios">
          <IonTitle><Trans>Profile</Trans></IonTitle>
          <IonButtons slot="end">
              <IonButton>
                <div onClick={openPopover}>muah.bio/{username}</div>
                <IonPopover
                  isOpen={showProfileUrlOptions.open}
                  event={showProfileUrlOptions.event}
                  onDidDismiss={()=>setShowProfileUrlOptions({open: false, event: undefined})}
                  cssClass='my-custom-class'
                >
                  <IonList>
                    <IonItem button onClick={copyToUrlToClipboard}>
                      <IonLabel><Trans>Copy Url</Trans></IonLabel>
                    </IonItem>
                    <IonItem
                      href={"https://muah.bio/"+username} target="_blank"
                      button onClick={()=>setShowProfileUrlOptions({open: false, event: undefined})}
                    >
                      <IonLabel><Trans>Preview Profile</Trans></IonLabel>
                    </IonItem>
                  </IonList>
                </IonPopover>
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
        {  noPublishedPosts || !hasAffiliateSetup ?
          <div className="disclaimer" style={{marginBottom: 0}}>
            {noPublishedPosts && <p><Trans>Greyed out posts have no products associated with them and will not show up on your page. Click on a post to add products.</Trans></p>}
            {!hasAffiliateSetup && <p><Trans>Remember to <b>connect your affiliate accounts</b> in settings to add products!</Trans></p>}
          </div>
        : null}
        <IonGrid style={{maxWidth: 1000}}>
          <IonRow>
            {posts.map((post, index) => (
              <IonCol size="4" key={index}>
                <PostPreview post={post} onClick={ () => setOpenedPost(index) }/>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        { posts[openedPost] ? <IonModal isOpen={posts[openedPost]} onDidDismiss={() => setOpenedPost(null)}>
          <EditPost userInformation={userInformation} post={posts[openedPost]} updatePost={updatePost} closePost={() => setOpenedPost(null)} />
        </IonModal> : null}
      </IonContent>

    </IonPage>
  );
}
export default withI18n()(Profile);
