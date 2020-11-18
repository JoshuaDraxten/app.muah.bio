const { SHA256 } = require("sha2");
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

exports.handler = async event => {
    const { usernameOrEmail, password } = event.queryStringParameters;
    const client = await connectToDatabase(process.env.MONGODB_URI);
    const collection = client.db("Muah_bio").collection("users");

    const passwordEncrypted = SHA256(password).toString("base64"); 
    console.log( passwordEncrypted )

    let user;
    if ( usernameOrEmail.match("@") ) {
        const email = usernameOrEmail;
        [ user ] = await collection.find( { email, password: passwordEncrypted } ).toArray();
    } else {
        const username = usernameOrEmail;
        [ user ] = await collection.find( { "instagram.username": username, password: passwordEncrypted } ).toArray();
    }

    if ( !user ) {
        return {
            statusCode: 404,
            body: JSON.stringify({error: "User Not Found"}) ,
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify( user ),
    }

}