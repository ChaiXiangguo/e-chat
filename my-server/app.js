var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var session = require('express-session');
var index = require('./routes/index');
var users = require('./routes/users');
var multer = require('multer');
var mongoose = require('mongoose');
var app = express();
// app.use(session({
//     secret: 'secret',
//     cookie:{
//         maxAge: 1000*60*30
//     }
// }));

app.use(function(req,res,next){
    // res.locals.user = req.session.user;   // 从session 获取 user对象
    // var err = req.session.error;   //获取错误信息
    // delete req.session.error;
    // res.locals.message = "";   // 展示的信息 message
    // if(err){
    //     res.locals.message = '<div class="alert alert-danger" style="margin-bottom:20px;color:red;">'+err+'</div>';
    // }
    next();  //中间件传递
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.engine("html",require("ejs").__express);
app.engine("html",require("ejs").renderFile);
// app.set('view engine', 'jade');
app.set('view engine', 'html');
global.db = mongoose.createConnection("mongodb://localhost:27017/nodedb");
global.dbHandel = require('./database/dbHandel');
require('./config/seed')

// 下边这里也加上 use(multer())
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(multer());
app.use(cookieParser());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/', routes);  // 即为为路径 / 设置路由
// app.use('/users', users); // 即为为路径 /users 设置路由
// app.use('/login',routes); // 即为为路径 /login 设置路由
// app.use('/register',routes); // 即为为路径 /register 设置路由
// app.use('/home',routes); // 即为为路径 /home 设置路由
// app.use("/logout",routes); // 即为为路径 /logout 设置路由
// app.all('*', function(req, res, next){
//     console.log('555555555')
//     req.headers['Access-Control-Allow-Origin'] = '*'
//     next()
// })
app.use('/', index);
app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  // if (req.method == 'OPTIONS') {
  //   res.send(200); /让options请求快速返回/
  // }
  // else {
    next();
  // }
});
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
