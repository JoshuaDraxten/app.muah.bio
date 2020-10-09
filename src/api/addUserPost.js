export default async function({ post, userId, position=0 }){
    const params = new URLSearchParams({
        userId,
        post: JSON.stringify( post ),
        position
    }).toString();
    
    return await fetch(`/.netlify/functions/add-user-post?`+params)
        .then( response => response.json() );
}