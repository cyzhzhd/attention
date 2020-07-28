import { app, BrowserWindow, ipcMain } from 'electron'; // eslint-disable-line

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  // eslint-disable-next-line no-underscore-dangle
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\'); // eslint-disable-line
}

let mainWindow;
const winURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:9080'
    : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true,
      webSecurity: true,
    },
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// try to fix with parent and child windows
// https://github.com/electron/electron/blob/master/docs/api/browser-window.md#webcontentssendchannel-args

ipcMain.on('popUpVideo', () => {
  const modalPath =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:9080/#/videoPopup'
      : `file://${__dirname}/index.html/#/videoPopup`;

  let win = new BrowserWindow({
    width: 400,
    height: 320,
    webPreferences: {
      nativeWindowOpen: true,
      webSecurity: true,
    },
  });

  win.setMenuBarVisibility(false);

  win.on('close', () => {
    win = null;
  });
  win.loadURL(modalPath);
});

// ipcMain.on('newRoom', (event, data) => {
//   mainWindow.webContents.send('newRoom', data);
// });
