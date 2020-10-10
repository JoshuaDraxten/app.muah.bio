import React, { useEffect, useState } from 'react';
import ProductSearch from './productSearch';
// import Header from '../components/header';
// import {arrayMove, SortableContainer, SortableElement, sortableHandle} from 'react-sortable-hoc';
// import swal from 'sweetalert';
// import ProductSearchBar from '../components/productSearchBar';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonModal,
  IonPage,
  IonReorder,
  IonReorderGroup,
  IonSearchbar,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

function doReorder(event) {
  // The `from` and `to` properties contain the index of the item
  // when the drag started and ended, respectively
  console.log('Dragged from index', event.detail.from, 'to', event.detail.to);

  // Finish the reorder and position the item in the DOM based on
  // where the gesture ended. This method can also be called directly
  // by the reorder group
  event.detail.complete();
}

const SwipeableProduct = ({ product, index, removeProduct }) => (
  <IonItemSliding key={ product.url } onIonSwipe={()=>removeProduct(index)}>
    <IonItemOptions side="start">
      <IonItemOption color="danger" expandable onClick={()=>removeProduct(index)}>
        Delete
      </IonItemOption>
    </IonItemOptions>

    <IonItem>
      <IonThumbnail slot="start">
        <img src={product.image} alt="" style={{objectFit: "contain"}} />
      </IonThumbnail>
      <IonLabel className="ion-text-wrap">
        <h3>{product.name}</h3>
        <p>{ product.retailer.name }{ product.price.number ? " | "+product.price.symbol: ""}{ product.price.number }</p>
      </IonLabel>
      <IonReorder slot="end" />
    </IonItem>
  </IonItemSliding>
)

function EditPost({ post, updatePost, closePost } ){
  const [ productSearchIsOpen, setProductSearchIsOpen ] = useState( false );
  useEffect(() => {
    document.querySelector("ion-tab-bar").style.display = "none";
    // TODO: Make this smoother
    return () => document.querySelector("ion-tab-bar").style.display = "flex";
  })

    // const [ showSearchBar, setShowSearchBar ] = useState(false);

    // function addProduct( product ) {
    //     console.log( product )
    //     setProducts( products => products.concat( product ) )
    // }

    async function removeProduct( productIndex ) {
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

    // function togglePublished(){
    //     if ( !post.isPublished ) {
    //         history.push('/');
    //     }
    //     updatePost( post.id, {
    //         ...post,
    //         isPublished: !post.isPublished
    //     });
    // }

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Edit Post</IonTitle>
            <IonButtons slot="end">
              <IonButton>
                <div onClick={closePost}>Done</div>
              </IonButton>
            </IonButtons> 
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Edit post</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonReorderGroup disabled={false} onIonItemReorder={doReorder}>
          {post.products.map((product, i) => (
            <SwipeableProduct product={product} index={i} removeProduct={removeProduct} key={i} />
          ))}
          </IonReorderGroup>
        </IonContent>
        <IonModal isOpen={productSearchIsOpen}>
            <ProductSearch />
        </IonModal>
        <IonFooter className="ion-no-border">
          <IonToolbar>
            <IonSearchbar placeholder="Search for makeup products" onIonFocus={() => setProductSearchIsOpen(true)}></IonSearchbar>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    )

    // // TODO: Design what the screen looks like when empty
    // return (
    //     <div>
    //     {/* <Header
    //         backIcon={<KeyboardArrowLeftRoundedIcon />}
    //         backText="Profile"
    //         backAction={ () => history.push('/') }
    //         title="Edit Post"
    //         key="header"
    //         forwardText={ post.isPublished ? "unpublish" : "publish" }
    //         forwardAction={ togglePublished }
    //         forwardDisabled={ post.products.length === 0 }
    //         forwardStyle={{ color: post.isPublished ? "red" : "blue" }}/> */}
    //     <div className="page edit-post">
    //         <div className="edit-page-image" style={{ backgroundImage: `url(${post.media_url})` }}></div>
    //         <div className="edit-page-products">
    //             <SortableProductList 
    //                 useDragHandle={true}
    //                 products={ post.products }
    //                 removeProduct={ removeProduct }
    //             />
    //             <br />
    //             <div className={post.products.length === 0 ? "" : "stick-to-bottom animate-with-parent" }>
    //                 <button className="full-width" onClick={ ()=>setShowSearchBar(true) }>Add Product</button>
    //                 { post.products.length === 0 ? 
    //                     <a href="#" style={{display: "block", padding: 20, textAlign: "center"}}>or link this post to a website</a>
    //                     : null
    //                 }
    //             </div>
    //             <div></div>
    //             { showSearchBar ?
    //                 <ProductSearchBar
    //                     exitSearch={()=>setShowSearchBar(false)}
    //                     addProduct={addProduct}
    //                 /> : null
    //             }
    //         </div>
    //     </div>
    //     </div>
    // )
}

export default EditPost;