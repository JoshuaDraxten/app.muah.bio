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

// const axios = require('axios');

// exports.handler = async ( event, context ) => {
//     const { code, redirect_uri } = event.queryStringParameters;
    
    // const response = await axios.post('https://api.instagram.com/oauth/access_token', {
    //     client_id: "399352408128696",
    //     client_secret: "fb6cb72b006eccc3ea50e6136d2d78ac",
    //     grant_type: "authorization_code",
    //     redirect_uri,
    //     code
    // }).catch( error => error )

//     return {
//         statusCode: 200,
//         body: JSON.stringify( response )
//     }
// }

// curl -X POST \
//   https://api.instagram.com/oauth/access_token \
//   -F client_id=399352408128696 \
//   -F client_secret=fb6cb72b006eccc3ea50e6136d2d78ac \
//   -F grant_type=authorization_code \
//   -F redirect_uri=https://app.muah.bio/ \
//   -F code=AQCTdtHKDpKkQxox9d1vVvcFpsGAKx0kmmQN91_83VyYiyfxIMC1Qe0OKIOAMmVIlJY-laGL9kQKuGtUiUsvT0_-NjTPr1D9pf1WnVUFNY-SHqlrCVEumNOWR50CU7IwNVucsVO7_--_hvFjGEyO5AVjSEDu7Lq7nvJmPyBAR7BcIuJB7KpSlfAO8fyVCkqL3pMraPorU2lxU9EQMh5ZgUSayAoWY5wdRfpA7bWnrMV7Eg