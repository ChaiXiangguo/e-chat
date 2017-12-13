
// var sendChannel,
//     receiveChannel,
//     chatWindow = document.querySelector('.chat-window'),
//     chatWindowMessage = document.querySelector('.chat-window-message'),
//     chatThread = document.querySelector('.chat-thread');

// // Create WebRTC connection
// createConnection();

// // On form submit, send message
// chatWindow.onsubmit = function (e) {
//     e.preventDefault();

//     sendData();

//     return false;
// };

// function createConnection() {
//     var servers = null;

//     if (window.mozRTCPeerConnection) {
//         window.localPeerConnection = new mozRTCPeerConnection(servers, {
//             optional: [{
//                 RtpDataChannels: true
//             }]
//         });
//     } else {
//         window.localPeerConnection = new webkitRTCPeerConnection(servers, {
//             optional: [{
//                 RtpDataChannels: true
//             }]
//         });
//     }

//     try {
//         // Reliable Data Channels not yet supported in Chrome
//         sendChannel = localPeerConnection.createDataChannel('sendDataChannel', {
//             reliable: false
//         });
//     } catch (e) {
//     }

//     localPeerConnection.onicecandidate = gotLocalCandidate;
//     sendChannel.onopen = handleSendChannelStateChange;
//     sendChannel.onclose = handleSendChannelStateChange;

//     if (window.mozRTCPeerConnection) {
//         window.remotePeerConnection = new mozRTCPeerConnection(servers, {
//             optional: [{
//                 RtpDataChannels: true
//             }]
//         });
//     } else {
//         window.remotePeerConnection = new webkitRTCPeerConnection(servers, {
//             optional: [{
//                 RtpDataChannels: true
//             }]
//         });
//     }

//     remotePeerConnection.onicecandidate = gotRemoteIceCandidate;
//     remotePeerConnection.ondatachannel = gotReceiveChannel;

//     // Firefox seems to require an error callback
//     localPeerConnection.createOffer(gotLocalDescription, function (err) {
//     });
// }

// function sendData() {
//     sendChannel.send(chatWindowMessage.value);
// }

// function gotLocalDescription(desc) {
//     localPeerConnection.setLocalDescription(desc);
//     remotePeerConnection.setRemoteDescription(desc);
//     // Firefox seems to require an error callback
//     remotePeerConnection.createAnswer(gotRemoteDescription, function (err) {
//     });
// }

// function gotRemoteDescription(desc) {
//     remotePeerConnection.setLocalDescription(desc);
//     localPeerConnection.setRemoteDescription(desc);
// }

// function gotLocalCandidate(event) {
//     if (event.candidate) {
//         remotePeerConnection.addIceCandidate(event.candidate);
//     }
// }

// function gotRemoteIceCandidate(event) {
//     if (event.candidate) {
//         localPeerConnection.addIceCandidate(event.candidate);
//     }
// }

// function gotReceiveChannel(event) {
//     receiveChannel = event.channel;
//     receiveChannel.onmessage = handleMessage;
//     receiveChannel.onopen = handleReceiveChannelStateChange;
//     receiveChannel.onclose = handleReceiveChannelStateChange;
// }

// function handleMessage(event) {
//     var chatNewThread = document.createElement('li'),
//         chatNewMessage = document.createTextNode(event.data);

//     // Add message to chat thread and scroll to bottom
//     chatNewThread.appendChild(chatNewMessage);
//     chatThread.appendChild(chatNewThread);
//     chatThread.scrollTop = chatThread.scrollHeight;

//     // Clear text value
//     chatWindowMessage.value = '';
// }

// function handleSendChannelStateChange() {
//     var readyState = sendChannel.readyState;

//     if (readyState == 'open') {
//         chatWindowMessage.disabled = false;
//         chatWindowMessage.focus();
//         chatWindowMessage.placeholder = "";
//     } else {
//         chatWindowMessage.disabled = true;
//     }
// }

// function handleReceiveChannelStateChange() {
//     var readyState = receiveChannel.readyState;
// }
const $ = require('jquery')
$("#creatfg").bind("click", function () {
    $("#creatfGin").css("display", "block")
})
$("#tabs li").bind("click", function () {
    var index = $(this).index();
    var divs = $("#tabs-body > div");
    $(this).parent().children("li").attr("class", "tab-nav");//将所有选项置为未选中
    $(this).attr("class", "tab-nav-action"); //设置当前选中项为选中样式
    divs.hide();//隐藏所有选中项内容
    divs.eq(index).show(); //显示选中项对应内容
})
$("#sendImg").bind("click", function () {
    $('#sendImage').trigger('click')
})
// 点击清空消息按钮
$("#delectChatH").bind("click", function () {
    $("#chatbox").html("")
})
$("#ftabs li").bind("click", function () {
    var index = $(this).index();
    var divs = $("#ftabs-body > div");
    $(this).parent().children("li").attr("class", "tab-nav");//将所有选项置为未选中
    $(this).attr("class", "tab-nav-action"); //设置当前选中项为选中样式
    divs.hide();//隐藏所有选中项内容
    divs.eq(index).show(); //显示选中项对应内容
})
$("#addFriends").bind("click", function () {
    $("#tabsAdd").show()
    $("#tabsInfo").hide()
    $("#searchValue").focus()
    $("#searchInforBox").html('')
})
$(".chat-friends div").bind("click", function () {
    $("#tabsInfo").show()
    $("#tabsAdd").hide()
})
$(".chat-friends div").bind("mouseover", function () {
    $(this).css("fontSize", "24px")
})
$(".chat-friends div").bind("mouseout", function () {
    $(this).css("fontSize", "14px")
})
$("#emoji").bind("click", function () {
    $("#emojiWrapper").css("display", "block")
})
$("#emojiWrapper").bind("click", function (e) {
    if (e.target.nodeName.toLowerCase() === 'img') {
        $("#messageInput").val($("#messageInput").val() + '[emoji:' + e.target.title + ']')
        $("#messageInput").focus()
        $("#emojiWrapper").css("display", "none")
    }
})
document.getElementById('emoji').addEventListener('click', function (e) {
    var emojiwrapper = document.getElementById('emojiWrapper');
    emojiwrapper.style.display = 'block';
    e.stopPropagation();
}, false);
$("body").bind("click", function (e) {
    if (e.target !== $("#emojiWrapper")) {
        $("#emojiWrapper").css("display", "none")
    }
})
function init() {
    var emojObj = $("#emojiWrapper")
    var sHtml = ''
    for (var i = 70; i > 0; i--) {
        sHtml = sHtml + '<img src="content/emoji/' + i + '.gif" title="' + i + '"/>'
    }
    emojObj.html(sHtml); // 使用jQuery的$.fn.html()方法添加改字符串 
    // emojObj.append("<li>Appended item</li><li>Appended item</li>");
}
init()
$("#manageFriends").on("click", "span", function () {
    var disvalue = $(this).next().css("display") === 'block' ? 'none' : 'block'
    $(this).next().css("display", disvalue)
})
