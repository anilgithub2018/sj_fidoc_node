
const express = require('express');

const router = express.Router();
const Controller = require('../controllers/sjFiDocPostController');


router.post('/fiDoc', Controller.createEntity);
router.options('/fiDoc', Controller.crossOrigin);

module.exports = router;