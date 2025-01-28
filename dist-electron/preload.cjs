"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// import { dowloadMoreFiles } from "./util";
const electron = require('electron');
electron.contextBridge.exposeInMainWorld("electronApp", {
    subscribeStatistics: (callback) => {
        electron.ipcRenderer.on("statistics", (_, stats) => {
            callback(stats);
        });
    },
    // getStaticData: () => console.log('static'),
    createFullFolder: () => electron_1.ipcRenderer.invoke(`createFullFolder`)
});
