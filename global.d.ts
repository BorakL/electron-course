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
        }
    } 
}