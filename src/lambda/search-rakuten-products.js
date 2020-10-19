const fetch = require('node-fetch');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ explicitArray: false });

async function rakutenSearch({ keyword, token="2aa2d5851f1743fd93f105a452aa21aa408e5c8b77afdba49cc6595a01771f27" }) {
    const url = `http://findadvertisers.linksynergy.com/productsearch?keyword=${keyword}&token=${token}&max=100`
    const xml = await fetch(url)
            .then( response => response.text() );

    const jsonResponse = await parser.parseStringPromise( xml );

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

    // const products = [...doc.querySelectorAll("item") ].map( item => {
    //     const product = {
    //         retailer: {
    //             name: item.querySelector("merchantname").innerHTML
    //         },
    //         price: {
    //             number: item.querySelector("price").innerHTML,
    //             currency: item.querySelector("price").getAttribute("currency")
    //         },
    //         name: item.querySelector("productname").innerHTML,
    //         image: item.querySelector("imageurl").innerHTML,
    //         url: item.querySelector("linkurl").innerHTML
    //     }
    //     return product;
    // });

    // return products;
}

exports.handler = async event => {
    const { keyword, token } = event.queryStringParameters;
    const results = await rakutenSearch({ keyword });

    return {
        statusCode: 200,
        body: JSON.stringify( results ),
    }
}