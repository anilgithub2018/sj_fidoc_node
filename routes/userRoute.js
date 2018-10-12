
const express = require('express');

const router = express.Router();
const userController = require('../controllers/UserController');

router.post('/tenant/add', userController.addTenant);
router.get('/tenant/add', userController.addTenantGet);
router.options('/tenant/add', userController.addTenantGet);

router.post('/landlord/add', userController.addLandlord);

router.get('/Users', userController.getEntityList );
router.options('/Users', userController.getEntityListOptions);

module.exports = router;