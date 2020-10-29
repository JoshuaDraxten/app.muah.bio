export default async function( token ){
    const response = await fetch(`/.netlify/functions/get-user?token=${token}`)
        .then( response => response.json() );
    return response;
}