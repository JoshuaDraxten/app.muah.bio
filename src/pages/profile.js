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
} from '@ionic/react';
import './profile.css';
import EditPost from './editPost'

const PostPreview = ({ post, onClick }) => (
  <div onClick={onClick} to={"/edit/"+post.id}
    key={post.id}
    className={"photo-grid__photo" + (post.isPublished ? " published" : "") + (post.products.length!==0 ? " has-products" : "")}
    style={{ backgroundImage: `linear-gradient(white, white), url('${ post.media_url }')` }}
  ></div>
)

const Profile = ({ history, username, posts, updatePost}) => {
  const [ openedPost, setOpenedPost ] = useState( false );
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Profile</IonTitle>
            {/* <IonButtons slot="end">
              <IonButton>
                <IonIcon slot="icon-only" icon={cogOutline} />
              </IonButton>
            </IonButtons> */}
          </IonToolbar>
        </IonHeader>
        <IonGrid>
          <IonRow>
            {posts.map((post, index) => (
              <IonCol size="4" key={index}>
                <PostPreview post={post} onClick={ () => setOpenedPost(post) }/>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        { openedPost ? <IonModal isOpen={openedPost} swipeToClose={true} onDidDismiss={() => setOpenedPost(false)}>
          <EditPost post={openedPost} updatePost={updatePost} closePost={() => setOpenedPost(false)} />
        </IonModal> : null}
      </IonContent>
    </IonPage>
  );
}
export default Profile;
