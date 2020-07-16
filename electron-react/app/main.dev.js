var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from 'path';
import { app, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
export default class AppUpdater {
    constructor() {
        log.transports.file.level = 'info';
        autoUpdater.logger = log;
        autoUpdater.checkForUpdatesAndNotify();
    }
}
let mainWindow = null;
if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}
if (process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true') {
    require('electron-debug')();
}
const installExtensions = () => __awaiter(void 0, void 0, void 0, function* () {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];
    return Promise.all(extensions.map((name) => installer.default(installer[name], forceDownload))).catch(console.log);
});
const createWindow = () => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.NODE_ENV === 'development' ||
        process.env.DEBUG_PROD === 'true') {
        yield installExtensions();
    }
    mainWindow = new BrowserWindow({
        show: false,
        width: 1024,
        height: 728,
        webPreferences: (process.env.NODE_ENV === 'development' ||
            process.env.E2E_BUILD === 'true') &&
            process.env.ERB_SECURE !== 'true'
            ? {
                nodeIntegration: true,
            }
            : {
                preload: path.join(__dirname, 'dist/renderer.prod.js'),
            },
    });
    mainWindow.loadURL(`file://${__dirname}/app.html`);
    mainWindow.webContents.on('did-finish-load', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        }
        else {
            mainWindow.show();
            mainWindow.focus();
        }
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();
    new AppUpdater();
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('ready', createWindow);
app.on('activate', () => {
    if (mainWindow === null)
        createWindow();
});
