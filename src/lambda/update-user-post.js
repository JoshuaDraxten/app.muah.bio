const { Magic } = require('@magic-sdk/admin');
const magicAdmin = new Magic('sk_live_A1480198431AED9D');

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://joshuad:!7PrMT6ww&LqZDxgRU@cluster0.5j0rh.mongodb.net/user_data?retryWrites=true&w=majority";

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

exports.handler = async event => {
    let { token, post } = event.queryStringParameters;
    const { email } = await magicAdmin.users.getMetadataByToken( token );
    
    post = JSON.parse(post);
    
    const client = await connectToDatabase(uri);
    const collection = client.db("Muah_bio").collection("users");

    const response = await collection.updateOne(
        { email, "posts.id": post.id },
        { $set: { "posts.$" : post } }
    )

    return {
        statusCode: 200,
        body: JSON.stringify( response ),
    }

}