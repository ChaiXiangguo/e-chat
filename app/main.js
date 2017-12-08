//  win.loadURL(url.format({
//      pathname: path.join(__dirname, './build/index.html'),
//      protocol: 'file:',
//      slashes: true
//  }))
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const pkg = require('./package.json') // 引用package.json
let win
global.UserInfor = {}
function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 450,
        height: 350,
        // resizable: false,
        // movable: false,
        icon: __dirname + '/loginsrc/img/log.png',
    })

    // and load the index.html of the app.
    // win.loadURL(url.format({
    //     pathname: path.join(__dirname, 'index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }))
    // win.loadURL(url.format({
    //     pathname: path.join(__dirname, './build/index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }))
    //判断是否是开发模式
    if (pkg.DEV) {
        win.loadURL(url.format({
                pathname: path.join(__dirname, './loginsrc/login.html'),
                protocol: 'file:',
                slashes: true,
                resizable: true
            }))
            // win.loadURL("http://localhost:3000/")
    } else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, './build/index.html'),
            protocol: 'file:',
            slashes: true,
            resizable: true
        }))
    }
    // Open the DevTools.
    // win.webContents.openDevTools()
    win.setMenuBarVisibility(false)
    win.setVisibleOnAllWorkspaces(false)

    // Emitted when the window is closed.
    win.on('closed', () => {
        win = null
    })
    ipcMain.on('login-success', (data) => {
        win.destroy()
        win = null
    })
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.