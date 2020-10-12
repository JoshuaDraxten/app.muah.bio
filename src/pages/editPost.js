import React, { useEffect, useRef, useState } from 'react';
import ProductSearch from './productSearch';

import './editPost.css';

// import Header from '../components/header';
// import swal from 'sweetalert';
// import ProductSearchBar from '../components/productSearchBar';
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonListHeader,
  IonModal,
  IonPage,
  IonReorder,
  IonReorderGroup,
  IonSearchbar,
  IonThumbnail,
  IonToolbar,
} from '@ionic/react';
import { closeCircle } from 'ionicons/icons';

const arrayMoveMutate = (array, from, to) => {
	const startIndex = from < 0 ? array.length + from : from;

	if (startIndex >= 0 && startIndex < array.length) {
		const endIndex = to < 0 ? array.length + to : to;

		const [item] = array.splice(from, 1);
		array.splice(endIndex, 0, item);
	}
};

const arrayMove = (array, from, to) => {
  console.log( array )
	array = [...array];
  arrayMoveMutate(array, from, to);
  console.log( array )
	return array;
};

const SwipeableProduct = ({ product, index, removeProduct, setProductTagEditor }) => (
  <IonItemSliding key={ product.url } onIonSwipe={()=>removeProduct(index)}>
    <IonItemOptions side="start">
      <IonItemOption color="danger" expandable onClick={()=>removeProduct(index)}>
        Delete
      </IonItemOption>
      <IonItemOption color="success" onClick={()=>setProductTagEditor( { open: true, productIndex: index, tag: product.tag } )}>
        Edit Tag
      </IonItemOption>
    </IonItemOptions>

    <IonItem>
      <IonThumbnail slot="start"  style={{background: "#ffffff", borderRadius: 4}}>
        <img src={product.image} alt="" style={{objectFit: "contain"}} />
      </IonThumbnail>
      <IonLabel className="ion-text-wrap">
      { product.tag ? <span className="tag">{product.tag}</span> : null }
        <h3>{product.name}</h3>
        <p>{ product.retailer.name }{ product.price.number ? " | "+product.price.symbol: ""}{ product.price.number }</p>
      </IonLabel>
      <IonReorder slot="end" />
    </IonItem>
  </IonItemSliding>
)

function EditPost({ post, updatePost, closePost } ){
  const [ productSearchIsOpen, setProductSearchIsOpen ] = useState( false );
  const [ products, setProducts ] = useState( post.products );
  const [ expandedHeader, setExpandedHeader ] = useState( false );
  const [ productTagEditor, setProductTagEditor ] = useState( { open: false, productIndex: -1, tag: '' } );
  const contentRef = useRef( null );

  useEffect(() => {
    setProducts(post.products);
  }, [post]);

  async function addProduct( product ) {
      setProductsInDb( products => products.concat( product ) );
      // Scroll to bottom of list
      const scrollElement = await contentRef.current.getScrollElement();
      setTimeout( () => scrollElement.scrollBy({ top: scrollElement.scrollHeight, behavior: 'smooth'}), 100);
  }

  async function removeProduct( productIndex ) {
    console.log( 'removing product', productIndex )
    setProductsInDb( products.filter( (x,index) => index!==productIndex ) )
  }

  function doReorder( event ){
      setProductsInDb( products => arrayMove( products, event.detail.from, event.detail.to ) );
      event.detail.complete();
  }

  function setProductsInDb( products ){
      setProducts( products )
      let postCopy = { ...post };
      if ( typeof products === "function" ) {
          updatePost( post.id, {
              ...post,
              products: products(postCopy.products)
          });
      } else {
          updatePost( post.id, {
              ...post, products
          });
      }
  }

  function openProductSearch(e) {
    setProductSearchIsOpen(true);
  }
  const sortableProductsList = products.map((product, i) => (
    <SwipeableProduct
      product={product}
      index={i}
      removeProduct={removeProduct}
      setProductTagEditor={setProductTagEditor}
      key={product.url} />
  ))

  return (
    <IonPage>
      <IonContent fullscreen ref={contentRef}>
        <div className=".header-buttons">
          <IonButtons slot="end" className="header-buttons">
            <IonButton onClick={closePost}>
              <IonIcon icon={closeCircle} size="large" />
            </IonButton>
          </IonButtons>
        </div>
        <div
          className={"edit-post-header" + (expandedHeader ? " expanded" : "")}
          style={{ backgroundImage: `url(${post.media_url})` }}
          onClick={ ()=>setExpandedHeader( x=>!x ) }
        ></div>
        <IonListHeader>
          <IonLabel>Tagged Products</IonLabel>
        </IonListHeader>
        <IonReorderGroup disabled={false} onIonItemReorder={doReorder}>
          { sortableProductsList }
        </IonReorderGroup>

        <IonAlert
          isOpen={productTagEditor.open}
          onDidDismiss={() => setProductTagEditor({ open: false, productIndex: -1, tag: '' })}
          subHeader={productTagEditor.productIndex!==-1?'Edit the tag for '+products[productTagEditor.productIndex].name: ''}
          inputs={[
            {
              name: 'tag',
              type: 'text',
              label: "Hello world",
              value: productTagEditor.tag,
              placeholder: 'ex: Lips'
            }
          ]}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                console.log('Cancel');
              }
            },
            {
              text: 'Ok',
              handler: ({ tag }) => {

                if ( tag === productTagEditor.tag ) return;

                let productsClone = [...products];
                productsClone[productTagEditor.productIndex].tag = tag;
                setProductsInDb( productsClone );
              }
            }
          ]}
        />
      </IonContent>

      <IonModal
        isOpen={productSearchIsOpen}
        onDidDismiss={() => setProductSearchIsOpen(false)}
        swipeToClose={true} >
          <ProductSearch closeSearch={() => setProductSearchIsOpen(false)} addProduct={addProduct} />
      </IonModal>

      <IonFooter className="ion-no-border" onClick={ openProductSearch }>
        <IonToolbar>
          <IonSearchbar
            placeholder="Search for makeup products"
            style={{pointerEvents: "none"}}
          ></IonSearchbar>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
}

export default EditPost;