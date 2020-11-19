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
  const { user } = context.clientContext;
  if ( !user ) {
    return {
      statusCode: 404,
      body: JSON.stringify({error: "User Does not exist"}) ,
    }
  }
  const { email } = user;

  const client = await connectToDatabase( process.env.MONGODB_URI );
  const collection = client.db("Muah_bio").collection("users");

  const userData = await collection.findOne( { email } );

  if ( userData ) {
      return {
          statusCode: 200,
          body: JSON.stringify( { ...userData, createDate: userData._id.getTimestamp() } ),
      }
  }

  return {
      statusCode: 404,
      body: JSON.stringify({error: "User Not Found"}) ,
  }

}