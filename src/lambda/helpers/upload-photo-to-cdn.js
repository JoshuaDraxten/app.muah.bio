const fetch = require('node-fetch');
const ftp = require('ftp');

// Super secret information here
const cdnHREF = "https://muah.b-cdn.net/";
const ftpConnectionInformation = {
    host: 'storage.bunnycdn.com',
    port: 21,
    user: 'muah',
    password: process.env.BUNNY_CDN_PASSWORD
}

exports.uploadPhotoToCDN =  async ({ url, folder, filename }) => {
    const imageBuffer = await fetch( url )
        .then(res => res.buffer())
        .catch(console.error)

    await (async function(){
        return new Promise(( resolve, reject ) => {
            var c = new ftp();
            c.on('ready', function() {
                c.put(imageBuffer, folder+"/"+filename+".jpeg", function(err) {
                    if (err) {
                        reject();
                        throw err;
                    }
                    c.end();
                    resolve();
                });
            });
            c.connect(ftpConnectionInformation);
        })
    })()

    return `${cdnHREF}${folder}/${filename}.jpeg`;
}