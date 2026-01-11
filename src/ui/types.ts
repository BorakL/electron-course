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

export type ClinicsWithOrderedProductsItem = {
  date: string,
  clinics: string[],
  clinicsObj?: Klinika[] | undefined
}

export type RouteKey = "1" | "2" | "3";
export type GetClinicsWithOrderedProducts = Record<RouteKey, ClinicsWithOrderedProductsItem>

export type DownloadSpecShippingDocsParams = {
  klinike: Klinika[], 
  url: string, 
  refererUrl: string, 
  suffix: string
}

export type PendingAction = (() => void) | null;

export type Settings = {
  urls: {
    LOGIN_URL: string;
    URL_OTPREMNICE: string;
    REFERER_URL_OTPREMNICE: string;
    URL_VAN_RFZO: string;
    URL_PROIZVODI: string;
    REFERER_URL_PROIZVODI: string;
  };
  listaZaPakovanje: {
    FIRST_CLINIC_ROW: number;
    FIRST_CLINIC_COL: number;
    DIET_COL: number;
    FIRST_DIET_ROW: number;
    CLINIC_ROW: number;
    DATE_CELL: string;
  };
  otpremnica: {
    DIET_COLUMN: string;
    QUANTITY_COLUMN: string;
    FIRST_DIET_ROW: number;
    LAST_ROW_TITLE: string;
    COL_WIDTH: number;
    COL_HEIGHT: number;
    MERGER: string[];
  };
}