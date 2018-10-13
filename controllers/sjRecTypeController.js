
const dataModel = require("../models/sjRecTypeModel");

exports.crossOrigin = async function(req,res,next){

      res.header('Access-Control-Allow-Origin', req.headers.origin)
      res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
      if (req.method == 'OPTIONS') res.send(JSON.stringify({"Result":"Options"}));
      else next();      
}

exports.createEntity = async function(req,res,next){

    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    debugger;

    let dataIn = {};
    dataIn.recType = req.body.recType;
    dataIn.recDesc = req.body.recDesc;
    // dataIn.token = token;
    dataModel.createEntity(dataIn,function(dataOut, error){
        if(error){
            res.send('Error during save: ' + error, null, {
                type: 0,
                title: 'Error',
                message: 'Update Failed'
            });
        } else{
            res.send(JSON.stringify(dataOut));
        }
    });    
    
}

exports.getEntityList = async function(req,res,next){

    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    let dataIn = {};
    dataModel.getEntityList(dataIn,function(outList, error){
        if(error){
            res.send('Cannot get list : ' + error, null, {
                type: 0,
                title: 'Error',
                message: 'List read failed'
            });
        } else{

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(outList));
            // res.send(userList);
        }
    });    

}