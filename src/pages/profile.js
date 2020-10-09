import React from 'react';
// import Header from '../components/header';
import { Link } from "react-router-dom";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import './profile.css';

const PostPreview = ({ post }) => (
  <Link to={"/edit/"+post.id}
    key={post.id}
    className={"photo-grid__photo" + (post.isPublished ? " published" : "") + (post.products.length!==0 ? " has-products" : "")}
    style={{ backgroundImage: `linear-gradient(white, white), url('${ post.media_url }')` }}
  ></Link>
)

const Profile = ({ history, username, posts}) => {
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
                <PostPreview post={post}/>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        {/* <div className="photo-grid">{posts.map( post =>
          <PostPreview post={post} key={post.id} />
        )}</div> */}
      </IonContent>
    </IonPage>
  );
}
export default Profile;
