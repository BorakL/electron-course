import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { createFullFolder, isDev } from './util.js';
// import { pollResources } from './resourceManager.js';
import { getPreloadPath } from './pathResolver.js';
import dotenv from 'dotenv';
import { addKlinikaToTura, appendJsonItem, deleteJsonItemById, getFilePath, readJsonFile, removeKlinikaFromTura, updateJsonItemById, writeJsonFile } from './fsHelpers/jsonUtils.js';
// Definiši __dirname za ES module 
dotenv.config({ path: path.join(process.cwd(), '.env.electron') });
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
    ipcMain.handle('createFullFolder', async (event, params) => {
        return createFullFolder(params);
    });
    ipcMain.handle('getFilePath', (event, fileName) => {
        return getFilePath(fileName);
    });
    ipcMain.handle('readJsonFile', async (event, fileName) => {
        return readJsonFile(fileName);
    });
    ipcMain.handle('writeJsonFile', async (event, fileName, data) => {
        return writeJsonFile(fileName, data);
    });
    ipcMain.handle("appendJsonItem", (event, fileName, newItem) => {
        appendJsonItem(fileName, newItem);
    });
    ipcMain.handle('updateJsonItemById', async (event, fileName, id, changes) => {
        return updateJsonItemById(fileName, id, changes);
    });
    ipcMain.handle('deleteJsonItemById', async (event, fileName, id) => {
        return deleteJsonItemById(fileName, id);
    });
    ipcMain.handle('addKlinikaToTura', async (event, fileName, turaId, klinikaId) => {
        return addKlinikaToTura(fileName, turaId, klinikaId);
    });
    ipcMain.handle('removeKlinikaFromTura', async (event, fileName, turaId, klinikaId) => {
        return removeKlinikaFromTura(fileName, turaId, klinikaId);
    });
});
