export type Klinika = {
    id:number,
    naziv:string,
    bolnicaApp: string,
    klinikaApp: string,
    bolnica: string,
    klinika: string,
    firm: number,
    user: number[]
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

export interface DostavnaTura {
  id: number;
  klinike: number[]; // sadrži ID-eve klinika
}

export type DownloadShippingDocsParams = {
  cliniks: Klinika[], 
  url: string, 
  refererUrl: string, 
  suffix?: string | undefined
}

export type VanRfzoForm = {
  date: string,
  clinics: Klinika[]
}