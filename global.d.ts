import { DostavnaTura, Klinika } from "./src/ui/types";

export {};

type CreateFullFolderParams = {
    cliniks: Klinika[],
    url: string | undefined, 
    refererUrl: string | undefined,
    category: number,
    date: string,
    session: string,
    groupId: number
}
interface DietFilter {
  title: string;
  keywords: string[];
}
interface TableParams {
  dietColumn: string;
  quantityColumn: string;
  firstRow: number;
  lastRowTitle: string;
}

declare global {
    interface Window {
        electronApp: { 
            createFullFolder: ( CreateFullFolderParams ) => Promise<Logs | undefined>;
            getFilePath: (fileName:string) => string;
            readJsonFile: (fileName:string) => Promise<JsonValue>; 
            appendJsonItem: (FileName:string, newItem:JsonObject) => Promise<void>;
            writeJsonFile: (fileName:string, data:JsonValue) => Promise<void>;
            updateJsonItemById: (fileName:string, id:number, updatedFields:JsonObject) => Promise<void>;
            deleteJsonItemById: (fileName:string, id:number, idKey:string) => Promise<void>;
            dodajKlinikuUNerasporedjene: (klinikaId: number) => Promise<void>;
            ukloniKlinikuIzNerasporedjenih: (klinikaId: number) => Promise<void>;
            dodajKlinikuUTuru: (turaId: number, klinikaId: number) => Promise<void>;
            ukloniKlinikuIzTure: (turaId: number, klinikaId: number) => Promise<void>;
            obrisiTuru: (turaId: number) => Promise<void>;
            dodajNovuTuru: () => Promise<number>;
            ocistiNevazecuKlinikuIzTura: (clinickId: number) => Promise<void>;
            processDietFiles: (dietFilters: DietFilter[], tableParams: TableParams, folterPath:string) => Promise<void>;
            selectFolder: () => Promise<null | string>;
            printDostavnaTura: (folderPath:string, dostavneTure:DostavnaTura[], klinike:Klinika[], turaId:nuber) => Promise<void>
            loginAndGetSession: (username:string, password:string) => Promise<string | null>
            addLicensePlate: (folderPath:string, tableParams:TableParams)=> Promise<void>
            mergeExcels(folderPath:string, outputPath:string): Promise<void> 
          }
    }
}