import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'path';
import {createFullFolder, isDev} from './util.js' 
// import { pollResources } from './resourceManager.js';
import { getPreloadPath } from './pathResolver.js'; 
import dotenv from 'dotenv'; 


// Definiši __dirname za ES module 

dotenv.config({ path: path.join(process.cwd(), '.env.electron') });
console.log('Secret Key:', process.env.ELECTRON_NAME);

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

    // pollResources(mainWindow)
    ipcMain.handle('createFullFolder',createFullFolder)

})