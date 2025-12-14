export type Klinika = {
    id:number,
    naziv:string,  
    bolnica: string,
    firm: number,
    klinika: Record<number,string>
}

export type ClinicMap = Record<number, string>;

export type ClinicItem = {
  userId: number;
  name: string;
};

export interface KlinikaItem {
  userId: number;
  name: string
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