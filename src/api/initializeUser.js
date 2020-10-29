export default async function({ token, posts, ig_username }) {
    // Initialize the user
    const params = new URLSearchParams({
        ig_username,
        token,
        // Add empty product for each post
        posts: JSON.stringify( posts.map( post => ({ ...post, products: [] }) ) )
    }).toString();

    const response = await fetch("/.netlify/functions/initialize-user?"+params)
        .then( response => response.json() );
    return response;
}