// See: https://developers.facebook.com/docs/instagram-api/reference/media#fields

export default async function({ token, pages=1 }){
    const response = await fetch(
        `https://graph.instagram.com/me/media?fields=media_url,thumbnail_url,timestamp,id,caption&access_token=${token}`
    ).then( response => response.json() );
    let posts = response.data;

    if ( pages > 1) {
        let pageNum = 1;
        let nextPageUrl = response.paging.next;
        while ( pageNum < pages && nextPageUrl ) {
            const nextPage = await fetch( nextPageUrl );
            posts = posts.concat(nextPage.data);
            nextPageUrl = nextPage.paging.next;
            pageNum++;
        }
    } 

    return posts;
}