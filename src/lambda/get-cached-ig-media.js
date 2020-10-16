const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const { username } = event.queryStringParameters;
  
    const posts = await fetch(
        `https://ig.muah.bio/${username}.json`
    ).then(res => res.json());

    return {
        statusCode: 200,
        body: JSON.stringify(posts)
    }
  };