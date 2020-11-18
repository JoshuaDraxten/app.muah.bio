export default async function( subscription ) {
    const Authorization = "Bearer " + window.auth.currentUser().token.access_token;

    const params = new URLSearchParams({
        subscription: JSON.stringify( subscription )
    }).toString();
    
    return await fetch(`/.netlify/functions/update-subscription?`+params, {
        headers: { Authorization },
        credentials: "include"
    }).then( response => response.json() );
}