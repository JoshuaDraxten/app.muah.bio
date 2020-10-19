export default async function( url ){
    const response = await fetch(`/.netlify/functions/get-product-from-url?url=${url}`)
        .then( response => response.json() );
    return response;
}