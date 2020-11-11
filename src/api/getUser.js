export default async function() {
    const Authorization = "Bearer " + window.auth.currentUser().token.access_token;
    return await fetch("/.netlify/functions/get-user", {
        headers: { Authorization },
        credentials: "include"
    }).then( response => response.json() );
}