const dotenv = require('dotenv');
if (process.env.NODE_MODE !== 'production') {
  dotenv.config();
}
const jwt = require('jsonwebtoken');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
const blogRouter = require('./routes/blogRoute');
const adminRouter = require('./routes/adminRoute');
const loginRouter = require('./routes/loginRoute');

//Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// middleware
// verify client jsonwebtoken
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.redirect('/login');
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).redirect('/login');
    }
    req.user = user;
    return next();
  });
};
// assign locals.user if current user exist
const showUser = (req, res, next) => {
  if (res.locals.user) {
    res.redirect('/admin');
  } else {
    return next();
  }
};

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', indexRouter);
app.use('/blog', blogRouter);
app.use('/admin', authenticateToken, adminRouter);
app.use('/login', loginRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
