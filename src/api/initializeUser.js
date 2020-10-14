import getIGMedia from './getIGMedia';

export default async function({ userId, ig_token, ig_token_expires }) {
    if ( !ig_token ) {
        console.error( "No token given!" );
        return false;
    }
    // Get user information
    // ig_id, ig_username
    const ig_profile = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${ig_token}`)
        .then( response => response.json() );
    
    // Get posts and add an empty product array
    const posts = await getIGMedia({ token: ig_token });
    console.log( posts, ig_token )

    // Initialize the user
    const params = new URLSearchParams({
        userId,
        ig_id: ig_profile.id,
        ig_username: ig_profile.username,
        ig_token,
        ig_token_expires,
        // Add empty product for each post
        posts: JSON.stringify( posts.map( post => ({ ...post, products: [] }) ) )
    }).toString();

    const response = await fetch("/.netlify/functions/initialize-user?"+params)
        .then( response => response.json() );
    return response;
}