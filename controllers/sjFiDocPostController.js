
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
debugger;
    req.body.data.forEach(lsRecData => {
        if( !(lsRecData["BBKPF-BUKRS"] === undefined) && lsRecData["BBKPF-BUKRS"] === ""){
            dataOutArr.push({"Type":"E","Message":"BKPF Company code missing", "MessageV1":"Header", "MessageV2":""});
        }

        if( !(lsRecData["BBSEG-DMBTR"] === undefined)  && lsRecData["BBSEG-DMBTR"] === ""){
            dataOutArr.push({"Type":"E","Message":"BBSEG-DMBTR Empty", "MessageV1":"Item", "MessageV2": ` ${lsRecData["BBSEG-NEWBS"]} / ${lsRecData["BBSEG-NEWKO"]} `  });
        }
        
    });

    if(dataOutArr.length > 0) {
        res.send(JSON.stringify(dataOutArr));
    } else {
        if(req.body.mode === 'Post')
        {
            var val = Math.floor(1000 + Math.random() * 9000);
            val = 1400000000 + val;
            dataOutArr.push({"Type":"S","Message":`Document ${val} Saved Successfully`, "MessageV1":"", "MessageV2":""});
        }
        else
        {
            dataOutArr.push({"Type":"S","Message":"Document Simulated Successfully", "MessageV1":"", "MessageV2":""});
        }

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