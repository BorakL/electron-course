import { ipcRenderer } from "electron"; 
// @ts-ignore
import  { DostavnaTura, Klinika } from "./types/types.js";   
// import { dowloadMoreFiles } from "./util";
import electron from 'electron';
// import { DietFilter, TableParams } from "./xlsx/processDietFiles.js";
export interface DietFilter {
  title: string;
  keywords: string[];
}

export interface TableParams {
  dietColumn: string;
  quantityColumn: string;
  firstRow: number;
  lastRowTitle: string;
}

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };


electron.contextBridge.exposeInMainWorld("electronApp", {
    createFullFolder: async (
        klinike: Klinika[],
        url: string,
        refererUrl: string,
        kategorija: number,
        date: string,
        session: string,
        groupId: number
    ) => await ipcRenderer.invoke(`createFullFolder`, klinike, url, refererUrl, kategorija, date, session, groupId),
    
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
        ipcRenderer.invoke('ocistiNevazecuKlinikuIzTura', clinickId),

    processDietFiles: (
        dietFilters: DietFilter[], 
        tableParams: TableParams, 
        folderPath: string
    ): Promise<void> => 
        ipcRenderer.invoke('processDietFiles', dietFilters, tableParams, folderPath),

    selectFolder: (): Promise<null | string> => ipcRenderer.invoke('selectFolder'),

    printDostavnaTura: (
        folderPath: string,
        dostavneTure: DostavnaTura[],
        klinika: Klinika[],
        turaId: number
    ): Promise<void> =>
        ipcRenderer.invoke('printDostavnaTura', folderPath, dostavneTure, klinika, turaId),

    loginAndGetSession: (username: string, password: string) => ipcRenderer.invoke("loginAndGetSession", username, password),
})