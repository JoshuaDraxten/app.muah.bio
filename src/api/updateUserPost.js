export default async function({ post, userId }){
    const params = new URLSearchParams({
        userId,
        post: JSON.stringify( post )
    }).toString();
    
    return await fetch(`/.netlify/functions/update-user-post?`+params)
        .then( response => response.json() );
}