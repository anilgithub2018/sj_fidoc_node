
const dataModel = require("../models/sjRecFldModel");

exports.crossOrigin = async function(req,res,next){

      res.header('Access-Control-Allow-Origin', req.headers.origin)
      res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
      if (req.method == 'OPTIONS') res.send(JSON.stringify({"Result":"Options"}));
      else next();      
}

exports.createEntity = async function(req,res,next){

    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    var dataOutArr = [];

    // var recToProcess = req.body.recFields.length;

    req.body.forEach(lsRecData => {
        if(lsRecData["BBKPF-BUKRS"] && lsRecData["BBKPF-BUKRS"] === ""){
            dataOutArr.push({"Type":"E","Message":"BKPF Company code missing", "MessageV1":"Header", "MessageV2":""});
        }

        if(lsRecData["BBSEG-DMBTR"] && lsRecData["BBSEG-DMBTR"] === ""){
            dataOutArr.push({"Type":"E","Message":"BBSEG-DMBTR Empty", "MessageV1":"Item", "MessageV2":lsRecData["BBSEG-NEWBS"]});
        }
        
        if(lsRecData["BBSEG-AUFNR"] && lsRecData["BBSEG-AUFNR"] === ""){
            dataOutArr.push({"Type":"W","Message":"BBSEG-AUFNR optional", "MessageV1":"Item", "MessageV2":lsRecData["BBSEG-NEWBS"]});
        }

        if(lsRecData["BBSEG-ZTERM"] && lsRecData["BBSEG-ZTERM"] === ""){
            dataOutArr.push({"Type":"I","Message":"Payment Term ZTERM empty", "MessageV1":"Item", "MessageV2":lsRecData["BBSEG-NEWBS"]});
        }

    });

    if(dataOutArr.length > 0) {
        res.send(JSON.stringify(dataOutArr));
    } else {
        dataOutArr.push({"Type":"S","Message":"Document Parked Successfully", "MessageV1":"Header", "MessageV2":""});
        res.send(JSON.stringify(dataOutArr));
    }

    // req.body.recFields.forEach(lsRecFields => {

    //     let dataIn = {};

    //     dataIn.recType = lsRecFields.recType;
    //     dataIn.fldName = lsRecFields.fldName;
    //     dataIn.seqNo   = lsRecFields.seqNo;
    //     // dataIn.token = token;
    //     if( lsRecFields.delInd !== true ) {
    //         dataModel.createEntity(dataIn,function(dataOut, error){
    //             if(error){
    //                 res.send('Error during save: ' + error, null, {
    //                     type: 0,
    //                     title: 'Error',
    //                     message: 'Update Failed'
    //                 });
    //             } else{

    //                 dataOutArr.push(dataOut.data);
    //                 if ( recToProcess === dataOutArr.length )
    //                     res.send(JSON.stringify(dataOutArr));
                    
                        
    //             }
    //         });
    // } else {

    //     dataModel.deleteEntity(dataIn, null ,function(dataOut, error){
    //         if(error){
    //             res.send('Error during save: ' + error, null, {
    //                 type: 0,
    //                 title: 'Error',
    //                 message: 'Update Failed'
    //             });
    //         } else{
    //             dataOutArr.push(dataOut.data);
    //             if ( recToProcess === dataOutArr.length )
    //                 res.send(JSON.stringify(dataOutArr));
    //         }
    //     });

    // }
           
    // });    
    
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