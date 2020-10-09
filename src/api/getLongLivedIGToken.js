export default async function( token ){
    const response = await fetch(`/.netlify/functions/get-long-lived-ig-token?token=${token}`)
        .then( response => response.json() );
    return response;
}