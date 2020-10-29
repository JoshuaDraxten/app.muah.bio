const { uploadPhotoToCDN } = require('./helpers/upload-photo-to-cdn');

exports.handler = async event => {
    const { username, postId, url } = event.queryStringParameters;
    const cdnURL = await uploadPhotoToCDN({ filename: postId, folder: username, url });
    return {
        statusCode: 200,
        body: cdnURL
    }
}