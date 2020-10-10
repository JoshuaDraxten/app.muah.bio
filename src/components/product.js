import React from 'react';

function product({ product, onClick=()=>{} }){
    const {image, name, retailer, price} = product;
    // TODO: deal with currencies
    return (
        <div className="product" onClick={()=>onClick( product )}>
            <div className="product__img" style={{backgroundImage: `url('${image}')`}}></div>
            <div className="product__information">
                <span className="product__title">{ name }</span><br />
                <span className="product__brand">
                    { retailer.name }{ price.number ? " | "+price.symbol: ""}{ price.number }
                </span>
            </div>
        </div>
    )
}

export default product;