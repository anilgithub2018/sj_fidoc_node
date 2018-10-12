

const kind = "Users";
const Datastore = require('@google-cloud/datastore');


var projectId = process.env.PROJECT;
if( process.env.GOOGLE_CLOUD_PROJECT ){
    projectId = process.env.GOOGLE_CLOUD_PROJECT;
    console.log('UserModel: Project ID ', projectId);
}

console.log('UserModel: projectId - from user', projectId);
const datastore = new Datastore({
    projectId: projectId
});
const transaction = datastore.transaction();

exports.addUser = function(user, callback){
    let email = user.email;
    const query = datastore.createQuery(kind).filter('email', '=', email);
    datastore.runQuery(query).then(function(results){
        console.log(results[0].length);
        if(results[0].length!=0){
            exports.updateEntity(user, results[0], callback );
            // return callback(results[0], null);
        }else{
            console.log("Saving user");
            const userSave = {
                key:datastore.key(kind),
                data:{
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    role:user.role
                }
            };
            datastore.save(userSave).then(function(){
                console.log(userSave);
                callback(userSave, null);
            }).catch(function(error){
                console.log(error);
                callback(null, error.errmsg);
            });
        }
    }).catch(function(error){
        callback(null, error);
    });
    
}

exports.updateEntity = function(userNew, QueryList, callback) {
  debugger;  
    QueryList.forEach(UserEntity => {
        const userKey = UserEntity[datastore.KEY];

        transaction
        .run()
        .then(() => transaction.get(userKey))
        .then(results => {
          const userDbRecord    = results[0];
          userDbRecord.email    = userNew.email;
          userDbRecord.username = userNew.username;
          userDbRecord.password = userNew.password;
          userDbRecord.role     = userNew.role;

          transaction.save({
            key: userKey,
            data: userDbRecord,
          });
          return transaction.commit();
        })
        .then(() => {
          // The transaction completed successfully.
          console.log(`User ${userKey.id} updated successfully.`);
          callback(userNew, null);
        })
        .catch(() => transaction.rollback());
          

      });
        
}

exports.deleteEntity = function(userNew, QueryList, callback) {
    debugger;  
      QueryList.forEach(UserEntity => {
          const userKey = UserEntity[datastore.KEY];

          const deleteKey = datastore.key(['Users', userKey.id]);
          datastore.delete(userKey)
          .then(() => {
            console.log(`User ${userKey.id} deleted successfully.`);
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