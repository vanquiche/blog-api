const Blog = require('../models/blogModel');

exports.index = (req, res) => {
  res.render('admin', { title: 'Admin', user: req.user });
};

exports.get_new_blog = (req, res) => {
  res.render('new_blog', { title: 'New Blog Post' });
};
exports.post_new_blog = (req, res, next) => {
  const publishState = req.body.published === 'true' ? true : false;
  const blog = new Blog({
    title: req.body.title,
    body: req.body.body,
    published: publishState,
  });
  blog.save((err) => {
    if (err) {
      return next(err);
    }
    res.send('blog was saved');
  });
};

exports.show_blogs = (req, res, next) => {
  Blog.find({}).sort({createdAt: -1}).exec((err, result) => {
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

exports.edit_blog = (req, res, next) => {
  Blog.find({ _id: req.params.id }).exec((err, result) => {
    if (err) {
      return next(err);
    }
    res.render('edit_blog', { title: result[0].title, blog: result[0] });
  });
};

exports.edit_blog_post = (req, res, next) => {
  const publishState = req.body.published === 'true' ? true : false;
  Blog.findOneAndUpdate(
    { _id: req.params.id },
    { title: req.body.title, body: req.body.body, published: publishState },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return next(err);
    }
    res.redirect('/admin/blog');
  });
};

exports.profile = (req, res) => {
  res.send('profile page not yet implemented');
};
