// 获取上线的用户
function getUserUp(ssocket){
var User = global.dbHandel.getModel('user');
       User.find({status: "up"},function(err,docs){
           if(err){
               console.log(err);
           }else{
               console.log('users list --default: '+docs);
               // 因为是回调函数  socket.emit放在这里可以防止  用户更新列表滞后
               ssocket.broadcast.emit('user_list',docs);           //更新用户列表
               ssocket.emit('user_list',docs);           //更新用户列表

           }
       });
}
