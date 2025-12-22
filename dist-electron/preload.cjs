"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// import { dowloadMoreFiles } from "./util";
const electron_2 = __importDefault(require("electron"));
electron_2.default.contextBridge.exposeInMainWorld("electronApp", {
    createFullFolder: async (klinike, url, refererUrl, kategorija, date, session, groupId) => await electron_1.ipcRenderer.invoke(`createFullFolder`, klinike, url, refererUrl, kategorija, date, session, groupId),
    // osnovne funkcije nad fajlovima
    getFilePath: (fileName) => electron_1.ipcRenderer.invoke("getFilePath", fileName),
    readJsonFile: (fileName) => electron_1.ipcRenderer.invoke("readJsonFile", fileName),
    writeJsonFile: (fileName, data) => electron_1.ipcRenderer.invoke("writeJsonFile", fileName, data),
    appendJsonItem: (fileName, newItem) => electron_1.ipcRenderer.invoke("appendJsonItem", fileName, newItem),
    updateJsonItemById: (fileName, id, changes) => electron_1.ipcRenderer.invoke("updateJsonItemById", fileName, id, changes),
    deleteJsonItemById: (fileName, id, idKey) => electron_1.ipcRenderer.invoke("deleteJsonItemById", fileName, id, idKey),
    addKlinikaToTura: (fileName, turaId, klinikaId) => electron_1.ipcRenderer.invoke("addKlinikaToTura", fileName, turaId, klinikaId),
    removeKlinikaFromTura: (fileName, turaId, klinikaId) => electron_1.ipcRenderer.invoke("removeKlinikaFromTura", fileName, turaId, klinikaId),
    dodajKlinikuUNerasporedjene: (klinikaId) => electron_1.ipcRenderer.invoke('dodajKlinikuUNerasporedjene', klinikaId),
    ukloniKlinikuIzNerasporedjenih: (klinikaId) => electron_1.ipcRenderer.invoke('ukloniKlinikuIzNerasporedjenih', klinikaId),
    dodajKlinikuUTuru: (turaId, klinikaId) => electron_1.ipcRenderer.invoke('dodajKlinikuUTuru', turaId, klinikaId),
    ukloniKlinikuIzTure: (turaId, klinikaId) => electron_1.ipcRenderer.invoke('ukloniKlinikuIzTure', turaId, klinikaId),
    obrisiTuru: (turaId) => electron_1.ipcRenderer.invoke('obrisiTuru', turaId),
    dodajNovuTuru: () => electron_1.ipcRenderer.invoke('dodajNovuTuru'),
    ocistiNevazecuKlinikuIzTura: (clinickId) => electron_1.ipcRenderer.invoke('ocistiNevazecuKlinikuIzTura', clinickId),
    processDietFiles: (dietFilters, tableParams, folderPath) => electron_1.ipcRenderer.invoke('processDietFiles', dietFilters, tableParams, folderPath),
    selectFolder: () => electron_1.ipcRenderer.invoke('selectFolder'),
    selectFile: () => electron_1.ipcRenderer.invoke('selectFile'),
    selectFiles: () => electron_1.ipcRenderer.invoke('selectFiles'),
    printDostavnaTura: (folderPath, dostavneTure, klinika, turaId) => electron_1.ipcRenderer.invoke('printDostavnaTura', folderPath, dostavneTure, klinika, turaId),
    loginAndGetSession: (username, password) => electron_1.ipcRenderer.invoke("loginAndGetSession", username, password),
    mergeExcels: (folderPath, outputPath) => electron_1.ipcRenderer.invoke('mergeExcels', folderPath, outputPath),
    getClinicsWithSpecMeals: (filePath, dietFilters) => electron_1.ipcRenderer.invoke('getClinicsWithSpecMeals', filePath, dietFilters),
    getClinicsWithOrderedProducts: (filePaths) => electron_1.ipcRenderer.invoke('getClinicsWithOrderedProducts', filePaths)
});
