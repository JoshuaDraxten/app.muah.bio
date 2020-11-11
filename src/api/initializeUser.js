export default async function({ posts, ig_username }) {
    const Authorization = "Bearer " + window.auth.currentUser().token.access_token;

    // Initialize the user
    const params = new URLSearchParams({
        ig_username,
        // Add empty product for each post
        posts: JSON.stringify( posts.map( post => ({ ...post, products: [] }) ) )
    }).toString();

    return await fetch("/.netlify/functions/initialize-user?"+params, {
        headers: { Authorization },
        credentials: "include"
    }).then( response => response.json() );
}