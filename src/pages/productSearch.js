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
    // current property is refered to input element
    console.log( searchInput.current );
    (async () => {
      const searchInputElem = await searchInput.current.setFocus();
      console.log( searchInputElem )
    })();

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