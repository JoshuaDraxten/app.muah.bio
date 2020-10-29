export default async function({ post, token }){
    const params = new URLSearchParams({
        token,
        post: JSON.stringify( post )
    }).toString();
    
    return await fetch(`/.netlify/functions/update-user-post?`+params)
        .then( response => response.json() );
}