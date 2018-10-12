

const kind = "sjRecType";
const Datastore = require('@google-cloud/datastore');

var projectId = process.env.PROJECT;
if( process.env.GOOGLE_CLOUD_PROJECT ){
    projectId = process.env.GOOGLE_CLOUD_PROJECT;
    console.log('UserModel: Project ID ', projectId);
}

console.log('sjRecType: projectId - from user', projectId);
const datastore = new Datastore({
    projectId: projectId
});
const transaction = datastore.transaction();

exports.createEntity = function(dataIn, callback){
    debugger;
    let keyFld = dataIn.recType;
    const query = datastore.createQuery(kind).filter('recType', '=', keyFld);
    datastore.runQuery(query).then(function(results){
        console.log(results[0].length);
        if(results[0].length!=0){
            exports.updateEntity(dataIn, results[0], callback );
            // return callback(results[0], null);
        }else{
            console.log("Create New Entity");
            const dataSave = {
                key:datastore.key(kind),
                data:{
                    recType: dataIn.recType,
                    recDesc: dataIn.recDesc
                }
            };
            datastore.save(dataSave).then(function(){
                console.log(dataSave);
                callback(dataSave, null);
            }).catch(function(error){
                console.log(error);
                callback(null, error.errmsg);
            });
        }
    }).catch(function(error){
        callback(null, error);
    });
    
}

exports.updateEntity = function(dataIn, QueryList, callback) {
  debugger;  
    QueryList.forEach(lsEntity => {
        const keyFld = lsEntity[datastore.KEY];

        transaction
        .run()
        .then(() => transaction.get(keyFld))
        .then(results => {
          const userDbRecord    = results[0];
          userDbRecord.email    = dataIn.recType;
          userDbRecord.username = dataIn.recDesc;

          transaction.save({
            key: keyFld,
            data: userDbRecord,
          });
          return transaction.commit();
        })
        .then(() => {
          // The transaction completed successfully.
          console.log(`${userKey.id} updated successfully.`);
          callback(lsEntity, null);
        })
        .catch(() => transaction.rollback());
          
      });
        
}

exports.deleteEntity = function(dataIn, QueryList, callback) {
    debugger;  
      QueryList.forEach(lsEntity => {
          const keyFld = lsEntity[datastore.KEY];

          const deleteKey = datastore.key(['sjRecType', keyFld.id]);
          datastore.delete(keyFld)
          .then(() => {
            console.log(`User ${keyFld.id} deleted successfully.`);
          })
          .catch(err => {
            console.error('ERROR:', err);
          });          
  
        });
          
  }

exports.findIdByEmail = function(email, callback){
    const query = datastore.createQuery(kind).filter('email', '=', email);
    datastore.runQuery(query).then(function(results){
        callback((results[0])[0], null);
    }).catch(function(error){
        callback(null, error);
    });
}

exports.getEntityList = function(filter, callback){
    const query = datastore.createQuery(kind);
debugger;
    datastore.runQuery(query).then(results => {
        console.log(results);
        const entities = results[0];
        const info = results[1];

        if (info.moreResults !== Datastore.NO_MORE_RESULTS) {
            // If there are more results to retrieve, the end cursor is
            // automatically set on `info`. To get this value directly, access
            // the `endCursor` property.
            return runPageQuery(info.endCursor).then(results => {
                // Concatenate entities
                results[0] = entities.concat(results[0]);
                return results;
            });
        }
        callback(entities,null);
    }).catch(function(error){
        callback(null, error);
    });    
}