import path from 'path';
import { DostavnaTura } from "../types/types.js";
import { dialog } from "electron";
import ExcelJS from 'exceljs'

const appFolder = process.cwd(); // ili path.dirname(process.execPath)

//Development
// const dataFolder = path.join(appFolder, "src/electron","data");
//Production
const dataFolder = path.join(appFolder, 'data');

const FILE_NAME = 'dostavneTure.json';
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}


export const getFilePath = (fileName: string) => {
  return path.join(dataFolder, fileName);
};

export function readJsonFile<T>(fileName: string): T {
  try {
    const filePath = getFilePath(fileName);
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Greška pri čitanju fajla ${fileName}:`, error);
    throw error;
  }
}

export function writeJsonFile<T>(fileName: string, data: T): void {
  try {
    const filePath = getFilePath(fileName);
    console.log("filePath", filePath)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Greška pri pisanju fajla ${fileName}:`, error);
    throw error;
  }
}

export function updateJsonItemById<T extends { id: number }>(
  fileName: string,
  id: number,
  updatedFields: Partial<T>
): void {
  try {
    const items: T[] = readJsonFile<T[]>(fileName);
    const updated = items.map(item =>
      item.id === id ? { ...item, ...updatedFields } : item
    );
    writeJsonFile(fileName, updated);
  } catch (error) {
    console.error(`Greška pri ažuriranju item-a ID ${id} u fajlu ${fileName}:`, error);
    throw error;
  }
}

export function deleteJsonItemById<T>(
  fileName: string,
  id: number,
  idKey: keyof T
): void {
  try {
    const items: T[] = readJsonFile<T[]>(fileName);
    const filtered = items.filter(item => item[idKey] !== id);
    writeJsonFile(fileName, filtered);
  } catch (error) {
    console.error(`Greška pri brisanju item-a ID ${id} u fajlu ${fileName}:`, error);
    throw error;
  }
}

export function appendJsonItem<T>(fileName: string, newItem: T): void {
  try {
    const items: T[] = readJsonFile<T[]>(fileName);
    items.push(newItem);
    writeJsonFile(fileName, items);
  } catch (error) {
    console.error(`Greška pri dodavanju novog item-a u fajl ${fileName}:`, error);
    throw error;
  }
}



type DostavneTureJson = {
  ture: DostavnaTura[];
  nerasporedjeneKlinike: number[];
};


// Dodavanje nove ture sa unikatnim ID-jem i praznom listom klinika
export function dodajNovuTuru(): number {
  const data: DostavneTureJson = readJsonFile(FILE_NAME);
  const id = getNextId(data.ture);
  const novaTura: DostavnaTura = {
    id,
    klinike: [],
  };
  data.ture.push(novaTura);
  writeJsonFile(FILE_NAME, data);
  return id;
}

// Brisanje ture i vraćanje njenih klinika u neraspoređene
export function obrisiTuru(id: number): void {
  const data: DostavneTureJson = readJsonFile(FILE_NAME);
  const tura = data.ture.find(t => t.id === id);
  if (!tura) throw new Error(`Tura sa ID ${id} ne postoji`);

  // Dodaj sve njene klinike u neraspoređene
  data.nerasporedjeneKlinike.push(...tura.klinike);
  data.ture = data.ture.filter(t => t.id !== id);
  writeJsonFile(FILE_NAME, data);
}

// Dodavanje klinike u postojeću turu
export function dodajKlinikuUTuru(turaId: number, klinikaId: number): void {
  const data: DostavneTureJson = readJsonFile(FILE_NAME);
  const tura = data.ture.find(t => t.id === turaId);
  if (!tura) throw new Error(`Tura sa ID ${turaId} ne postoji`);

  // Ukloni kliniku iz neraspoređenih ako postoji
  data.nerasporedjeneKlinike = data.nerasporedjeneKlinike.filter(id => id !== klinikaId);

  // Dodaj kliniku u turu ako već nije tu
  if (!tura.klinike.includes(klinikaId)) {
    tura.klinike.push(klinikaId);
  }

  writeJsonFile(FILE_NAME, data);
}

// Brisanje klinike iz ture i vraćanje u neraspoređene
export function ukloniKlinikuIzTure(turaId: number, klinikaId: number): void {
  const data: DostavneTureJson = readJsonFile(FILE_NAME);
  const tura = data.ture.find(t => t.id === turaId);
  if (!tura) throw new Error(`Tura sa ID ${turaId} ne postoji`);

  tura.klinike = tura.klinike.filter(id => id !== klinikaId);

  // Dodaj kliniku nazad u neraspoređene ako već nije tamo
  if (!data.nerasporedjeneKlinike.includes(klinikaId)) {
    data.nerasporedjeneKlinike.push(klinikaId);
  }

  writeJsonFile(FILE_NAME, data);
}


// Dodavanje klinike u neraspoređene (ako već nije tamo)
export function dodajKlinikuUNerasporedjene(klinikaId: number): void {
  const data: DostavneTureJson = readJsonFile(FILE_NAME);

  if (!data.nerasporedjeneKlinike.includes(klinikaId)) {
    data.nerasporedjeneKlinike.push(klinikaId);
    writeJsonFile(FILE_NAME, data);
  }
}

// Brisanje klinike iz neraspoređenih
export function ukloniKlinikuIzNerasporedjenih(klinikaId: number): void {
  const data: DostavneTureJson = readJsonFile(FILE_NAME);

  const preDuzina = data.nerasporedjeneKlinike.length;
  data.nerasporedjeneKlinike = data.nerasporedjeneKlinike.filter(id => id !== klinikaId);

  if (data.nerasporedjeneKlinike.length !== preDuzina) {
    writeJsonFile(FILE_NAME, data);
  }
}


// Pomocna funkcija za generisanje ID-ja
function getNextId(ture: DostavnaTura[]): number {
  const ids = ture.map(t => t.id);
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}


export async function ocistiNevazecuKlinikuIzTura(clinickId:number): Promise<void> {
  const data: DostavneTureJson = readJsonFile(FILE_NAME);

  // Očisti tura.klinike
  data.ture = data.ture.map(tura => ({
    ...tura,
    klinike: tura.klinike.filter(id => id!==clinickId)
  }));

  // Očisti nerasporedjene klinike
  data.nerasporedjeneKlinike = data.nerasporedjeneKlinike.filter(id => id!==clinickId);

  writeJsonFile(FILE_NAME, data);
}

export async function selectFolder(): Promise<null | string> {
  try{
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0];
  }catch(error){
    console.log("Greška pri selektovanju foldera", error);
    return null;
  }
}


//Merdzuj sve excel fajlove iz jednog foldera u jedan excel fajl
import fs from "fs";
import {
    Workbook,
    Worksheet,
    Row,
    Cell,
    Column
} from "exceljs";

type CounterMap = Record<string, number>;

export async function mergeExcels(folderPath: string, outputPath: string): Promise<void> {
    const filesForCheck: string[] = ["DB NEFROLOGIJA", "FAKULTET"];
    const mainWorkbook: Workbook = new ExcelJS.Workbook();
    const files: string[] = fs.readdirSync(folderPath)
        .filter((file: string) => file.endsWith(".xlsx"));
    files.sort((a, b) => {
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      return aNum - bNum;
    });

    const counterMap: CounterMap = {};

    for (const file of files) {
        const filePath: string = path.join(folderPath, file);

        // Extract number prefix before first space
        const match: RegExpMatchArray | null = file.match(/^(\d+)\s+/);
        if (!match) {
            console.log(`Skipping file (no number prefix): ${file}`);
            continue;
        }

        const prefix: string = match[1];

        // Prepare counter
        counterMap[prefix] = (counterMap[prefix] ?? 0) + 1;

        
        const sheetName: string = `${prefix}-${counterMap[prefix]}${filesForCheck.some(f=>file.includes(f)) ? "-Proveri" : ""}`;

        const tempWorkbook: Workbook = new ExcelJS.Workbook();
        await tempWorkbook.xlsx.readFile(filePath);

        const sourceSheet: Worksheet = tempWorkbook.worksheets[0];
        const targetSheet: Worksheet = mainWorkbook.addWorksheet(sheetName);

        // Copy full sheet
        await copySheet(sourceSheet, targetSheet);

        console.log(`✔ Added sheet: ${sheetName}`);
    }
    await mainWorkbook.xlsx.writeFile(outputPath);

    console.log(`\n🎉 Done! File saved as: ${outputPath}`);
}


/* -----------------------------------------------------------
    COPY SHEET FUNCTION (WITH TYPE ANNOTATIONS)
------------------------------------------------------------ */

async function copySheet(source: Worksheet, target: Worksheet): Promise<void> {
    /* ----- Copy Column Widths ----- */
    source.columns.forEach((col: Partial<Column> | null, index: number) => {
        if (col && typeof col.width === "number") {
            target.getColumn(index + 1).width = col.width * 1.11;
        }
    });

    /* ----- Copy Cells: Values + Style ----- */
    source.eachRow({ includeEmpty: true }, (row: Row, rowNumber: number) => {
        const newRow: Row = target.getRow(rowNumber);

        row.eachCell({ includeEmpty: true }, (cell: Cell, colNumber: number) => {
            const newCell: Cell = newRow.getCell(colNumber);

            // Copy cell value
            newCell.value = cell.value;

            // Copy style (deep clone)
            if (cell.style) {
                newCell.style = JSON.parse(JSON.stringify(cell.style));
            }

            // Copy formula if exists
            if (cell.formula) {
                newCell.value = { formula: cell.formula, result: cell.result };
            }
        });

        // Copy row height
        
            newRow.height = row.height * 1.25; 
    });
    target.mergeCells("A1:C1");

}