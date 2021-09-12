const express = require('express');
const Blog = require('../models/blogModel');
const User = require('../models/adminModel');
const { body, validationResult } = require('express-validator');

const path = require('path');
const multer = require('multer');
const directory = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images/thumbnails'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname.toLowerCase().split(' ').join('-'));
  },
});
const maxSizeUpload = 1 * 2048 * 2048;
const upload = multer({
  storage: directory,
  limits: {
    fileSize: maxSizeUpload,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/gif' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .gif, .jpg and .jpeg format allowed'));
    }
  },
});



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

function createSlug(str) {
  if (str === null || str === '') {
    return;
  }
  return str.toLowerCase().split(' ').join('-');
}

// admin inde controller
exports.index = (req, res) => {
  res.render('admin', { title: 'Admin', user: req.user.userLogged });
};

// profile controller
exports.get_profile = (req, res, next) => {
  res.render('profile', { title: 'Profile', user: req.user });
};

exports.update_profile = [
  // sanitizing input fields
  body('username', 'invalid username').trim().escape(),
  body('email', 'invalid email').isEmail().trim().escape(),
  body('password', 'invalid password').trim().escape(),
  // console.log(req.user.user._id),
  // res.send('hello world')
  (req, res, next) => {
    User.findOneAndUpdate(
      { _id: req.user._id },
      {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      },
      { new: true }
    ).exec((err, result) => {
      if (err) {
        return next(err);
      }
      req.user = result;
      res.render('profile', { title: 'Profile', user: req.user });
    });
  },
];

exports.add_user = [
  body('name', 'invalid first-name')
    .trim()
    .isLength({ min: 1, max: 25 })
    .escape(),
  body('lastname', 'invalid last name')
    .trim()
    .isLength({ min: 1, max: 25 })
    .escape(),
  body('username', 'invalid username')
    .trim()
    .isLength({ min: 1, max: 25 })
    .escape(),
  body('password', 'invalid password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .escape(),
  body('email', 'invalid email').trim().escape().isEmail(),

  (req, res, next) => {
    const newUser = {
      name: req.body.name,
      lastname: req.body.lastname,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: 'admin',
    };
    User.save(newUser, (err, result) => {
      if (err) {
        return next(err);
      }
      res.redirect('admin/profile');
    });
  },
];

// blog controller
exports.get_new_blog = (req, res) => {
  res.render('new_blog', { title: 'New Blog Post' });
};
// exports.post_new_blog = (req, res, next) => {
//   const publishState = req.body.published === 'true' ? true : false;
//   const blog = new Blog({
//     title: req.body.title,
//     body: req.body.body,
//     snippet: createSnippet(req.body.body),
//     thumbnail:
//     thumnailAlt:
//     slug: createSlug(req.body.title),
//     tags: (req.body.tags).split(' '),
//     published: publishState,
//   });
//   blog.save((err) => {
//     if (err) {
//       return next(err);
//     }
//     res.redirect('/admin/blog');
//   });
// };

exports.post_new_blog = [
  upload.single('thumbnail'),
  (req, res) => {
    const publishState = req.body.published === 'true' ? true : false;
    const blog = new Blog({
      title: req.body.title,
      body: req.body.body,
      snippet: createSnippet(req.body.body),
      thumbnail: `/images/thumbnails/${req.file.filename}`,
      thumbnailAlt: req.body.thumbnailAlt,
      slug: createSlug(req.body.title),
      tags: req.body.tags.split(' '),
      published: publishState,
    });
    blog.save((err) => {
      if (err) {
        return next(err);
      }
      console.log(req.file)
      console.log(blog);
      res.redirect('/admin/blog');
    });

  }
];

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
    console.log(result)
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
      tags: (req.body.tags).split(' '),
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
