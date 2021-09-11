const dotenv = require('dotenv');
if (process.env.NODE_MODE !== 'production') {
  dotenv.config();
}
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/adminModel');

exports.login_get = (req, res) => {
  res.render('login', { title: 'Login', user: req.user });
};

exports.login_submit_post = [
  // sanitizing user entries
  body('email', 'incorrect email').isEmail().normalizeEmail(),
  body('password', 'incorrect password').isLength({ min: 5 }).trim(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(401).json({ errors: errors.array() });
    }
    // validate db for user
    Admin.findOne({ email: req.body.email, password: req.body.password }).exec(
      (err, user) => {
        if (err) {
          return next(err);
        }
        if (user !== null) {
          // create web token here
          // expires in 24hrs
          const oneDay = 1000 * 60 * 60 * 24;
          const token = jwt.sign({ user }, process.env.JWT_SECRET, {
            algorithm: 'HS256',
          });
          res.cookie('token', token, { maxAge: oneDay });
          res.redirect('/admin');
        } else {
          res.render('login', {
            title: 'Login',
            error: 'wrong email or password',
          });
        }
      }
    );
  },
];
