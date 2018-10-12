
const userModel = require("../models/UserModel");

// const {OAuth2Client} = require('google-auth-library');
// const client = new OAuth2Client("424866252249-rnmr12b3jo5ab7iacdrh1q56jcrq3al4.apps.googleusercontent.com");

exports.addTenantGet = async function(req,res,next){

      res.header('Access-Control-Allow-Origin', req.headers.origin)
      res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
      if (req.method == 'OPTIONS') res.send(JSON.stringify({"Result":"Options"}));
      else if (req.method == 'GET') res.send({"Result":"Get"});
      else if (req.method == 'POST') res.send({"Result":"Post"});
      else next();      
}
 
exports.getEntityListOptions = async function(req,res,next){

    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    if (req.method == 'OPTIONS') res.send(JSON.stringify({"Result":"Options"}));
    else if (req.method == 'GET') res.send({"Result":"Get"});
    else if (req.method == 'POST') res.send({"Result":"Post"});
    else next();      
}


exports.addTenant = async function(req,res,next){
    // let token = req.body.idtoken;
    // const ticket = await client.verifyIdToken({
    //     idToken: token,
    //     audience: "424866252249-rnmr12b3jo5ab7iacdrh1q56jcrq3al4.apps.googleusercontent.com"
    // });
    // console.log(token);
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    let query = {};
    query.email = req.body.email;
    query.username = req.body.username;
    query.password = req.body.password;
    query.role = "TENANT";
    // query.token = token;
    userModel.addUser(query,function(user, error){
        if(error){
            res.send('Cannot save user : ' + error, null, {
                type: 0,
                title: 'error',
                message: 'Something went wrong. Cannot update details'
            });
        } else{
            res.send(JSON.stringify(user));
        }
    });
    
    
}

exports.addLandlord = async function(req,res,next){
    // let token = req.body.idtoken;
    // const ticket = await client.verifyIdToken({
    //     idToken: token,
    //     audience: "424866252249-rnmr12b3jo5ab7iacdrh1q56jcrq3al4.apps.googleusercontent.com"
    // });
    // console.log(token);
      
    let query = {};
    query.email = ticket.payload.email;
    query.username = ticket.payload.name;
    query.role = "LANDLORD";
    query.token = token;
    userModel.addUser(query,function(user, error){
            if(error){
                res.send('Cannot save user : ' + error, null, {
                    type: 0,
                    title: 'error',
                    message: 'Something went wrong. Cannot update details'
                });
            } else{
                res.send(user);
            }
        });
    
}


exports.getEntityList = async function(req,res,next){

    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    let query = {};
    query.role = "TENANT";
    userModel.getEntityList(query,function(userList, error){
        if(error){
            res.send('Cannot get user list : ' + error, null, {
                type: 0,
                title: 'error',
                message: 'Something went wrong. Cannot update details'
            });
        } else{
            debugger;
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(userList));
            // res.send(userList);
        }
    });    

}