export default async function({ userId, settings }){
    const params = new URLSearchParams({
        userId,
        settings: JSON.stringify( settings )
    }).toString();
    
    return await fetch(`/.netlify/functions/update-settings?`+params)
        .then( response => response.json() );
}