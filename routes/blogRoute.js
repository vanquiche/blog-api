var express = require('express');
var router = express.Router();

const Blog = require('../models/blogModel');

// API endpoints for front-end fetches

// returns all blog posts
router.get('/', (req, res) => {
  Blog.find({}).exec((err, result) => {
    if (err) {
      return next(err);
    }
    res.json(result);
  });
});

// returns a single blog post
router.get('/:id', (req, res, next) => {
  Blog.find({ _id: req.params.id }).exec((err, result) => {
    if (err) {
      return next(err);
    }
    res.json(result);
  });
});

module.exports = router;
