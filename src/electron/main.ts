import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'path';
import {createFullFolder, isDev} from './util.js' 
// import { pollResources } from './resourceManager.js';
import { getPreloadPath } from './pathResolver.js'; 
import dotenv from 'dotenv';  
import { appendJsonItem, deleteJsonItemById, dodajKlinikuUNerasporedjene, dodajKlinikuUTuru, dodajNovuTuru, getFilePath, obrisiTuru, ocistiNevazecuKlinikuIzTura, readJsonFile, ukloniKlinikuIzNerasporedjenih, ukloniKlinikuIzTure, updateJsonItemById, writeJsonFile } from './fsHelpers/jsonUtils.js';
import processDietFiles, { DietFilter, TableParams } from './xlsx/processDietFiles.js';


// Definiši __dirname za ES module 

dotenv.config({ path: path.join(process.cwd(), '.env.electron') }); 


app.on("ready", ()=>{
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: getPreloadPath()
        }
    });
    if(isDev()){
        mainWindow.loadURL('http://localhost:5123')
    }else{
        mainWindow.loadFile(path.join(app.getAppPath() + '/dist-react/index.html'));
    }
    ipcMain.handle('createFullFolder', async (event, params) => {
        return createFullFolder(params);
    });
    ipcMain.handle('getFilePath', (event, fileName:string): string => {
        return getFilePath(fileName)
    })
    ipcMain.handle('readJsonFile', async (event, fileName:string) => {
        return readJsonFile(fileName)
    })
    ipcMain.handle('writeJsonFile', async (event, fileName:string, data ) => {
        return writeJsonFile(fileName,data)
    })
    ipcMain.handle("appendJsonItem", (event, fileName: string, newItem) => {
        appendJsonItem(fileName, newItem);
    });
    ipcMain.handle('updateJsonItemById', async (event, fileName, id, changes) => {
        return updateJsonItemById(fileName, id, changes);
    });
    ipcMain.handle('deleteJsonItemById', async (event, fileName, id, idKey:string) => {
        return deleteJsonItemById(fileName, id, idKey);
    });
    ipcMain.handle('dodajKlinikuUNerasporedjene', (event, klinikaId: number) => {
        dodajKlinikuUNerasporedjene(klinikaId);
    });
    ipcMain.handle('ukloniKlinikuIzNerasporedjenih', (event, klinikaId: number) => {
        ukloniKlinikuIzNerasporedjenih(klinikaId);
    });
    ipcMain.handle('dodajKlinikuUTuru', (event, turaId: number, klinikaId: number) => {
        dodajKlinikuUTuru(turaId, klinikaId);
    });
    ipcMain.handle('ukloniKlinikuIzTure', (event, turaId: number, klinikaId: number) => {
        ukloniKlinikuIzTure(turaId, klinikaId);
    });
    ipcMain.handle('obrisiTuru', (event, turaId: number) => {
        obrisiTuru(turaId);
    });
    ipcMain.handle('dodajNovuTuru', () => {
        return dodajNovuTuru(); // vraća ID nove ture
    });
    ipcMain.handle('ocistiNevazecuKlinikuIzTura', (event, clinickId:number) => {
        return ocistiNevazecuKlinikuIzTura(clinickId)
    })
    ipcMain.handle('processDietFiles', (event, dietFilters:DietFilter[], tableParams:TableParams, folderPath:string) => {
        return processDietFiles(dietFilters,tableParams,folderPath)
    })
})