const Blog = require('../models/blogModel');

function createSnippet(str) {
  if (str === null || str === '') {
    return 'no snippet available';
  }
  // strip html tags from string
  const stripped = str.replace(/(<([^>]+)>)/gi, '');
  // slicing the first 40 words or less of string
  const snippet = stripped.split(' ').splice(0, 40).join(' ').concat('...');
  return snippet;
}

exports.index = (req, res) => {
  res.render('admin', { title: 'Admin', user: req.user });
};

exports.get_profile = (req, res, next) => {
  console.log(req.user);

  res.render('profile', {title: 'Profile', user: req.user.user})
}

exports.get_new_blog = (req, res) => {
  res.render('new_blog', { title: 'New Blog Post' });
};
exports.post_new_blog = (req, res, next) => {
  const publishState = req.body.published === 'true' ? true : false;
  const blog = new Blog({
    title: req.body.title,
    body: req.body.body,
    snippet: createSnippet(req.body.body),
    published: publishState,
  });
  blog.save((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/admin/blog');
  });
};

exports.show_blogs = (req, res, next) => {
  Blog.find({})
    .sort({ createdAt: -1 })
    .exec((err, result) => {
      if (err) {
        return next(err);
      }
      res.render('catalog', {
        title: 'Blog Catalog',
        blogs: result,
      });
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
    {
      title: req.body.title,
      body: req.body.body,
      snippet: createSnippet(req.body.body),
      published: publishState,
    },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return next(err);
    }
    res.redirect('/admin/blog');
  });
};

exports.delete_blog_post = (req, res, next) => {
  Blog.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/admin/blog');
  });
};

exports.profile = (req, res) => {
  res.send('profile page not yet implemented');
};
