import React, {useRef, useEffect, useState} from 'react';
import {
  IonContent,
  IonHeader,
  IonListHeader,
  IonPage,
  IonSearchbar,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonToolbar,
  IonSkeletonText
} from '@ionic/react';

import productSearch from '../api/productSearch';
import getProductFromUrl from '../api/getProductFromUrl';

// Internationalization
import { Trans } from '@lingui/macro';

const ProductResult = ({ product, addProduct, closeSearch, wordsToBold=[] }) => {
  console.log( product )
  let boldedName = product.name.split(" ").map( word => 
    wordsToBold.includes(word.toLowerCase().replace(/[^a-z]/g, '')) ? "<b>"+word+"</b>" : word
  ).join(" ");

  let formattedPrice = "";
  try {
    formattedPrice = " | " + Intl.NumberFormat('en-US', { style: 'currency', currency: product.price.currency })
      .format(product.price.number);
  } catch (error) {}
  
  return (
    <IonItem onClick={() => {addProduct(product); closeSearch()}}>
      <IonThumbnail slot="start" style={{background: "#ffffff", borderRadius: 4}}>
        <img src={product.image} alt="" style={{objectFit: "contain"}} />
      </IonThumbnail>
      <IonLabel className="ion-text-wrap">
        <h3 dangerouslySetInnerHTML={{__html: boldedName}}></h3>
        <p>{ product.retailer.name }{ formattedPrice }</p>
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

const isUrl = url => {
  console.log( url )
  try {
    new URL(url);
  } catch (error) {
    return false
  }
  return true;
}

const LoadingProductResults = () => [...Array(45)].map( (x, i) => <LoadingProductResult key={i} /> )

export default ({ addProduct, closeSearch }) => {
  const [ results, setResults ] = useState([]);
  const [ query, setQuery ] = useState("");
  const [ isSearching, setIsSearching ] = useState(false);
  const searchInput = useRef(null);

  useEffect(() => {(async () => {
    console.log("Running this")
    const clipboardText = await navigator.clipboard.readText()

    if ( isUrl( clipboardText ) ) {
      getProductFromUrl( clipboardText )
        .then( newResult => updateResults( [newResult], query ) )
        .catch( error => {
          console.log(error);
          setIsSearching(false);
        });
    }
  // eslint-disable-next-line
  })()}, []);

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
      setIsSearching(true);
      try {
        if ( isUrl(query) ) {
          getProductFromUrl( query )
            .then( newResult => updateResults( [newResult], query ) )
            .catch( error => {
              console.log(error);
              setIsSearching(false);
            });
        } else {
          productSearch({ keyword: query })
            .then( newResults => updateResults( newResults, query ) )
            .catch( error => {
              console.log(error);
              setIsSearching(false);
            });
        }
      } catch (error) {
        console.error( error )
      }
      
  } else {
      setResults([]);
  }
  }, [ query, closeSearch ]);

  const updateQuery = e => {
    console.log( e.target.value )
    setQuery(e.target.value);
  }

  return (
    <IonPage onClick={() => searchInput.current.setFocus()}>
      <IonHeader>
        <IonToolbar>
          <Trans render={ ({translation}) => 
            <IonSearchbar
              className="product-search-bar"
              showCancelButton="always"
              placeholder={translation}
              onIonCancel={closeSearch}
              ref={searchInput}
              value={query}
              onIonChange={updateQuery}
              debounce={1000}
            ></IonSearchbar>
          }>
              Search for products or paste url
          </Trans>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        { (query === "" && results.length === 1) ?
          <IonListHeader>
            <IonLabel><Trans>Found this product in your clipboard</Trans></IonLabel>
          </IonListHeader>
        : "" }
        { isSearching ?
          <LoadingProductResults/>
          :
          results.map( (product, i) => 
          <ProductResult product={product} key={i} addProduct={addProduct} closeSearch={closeSearch} wordsToBold={query.split(' ').map(x=>x.toLowerCase())}/>
        )}
      </IonContent>
    </IonPage>
  )
}