export default async function({ userId, linkInBioPage }){
    const params = new URLSearchParams({
        userId,
        linkInBioPage: JSON.stringify( linkInBioPage )
    }).toString();
    
    return await fetch(`/.netlify/functions/update-link-in-bio-settings?`+params)
        .then( response => response.json() );
}