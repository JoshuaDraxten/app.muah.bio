const fetch = require('node-fetch');


exports.handler = async (event, context) => {
    const { code, redirect_uri } = event.queryStringParameters;
  
    try {
        const params = new URLSearchParams();
        params.append('client_id', "399352408128696");
        params.append('client_secret', "fb6cb72b006eccc3ea50e6136d2d78ac");
        params.append('grant_type', "authorization_code");
        params.append('redirect_uri', redirect_uri);
        params.append('code', code);

        const result = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            // headers: { Authorization: adminAuthHeader },
            body: params
        })
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
  };