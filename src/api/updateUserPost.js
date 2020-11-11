export default async function({ post }){
    const Authorization = "Bearer " + window.auth.currentUser().token.access_token;

    const params = new URLSearchParams({
        post: JSON.stringify( post )
    }).toString();
    
    return await fetch(`/.netlify/functions/update-user-post?`+params, {
        headers: { Authorization },
        credentials: "include"
    }).then( response => response.json() );
}