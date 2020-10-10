import {
  IonContent,
  IonHeader,
  IonPage,
  IonSearchbar
} from '@ionic/react';

import React, {useRef, useEffect} from 'react';

export default () => {
  const searchInput = useRef(null);

  useEffect(() => {
    // Wait till animation is done to focus on input
    setTimeout( ()=>searchInput.current.setFocus(), 600 )
 },[searchInput])

  return (
    <IonPage>
      <IonHeader>
        <IonSearchbar
          placeholder="Search for makeup products"
          ref={searchInput}
        ></IonSearchbar>
      </IonHeader>
      <IonContent>
        Results go here.
      </IonContent>
    </IonPage>
  )
}