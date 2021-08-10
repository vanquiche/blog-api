const express = require('express');
const router = express.Router();

const loginController = require('../controller/loginController')

router.get('/', loginController.login_get);

module.exports = router;
