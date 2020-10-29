export default async function({ token, settings }){
    const params = new URLSearchParams({
        token,
        settings: JSON.stringify( settings )
    }).toString();
    
    return await fetch(`/.netlify/functions/update-settings?`+params)
        .then( response => response.json() );
}