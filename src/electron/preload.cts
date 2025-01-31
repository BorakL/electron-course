import { ipcRenderer } from "electron";
import { Klinika } from "./types";
// import { dowloadMoreFiles } from "./util";
import klinike from '../../data/klinike.json' assert { type: 'json' };

const electron = require('electron');



electron.contextBridge.exposeInMainWorld("electronApp", { 
    // getStaticData: () => console.log('static'),
    createFullFolder: (
        
    ) => ipcRenderer.invoke(`createFullFolder`, klinike, url, refererUrl, kategorija, date)
})