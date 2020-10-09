export default async function( userId ){
    const response = await fetch(`/.netlify/functions/get-user?userId=${userId}`)
        .then( response => response.json() );
    return response;
}