const express = require('express');
const router = express.Router();

const adminController = require('../controller/adminController');

router.get('/', adminController.index);

router.get('/new-blog', adminController.get_new_blog);
router.post('/new-blog', adminController.post_new_blog);

router.get('/blog', adminController.show_blogs);
router.get('/blog/:id', adminController.get_blog)

router.get('/profile', adminController.profile);

module.exports = router;
