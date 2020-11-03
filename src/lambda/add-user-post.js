const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://joshuad:!7PrMT6ww&LqZDxgRU@cluster0.5j0rh.mongodb.net/user_data?retryWrites=true&w=majority";

const uploadPhotoToCDN = require('./helpers/upload-photo-to-cdn');

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
    let { ig_username, token, post, position } = event.queryStringParameters;

    post = JSON.parse(post);

    // We need to host our own version of the photo
    const newMediaUrl = await uploadPhotoToCDN({
      folder: ig_username,
      filename: post.id,
      url: post.media_url
    });

    post.media_url = newMediaUrl
    
    const client = await connectToDatabase(uri);
    const collection = client.db("Muah_bio").collection("users");

    const response = await collection.updateOne(
        { email },
        { $push: {
          "posts": {
            $each: [ post ],
            $position: parseInt(position)
          }
        } }
    )

    return {
        statusCode: 200,
        body: JSON.stringify( response ),
    }

}