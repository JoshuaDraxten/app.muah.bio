const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

const generateUser = async ({ ig_username, email, posts }) => {
  // Create the stripe user
  const customer = await stripe.customers.create({ email });

  return {
    stripeCustomerId: customer.id,
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

exports.handler = async ( event, context ) => {
    const { email } = context.clientContext.user;

    const client = await connectToDatabase( process.env.MONGODB_URI );
    const collection = client.db("Muah_bio").collection("users");

    let { ig_username, posts } = event.queryStringParameters;

    posts = JSON.parse( posts )
    
    const userExists = await collection.find( { "instagram.username": ig_username } ).toArray()[0];
    if ( userExists ) {
      return {
        statusCode: 500,
        body: `{"error": "Instagram User Already Exists. Please email josh@muah.bio if this is a mistake"}`
      }
    }

    const newUser = await generateUser( { ig_username, email, posts } );

    console.log( newUser )

    // Insert the user into the database
    return collection.insertOne(newUser)

    // If there's an error, return that
    .catch( err => ({
        statusCode: 500,
        body: JSON.stringify(err)
    }))

    // If there arent any issues, return the user
    .then( () => ({
        statusCode: 200,
        body: JSON.stringify(newUser)
    }));

}