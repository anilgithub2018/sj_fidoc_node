
const express = require('express');

const router = express.Router();
const Controller = require('../controllers/fileServiceController');

router.get('/getFileList', Controller.ListFiles );
router.options('/getFileList', Controller.CrossOrigin);

router.post('/uploadFile', Controller.uploadFile );
router.options('/uploadFile', Controller.CrossOrigin);

module.exports = router;