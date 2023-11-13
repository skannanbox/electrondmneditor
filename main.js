// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

var isInitialized = false;
var clickedFilePath;

var idfilepathmap = {};

function getWindowFilePath(event) {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  const windowId = win.id;
  const filePath = idfilepathmap[windowId];
  console.log(filePath, windowId);
  return filePath;
}
function createWindow(windowfilepath) {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: windowfilepath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  console.log(mainWindow.id, windowfilepath);
  idfilepathmap[mainWindow.id] = windowfilepath;

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  intialize()
})

function intialize() {
  if (!isInitialized) {
    isInitialized = true;
    ipcMain.handle('openClickedFile', async (event) => { return fs.readFileSync(getWindowFilePath(event)).toString(); })
    ipcMain.on('save', (event, xml) => { fs.writeFileSync(getWindowFilePath(event), xml) })
    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      // if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
    if (clickedFilePath) {
      createWindow(clickedFilePath);
    }
  }
}

app.on('open-file', (event, fpath) => {
  console.log(fpath)
  if (app.isReady()) {
    createWindow(fpath);
  } else {
    clickedFilePath = fpath
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
