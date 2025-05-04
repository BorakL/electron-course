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
            writeJsonFile: (fileName:string, data:JsonValue) => Promise<void>;
            updateJsonItemById: (fileName:string, id:number, updatedFields:JsonObject) => Promise<void>;
            deleteJsonItem: (fileName:string, id:number) => Promise<void>
        }
    }
}