"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// import { dowloadMoreFiles } from "./util";
const electron_2 = __importDefault(require("electron"));
electron_2.default.contextBridge.exposeInMainWorld("electronApp", {
    createFullFolder: (klinike, url, refererUrl, kategorija, date, session) => electron_1.ipcRenderer.invoke(`createFullFolder`, klinike, url, refererUrl, kategorija, date, session),
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
    ocistiNeispravnuKlinikuIzTura: (clinickId) => electron_1.ipcRenderer.invoke('ocistiNeispravnuKlinikuIzTura', clinickId)
});
