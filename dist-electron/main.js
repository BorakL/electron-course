import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { createFullFolder, getClinicsWithSpecMeals, getClinicsWithOrderedProducts, isDev, loginAndGetSession, printDostavnaTura, fillABsoftForm, inspectForm, waitForServer } from './util.js';
import { getPreloadPath } from './pathResolver.js';
import dotenv from 'dotenv';
import { appendJsonItem, deleteJsonItemById, dodajKlinikuUNerasporedjene, dodajKlinikuUTuru, dodajNovuTuru, getFilePath, mergeExcels, obrisiTuru, ocistiNevazecuKlinikuIzTura, readJsonFile, selectFile, selectFiles, selectFolder, ukloniKlinikuIzNerasporedjenih, ukloniKlinikuIzTure, updateJsonItemById, writeJsonFile, zameniVoziloSaProverom } from './fsHelpers/jsonUtils.js';
import processDietFiles from './xlsx/processDietFiles.js';
import { spawn } from "child_process";
import { exec } from "child_process";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(process.cwd(), '.env.electron') });
let backendProcess = null;
const preloadPath = app.isPackaged
    ? path.join(__dirname, "preload.cjs")
    : getPreloadPath();
app.on("ready", async () => {
    const exePath = app.isPackaged
        ? path.join(process.resourcesPath, "UiHelper", "UiHelper.exe")
        : path.join(process.cwd(), "resources", "UiHelper", "UiHelper.exe");
    backendProcess = spawn(exePath, [], {
        cwd: path.dirname(exePath)
    });
    backendProcess.stdout.on("data", (data) => {
        console.log("C#:", data.toString());
    });
    backendProcess.stderr.on("data", (data) => {
        console.error("C# ERROR:", data.toString());
    });
    backendProcess.on("error", (err) => {
        console.error("Failed to start C#:", err);
    });
    backendProcess.on("close", (code) => {
        console.log("C# exited with code:", code);
    });
    backendProcess.on("exit", (code) => {
        console.log("C# exit:", code);
    });
    await waitForServer();
    const mainWindow = new BrowserWindow({
        icon: path.join(path.join(app.getAppPath() + '/src/electron'), 'assets', 'icon.ico'),
        webPreferences: {
            preload: preloadPath
        }
    });
    if (!isDev()) {
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
    ipcMain.handle('zameniVoziloSaProverom', (event, turaId, novoVozilo) => {
        return zameniVoziloSaProverom(turaId, novoVozilo);
    });
    ipcMain.handle('processDietFiles', (event, dietFilters, tableParams, folderPath) => {
        return processDietFiles(dietFilters, tableParams, folderPath);
    });
    ipcMain.handle('selectFolder', () => {
        return selectFolder();
    });
    ipcMain.handle('selectFile', () => {
        return selectFile();
    });
    ipcMain.handle('selectFiles', () => {
        return selectFiles();
    });
    ipcMain.handle('printDostavnaTura', (event, folderPath, dostavneTure, klinika, turaId) => {
        return printDostavnaTura(folderPath, dostavneTure, klinika, turaId);
    });
    ipcMain.handle('loginAndGetSession', async (_event, username, password) => {
        return loginAndGetSession(username, password);
    });
    ipcMain.handle('mergeExcels', async (event, folderPath, outputPath) => {
        return mergeExcels(folderPath, outputPath);
    });
    ipcMain.handle('getClinicsWithSpecMeals', async (event, filePath, dietFilters) => {
        return getClinicsWithSpecMeals(filePath, dietFilters);
    });
    ipcMain.handle('getClinicsWithOrderedProducts', async (event, filePaths) => {
        return getClinicsWithOrderedProducts(filePaths);
    });
    ipcMain.handle('fillABsoftForm', async (event, windowTitle, fields) => {
        return fillABsoftForm(windowTitle, fields);
    });
    ipcMain.handle('inspectForm', async (event, windowTitle) => {
        return await inspectForm(windowTitle);
    });
});
app.on("before-quit", () => {
    if (backendProcess?.pid) {
        console.log("🛑 Force kill backend...");
        exec(`taskkill /PID ${backendProcess.pid} /T /F`);
    }
});
