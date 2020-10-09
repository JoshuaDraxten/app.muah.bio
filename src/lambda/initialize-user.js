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


const generateUser = ({ userId, ig_id, ig_username, ig_token, ig_token_expires, posts }) => ({
    _id: userId,
	instagram: {
		id: parseInt(ig_id),
		username: ig_username,
		token: ig_token,
		tokenExpires: ig_token_expires,
	},
	settings: {
		linkInBioPage: {
			disclaimer: "Test disclaimer text",
			website: null,
			visitSiteButtonText: "Visit Site"
		}
	},
	posts: JSON.parse(posts)
});

exports.handler = async event => {
    const client = await connectToDatabase(uri);
    const collection = client.db("Muah_bio").collection("users");

    const newUser = generateUser( event.queryStringParameters );

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