"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// import { dowloadMoreFiles } from "./util";
const electron = require('electron');
electron.contextBridge.exposeInMainWorld("electronApp", {
    // getStaticData: () => console.log('static'),
    createFullFolder: (klinike, url, refererUrl, kategorija, date) => electron_1.ipcRenderer.invoke(`createFullFolder`, klinike, url, refererUrl, kategorija, date)
});
