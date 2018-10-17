require('./config/config');
var user = require('./routes/userRoute');
var recType = require('./routes/sjRecTypeRoute');
var recFields = require('./routes/sjRecFldRoute');

var fileService = require('./routes/fileServiceRoute');
var fiDocPost = require('./routes/sjFiDocPostRoute');

const express = require('express')
const app = express()

app.use(express.static(__dirname + '/public')); 

console.log("entering the app" , "project " , process.env.PROJECT);

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/user/',user);
app.use('/fileService/',fileService);
app.use('/recType/', recType);
app.use('/recFields/', recFields);
app.use('/fiDoc/', fiDocPost);

app.get('/', (req, res) => {
  res.header('Content-Type', 'application/json');
  res.send(JSON.stringify({value: 1}));
})

app.get('/log', (req, res) => {
  res.status(418).send("Hello I'm a teapot running on Node Standard GAE")
})

app.listen(process.env.PORT || 3000, () => {
  console.log("started to listen & Process Port = " +  process.env.PORT );
})

