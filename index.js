const {shell, app, protocol, BrowserWindow, globalShortcut, dialog, ipcMain} = require('electron')
const path = require('path');
const url = require('url');
const fs = require('fs');

let currentFile;

function createWindow() {
    win = new BrowserWindow();
    
    win.setMenu(null);
    
    globalShortcut.register('CommandOrControl+O', () => {
	let file = dialog.showOpenDialog({
	    properties: ['openFile']
	});
	if(file) {
	    currentFile = file[0];
	    win.webContents.send('setPath', {path: file[0]});
	    fs.readFile(currentFile, 'utf-8', (err, data) => {
		if(err) {
		    return console.log(err);
		}
		win.webContents.send('openFile', {value: data, path: currentFile});
	    });
	}
    });

    globalShortcut.register('CommandOrControl+S', () => {
	if(currentFile) {
	    win.webContents.send('saveFile', {path: currentFile});
	} else {
	    let file = dialog.showSaveDialog({});
	    if(file) {
		win.webContents.send('saveFile', {path: file});
	    }
	}
    });

    globalShortcut.register('CommandOrControl+Shift+S', () => {
	let file = dialog.showSaveDialog({});
	if(file) {
	    win.webContents.send('saveFile', {path: file});
	}
    });

    ipcMain.on('fileContents', (event, data) => {
	fs.writeFile(data.path, data.file, function(err) {
	    if(err) {
		return console.log(err);
	    }
	    win.webContents.send('setPath', {path: data.path});
	    win.webContents.send('fileSaved');
	});
    });

    protocol.registerFileProtocol('site', (request, callback) => {
	const url = request.url.substr(7)
	callback({path: path.normalize(`${__dirname}/site/${url}`)})
    }, (error) => {
	if(error) console.error('Failed to register protocol')
    });
    
    win.loadURL(url.format({
	pathname: 'index.html',
	protocol: 'site:',
	slashes: true
    }));
    let wc = win.webContents
    wc.on('will-navigate', function (e, url) {
	if (url != wc.getURL()) {
	    e.preventDefault()
	    shell.openExternal(url)
	}
    })
}

app.on('ready', createWindow);
