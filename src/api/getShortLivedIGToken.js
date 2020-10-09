export default async function({ code, redirect_uri }){
    const response = await fetch(`/.netlify/functions/get-short-lived-ig-token?code=${code}&redirect_uri=${redirect_uri}`)
        .then( response => response.json() );
    return response;
}