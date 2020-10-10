import React, { useState } from 'react';
// import Header from '../components/header';
import ProductSearchBar from '../components/productSearchBar';
// import {arrayMove, SortableContainer, SortableElement, sortableHandle} from 'react-sortable-hoc';
// import swal from 'sweetalert';
import {
  IonBackButton,
  IonButton,
  IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonPage,
    IonReorder,
    IonReorderGroup,
    IonThumbnail,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { remove } from 'ionicons/icons';

const Handle = ({image}) =>
    <div className="product__img" style={{backgroundImage: `url('${image}')`}}></div>

const SortableProduct = (({product, remove}) => {
    const {image, name, retailer, price} = product;
    return (
        <div className="product">
            <Handle image={image} />
            <div className="product__information">
                <span className="product__title">{ name }</span><br />
                <span className="product__brand">
                    { retailer.name }{ price.number ? " | "+price.symbol: ""}{ price.number }
                </span>
            </div>
            {/* <HighlightOffRoundedIcon className="product__close-button" onClick={()=>remove( product )} /> */}
        </div>
    )
});

const SortableProductList = (({products, removeProduct}) => {
  return (
    <div>
      {products.map((product, i) => (
        <SortableProduct key={`item-${product.name+product.brand}`} index={i} product={product} remove={()=>removeProduct(i)} />
      ))}
    </div>
  );
});

function doReorder(event) {
  // The `from` and `to` properties contain the index of the item
  // when the drag started and ended, respectively
  console.log('Dragged from index', event.detail.from, 'to', event.detail.to);

  // Finish the reorder and position the item in the DOM based on
  // where the gesture ended. This method can also be called directly
  // by the reorder group
  event.detail.complete();
}

function EditPost({ history, match, posts, updatePost } ){
    const postId = match.params.id;
    const post = posts.filter( post => post.id === postId )[0];

    const [ showSearchBar, setShowSearchBar ] = useState(false);

    function addProduct( product ) {
        console.log( product )
        setProducts( products => products.concat( product ) )
    }

    async function removeProduct( productIndex ) {
        const remove = window.confirm(`Remove ${post.products[productIndex].name} from list?`)
        if ( !remove ) return;
        setProducts( post.products.filter( (x,index) => index!==productIndex ) )
    }

    // function onSortEnd({oldIndex, newIndex}){
    //     setProducts( products => arrayMove( products, oldIndex, newIndex ) );
    // }

    function setProducts( products ){
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

    function togglePublished(){
        if ( !post.isPublished ) {
            history.push('/');
        }
        updatePost( post.id, {
            ...post,
            isPublished: !post.isPublished
        });
    }

    return (
      <IonPage>
        <IonContent fullscreen>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton>
                  <IonBackButton defaultHref="/profile"/>
                </IonButton>
              </IonButtons> 
              <IonTitle>Edit post</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonReorderGroup disabled={false} onIonItemReorder={doReorder}>
          {post.products.map((product, i) => (
            <IonItemSliding onIonDrag={({detail}) => detail.ratio <= -3 ? removeProduct(i) : null }>
              <IonItemOptions side="start">
                <IonItemOption color="danger" expandable>
                  Delete
                </IonItemOption>
              </IonItemOptions>

              <IonItem key={ product.url }>
                <IonThumbnail slot="start">
                  <img src={product.image} style={{objectFit: "contain"}} />
                </IonThumbnail>
                <IonLabel className="ion-text-wrap">
                  <h3>{product.name}</h3>
                  <p>{ product.retailer.name }{ product.price.number ? " | "+product.price.symbol: ""}{ product.price.number }</p>
                </IonLabel>
                <IonReorder slot="end" />
              </IonItem>
            </IonItemSliding>
          ))}
          </IonReorderGroup>
        </IonContent>
      </IonPage>
    )

    // TODO: Design what the screen looks like when empty
    return (
        <div>
        {/* <Header
            backIcon={<KeyboardArrowLeftRoundedIcon />}
            backText="Profile"
            backAction={ () => history.push('/') }
            title="Edit Post"
            key="header"
            forwardText={ post.isPublished ? "unpublish" : "publish" }
            forwardAction={ togglePublished }
            forwardDisabled={ post.products.length === 0 }
            forwardStyle={{ color: post.isPublished ? "red" : "blue" }}/> */}
        <div className="page edit-post">
            <div className="edit-page-image" style={{ backgroundImage: `url(${post.media_url})` }}></div>
            <div className="edit-page-products">
                <SortableProductList 
                    useDragHandle={true}
                    products={ post.products }
                    removeProduct={ removeProduct }
                />
                <br />
                <div className={post.products.length === 0 ? "" : "stick-to-bottom animate-with-parent" }>
                    <button className="full-width" onClick={ ()=>setShowSearchBar(true) }>Add Product</button>
                    { post.products.length === 0 ? 
                        <a href="#" style={{display: "block", padding: 20, textAlign: "center"}}>or link this post to a website</a>
                        : null
                    }
                </div>
                <div></div>
                { showSearchBar ?
                    <ProductSearchBar
                        exitSearch={()=>setShowSearchBar(false)}
                        addProduct={addProduct}
                    /> : null
                }
            </div>
        </div>
        </div>
    )
}

export default EditPost;