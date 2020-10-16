const fetch = require('node-fetch');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://joshuad:!7PrMT6ww&LqZDxgRU@cluster0.5j0rh.mongodb.net/user_data?retryWrites=true&w=majority";

/**
 * To use this function visit 
 * https://app.muah.bio/.netlify/functions/initialize-user?userId=<userId>&ig_username=<ig_username>
 */

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

async function getPosts( ig_username ) {
  return await fetch(`https://ig.muah.bio/${ig_username}.json`).then( response => response.json() );
}

const generateUser = async ({ userId, ig_id, ig_username, ig_token, ig_token_expires, posts }) => {
  if ( !posts ) {
    posts = await getPosts( ig_username );
    console.log( posts )
    posts = posts.map( post => ({ ...post, products: [] }) );
  } else {
    posts = JSON.parse( posts )
  }

  return {
    _id: userId,
	  posts,
    instagram: {
      // id: parseInt(ig_id),
      username: ig_username,
      // token: ig_token,
      // tokenExpires: ig_token_expires,
    },
    settings: {
      linkInBioPage: {
        disclaimer: "",
        website: "",
        visitSiteButtonText: "Visit Site"
      },
      affiliatePrograms: {
        amazon: {
          trackingID: ""
        }
      }
    }
  }
};

exports.handler = async event => {
    const client = await connectToDatabase(uri);
    const collection = client.db("Muah_bio").collection("users");

    const newUser = await generateUser( event.queryStringParameters );

    return collection.insertOne(newUser)
        .catch( err => ({
            statusCode: 500,
            body: JSON.stringify(e)
        }))
        .then( response => ({
            statusCode: 200,
            body: JSON.stringify(response)
        }));

}