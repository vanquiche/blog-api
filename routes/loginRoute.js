const express = require('express');
const router = express.Router();

const loginController = require('../controller/loginController')

router.get('/', loginController.login_get);
router.post('/', loginController.login_submit_post)

module.exports = router;
