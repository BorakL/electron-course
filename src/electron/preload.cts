import { ipcRenderer } from "electron"; 
// @ts-ignore
import  { Klinika } from "./types"; 
// import { dowloadMoreFiles } from "./util";
const electron = require('electron'); 


electron.contextBridge.exposeInMainWorld("electronApp", { 
    // getStaticData: () => console.log('static'),
    createFullFolder: (
        klinike: Klinika[],
        url: string,
        refererUrl: string,
        kategorija: number,
        date: string,
        session: string
    ) => ipcRenderer.invoke(`createFullFolder`, klinike, url, refererUrl, kategorija, date, session),
    
    processExcel: () => ipcRenderer.invoke('processExcel')

})