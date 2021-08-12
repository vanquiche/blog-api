const Blog = require('../models/blogModel');

exports.index = (req, res) => {
  res.render('admin', { title: 'Portal' });
};

exports.get_new_blog = (req, res) => {
  res.render('new_blog', { title: 'New Blog Post' });
};
exports.post_new_blog = (req, res, next) => {
  const blog = new Blog({
    title: req.body.title,
    body: req.body.body,
  });
  blog.save((err) => {
    if (err) {
      return next(err);
    }
    res.send('blog was saved');
  });
};

exports.show_blogs = (req, res, next) => {
  Blog.find({}).exec((err, result) => {
    if (err) {
      return next(err);
    }
    res.render('catalog', { title: 'Blog Catalog', blogs: result });
  });
};

exports.get_blog = (req, res, next) => {
  Blog.find({ _id: req.params.id }).exec((err, result) => {
    if (err) {
      return next(err);
    }
    res.render('request_blog', { title: result[0].title, blog: result[0] });
  });
};

exports.profile = (req, res) => {
  res.send('profile page not yet implemented');
};

