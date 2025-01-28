import { ipcRenderer } from "electron";
// import { dowloadMoreFiles } from "./util";

const electron = require('electron');

electron.contextBridge.exposeInMainWorld("electronApp", {
    subscribeStatistics: (callback: (statistics:any) => void) => {
        electron.ipcRenderer.on("statistics", (_, stats)=>{
            callback(stats)
        })        
    },
    // getStaticData: () => console.log('static'),
    createFullFolder: () => ipcRenderer.invoke(`createFullFolder`)
})