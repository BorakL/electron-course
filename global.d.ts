export {};

declare global {
    interface Window {
        electronApp: { 
            createFullFolder: (
                klinike: Klinika[],
                url: string,
                refererUrl: string,
                kategorija: number,
                date: string,
                session: string
              ) => Promise<void>;
        }
    } 
}