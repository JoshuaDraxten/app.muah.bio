async function rakutenSearch({ keyword, token="2aa2d5851f1743fd93f105a452aa21aa408e5c8b77afdba49cc6595a01771f27" }) {
    const response = await fetch("/.netlify/functions/search-rakuten-products?keyword="+keyword+"&token="+token).then( response => response.json() );
    return response;
}

export default async function({ keyword }){
    return rakutenSearch({ keyword })

    // const response = await fetch("/.netlify/functions/productSearch?keyword="+keyword).then( response => response.json() );
    // return response;
}