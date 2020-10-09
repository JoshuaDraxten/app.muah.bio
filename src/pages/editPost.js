import React, { useState } from 'react';
import Header from '../components/header';
import ProductSearchBar from '../components/productSearchBar';
import {arrayMove, SortableContainer, SortableElement, sortableHandle} from 'react-sortable-hoc';
import swal from 'sweetalert';

import HighlightOffRoundedIcon from '@material-ui/icons/HighlightOffRounded';

import KeyboardArrowLeftRoundedIcon from '@material-ui/icons/KeyboardArrowLeftRounded';

const Handle = sortableHandle( ({image}) =>
    <div className="product__img" style={{backgroundImage: `url('${image}')`}}></div>
);

const SortableProduct = SortableElement(({product, remove}) => {
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
            <HighlightOffRoundedIcon className="product__close-button" onClick={()=>remove( product )} />
        </div>
    )
});

const SortableProductList = SortableContainer(({products, removeProduct}) => {
  return (
    <div>
      {products.map((product, i) => (
        <SortableProduct key={`item-${product.name+product.brand}`} index={i} product={product} remove={()=>removeProduct(i)} />
      ))}
    </div>
  );
});

function EditPost({ history, match, posts, updatePost } ){
    const postId = match.params.id;
    const post = posts.filter( post => post.id === postId )[0];

    const [ showSearchBar, setShowSearchBar ] = useState(false);

    function addProduct( product ) {
        console.log( product )
        setProducts( products => products.concat( product ) )
    }

    async function removeProduct( productIndex ) {
        const remove = await swal({
            text: `Remove ${post.products[productIndex].name} from list?`,
            buttons: ["Cancel", "Remove product"]
        })
        if ( !remove ) return;
        setProducts( post.products.filter( (x,index) => index!==productIndex ) )
    }

    function onSortEnd({oldIndex, newIndex}){
        setProducts( products => arrayMove( products, oldIndex, newIndex ) );
    }

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

    // TODO: Design what the screen looks like when empty
    return (
        <div>
        <Header
            backIcon={<KeyboardArrowLeftRoundedIcon />}
            backText="Profile"
            backAction={ () => history.push('/') }
            title="Edit Post"
            key="header"
            forwardText={ post.isPublished ? "unpublish" : "publish" }
            forwardAction={ togglePublished }
            forwardDisabled={ post.products.length === 0 }
            forwardStyle={{ color: post.isPublished ? "red" : "blue" }}/>
        <div className="page edit-post">
            <div className="edit-page-image" style={{ backgroundImage: `url(${post.media_url})` }}></div>
            <div className="edit-page-products">
                <SortableProductList 
                    useDragHandle={true}
                    products={ post.products }
                    onSortEnd={ onSortEnd }
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