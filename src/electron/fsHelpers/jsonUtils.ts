import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFolder = path.join(__dirname, "..","..","data")

export const getFilePath = (fileName:string)=>{
    return path.join(dataFolder,fileName)
}

export function readJsonFile<T>(fileName: string): T {
    const filePath = getFilePath(fileName);
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  }
  
  export function writeJsonFile<T>(fileName: string, data: T): void {
    const filePath = getFilePath(fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

export function updateJsonItemById<T extends { id: number }>(
    fileName: string,
    id: number,
    updatedFields: Partial<T>
  ): void {
    const items: T[] = readJsonFile<T[]>(fileName);
    const updated = items.map(item =>
      item.id === id ? { ...item, ...updatedFields } : item
    );
    writeJsonFile(fileName, updated);
  }
  
  export function deleteJsonItemById<T extends { id: number }>(
    fileName: string,
    id: number
  ): void {
    const items: T[] = readJsonFile<T[]>(fileName);
    const filtered = items.filter(item => item.id !== id);
    writeJsonFile(fileName, filtered);
  }
  
  export function addKlinikaToTura(
    fileName: string,
    turaId: number,
    klinikaId: number
  ): void {
    const ture = readJsonFile<{ id: number; klinike: number[] }[]>(fileName);
    const updated = ture.map(tura =>
      tura.id === turaId && !tura.klinike.includes(klinikaId)
        ? { ...tura, klinike: [...tura.klinike, klinikaId] }
        : tura
    );
    writeJsonFile(fileName, updated);
  }
  
  export function removeKlinikaFromTura(
    fileName: string,
    turaId: number,
    klinikaId: number
  ): void {
    const ture = readJsonFile<{ id: number; klinike: number[] }[]>(fileName);
    const updated = ture.map(tura =>
      tura.id === turaId
        ? { ...tura, klinike: tura.klinike.filter(id => id !== klinikaId) }
        : tura
    );
    writeJsonFile(fileName, updated);
  }
  