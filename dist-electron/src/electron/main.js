import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { createFullFolder, isDev } from './util.js';
// import { pollResources } from './resourceManager.js';
import { getPreloadPath } from './pathResolver.js';
import dotenv from 'dotenv';
import klinike from '../../data/klinike.json' assert { type: "json" };
// Definiši __dirname za ES module 
dotenv.config({ path: path.join(process.cwd(), '.env.electron') });
const url = process.env.URL;
const refererUrl = process.env.REFERERURL;
app.on("ready", () => {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: getPreloadPath()
        }
    });
    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123');
    }
    else {
        mainWindow.loadFile(path.join(app.getAppPath() + '/dist-react/index.html'));
    }
    // pollResources(mainWindow)
    ipcMain.handle('createFullFolder', createFullFolder(klinike, url, refererUrl, kategorija, date));
});
