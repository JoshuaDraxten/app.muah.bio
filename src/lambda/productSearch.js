const { addCachedSearchResult } = require('./helpers/addCachedSearchResult');
const { getCachedSearchResult } = require('./helpers/getCachedSearchResult');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;

let cachedDb = null;
function connectToDatabase (uri) {
  console.log('=> connect to database');

  if (cachedDb) {
    console.log('=> using cached database instance');
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(db => {
      cachedDb = db;
      return cachedDb;
    });
}

// TODO: Cache searches once I've set up database
let cachedAmazonQueries = {}
async function searchAmazon( keyword ) {
    
    if ( !cachedAmazonQueries[keyword] ) {
        const timeStamp = new Date().getMinutes() + ":" + new Date().getSeconds();

        // make the http GET request to Rainforest API
        const response = await axios.get('https://api.rainforestapi.com/request', { params: {
            api_key: process.env.RAINFOREST_KEY,
            type: "search",
            amazon_domain: "amazon.com",
            category_id:"n:11058281",
            search_term: keyword
        } })
        .then(response => {
            return response.data.search_results
        }).then(products => products.map( product => ({
            name: product.title,
            image: product.image,
            url: product.link,
            price: product.price ? {
                symbol: product.price.symbol,
                currency: product.price.currency,
                number: product.price.value
            } : {},
            retailer: {
                name: "Amazon",
                asin: product.asin
            }
        })))
        .catch( error => error )

        cachedAmazonQueries[keyword] = response;
    } else {
        console.log( "using amazon cache for: "+keyword )
    }

    return cachedAmazonQueries[keyword]
}

exports.handler = async ( event, context ) => {
    const keyword = event.queryStringParameters.keyword.toLowerCase();
    const client = await connectToDatabase( process.env.MONGODB_URI );

    // Check if keyword is cached. If not, search for it
    const cacheResponse = await getCachedSearchResult({ client, keyword, domain: "amazon.com"});
    let results = cacheResponse.results;
    if ( !results ) {
        console.log("Searching amazon for: "+ keyword);
        // rainforestapi.com
        results = await searchAmazon( keyword );

        addCachedSearchResult({ client, keyword, results, domain: "amazon.com" });
    } else {
        console.log("Using cached search for: "+ keyword);
    }

    return {
        statusCode: 200,
        body: JSON.stringify( results )
    }
}