import React, {useRef, useEffect, useState} from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonSearchbar,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonToolbar,
  IonSkeletonText
} from '@ionic/react';

import productSearch from '../api/productSearch';

const ProductResult = ({ product, addProduct, closeSearch, wordsToBold=[] }) => {
  let boldedName = product.name.split(" ").map( word => 
    wordsToBold.includes(word.toLowerCase()) ? "<b>"+word+"</b>" : word
  ).join(" ");
  return (
    <IonItem onClick={() => {addProduct(product); closeSearch()}}>
      <IonThumbnail slot="start" style={{background: "#ffffff", borderRadius: 4}}>
        <img src={product.image} alt="" style={{objectFit: "contain"}} />
      </IonThumbnail>
      <IonLabel className="ion-text-wrap">
        <h3 dangerouslySetInnerHTML={{__html: boldedName}}></h3>
        <p>{ product.price.number ? product.price.symbol: ""}{ product.price.number }</p>
      </IonLabel>
    </IonItem>
  )
}
const LoadingProductResult = () => (
  <IonItem>
    <IonThumbnail slot="start" style={{background: "#ffffff", borderRadius: 4}}>
      <IonSkeletonText animated />
    </IonThumbnail>
    <IonLabel className="ion-text-wrap">
      <h3><IonSkeletonText animated style={{ width: "80%" }} /></h3>
      <h3><IonSkeletonText animated style={{ width: "40%" }} /></h3>
      <p><IonSkeletonText animated style={{ width: "20%" }} /></p>
    </IonLabel>
  </IonItem>
)

const LoadingProductResults = () => [...Array(45)].map( (x, i) => <LoadingProductResult key={i} /> )

export default ({ addProduct, closeSearch }) => {
  const [ results, setResults ] = useState([]);
  const [ query, setQuery ] = useState("");
  const [ isSearching, setIsSearching ] = useState(false)
  const searchInput = useRef(null);

  useEffect(() => {
    // Wait till animation is done to focus on input
    setTimeout( ()=>searchInput.current.setFocus(), 600 )
  },[searchInput])

  const updateResults = ( newResults, queryUsed ) => {
    console.log( searchInput.current )
    const currentQuery = searchInput.current.querySelector("input").value;
    console.log( currentQuery, queryUsed )
    if ( queryUsed !== currentQuery ) return;

    setIsSearching(false);
    setResults( newResults )
    console.log( newResults )
  }

  useEffect(() => {
    if ( query.length > 2 ) {
      console.log( query )
      setIsSearching(true);
      productSearch({ keyword: query }).then( newResults => updateResults( newResults, query ));
  } else {
      setResults([]);
  }
  }, [ query ]);

  const updateQuery = e => {
    console.log( e.target.value )
    setQuery(e.target.value);
  }

  return (
    <IonPage onClick={() => searchInput.current.setFocus()}>
      <IonHeader>
        <IonToolbar>
          <IonSearchbar
            className="product-search-bar"
            showCancelButton="always"
            placeholder="Search for makeup products"
            onIonCancel={closeSearch}
            ref={searchInput}
            value={query}
            onIonChange={updateQuery}
            debounce={600}
          ></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        { isSearching ?
          <LoadingProductResults/>
          :
          results.map( (product, i) => 
          <ProductResult product={product} key={i} addProduct={addProduct} closeSearch={closeSearch} wordsToBold={query.split(' ')}/>
        )}
      </IonContent>
    </IonPage>
  )
}