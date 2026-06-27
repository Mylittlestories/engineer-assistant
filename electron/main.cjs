const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');

let mainWindow;
let serverHandle;

function getDistDir() {
  return app.isPackaged ? path.join(process.resourcesPath, 'dist') : path.join(__dirname, '..', 'dist');
}

async function bootLocalServer() {
  process.env.NODE_ENV = 'production';
  process.env.HOST = '127.0.0.1';
  process.env.STATIC_DIR = getDistDir();
  process.env.APP_CONFIG_DIR = app.getPath('userData');

  const serverModulePath = path.join(getDistDir(), 'server.cjs');
  const { startServer } = require(serverModulePath);
  return startServer({ port: 0, host: '127.0.0.1' });
}

async function createMainWindow() {
  serverHandle = await bootLocalServer();

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1120,
    minHeight: 720,
    title: 'Engineer Assistant',
    backgroundColor: '#0d1425',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const localUrl = `http://127.0.0.1:${serverHandle.port}`;
    if (!url.startsWith(localUrl)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  await mainWindow.loadURL(`http://127.0.0.1:${serverHandle.port}`);
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createMainWindow).catch((error) => {
    console.error(error);
    dialog.showErrorBox('Engineer Assistant failed to start', error.message || String(error));
    app.quit();
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverHandle?.server) {
    serverHandle.server.close();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow().catch((error) => {
      console.error(error);
      dialog.showErrorBox('Engineer Assistant failed to start', error.message || String(error));
    });
  }
});
