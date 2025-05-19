import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import { DostavnaTura } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFolder = path.join(__dirname, "..", "..", "data");
const FILE_NAME = 'dostavneTure.json';


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
export function dodajNovuTuru(): void {
  const data: DostavneTureJson = readJsonFile(FILE_NAME);
  const novaTura: DostavnaTura = {
    id: getNextId(data.ture),
    klinike: [],
  };
  data.ture.push(novaTura);
  writeJsonFile(FILE_NAME, data);
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
