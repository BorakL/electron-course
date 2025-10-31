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
    user: number[], 
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
    session: string,
    groupId: number
}

export interface DostavnaTura {
  id: number;
  klinike: number[]; // sadrži ID-eve klinika
}

export type Logs = {
    status:string, 
    downloads:string[],
    failedDownloads:string[]
}

export interface ExcelApplication {
  Visible: boolean;
  Workbooks: {
    Open(path: string): Workbook;
    Add(): Workbook;
    Close(): void;
  };
  Quit(): void;
}


export interface Worksheet {
  Cells(row: number, column: number): Cell;
  Range(address: string): Range;
  Name: string;
}

export interface Range {
  Value: string | number | boolean | null;
  // Dodaj druge metode ako ih koristiš
}

export interface Cell {
  Value: string | number | boolean | null;
}

export interface Workbook {
  Sheets: {
    Item(index: number | string): Worksheet;
    Count: number;
  };
  SaveAs(path: string): void;
  Close(saveChanges?: boolean): void;
  PrintOut(): void;
}

export interface PageSetup {
  CenterHorizontally: boolean;
  CenterVertically: boolean;
  Orientation: number | string; // npr. 'xlPortrait' ili 1
  Zoom: number;
  FitToPagesWide: number;
  FitToPagesTall: number;
  // Dodaj još ako koristiš druge opcije
}

export interface Worksheet {
  Cells(row: number, column: number): Cell;
  Range(address: string): Range;
  Name: string;
  PageSetup: PageSetup;
    PrintOut(
    From?: number,
    To?: number,
    Copies?: number,
    Preview?: boolean,
    ActivePrinter?: string,
    PrintToFile?: boolean,
    Collate?: boolean,
    PrToFileName?: string,
    CenterHorizontally?: boolean,
    Orientation?: number,
  ): void;
  PrintOut(): void;
  insertRows?(row: number, amount?: number): void;
}

export interface DostavnaTuraObject {
  ture: DostavnaTura[],
  nerasporedjeneKlinike: number[]
}