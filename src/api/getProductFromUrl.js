export default async function( url ){
    const response = await fetch(`/.netlify/functions/get-product-from-url?url=${encodeURIComponent(url)}`)
        .then( response => response.json() );
    return response;
}