// const $ = require('jquery')
const { BrowserWindow } = require('electron').remote;
const { ipcRenderer, remote } = require('electron')
const Datastore = require('nedb')
var fs = require('fs')
var path = require('path')
let db
// import io from 'socket.io-client'
var requstUser = '' // 请求好友的Id
var monmentChat = '' //当前窗口聊天的对象
var chatType = '' // 当前聊天的类型 'single' 单聊 'groups' 群聊
onload = () => {
    // 添加好友分组
    $(".modal-div").on("click", "#sureAddfg", function () {
        if ($("#Addfgv").val()) {
            $.ajax({
                url: 'http://192.168.20.118:5000/groups/',
                type: 'post',
                data: { gname: $("#Addfgv").val(), userId: localStorage.selfUserId },
                success: function (data, status) {
                    $("#Addfgv").val('')
                    var optionih = '<option value="' + data._id + '">' + data.gname + '</option>'
                    $("#selecFG").children().eq($("#selecFG").children().length - 1).after(optionih)
                    $("#creatfGin").css("display", "none")
                    $("#scfGin").css("display", "block")
                },
                error: function (data, status) {
                    if (status == 'error') {
                        console.log('33333333333333')
                    }
                }
            });
        }
    })
    var selfUserId = ""
    var socket = {}
    ipcRenderer.on('msg', (event, winId, msg) => {
        selfUserId = msg._id
        localStorage.selfUserId = msg._id;
        console.log(path.join(remote.app.getPath('userData')))
        db = new Datastore({
            filename: path.join(remote.app.getPath('userData'), `/${msg._id}.db`),
            autoload: true
        })
        findchat()
        $("#manageFriends").html(friendMhtml(msg))
        $("#getInforDiv").html(inforHtmlDiv(msg.framef))
        $("#manageChatGroup").html(chatgroupFun(msg.chatgroup))
        socketFun(msg._id)
    })
    // 查询本地聊天对象数据
    function findchat() {
        db.find({ form: 'user' }).sort({ updata: -1 }).exec((err, sucs) => {
            let defaultItemhtml = ''
            chatType = sucs[0].type
            monmentChat = sucs[0].nameId
            for (let i = 0; i < sucs.length; i++) {
                if (sucs[i].type === 'single') {
                    defaultItemhtml = defaultItemhtml + '<div nameId="'
                        + sucs[i].nameId +
                        '" class="item-chat"><img src="./content/img/1.jpg"><p>' +
                        sucs[i].namem
                        + '</p><i class="fa fa-times" aria-hidden="true"></i></div>'
                } else {
                    defaultItemhtml = defaultItemhtml + '<div nameId="'
                        + sucs[i].nameId +
                        '" class="item-chat"><img src="./content/img/4.jpg"><p>' +
                        sucs[i].namem
                        + '</p><i class="fa fa-times" aria-hidden="true"></i></div>'
                }
            }
            $('#defaultItem').html(defaultItemhtml)
        })
    }
    // 点击聊天按钮
    $('#chatMMt').click(findchat)
    // 点击聊天删除按钮
    $("#defaultItem").on("click", "i", function () {
        console.log($(this).parent().attr('nameId'))
        db.remove({ "nameId": $(this).parent().attr('nameId') }, {}, (err, doc) => {
            console.log('err', err, doc)
            findchat()
        })
    })
    // sockit
    function socketFun(uid) {
        socket = io.connect('http://192.168.20.118:5000');
        // $('#file').change(function (e) {
        //     ss.forceBase64 = true;
        //     var file = e.target.files[0];
        //     var stream = ss.createStream();
        //     console.log('stream is', stream)
        //     var filename = file.name;
        //     ss(socket).emit('file', stream, { size: file.size });
        //     ss.createBlobReadStream(file).pipe(stream);
        //     // upload a file to the server.
        //     // ss(socket).emit('file', stream, { size: file.size });
        //     // ss.createBlobReadStream(file).pipe(stream);
        // });
        let indexflag = 1
        $('#sendImage').change(function (e) {
            if (monmentChat) {
                var file = e.target.files[0];
                reader = new FileReader();
                reader.onload = function (e) {
                    if (indexflag) {
                        indexflag = 0
                        setTimeout(function () {
                            indexflag = 1
                        }, 1000);
                        //读取成功，显示到页面并发送到服务器
                        this.value = '';
                        socket.emit('img', { from: localStorage.selfUserId, to: monmentChat, msg: e.target.result, type: chatType, infor: {} });
                        $("#chatbox").append('<li class="togo"><img src="' + e.target.result + '"></img></li>')
                        $("#chatbox")[0].scrollTop = $("#chatbox")[0].scrollHeight
                    }
                };
                reader.readAsDataURL(file);
            } else {
                alert("请选择聊天对象！")
            }

            // var stream = ss.createStream();
            // // upload a file to the server.
            // ss(socket).emit('send-file', stream, file);
            // ss.createBlobReadStream(file).pipe(stream);
            // $('#file').val('');
            // $('#file').after('<p>File uploaded!</p>');
        });
        socket.on("connect", function () {
            socket.emit('login', { user: uid });
            socket.on("toSomeone", function (data) {
                $("#chatbox").append('<li class="come">' + showEmoji(data.infor) + '</li>')
                $("#chatbox")[0].scrollTop = $("#chatbox")[0].scrollHeight
                // var str=$("#contentTxt").val()+"\n"+data;
                // $("#contentTxt").val(str);
            })
            socket.on("newImg", function (data) {
                $("#chatbox").append('<li class="come"><img src="' + data.infor + '"></li>')
                console.log(scrollHeight)
                $("#chatbox")[0].scrollTop = $("#chatbox")[0].scrollHeight
                // var str=$("#contentTxt").val()+"\n"+data;
                // $("#contentTxt").val(str);
            })
            // socket.on("exituser", function (data) {
            //     //必须要移除没有登陆成功时给socket定义的事件，因为用户还没有登陆成功，
            //     //但是socket已经创建了，如果不销毁socket
            //     //这个没有登陆的用户页面还是可以收到服务器端广播的消息的，当然也可以将所有的代码放在用户
            //     //真正的登陆成功的回调函数中
            //     // socket.disconnect();调用这个函数也会触发客户端的disconnect事件
            //     socket.removeAllListeners();
            //     alert("用户名已存在");
            // })
        })
    }
    $("#messageInput").on("keyup", function (e) {
        if (e.keyCode == 13 && $("#messageInput").val().trim().length != 0) {
            if (monmentChat) {
                // console.log(monmentChat, localStorage.selfUserId)
                $("#chatbox").append('<li class="togo">' + showEmoji($("#messageInput").val()) + '</li>')
                $("#chatbox").scrollTop = $("#chatbox").scrollHeight
                socket.emit('postMsg', { from: localStorage.selfUserId, to: monmentChat, msg: $("#messageInput").val(), type: chatType, infor: {} });
                $("#messageInput").val('')
                $("#chatbox")[0].scrollTop = $("#chatbox")[0].scrollHeight
            } else {
                alert("请选择聊天对象！")
            }
        };
    })
    //发送消息
    $("#sendMsgbtn").on("click", function () {
        if (monmentChat) {
            // console.log(monmentChat, localStorage.selfUserId)
            $("#chatbox").append('<li class="togo">' + showEmoji($("#messageInput").val()) + '</li>')
            $("#chatbox").scrollTop = $("#chatbox").scrollHeight
            socket.emit('postMsg', { from: localStorage.selfUserId, to: monmentChat, msg: $("#messageInput").val(), type: chatType, infor: {} });
            $("#messageInput").val('')
            $("#chatbox")[0].scrollTop = $("#chatbox")[0].scrollHeight
        } else {
            alert("请选择聊天对象！")
        }
    })
    // 将消息中的表情展示出来
    function showEmoji(msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="./content/emoji/' + emojiIndex + '.gif" />');
            };
        };
        return result;
    }
    // 展开群成员
    $("#manageChatGroup").on("click", "span", function () {
        monmentChat = $(this).attr("infor")
        let namem = $(this, 'p').text()
        $('#chatbox').html('')
        console.log(db)
        db.findOne({ nameId: monmentChat }, function (err, docs) {
            // docs contains Mars 
            if (err) {
                console.log('find user err', err)
            } else {
                if (!docs) {
                    db.insert({
                        nameId: monmentChat,
                        type: 'group',
                        form: 'user',
                        namem: namem,
                        updata: new Date()
                    }, (err, ret) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(ret)
                        }
                    })
                } else {
                    db.update({ nameId: monmentChat }, { $set: { updata: new Date() } }, { multi: false }, function (err, numReplaced) {
                        if (err) {
                            console.log('updata user err', err)
                        } else {
                            console.log('updata user`data is', numReplaced)
                        }
                    });
                }
            }
        })
        chatType = 'group'
        var disvalueG = $(this).next('ul').css("display") === 'block' ? 'none' : 'block'
        console.log(disvalueG)
        let that = this
        if (disvalueG === 'block') {
            $.ajax({
                url: 'http://192.168.20.118:5000/groupsmember/' + $(this).children("input").val(),
                type: 'get',
                success: function (data, status) {
                    var gmemberHtml = ''
                    for (let s = 0; s < data.member.length; s++) {
                        gmemberHtml = gmemberHtml
                            + '<li><img src="./content/img/1.jpg"><p>'
                            + data.member[s].name + '</p></li>'

                    }
                    $(that).next('ul').css("display", 'block')
                    $(that).next('ul').html(gmemberHtml)
                },
                error: function (data, status) {
                    if (status == 'error') {
                        console.log('33333333333333')
                    }
                }
            });
        } else {
            $(this).next('ul').css("display", 'none')
        }

    })
    // 查询聊天群
    $("#searchGBtn").on("click", function () {
        $.ajax({
            url: 'http://192.168.20.118:5000/chatgroups/' + $("#searchGValue").val(),
            type: 'get',
            success: function (data, status) {
                let searchGhtml = ''
                searchGhtml = '<ul><li>有聊群名：' +
                    data.cgname + '</li><li>有聊账号：'
                    + data.gnumber + '</li></ul><button id="addGsuss">加入该群</button>'
                $("#seachGNameId").val(data._id)
                $("#searchGInforBox").html(searchGhtml)
            },
            error: function (data, status) {
                if (status == 'error') {
                    console.log('33333333333333')
                }
            }
        });
    })
    $("#searchGInforBox").on("click", "#addGsuss", function () {
        $.ajax({
            url: 'http://192.168.20.118:5000/addchatgroups',
            type: 'post',
            data: { gid: $("#seachGNameId").val(), uid: localStorage.selfUserId },
            success: function (data, status) {
                //   let searchGhtml = ''
                //   searchGhtml = ''
                //   $("#seachGNameId").val(data._id)               
                $("#searchGInforBox").html('<p>加群成功<i class="fa fa-check" aria-hidden="true"></i></p>')
            },
            error: function (data, status) {
                if (status == 'error') {
                    console.log('33333333333333')
                }
            }
        });
    })
    // 
    // 添加聊天群
    function addGroup() {
        if ($("#addGValue").val()) {
            $.ajax({
                url: 'http://192.168.20.118:5000/chatgroups',
                type: 'post',
                data: { cgname: $("#addGValue").val(), userId: localStorage.selfUserId },
                success: function (data, status) {
                    var addHtml = '<p>新建成功<i class="fa fa-check" aria-hidden="true"></i></p>'
                    $("#addGInforBox").html(addHtml)
                },
                error: function (data, status) {
                    if (status == 'error') {
                        console.log('33333333333333')
                    }
                }
            });
        } else {
            console.log('err')
        }
    }
    $("#addGBtn").click(addGroup)
    // 搜索聊天群
    function searchGroup() {
        console.log('6666')
    }
    $("#searchGroup").click(searchGroup)
    function searchFun() {
        if ($("#searchValue").val()) {
            $.ajax({
                url: 'http://192.168.20.118:5000/friendsinfo/' + $("#searchValue").val(),
                type: 'get',
                success: function (data, status) {
                    var sex = data.sex === 'boy' ? '男♂' : '女♀'
                    var status = data.status === 'down' ? '离线' : '在线'
                    var searchHtml = '<ul><li>有聊号：' + data.account
                        + '</li><li>用户名：' + data.name
                        + '</li><li>性别:' + sex
                        + '</li><li>' + status
                        + '</li><li>签名：'
                        + data.signature + '</li></ul>'
                        + '<button id="addFclick">添加</button>'
                    $("#seachNameId").val(data._id)
                    $("#searchInforBox").html(searchHtml)
                },
                error: function (data, status) {
                    if (status == 'error') {
                        console.log('33333333333333')
                    }
                }
            });
        } else {
            console.log('err')
        }
    }
    $("#searchBtn").click(searchFun)
    $("#searchInforBox").on('click', '#addFclick', function () {
        console.log($("#seachNameId").val())
        $.ajax({
            url: 'http://192.168.20.118:5000/reqfriends',
            type: 'post',
            data: { addUser: $("#seachNameId").val(), userId: localStorage.selfUserId },
            success: function (data, status) {
                var addHtml = '<p>发送请求成功<i class="fa fa-check" aria-hidden="true"></i></i></p>'
                $("#searchInforBox").html(addHtml)
            },
            error: function (data, status) {
                if (status == 'error') {
                    console.log('33333333333333')
                }
            }
        })
    })
    // 点击好友获取详细信息
    $("#manageFriends").on("click", "li", function () {
        let that = this
        $.ajax({
            url: 'http://192.168.20.118:5000/idfriendsinfo/' + $(this).attr('infor'),
            type: 'get',
            success: function (data, status) {
                $('#chatbox').html('')
                monmentChat = $(that).attr('infor')
                let namem = $(that, 'p').text()
                chatType = 'single'
                let sexb = data.sex === 'boy' ? '男♂' : '女♀'
                let statusb = data.status === 'down' ? '离线' : '在线'
                let searchHtml = '<ul><li>有聊号：' + data.account
                    + '</li><li>用户名：' + data.name
                    + '</li><li>性别:' + sexb
                    + '</li><li>' + statusb
                    + '</li><li>签名：'
                    + data.signature + '</li></ul>'
                $("#tabsInfo").html(searchHtml)
                db.findOne({ nameId: monmentChat }, function (err, docs) {
                    // docs contains Mars 
                    if (err) {
                        console.log('find user err', err)
                    } else {
                        if (!docs) {
                            db.insert({
                                nameId: monmentChat,
                                type: 'single',
                                form: 'user',
                                namem: namem,
                                updata: new Date()
                            }, (err, ret) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log(ret)
                                }
                            })
                        } else {
                            db.update({ nameId: monmentChat }, { $set: { updata: new Date() } }, { multi: false }, function (err, numReplaced) {
                                if (err) {
                                    console.log('updata user err', err)
                                } else {
                                    console.log('updata user`data is', numReplaced)
                                }
                            });
                        }
                    }
                })
            },
            error: function (data, status) {
                if (status == 'error') {
                    console.log('33333333333333')
                }
            }
        })
    })

    function friendMhtml(arg) {
        var divhtml = ''
        for (var k = 0; k < arg.group.length; k++) {
            var ulhtml = ''
            for (var j = 0; j < arg.friends.length; j++) {
                if (arg.friends[j].groupId === arg.group[k]._id) {
                    ulhtml = ulhtml + '<li infor="' +
                        arg.friends[j].user._id
                        + '"><img src="./content/img/1.jpg"><p>' +
                        arg.friends[j].user.name
                        + '</p><i class="fa fa-times" aria-hidden="true"></i>'
                        + '</li>'
                }
            }
            divhtml = divhtml + '<span><i class="fa fa-angle-down" aria-hidden="true"></i><p>' + arg.group[k].gname + '</p></span><ul>' + ulhtml + '</ul>'
        }
        return divhtml
    }
    $("#getInforDiv").on("click", ".agreef", function () {
        requstUser = $(this).attr("infor")
        $.ajax({
            url: 'http://192.168.20.118:5000/friends/' + localStorage.selfUserId,
            type: 'get',
            success: function (data, status) {
                let optionshtml = ''
                for (let f = 0; f < data.group.length; f++) {
                    optionshtml = optionshtml
                        + '<option value="'
                        + data.group[f]._id + '">'
                        + data.group[f].gname + '</option>'
                }
                $("#selecFG").html(optionshtml)
                $("#modal").css("display", "block")
            },
            error: function (data, status) {
                if (status == 'error') {
                    console.log('33333333333333')
                }
            }
        })
        console.log($(this).attr("infor"))
    })
    $("#okFun").on("click", function () {
        $.ajax({
            url: 'http://192.168.20.118:5000/friends',
            type: 'post',
            data: { userId: localStorage.selfUserId, addUser: requstUser, groupId: $('#selecFG').val() },
            success: function (data, status) {
                friendMfun()
            },
            error: function (data, status) {
                if (status == 'error') {
                    console.log('33333333333333')
                }
            }
        })
    })
    $("#cancelFun").on("click", function () {
        $("#modal").css("display", "none")
    })
    function inforHtmlDiv(data) {
        var inforHtml = ''
        for (let z = 0; z < data.length; z++) {
            inforHtml = inforHtml +
                '<ul><li><span class="glyphicon glyphicon-bell" aria-hidden="true"></span> ' +
                '<p>' + data[z].name + '请求成为好友！</p><br/>' +
                '<div><button class="agreef" infor=' + data[z]._id + '>同意</button>' +
                '<button class="disagreef" infor=' + data[z]._id + '>拒绝</button>' +
                '</div></li></ul>'
        }
        return inforHtml
    }
    function chatgroupFun(chatgroup) {
        let chatgrouphtml = ''
        for (let y = 0; y < chatgroup.length; y++) {
            chatgrouphtml = chatgrouphtml
                + '<span infor="' +
                chatgroup[y]._id + '"><i class="fa fa-angle-down" aria-hidden="true"></i><p>'
                + chatgroup[y].cgname + '</p>'
                + '<input type="hidden" id="seachNameId" value="'
                + chatgroup[y]._id + '"></span><ul></ul>'
        }
        return chatgrouphtml
    }
    function friendMfun() {
        $.ajax({
            url: 'http://192.168.20.118:5000/friends/' + localStorage.selfUserId,
            type: 'get',
            success: function (data, status) {
                socketFun(data._id)
                $("#modal").css("display", "none")
                $("#manageFriends").html(friendMhtml(data))
                $("#getInforDiv").html(inforHtmlDiv(data.framef))
                $("#manageChatGroup").html(chatgroupFun(data.chatgroup))
            },
            error: function (data, status) {
                if (status == 'error') {
                    console.log('33333333333333')
                }
            }
        })
    }
    $("#managemenTabs").click(friendMfun)
    // if (localStorage.selfUserId) {
    //     friendMfun()
    // }

}

