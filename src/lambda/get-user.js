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

exports.handler = async ( event, context ) => {
  const { user } = context.clientContext;
  if ( !user ) {
    return {
      statusCode: 404,
      body: JSON.stringify({error: "User Does not exist"}) ,
    }
  }
  const { email } = user;

  const client = await connectToDatabase(uri);
  const collection = client.db("Muah_bio").collection("users");

  const users = await collection.find( { email } ).toArray();

  if ( users.length > 0 ) {
      return {
          statusCode: 200,
          body: JSON.stringify( users[0] ),
      }
  }

  return {
      statusCode: 404,
      body: JSON.stringify({error: "User Not Found"}) ,
  }

}