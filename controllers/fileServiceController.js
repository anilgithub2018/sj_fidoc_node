const config = require("../config/config");
const Busboy = require('busboy');
const fs = require('fs');

exports.addImage = function(req, res, next) {
    var busboy = new Busboy({headers: req.headers});
    var uploads = {};

    // Imports the Google Cloud client library
    const googleStorage = require('@google-cloud/storage');

    // Your Google Cloud Platform project ID
    const projectId = process.env.PROJECT;

    // console.log(file[0]);
    // file = file[0];
    // Creates a client
    const storage = googleStorage({
        projectId: process.env.PROJECT,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    const bucket = storage.bucket(process.env.STORAGE_BUCKET);

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        console.log(`File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`);

        let fileUpload = bucket.file(filename);
        file.pipe(fileUpload.createWriteStream({
            metadata: {
                contentType: mimetype
            }
        }));
    });
    busboy.on('finish', function() {

        res.status(200).send("Busboy Done");
        res.end();

    });
    req.pipe(busboy);
};

exports.CrossOrigin = async function(req,res,next){
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    if (req.method == 'OPTIONS') res.send(JSON.stringify({"Result":"Options"}));
    else next();      
}

exports.ListFiles = async function listFiles(req,res,next) {
    // [START storage_list_files]
    // Imports the Google Cloud client library
    const {Storage} = require('@google-cloud/storage');
   
    debugger; 

    const storage = new Storage({
        projectId: process.env.PROJECT,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    const mybucket = storage.bucket(process.env.STORAGE_BUCKET);

 // Creates a client
    // const storage = new Storage();
  
    // Lists files in the bucket
    const [files] = await mybucket.getFiles();
  
    // mybucket
    // .acl.get()
    // .then(results => {
    //   const acls = results[0];
  
    //   acls.forEach(acl => {
    //     console.log(`${acl.role}: ${acl.entity}`);
    //   });
    // })
    // .catch(err => {
    //   console.error('ERROR:', err);
    // });

    var oFileList = {};
    var aFile = []

    console.log('Files:');
    files.forEach(file => {
      console.log(file.name);
      oFileList = {};
      oFileList.fileName  = file.name;
      oFileList.createDate = file.metadata.updated;
      aFile.push(oFileList);
    });

    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(aFile));

    // [END storage_list_files]
  }