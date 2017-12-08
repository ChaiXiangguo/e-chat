var express = require('express');
var router = express.Router();
/* GET users listing. */
router.get('/:id', function (req, res, next) {
   var User = global.dbHandel.getModel('user');
  User.findOne({ _id: req.params.id }, function (err, doc) { // 同理 /login 路径的处理方式
    if (err) {
      res.send(500);
      // req.session.error = '网络异常错误！';
      console.log(err);
    } else if (doc) {
      // req.session.error = '用户名已存在！';
      res.send(500);
    }
  })
})
module.exports = router