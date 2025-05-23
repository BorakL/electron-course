import { ipcRenderer } from "electron"; 
// @ts-ignore
import  { Klinika } from "./types/types.js";   
// import { dowloadMoreFiles } from "./util";
import electron from 'electron'; 

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };


electron.contextBridge.exposeInMainWorld("electronApp", {
    createFullFolder: (
        klinike: Klinika[],
        url: string,
        refererUrl: string,
        kategorija: number,
        date: string,
        session: string
    ) => ipcRenderer.invoke(`createFullFolder`, klinike, url, refererUrl, kategorija, date, session),
    
    // osnovne funkcije nad fajlovima
    getFilePath: (fileName: string): Promise<string> =>
        ipcRenderer.invoke("getFilePath", fileName),

    readJsonFile: (fileName: string): Promise<JsonValue> =>
        ipcRenderer.invoke("readJsonFile", fileName),

    writeJsonFile: (fileName: string, data: JsonValue): Promise<void> =>
        ipcRenderer.invoke("writeJsonFile", fileName, data),

    appendJsonItem: (fileName: string, newItem: any) =>
        ipcRenderer.invoke("appendJsonItem", fileName, newItem),

    updateJsonItemById: (
        fileName: string,
        id: number | string,
        changes: JsonObject
    ): Promise<void> =>
        ipcRenderer.invoke("updateJsonItemById", fileName, id, changes),

    deleteJsonItemById: (
        fileName: string,
        id: number | string,
        idKey: string
    ): Promise<void> =>
        ipcRenderer.invoke("deleteJsonItemById", fileName, id, idKey),

    addKlinikaToTura: (
        fileName: string,
        turaId: number,
        klinikaId: number
    ): Promise<void> => 
        ipcRenderer.invoke("addKlinikaToTura", fileName, turaId, klinikaId),

    removeKlinikaFromTura: (
        fileName: string,
        turaId: number,
        klinikaId: number
    ): Promise<void> =>
        ipcRenderer.invoke("removeKlinikaFromTura", fileName, turaId, klinikaId),

    dodajKlinikuUNerasporedjene: (
        klinikaId: number
    ): Promise<void> =>
        ipcRenderer.invoke('dodajKlinikuUNerasporedjene', klinikaId),

    ukloniKlinikuIzNerasporedjenih: (
        klinikaId: number
    ): Promise<void> =>
        ipcRenderer.invoke('ukloniKlinikuIzNerasporedjenih', klinikaId),

    dodajKlinikuUTuru: (
        turaId: number, 
        klinikaId: number
    ): Promise<void> =>
        ipcRenderer.invoke('dodajKlinikuUTuru', turaId, klinikaId),

    ukloniKlinikuIzTure: (
        turaId: number, 
        klinikaId: number
    ): Promise<void> =>
        ipcRenderer.invoke('ukloniKlinikuIzTure', turaId, klinikaId),

    obrisiTuru: (
        turaId: number
    ): Promise<void> =>
        ipcRenderer.invoke('obrisiTuru', turaId),

    dodajNovuTuru: (): Promise<number> =>
        ipcRenderer.invoke('dodajNovuTuru'),
    
    ocistiNevazecuKlinikuIzTura: (
        clinickId: number
    ): Promise<void> =>
        ipcRenderer.invoke('ocistiNevazecuKlinikuIzTura', clinickId)

})