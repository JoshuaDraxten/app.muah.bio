import netlifyIdentity from 'netlify-identity-widget';

export default async function() {
    const Authorization = "Bearer " + netlifyIdentity.currentUser().token.access_token;
    return await fetch("/.netlify/functions/get-user", {
        headers: { Authorization },
        credentials: "include"
    }).then( response => response.json() );
}