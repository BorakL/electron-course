"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// import { dowloadMoreFiles } from "./util";
const klinike_json_1 = __importDefault(require("../../data/klinike.json"));
const electron = require('electron');
electron.contextBridge.exposeInMainWorld("electronApp", {
    subscribeStatistics: (callback) => {
        electron.ipcRenderer.on("statistics", (_, stats) => {
            callback(stats);
        });
    },
    // getStaticData: () => console.log('static'),
    createFullFolder: () => electron_1.ipcRenderer.invoke(`createFullFolder`, klinike_json_1.default, url, refererUrl, kategorija, date)
});
