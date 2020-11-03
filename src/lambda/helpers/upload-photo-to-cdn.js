const fetch = require('node-fetch');
const ftp = require('ftp');
const axios = require('axios');
const fs = require('fs');

// Super secret information here
const cdnHREF = "https://muah.b-cdn.net/";
const ftpConnectionInformation = {
    host: 'storage.bunnycdn.com',
    port: 21,
    user: 'muah',
    password: '95bbf8a0-3d79-42ad-83b1e3a79f4e-0492-4299'
}

const deleteFile = path => new Promise( resolve => 
    fs.unlink(path, ()=>resolve())
);

const downloadFile = (url, name) => axios({
        url,
        responseType: 'stream',
    }).then(
        response =>
            new Promise((resolve, reject) => {
                console.log('download script')
                response.data
                    .pipe(fs.createWriteStream(name))
                    .on('finish', () => resolve())
                    .on('error', e => reject(e));
            }),
    ).catch(
        error => console.error( "Could not download image", url, error )
    );

const uploadFileToFtp = (fileName, remoteDir='', ftpConnectionInformation) => {
    return new Promise((resolve, reject) => {
        var c = new ftp();
        c.on('ready', function() {
            c.put(fileName, remoteDir+"/"+fileName, function(err) {
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
}

exports.uploadPhotoToCDN =  async ({ url, folder, filename }) => {
    await downloadFile( url, `${filename}.jpeg` );
    await uploadFileToFtp(`${filename}.jpeg`, folder, ftpConnectionInformation);
    // await deleteFile(`${filename}.jpeg`);

    return `${cdnHREF}${folder}/${filename}.jpeg`;
}