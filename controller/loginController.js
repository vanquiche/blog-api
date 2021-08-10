const Admin = require('../models/adminModel');

exports.login_get = (req, res) => {
  res.render('login', { title: 'Login' });
};
