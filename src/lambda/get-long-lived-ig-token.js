const fetch = require('node-fetch');


exports.handler = async (event, context) => {
  const { token } = event.queryStringParameters;

  const client_secret = "fb6cb72b006eccc3ea50e6136d2d78ac";

  requestURL = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${client_secret}&access_token=${token}`

  try {
    const result = await fetch(requestURL, { method: 'GET' })
      .then((response) => {
        console.log( response )
        return response.json();
      })
      .then((data) => {
        return { statusCode: 200, body: JSON.stringify(data) };
      })
      .catch((e) => {
        console.log("error")
        return {
          statusCode: 500,
          body: 'Internal Server Error: ' + JSON.stringify(e),
        };
      });

    console.log( "result: ", result );
    return result;
  } catch (e) {
    console.log( "Failed", e )
    return { statusCode: 500, body: JSON.stringify(e)};
  }
}
