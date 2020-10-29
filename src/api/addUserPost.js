export default async function({ ig_username, post, token, position=0 }){
    const params = new URLSearchParams({
        ig_username,
        token,
        post: JSON.stringify( post ),
        position
    }).toString();
    
    return await fetch(`/.netlify/functions/add-user-post?`+params)
        .then( response => response.json() );
}