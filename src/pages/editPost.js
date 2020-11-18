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
  IonReorder,
  IonReorderGroup,
  IonSearchbar,
  IonThumbnail,
  IonToolbar,
} from '@ionic/react';
import { closeCircle } from 'ionicons/icons';

// Internationalization
import { Trans } from '@lingui/macro';
import { withI18n } from "@lingui/react"

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

const SwipeableProduct = ({ i18n, product, index, removeProduct, setProductEditor }) => {

  let formattedPrice = "";
  try {
    formattedPrice = " | " + Intl.NumberFormat('en-US', { style: 'currency', currency: product.price.currency })
      .format(product.price.number);
  } catch (error) {}

  return (
    <IonItemSliding key={ product.url } onIonSwipe={()=>removeProduct(index)}>
      <IonItemOptions side="start">
        <IonItemOption color="danger" expandable onClick={()=>removeProduct(index)}>
          <Trans>Delete</Trans>
        </IonItemOption>
        <IonItemOption color="success" onClick={()=>setProductEditor( { open: true, productIndex: index, product } )}>
        <Trans>Edit Product</Trans>
        </IonItemOption>
      </IonItemOptions>

      <IonItem>
        <IonThumbnail slot="start"  style={{background: "#ffffff", borderRadius: 4}}>
          <img src={product.image} alt="" style={{objectFit: "contain"}} />
        </IonThumbnail>
        <IonLabel className="ion-text-wrap">
          { product.tag ? <span className="tag">{product.tag}</span> : null }
          <h3>{product.name}</h3>
          <p>{ product.retailer.name }{ formattedPrice }</p>
        </IonLabel>
        <IonReorder slot="end" />
      </IonItem>
    </IonItemSliding>
  ) 
}

function EditPost({ i18n, userInformation, post, updatePost, closePost } ){
  const [ productSearchIsOpen, setProductSearchIsOpen ] = useState( false );
  const [ products, setProducts ] = useState( post.products );
  const [ expandedHeader, setExpandedHeader ] = useState( false );
  const [ productEditor, setProductEditor ] = useState( { open: false, productIndex: -1, product: {} } );
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
      setProductEditor={setProductEditor}
      key={product.url} />
  ))

  return (
    <>
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
        { products.length !== 0 ? 
          <div style={{paddingBottom: 50}}>
            <IonListHeader>
              <IonLabel><Trans>Tagged Products</Trans></IonLabel>
            </IonListHeader>
            <IonReorderGroup disabled={false} onIonItemReorder={doReorder}>
              { sortableProductsList }
            </IonReorderGroup>
          </div>
          :
          <div className="empty-post">
            <IonLabel><Trans>Search for products to tag this post with using the search bar below</Trans></IonLabel>
          </div>
        }
        <IonAlert
          isOpen={productEditor.open}
          onDidDismiss={() => setProductEditor({ open: false, productIndex: -1, product: {} })}
          subHeader={productEditor.productIndex!==-1 ? i18n._("Edit {productName}", {productName: products[productEditor.productIndex].name}): ''}
          inputs={[
            {
              name: 'name',
              type: 'text',
              value: productEditor.product.name,
              placeholder: i18n._("Product name")
            },
            {
              name: 'url',
              type: 'text',
              value: productEditor.product.url,
              placeholder: i18n._("URL")
            },
            {
              name: 'tag',
              type: 'text',
              value: productEditor.product.tag,
              placeholder: i18n._("Optional product tag (ex: lips)")
            }
          ]}
          buttons={[
            {
              text: i18n._("Cancel"),
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                console.log('Cancel');
              }
            },
            {
              text: i18n._("Ok"),
              handler: ({ name, url, tag }) => {

                if (
                  name === productEditor.product.name &&
                  url === productEditor.product.url &&
                  tag === productEditor.product.tag
                ) return;

                let productsClone = [...products];
                productsClone[productEditor.productIndex].name = name;
                productsClone[productEditor.productIndex].url = url;
                productsClone[productEditor.productIndex].tag = tag;
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
          <ProductSearch userInformation={userInformation} closeSearch={() => setProductSearchIsOpen(false)} addProduct={addProduct} />
      </IonModal>

      <IonFooter className="ion-no-border" onClick={ openProductSearch }>
        <IonToolbar>
          <Trans render={ ({translation}) =>
            <IonSearchbar
              placeholder={ translation }
              style={{pointerEvents: "none"}}
            ></IonSearchbar>
          }>
            Search for products or paste url
          </Trans>
        </IonToolbar>
      </IonFooter>
    </>
  );
}

export default withI18n()(EditPost);