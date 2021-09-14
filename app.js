const dotenv = require('dotenv');
if (process.env.NODE_MODE !== 'production') {
  dotenv.config();
}
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var compression = require('compression');
var methodOverride = require('method-override');
var createError = require('http-errors');
var helmet = require('helmet');
var jwt = require('jsonwebtoken');
var path = require('path');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/apiRoute');
var adminRouter = require('./routes/adminRoute');
var loginRouter = require('./routes/loginRoute');

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
    // console.log(user)
    req.user = user;
    return next();
  });
};

const userIsLoggedIn = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return next(err);
      }
      res.redirect('/admin');
    });
  } else return next();
};

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));


// routes
app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/admin', authenticateToken, adminRouter);
app.use('/login', userIsLoggedIn, loginRouter);

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
