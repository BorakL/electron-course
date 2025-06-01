import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { createFullFolder, isDev, printDostavnaTura } from './util.js';
// import { pollResources } from './resourceManager.js';
import { getPreloadPath } from './pathResolver.js';
import dotenv from 'dotenv';
import { appendJsonItem, deleteJsonItemById, dodajKlinikuUNerasporedjene, dodajKlinikuUTuru, dodajNovuTuru, getFilePath, obrisiTuru, ocistiNevazecuKlinikuIzTura, readJsonFile, selectFolder, ukloniKlinikuIzNerasporedjenih, ukloniKlinikuIzTure, updateJsonItemById, writeJsonFile } from './fsHelpers/jsonUtils.js';
import processDietFiles from './xlsx/processDietFiles.js';
// Definiši __dirname za ES module 
dotenv.config({ path: path.join(process.cwd(), '.env.electron') });
app.on("ready", () => {
    const mainWindow = new BrowserWindow({
        icon: path.join(path.join(app.getAppPath() + '/src/electron'), 'assets', 'icon.ico'),
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
        const result = await createFullFolder(params);
        return result;
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
    ipcMain.handle('deleteJsonItemById', async (event, fileName, id, idKey) => {
        return deleteJsonItemById(fileName, id, idKey);
    });
    ipcMain.handle('dodajKlinikuUNerasporedjene', (event, klinikaId) => {
        dodajKlinikuUNerasporedjene(klinikaId);
    });
    ipcMain.handle('ukloniKlinikuIzNerasporedjenih', (event, klinikaId) => {
        ukloniKlinikuIzNerasporedjenih(klinikaId);
    });
    ipcMain.handle('dodajKlinikuUTuru', (event, turaId, klinikaId) => {
        dodajKlinikuUTuru(turaId, klinikaId);
    });
    ipcMain.handle('ukloniKlinikuIzTure', (event, turaId, klinikaId) => {
        ukloniKlinikuIzTure(turaId, klinikaId);
    });
    ipcMain.handle('obrisiTuru', (event, turaId) => {
        obrisiTuru(turaId);
    });
    ipcMain.handle('dodajNovuTuru', () => {
        return dodajNovuTuru(); // vraća ID nove ture
    });
    ipcMain.handle('ocistiNevazecuKlinikuIzTura', (event, clinickId) => {
        return ocistiNevazecuKlinikuIzTura(clinickId);
    });
    ipcMain.handle('processDietFiles', (event, dietFilters, tableParams, folderPath) => {
        return processDietFiles(dietFilters, tableParams, folderPath);
    });
    ipcMain.handle('selectFolder', () => {
        return selectFolder();
    });
    ipcMain.handle('printDostavnaTura', (event, folderPath, dostavneTure, klinika, turaId) => {
        return printDostavnaTura(folderPath, dostavneTure, klinika, turaId);
    });
});
