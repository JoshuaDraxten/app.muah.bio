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

exports.handler = async ( event, context ) => {
    const { email } = context.clientContext.user;
    let { settings } = event.queryStringParameters;
    console.log( settings )
    settings = JSON.parse(settings);

    console.log( settings )
    
    const client = await connectToDatabase( process.env.MONGODB_URI );
    const collection = client.db("Muah_bio").collection("users");

    const response = await collection.updateOne(
        { email },
        { $set: { "settings" : settings } }
    )

    return {
        statusCode: 200,
        body: JSON.stringify( response ),
    }

}