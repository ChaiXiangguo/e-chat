window.onload = function() {
    //实例并初始化我们的hichat程序
    var hichat = new HiChat();
    hichat.init();
};

//定义我们的hichat类
var HiChat = function() {
    this.socket = null;
};

//向原型添加业务方法
HiChat.prototype = {
    init: function() { //此方法初始化程序
        var that = this;
        //建立到服务器的socket连接
        this.socket = io.connect();
        //监听socket的connect事件，此事件表示连接已经建立
        this.socket.on('connect', function(data, err) {
            // console.log(data, err)
            var name = document.getElementById('user').innerText
            that.socket.emit('login', name);
        });
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        });
        // //昵称设置的确定按钮
        // document.getElementById('loginBtn').addEventListener('click', function() {
        //     var nickName = document.getElementById('nicknameInput').value;
        //     //检查昵称输入框是否为空
        //     if (nickName.trim().length != 0) {
        //         //不为空，则发起一个login事件并将输入的昵称发送到服务器
        //         that.socket.emit('login', nickName);
        //     } else {
        //         //否则输入框获得焦点
        //         document.getElementById('nicknameInput').focus();
        //     };
        // }, false);
        document.getElementById('sendBtn').addEventListener('click', function() {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg); //把消息发送到服务器
                that._displayNewMsg('我', msg); //把自己的消息显示到自己的窗口中
            };
        }, false);
        document.getElementById('clearBtn').addEventListener('click', function() {
            document.getElementById('historyMsg').innerHTML = '';
        }, false);
        document.getElementById('sendImage').addEventListener('change', function() {
            //检查是否有文件被选中
            if (this.files.length != 0) {
                //获取文件并用FileReader进行读取
                var file = this.files[0],
                    reader = new FileReader();
                if (!reader) {
                    that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
                    this.value = '';
                    return;
                };
                reader.onload = function(e) {
                    //读取成功，显示到页面并发送到服务器
                    this.value = '';
                    that.socket.emit('img', e.target.result);
                    that._displayImage('我', e.target.result);
                };
                reader.readAsDataURL(file);
            };
        }, false);
        document.getElementById('emojiWrapper').addEventListener('click', function(e) {
            //获取被点击的表情
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            };
        }, false);
        // document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
        //     if (e.keyCode == 13) {
        //         var nickName = document.getElementById('nicknameInput').value;
        //         if (nickName.trim().length != 0) {
        //             that.socket.emit('login', nickName);
        //         };
        //     };
        // }, false);
        document.getElementById('messageInput').addEventListener('keyup', function(e) {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('我', msg, color);
            };
        }, false);
        // document.getElementById('sendBtn').addEventListener('click', function() {
        //     var messageInput = document.getElementById('messageInput'),
        //         msg = messageInput.value,
        //         //获取颜色值
        //         color = document.getElementById('colorStyle').value;
        //     messageInput.value = '';
        //     messageInput.focus();
        //     if (msg.trim().length != 0) {
        //         //显示和发送时带上颜色值参数
        //         that.socket.emit('postMsg', msg, color);
        //         that._displayNewMsg('我', msg, color);
        //     };
        // }, false);
        // this.socket.on('newMsg', function(user, msg, color) {
        //     //  that._displayNewMsg(user, msg, color);
        // });
        this.socket.on('newImg', function(user, img) {
            that._displayImage(user, img);
        });
        this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = '!nickname is taken, choose another pls'; //显示昵称被占用的提示
        });
        this.socket.on('loginSuccess', function() {
            // document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
            // document.getElementById('loginWrapper').style.display = 'none'; //隐藏遮罩层显聊天界面
            // document.getElementById('messageInput').focus(); //让消息输入框获得焦点
        });
        this.socket.on('system', function(nickName, userCount, type) {
            var msg = nickName + (type == 'login' ? ' 已上线' : ' 已下线');
            //指定系统消息显示为红色
            that._displayNewMsg('system ', msg, 'red');
            document.getElementById('status').textContent = '目前有' + userCount + '名用户' + '在线';
        });
        this.socket.on('newMsg', function(user, msg) {
            that._displayNewMsg(user, msg, 'green');
        });
    },
    //   _displayNewMsg: function(user, msg, color) {
    //     var container = document.getElementById('historyMsg'),
    //         msgToDisplay = document.createElement('p'),
    //         date = new Date().toTimeString().substr(0, 8);
    //     msgToDisplay.style.color = color || '#000';
    //     msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
    //     container.appendChild(msgToDisplay);
    //     container.scrollTop = container.scrollHeight;
    // },
    _displayImage: function(user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        if (user === '我') {
            msgToDisplay.innerHTML = '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>' + '<span class="timespan">(' + date + '): </span> <br/>' + user;
        } else {
            msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        }
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _initialEmoji: function() {
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 70; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = 'content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    },
    _showEmoji: function(msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
            };
        };
        return result;
    },
    _displayNewMsg: function(user, msg, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8),
            //将消息中的表情转换为图片
            msg = this._showEmoji(msg);
        msgToDisplay.style.color = color || '#000';
        if (user == '我') {
            msgToDisplay.innerHTML = '<div><span class="ifor"><span class="infor-bac">' + msg + '</span><span class="timespan">(' + date + '): </span>' + user + '</psan></div><br/>';
        } else {
            msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span><span class="infor-bac-come">' + msg + '</psan>';
        }
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
};