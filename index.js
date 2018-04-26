const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

function createWindow () {
    win = new BrowserWindow()
    
    win.loadURL(url.format({
	pathname: path.join(__dirname, 'index.html'),
	protocol: 'file:',
	slashes: true
    }))
}

app.on('ready', createWindow)
