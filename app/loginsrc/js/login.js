const submit = document.querySelector('#submit')
const register = document.querySelector('#register')
const path = require('path')
const url = require('url')
const BrowserWindow = require('electron').remote.BrowserWindow;
const ipc = require('electron').ipcRenderer
const $ = require('jquery')
let winchat;
submit.onclick = () => {
    var username = $("#username").val();
    var password = $("#password").val();
    var data = {
        "uname": username,
        "upwd": password
    };
    console.log(data)
    $.ajax({
        url: 'http://localhost:5000/login',
        type: 'post',
        data: data,
        success: function (data, status) {
            if (status == 'success') {
                if (data.code) {
                    $('#errorInfor').text(data.error)
                } else {
                   let winId = BrowserWindow.getFocusedWindow().id
                    winchat = new BrowserWindow({
                        width: 1500,
                        height: 1000,
                        frame: true
                    })
                    winchat.on('close', () => { winchat = null })
                    // winchat.webContents.openDevTools()
                    winchat.loadURL(url.format({
                        pathname: path.join(__dirname, '../../render-process/html/chat.html'),
                        protocol: 'file:',
                        slashes: true,
                        resizable: true
                    }))
                     winchat.webContents.on('did-finish-load', (event) => {
                        winchat.webContents.send('msg', winId, data)
                        ipc.send('login-success')
                    })
                }
            }
        },
        error: function (data, status) {
            $('#errorInfor').text(data.responseJSON.err)
        }
    });
}
register.onclick = () => {
    $('#login').css('display', 'none')
    $('#registerform').css('display', 'block')
}
$("#registerfun").click(function () {
    var username = $("#reusername").val();
    var password = $("#repassword").val();
    var password1 = $("#reaffirm").val();
    if (password !== password1) {
        $("#repassword").css("border", "1px solid red");
        $("#reaffirm").css("border", "1px solid red");
    } else if (password === password1) {
        var data = { "uname": username, "upwd": password };
        $.ajax({
            url: 'http://localhost:5000/register',
            type: 'post',
            data: data,
            success: function (data, status) {
                if (status == 'success') {
                    $('#registerform').css('display', 'none')
                    $('#login').css('display', 'block')
                }
            },
            error: function (data, err) {

            }
        });
    }
});
// open("http://localhost:3000/")
// winchat.loaURL(path.join('file:', __dirname, ''))