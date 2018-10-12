
const express = require('express');

const router = express.Router();
const Controller = require('../controllers/sjRecFldController');

router.get('/getList', Controller.getEntityList );
router.options('/getList', Controller.crossOrigin);

router.post('/add', Controller.createEntity);
router.options('/add', Controller.crossOrigin);

module.exports = router;