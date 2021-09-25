const dotenv = require('dotenv');
if (process.env.NODE_MODE !== 'production') {
  dotenv.config();
}
var Blog = require('../models/blogModel');
var User = require('../models/adminModel');
var cloudinary = require('cloudinary').v2;
var path = require('path');
var multer = require('multer');
var { body } = require('express-validator');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

var directory = multer.diskStorage({
  // we are no longer saving to disc
  // destination: (req, file, cb) => {
  //   cb(null, path.join(__dirname, '../public/images/thumbnails'));
  // },
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

const multi_upload = multer({
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

exports.post_new_blog = [
  upload.single('thumbnail'),
  async (req, res) => {
    // const extRegex = /\.jpg|\.png|\.jpeg|\.gif/gi;
    const cloud = await cloudinary.uploader.upload(req.file.path, {
      public_id: req.file.filename,
    });
    const publishState = req.body.published === 'true' ? true : false;
    const blog = new Blog({
      title: req.body.title,
      body: req.body.body,
      published: publishState,
      thumbnail: cloud.secure_url,
      tags: req.body.tags.split(' '),
      thumbnailAlt: req.file.filename,
      slug: createSlug(req.body.title),
      snippet: createSnippet(req.body.body),
    });
    blog.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/admin/blog');
    });
  },
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
    res.render('edit_blog', { title: result[0].title, blog: result[0] });
  });
};

exports.edit_blog_post = [
  upload.single('thumbnail'),
  async (req, res, next) => {
    const cloud = await cloudinary.uploader.upload(req.file.path, {
      public_id: req.file.filename,
    });
    const publishState = req.body.published === 'true' ? true : false;
    Blog.findOneAndUpdate(
      { _id: req.params.id },
      {
        title: req.body.title,
        body: req.body.body,
        snippet: createSnippet(req.body.body),
        thumbnail: cloud.secure_url,
        thumbnailAlt: req.file.filename,
        tags: req.body.tags.split(' '),
        published: publishState,
      },
      { new: true }
    ).exec((err, result) => {
      if (err) {
        return next(err);
      }
      res.redirect('/admin/blog');
    });
  },
];

exports.delete_blog_post = (req, res, next) => {
  Blog.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/admin/blog');
  });
};

exports.get_media_library = (req, res) => {
  res.render('media', { title: 'Media Upload' });
};

exports.post_media_library = [
  // process uploaded images
  multi_upload.array('media', 5),
  async (req, res) => {
    // assign a promise to each file
    let res_promises = req.files.map(
      (file) =>
        new Promise((resolve, reject) => {
          // upload file individually
          cloudinary.uploader.upload(
            file.path,
            { public_id: file.filename },
            (err, result) => {
              // if upload fails, then reject
              if (err) reject(err);
              // otherwise resolve promise
              else resolve(result.public_id);
            }
          );
        })
    );
    // once all promises has been resolved
    // send user to new page displaying results
    Promise.all(res_promises)
      .then((result) => {
        res.render('uploadSuccess', {results: result})
      })
      .catch((err) => console.log(err));
  },
];
