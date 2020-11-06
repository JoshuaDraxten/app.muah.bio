const fetch = require('node-fetch');
const ftp = require('ftp');

// Super secret information here
const cdnHREF = "https://muah.b-cdn.net/";
const ftpConnectionInformation = {
    host: 'storage.bunnycdn.com',
    port: 21,
    user: 'muah',
    password: '95bbf8a0-3d79-42ad-83b1e3a79f4e-0492-4299'
}

exports.uploadPhotoToCDN =  async ({ url, folder, filename }) => {
    const imageBuffer = await fetch( url )
        .then(res => res.buffer())
        .catch(console.error)

    var c = new ftp();
    c.on('ready', function() {
        c.put(imageBuffer, folder+"/"+filename+".jpeg", function(err) {
            if (err) {
                reject();
                throw err;
            }
            c.end();
            // resolve();
        });
    });
    c.connect(ftpConnectionInformation);

    return `${cdnHREF}${folder}/${filename}.jpeg`;
}