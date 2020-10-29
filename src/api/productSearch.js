async function rakutenSearch({ keyword, token }) {
    const params = new URLSearchParams({
        keyword,
        token
    }).toString();

    const response = await fetch("/.netlify/functions/search-rakuten-products?"+params).then( response => response.json() );
    return response;
}

export default async function({ keyword, affiliatePrograms }) {
    let results = [];

    if ( affiliatePrograms.rakuten && affiliatePrograms.rakuten.token ) {
        const rakuten = await rakutenSearch({ keyword, token: affiliatePrograms.rakuten.token })
        results = results.concat(rakuten)
    }

    if ( results.length < 5 || affiliatePrograms.amazon.trackingID ) {
        const amazon = await fetch("/.netlify/functions/productSearch?keyword="+keyword).then( response => response.json() ).catch( err => [] );
        results = results.concat( amazon )
    }

    return results;
}