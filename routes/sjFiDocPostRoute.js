
const express = require('express');

const router = express.Router();
const Controller = require('../controllers/sjFiDocPostController');


router.post('/fidoc', Controller.createEntity);
router.options('/fidoc', Controller.crossOrigin);

module.exports = router;