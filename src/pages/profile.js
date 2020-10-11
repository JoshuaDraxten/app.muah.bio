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

const Profile = ({ username, posts, updatePost}) => {
  const [ openedPost, setOpenedPost ] = useState( false );
  const [ showProfileUrlOptions, setShowProfileUrlOptions ] = useState({ opened: false, event: undefined });
  const [ toastMessage, setToastMessage ] = useState("");

  function openPopover( event ){
    event.persist();
    setShowProfileUrlOptions({open: true, event});
  }

  function copyToUrlToClipboard() {
    copyTextToClipboard("https://muah.bio/"+username);
    setToastMessage("Your Muah.bio profile has been copied to your clipboard");
    setShowProfileUrlOptions({open: false, event: undefined})
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="hide-title-on-ios">
          <IonTitle>Profile</IonTitle>
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
                      <IonLabel>Copy Url</IonLabel>
                    </IonItem>
                    <IonItem
                      href={"https://muah.bio/"+username} target="_blank"
                      button onClick={()=>setShowProfileUrlOptions({open: false, event: undefined})}
                    >
                      <IonLabel>Preview Profile</IonLabel>
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
            <IonTitle size="large">Profile</IonTitle>
          </IonToolbar>
        </IonHeader>
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
          <EditPost post={posts[openedPost]} updatePost={updatePost} closePost={() => setOpenedPost(null)} />
        </IonModal> : null}
      </IonContent>

    </IonPage>
  );
}
export default Profile;
