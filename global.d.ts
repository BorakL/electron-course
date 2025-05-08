export {};

type CreateFullFolderParams = {
    cliniks: Klinika[],
    url: string | undefined, 
    refererUrl: string | undefined,
    category: number,
    date: string,
    session: string
}

declare global {
    interface Window {
        electronApp: { 
            createFullFolder: ( CreateFullFolderParams ) => Promise<void>;
            getFilePath: (fileName:string) => string;
            readJsonFile: (fileName:string) => Promise<JsonValue>; 
            appendJsonItem: (FileName:string, newItem:JsonObject) => Promise<void>;
            writeJsonFile: (fileName:string, data:JsonValue) => Promise<void>;
            updateJsonItemById: (fileName:string, id:number, updatedFields:JsonObject) => Promise<void>;
            deleteJsonItemById: (fileName:string, id:number, idKey:string) => Promise<void>;
            addKlinikaToTura: (fileName:string, turaId:number, klinikaId:number) => Promise<void>;
            showConfirm: () => boolean;
        }
    }
}