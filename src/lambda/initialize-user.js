const { Magic } = require('@magic-sdk/admin');
const magicAdmin = new Magic('sk_test_4A682C9CD21C9382');

const fetch = require('node-fetch');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://joshuad:!7PrMT6ww&LqZDxgRU@cluster0.5j0rh.mongodb.net/user_data?retryWrites=true&w=majority";

/**
 * To use this function visit 
 * https://app.muah.bio/.netlify/functions/initialize-user?user_id=<userId>&ig_username=<ig_username>
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

const generateUser = async ({ ig_username, email, posts }) => {
  return {
    posts,
    email,
    instagram: {
      username: ig_username,
    },
    settings: {
      linkInBioPage: {
        disclaimer: "",
        website: "",
        visitSiteButtonText: "Visit Site"
      },
      affiliatePrograms: {}
    }
  }
};

exports.handler = async event => {
    const client = await connectToDatabase(uri);
    const collection = client.db("Muah_bio").collection("users");

    let { ig_username, token, posts } = event.queryStringParameters;

    posts = JSON.parse( posts )
    const { email } = await magicAdmin.users.getMetadataByToken( token );
    
    const userExists = await collection.find( { "instagram.username": ig_username } ).toArray()[0];
    if ( userExists ) {
      return {
        statusCode: 500,
        body: `{"error": "Instagram User Already Exists. Please email josh@muah.bio if this is a mistake"}`
      }
    }

    const newUser = await generateUser( { ig_username, email, posts } );

    return collection.insertOne(newUser)
        .catch( err => ({
            statusCode: 500,
            body: JSON.stringify(err)
        }))
        .then( () => ({
            statusCode: 200,
            body: JSON.stringify(newUser)
        }));

}