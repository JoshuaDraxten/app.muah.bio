export default async function({ keyword }){
    const response = await fetch("/.netlify/functions/productSearch?keyword="+keyword).then( response => response.json() );
    return response;
}