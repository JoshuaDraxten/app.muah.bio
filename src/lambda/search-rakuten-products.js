const fetch = require('node-fetch');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ explicitArray: false });

async function rakutenSearch({ keyword, token }) {
    const url = `http://findadvertisers.linksynergy.com/productsearch?keyword=${keyword}&token=${token}&max=100`
    const xml = await fetch(url)
            .then( response => response.text() );

    const jsonResponse = await parser.parseStringPromise( xml );

    if ( !jsonResponse.result.item ) {
        return [];
    }

    const products = jsonResponse.result.item.map( product => ({
        retailer: {
            name: product.merchantname
        },
        price: {
            number: product.price._,
            currency: product.price.$.currency
        },
        name: product.productname,
        image: product.imageurl,
        url: product.linkurl
    }))

    return products;
}

exports.handler = async event => {
    const { keyword, token } = event.queryStringParameters;
    const results = await rakutenSearch({ keyword, token });

    return {
        statusCode: 200,
        body: JSON.stringify( results ),
    }
}