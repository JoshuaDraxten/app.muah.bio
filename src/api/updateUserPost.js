import netlifyIdentity from 'netlify-identity-widget';

export default async function({ post }){
    const Authorization = "Bearer " + netlifyIdentity.currentUser().token.access_token;

    const params = new URLSearchParams({
        post: JSON.stringify( post )
    }).toString();
    
    return await fetch(`/.netlify/functions/update-user-post?`+params, {
        headers: { Authorization },
        credentials: "include"
    }).then( response => response.json() );
}