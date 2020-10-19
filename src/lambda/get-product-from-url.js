const metaget = require('metaget');

const firstThatsNotUndefined = ( arr, defaultValue=undefined ) => {
    return arr.filter( x => x ).concat([defaultValue])[0]
}

exports.handler = async event => {
    const { url } = event.queryStringParameters;
    const metadata = await metaget.fetch( url );

    // const canonicanUrl = firstThatsNotUndefined([
    //     metadata['canonical'],
    //     url
    // ]);

    const siteName = firstThatsNotUndefined([
        metadata["og:site_name"],

        // The url before the tld, capitalized ex: www.amazon.com => Amazon 
        new URL(url).host.split('.').slice(-2,-1)[0]
        .replace(/^\w/, c => c.toUpperCase())
    ]);

    const name = firstThatsNotUndefined([
        metadata["twitter:title"],
        metadata["og:title"],
        metadata["title"]
    ]);

    let image = firstThatsNotUndefined([
        metadata["twitter:image"],
        metadata["og:image"]
    ], "");
    
    if ( image.slice(0,1) === '/' ) {
        image = new URL(url).origin + image;
    }

    let price = {
        number: metadata["og:price:amount"],
        currency: metadata["og:price:currency"]
    }
    if ( price.currency ) {
        price.symbol = Intl.NumberFormat('en-US', { style: 'currency', currency: price.currency }).format(0).split('0')[0]
    }

    let product = {
        retailer: { name: siteName },
        price,
        name,
        image,
        url
    }
    console.log( product, metadata.title )

    return {
        statusCode: 200,
        body: JSON.stringify( product ),
    }
}