import netlifyIdentity from 'netlify-identity-widget';

export default async function({ settings }){
    const Authorization = "Bearer " + netlifyIdentity.currentUser().token.access_token;

    const params = new URLSearchParams({
        settings: JSON.stringify( settings )
    }).toString();
    
    return await fetch(`/.netlify/functions/update-settings?`+params, {
        headers: { Authorization },
        credentials: "include"
    }).then( response => response.json() );
}