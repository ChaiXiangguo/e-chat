module.exports = function (socketio) {
    global.io.on('connection', function (socket) {
        //昵称设置
        //  socket.userIndex = req.session.user;
        //  socket.nickname = req.session.user;
        //  socket.emit('loginSuccess');
        //接收新消息
        socket.on('login', function (msg) {
            var User = global.dbHandel.getModel('user');
            User.update({ _id: msg.user }, { status: 'up', socket: socket.id }, function (err, result) {
                if (err) {
                    console.log('系统内部错误')
                } else {
                    console.log('p', socket.id, msg.user)
                }
            })
            //  console.log(socket.id)
            //  socket.userIndex = users.length;
            //  socket.nickname = msg;
            //  users.push(msg);
            //将消息发送到除自己外的所有用户
            //  io.sockets.emit('system', msg, users.length, 'login'); //向所有连接到服务器的客户端发送当前登陆用户的昵称
        });
        socket.on('postMsg', function (msg) {
            var User = global.dbHandel.getModel('user');
            var Chatgroup = global.dbHandel.getModel('chatgroup')
            console.log(7777, msg)
            if (msg.type === 'single') {
                User.findOne({ _id: msg.to }, ['socket'], function (err, suc) {
                    socket.broadcast.to(suc.socket).emit("toSomeone", { infor: msg.msg, from: msg.from, type: 'single' })
                })
                // socket.broadcast.to(socketList[data.user].id).emit("toSomeone",data.str)
            } else {
                Chatgroup.findOne({ _id: msg.to }, ['member'], function (err, sgroups) {
                    console.log(7, sgroups)
                    for (let q = 0; q < sgroups.member.length; q++) {
                        if (JSON.stringify(sgroups.member[q]) !== '"' + msg.from + '"') {
                            User.findOne({ _id: sgroups.member[q] }, ['socket'], function (err, suc) {
                                socket.broadcast.to(suc.socket).emit("toSomeone", { infor: msg.msg, from: msg.from, type: 'group', target: msg.to })
                            })
                        }
                    }
                })
            }
            //  console.log(msg)
            //将消息发送到除自己外的所有用户
            // socket.broadcast.emit('newMsg', socket.nickname, msg, 'blue');
        });
        socket.on('disconnect', function () {
            var User = global.dbHandel.getModel('user')
            console.log(socket.id)
            User.update({ socket: socket.id }, { status: 'down', socket: '' }, function (err, result) {
                if (err) {
                    console.log('系统内部错误')
                } else {
                    console.log(socket.id)
                }
            })
        });
        //接收用户发来的图片
        socket.on('img', function (imgData) {
            //通过一个newImg事件分发到除自己外的每个用户
            socket.broadcast.emit('newImg', socket.nickname, imgData);
        });
    })
}