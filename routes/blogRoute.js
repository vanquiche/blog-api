var express = require('express');
var router = express.Router();

// API endpoints for front-end fetches

// returns all blog posts
router.get('/', (req, res) => {
  res.json({
    blog: 'all of the blog post',
  });
});

// returns a single blog post
router.get('/:blogId', (req, res) => {
  res.json({
    blog: 'a single post',
  });
});

module.exports = router;
