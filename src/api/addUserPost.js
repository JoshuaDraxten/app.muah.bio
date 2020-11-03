import netlifyIdentity from 'netlify-identity-widget';

export default async function({ ig_username, post, position=0 }){
    const Authorization = "Bearer " + netlifyIdentity.currentUser().token.access_token;

    const params = new URLSearchParams({
        ig_username,
        post: JSON.stringify( post ),
        position
    }).toString();
    
    return await fetch(`/.netlify/functions/add-user-post?`+params, {
        headers: { Authorization },
        credentials: "include"
    }).then( response => response.json() );
}