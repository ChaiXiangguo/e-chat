var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});
/* GET login page. */
router.route("/login").get(function (req, res) { // 到达此路径则渲染login文件，并传出title值供 login.html使用
    res.render("login", { title: 'User Login' });
})
router.route("/login").post(function (req, res) { // 从此路径检测到post方式则进行post数据的处理操作
    //get User info
    //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在app.js中已经实现)

    var User = global.dbHandel.getModel('user');
    var uname = req.body.uname;
    console.log(uname)
    var Group = global.dbHandel.getModel('group');
    try {
        User.findOne({ "$or": [{ name: uname }, { account: uname }] }).populate('group friends.user chatgroup framef', 'gname logo name cgname').exec().then(function (user) {
            if (!user) {
                res.send(500, { err: '无此用户！', code: 1000 });
            } else {
                if (req.body.upwd != user.password) { //查询到匹配用户名的信息，但相应的password属性不匹配
                    //             req.session.error = "密码错误";
                    res.send(500, { err: '密码错误', code: 1001 });
                    //             //    res.redirect("/login");
                } else if (user.socket || user.status === 'up') {
                    res.send(500, { err: '您的账号在其他地方已经登陆，请确保你的账号安全，不要将密码告诉其他人', code: 1002 });
                } else { //信息匹配成功，则将此对象（匹配到的user) 赋给session.user  并返回成功
                    //             req.session.user = doc;
                    res.send(200, user);
                    //             //    res.redirect("/home");
                }
            }
        })
    } catch (err) {
        res.send(500, { err: '系统内部错误' });
    }
});
/* GET register page. */
router.route("/register").get(function (req, res) { // 到达此路径则渲染register文件，并传出title值供 register.html使用
    res.render("register", { title: 'User register' });
}).post(function (req, res) {
    //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在app.js中已经实现)
    var User = global.dbHandel.getModel('user');
    var uname = req.body.uname;
    var upwd = req.body.upwd;
    User.findOne({ name: uname }, function (err, doc) { // 同理 /login 路径的处理方式
        if (err) {
            res.send(500, { err: '网络异常错误！' });
            // req.session.error = '网络异常错误！';
            console.log(err);
        } else if (doc) {
            // req.session.error = '用户名已存在！';
            res.send(500, { err: '网络异常错误！' });
        } else {
            User.count({}, function (err, count) {
                User.create({ // 创建一组user对象置入model
                    name: uname,
                    password: upwd,
                    account: count + '' + parseInt(Math.random() * 100000)
                }, function (err, doc) {
                    if (err) {
                        // req.session.error = '网络异常错误！';
                        console.log(err);
                    } else {
                        var Group = global.dbHandel.getModel('group');
                        Group.create({ gname: '我的好友', ismain: true }, function (err, suc) {
                            if (err) {
                                // req.session.error = '网络异常错误！';
                                console.log(err);
                            } else {
                                console.log(6, doc._id, suc._id)
                                User.update({ _id: doc._id }, { $push: { group: suc._id } }, function (err, result) {
                                    console.log(7, result)
                                    if (err) {
                                        // req.session.error = '网络异常错误！';
                                        console.log(err);
                                    } else {
                                        // req.session.error = '用户名创建成功！';
                                        res.send(200);
                                    }
                                });
                            }
                        }
                        )
                    }
                })
            })
        }
    });
});
/* GET friends. */
router.get("/friendsinfo/:id", function (req, res) {
    var User = global.dbHandel.getModel('user');
    User.findOne({ "$or": [{ name: req.params.id }, { account: req.params.id }] }, ['name', 'sex', 'logo', 'status', 'account'], function (err, suc) {
        console.log(err, suc)
        if (err) {
            console.log(88, err)
        } else {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
            res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
            res.header('Cache-Control', 'no-cache');
            res.send(200, suc);
        }
    })
});
/* GET friends. */
router.get("/idfriendsinfo/:id", function (req, res) {
    var User = global.dbHandel.getModel('user');
    User.findOne({ "$or": [{ _id: req.params.id }] }, ['name', 'sex', 'logo', 'status', 'account'], function (err, suc) {
        console.log(err, suc)
        if (err) {
            console.log(88, err)
        } else {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
            res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
            res.header('Cache-Control', 'no-cache');
            res.send(200, suc);
        }
    })
});
/* GET friends. */
router.get("/friends/:id", function (req, res) {
    var User = global.dbHandel.getModel('user');
    try {
        User.findOne({ "$or": [{ name: req.params.id }, { account: req.params.id }, { _id: req.params.id }], }).populate('group friends.user framef chatgroup', 'gname logo name sex status cgname member').exec().then(function (user, err) {
            // var friendsList = {friends:[]}
            // for (var i = 0; i < user.group.length; i++) {
            //     for (var j = 0; j < user.friends.length; j++) {
            //         console.log(i,user.group[i]._id)
            //         console.log(i,user.friends[j].groupId)
            //         // if (user.group[i]._id === user.friends[j].groupId){
            //         //     console.log(777777777777777)
            //         //   friendsList.friends.push(user.friends[j])
            //         // }
            //     }
            // }
            // console.log(friendsList.friends)
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
            res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
            res.header('Cache-Control', 'no-cache');
            res.send(200, user);
        })
    } catch (err) {
        console.log(err)
        res.send(500, user);
    }
});
//加入该群
router.post("/addchatgroups", function (req, res) {
    var Chatgroup = global.dbHandel.getModel('chatgroup');
    var User = global.dbHandel.getModel('user');
    Chatgroup.update({_id: req.body.gid},{$push: { member: req.body.uid }}, function (err, result) {
        if(err) {
           res.send(500, err); 
        } else {
           User.update({_id:req.body.uid},{$push: { chatgroup: req.body.gid }},function(err, uresult) {
               if (err) {
                 res.send(500, err); 
               } else {
                 res.send(200, uresult)
               }
           })
        }
       
    })
})
//查看群信息
router.get("/chatgroups/:id", function (req, res) {
    var Chatgroup = global.dbHandel.getModel('chatgroup');
    Chatgroup.findOne({ $or: [{ cgname: req.params.id }, { gnumber: req.params.id }] }, function (err, result) {
        if (err) {
            res.send(500, err);
        } else {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
            res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
            res.header('Cache-Control', 'no-cache');
            res.send(200, result);
        }
    })
})
// 创建群组
router.post("/chatgroups", function (req, res) {
    var User = global.dbHandel.getModel('user');
    var Chatgroup = global.dbHandel.getModel('chatgroup');
    Chatgroup.count({}, function (err, gcount) {
        if (err) {
            res.send(500, err);
        } else {
            var newcount = gcount + '' + parseInt(Math.random() * 100000)
            console.log('-----------------', gcount, gcount + '' + parseInt(Math.random() * 100000))
            Chatgroup.create({ cgname: req.body.cgname, gnumber: gcount, member: [req.body.userId] }, function (err, suc) {
                if (err) {
                    res.send(500, err);
                } else {
                    User.update({ _id: req.body.userId }, { $push: { chatgroup: suc._id } }, function (err, result) {
                        if (err) {
                            // req.session.error = '网络异常错误！';
                            console.log(err);
                        } else {
                            // req.session.error = '用户名创建成功！';
                            res.header('Access-Control-Allow-Origin', '*');
                            res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
                            res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
                            res.header('Cache-Control', 'no-cache');
                            res.send(200, suc);
                        }
                    })
                }
            })
        }
    })
});
// 查看群成员
router.get("/groupsmember/:id", function (req, res) {
    var Chatgroup = global.dbHandel.getModel('chatgroup');
    try {
        Chatgroup.findOne({ "$or": [{ _id: req.params.id }, { cgname: req.params.id }] }).populate('member', 'name account sex status').exec().then(function (user, err) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
            res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
            res.header('Cache-Control', 'no-cache');
            res.send(200, user);
        })
    } catch (err) {
        console.log(err)
        res.send(500, user);
    }
});
/* add friends */
router.post("/friends", function (req, res) {
    var User = global.dbHandel.getModel('user');
    User.update({ _id: req.body.userId }, { $push: { friends: { user: req.body.addUser, groupId: req.body.groupId, remark: "wanggg" } }, $pull: { framef: req.body.addUser } }, function (err, result) {
        if (err) {
            res.send(500, { err: '系统内部错误' });
            console.log(err);
        } else {
            try {
                User.findOne({ _id: req.body.addUser }).populate('group', 'gname ismain').exec().then(function (addusers, err) {
                    console.log(777, addusers)
                    let findmaing = false
                    let mainGroup = ''
                    for (let s = 0; s < addusers.group.length; s++) {
                        if (addusers.group[s].main) {
                            mainGroup = addusers.group[s]._id
                            findmaing = true
                        }
                        break;
                    }
                    if (!findmaing) {
                        mainGroup = addusers.group[0]._id
                    }
                    console.log(req.body.addUser, req.body.userId)
                    User.update({ _id: req.body.addUser }, { $push: { friends: { user: req.body.userId, groupId: mainGroup, remark: "wanggg" } } }, function (err, result) {
                        res.header('Access-Control-Allow-Origin', '*');
                        res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
                        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
                        res.header('Cache-Control', 'no-cache');
                        res.send(200, result);
                    })
                })
            } catch (err) {
                console.log(err)
                res.send(500, user);
            }
        }
    })
});
/* add friends request */
router.post("/reqfriends", function (req, res) {
    var User = global.dbHandel.getModel('user');
    User.update({ _id: req.body.addUser }, { $push: { framef: req.body.userId } }, function (err, result) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
        res.header('Cache-Control', 'no-cache');
        if (err) {
            // req.session.error = '网络异常错误！';
            res.send(500, err);
        } else {
            // req.session.error = '用户名创建成功！';
            res.send(200, result);
        }
    })
});
/* add groups. */
router.post("/groups", function (req, res) {
    var User = global.dbHandel.getModel('user');
    var Group = global.dbHandel.getModel('group');
    Group.create({ gname: req.body.gname }, function (err, suc) {
        if (err) {
            res.send(500, err)
        } else {
            User.update({ _id: req.body.userId }, { $push: { group: suc._id } }, function (err, result) {
                console.log(7, result)
                if (err) {
                    // req.session.error = '网络异常错误！';
                    console.log(err);
                } else {
                    // req.session.error = '用户名创建成功！';
                    res.send(200, suc);
                }
            })
        }
    })
});
/* GET home page. */
router.get("/home/:id", function (req, res) {
    if (!req.session.user) { //到达/home路径首先判断是否已经登录
        req.session.error = "请先登录"
        res.redirect("/login"); //未登录则重定向到 /login 路径
    }
    res.render("home", { title: 'Home' }) //已登录则渲染home页面

});
/* GET logout page. */
router.get("/logout", function (req, res) { // 到达 /logout 路径则登出， session中user,error对象置空，并重定向到根路径
    // req.session.user = null;
    // req.session.error = null;
    res.redirect("/");
});
module.exports = router;