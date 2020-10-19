const metaget = require('metaget');

const firstThatsNotUndefined = arr => {
    return arr.map( x => x )[0]
}

exports.handler = async event => {
    const { url } = event.queryStringParameters;
    const metadata = await metaget.fetch( url );

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

    const image = firstThatsNotUndefined([
        metadata["twitter:image"],
        metadata["og:image"],
    ]);

    let price = {
        amount: metadata["og:price:amount"],
        currency: metadata["og:price:currency"]
    }
    if ( price.currency ) {
        price.symbol = Intl.NumberFormat('en-US', { style: 'currency', currency: price.currency }).format(0).split('0')[0]
    }

    let product = {
        retailer: { siteName },
        price,
        name,
        image,
        url
    }

    return {
        statusCode: 200,
        body: JSON.stringify( product ),
    }
}