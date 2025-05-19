export type Klinika = {
    naziv:string,
    bolnicaApp: string,
    klinikaApp: string,
    bolnica: string,
    klinika: string,
    firm: number,
    user: number
}

export type DownloadFileParams = {
    fileUrl: string,
    filePath: string,
    refererUrl: string | undefined, 
    firm: number, 
    user: number, 
    date: string, 
    session: string
}

// klinike: Klinika[], url: string | undefined, refererUrl: string | undefined, kategorija: number, date: string, session: string

export type CreateFullFolderParams = {
    cliniks: Klinika[],
    url: string | undefined, 
    refererUrl: string | undefined,
    category: number,
    date: string,
    session: string
}

export interface DostavnaTura {
  id: number;
  naziv: string;
  klinike: number[]; // sadrži ID-eve klinika
}