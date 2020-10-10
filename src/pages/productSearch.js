import React, {useRef, useEffect, useState} from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonSearchbar,
  IonItem,
  IonThumbnail,
  IonLabel
} from '@ionic/react';

import productSearch from '../api/productSearch';

const ProductResult = ({ product, addProduct, closeSearch }) => (
  <IonItem onClick={() => {addProduct(product); closeSearch()}}>
    <IonThumbnail slot="start" style={{background: "#ffffff", borderRadius: 4}}>
      <img src={product.image} alt="" style={{objectFit: "contain"}} />
    </IonThumbnail>
    <IonLabel className="ion-text-wrap">
      <h3>{product.name}</h3>
      <p>{ product.price.number ? product.price.symbol: ""}{ product.price.number }</p>
    </IonLabel>
  </IonItem>
)

export default ({ addProduct, closeSearch }) => {
  const [ results, setResults ] = useState([]);
  const [ query, setQuery ] = useState("");
  const searchInput = useRef(null);

  useEffect(() => {
    // Wait till animation is done to focus on input
    setTimeout( ()=>searchInput.current.setFocus(), 600 )
  },[searchInput])

  useEffect(() => {
    if ( query.length > 2 ) {
      productSearch({ keyword: query }).then( response => {
          setResults( response )
          console.log( response )
      });
  } else {
      setResults([]);
  }
  }, [ query ]);

  return (
    <IonPage onClick={() => searchInput.current.setFocus()}>
      <IonHeader>
        <IonSearchbar
          className="product-search-bar"
          showCancelButton="always"
          placeholder="Search for makeup products"
          onIonCancel={closeSearch}
          ref={searchInput}
          value={query}
          onIonChange={e=>setQuery(e.target.value)}
          debounce={300}
        ></IonSearchbar>
      </IonHeader>
      <IonContent>
        { results.map( (product, i) => 
          <ProductResult product={product} key={i} addProduct={addProduct} closeSearch={closeSearch} />
        ) }
      </IonContent>
    </IonPage>
  )
}