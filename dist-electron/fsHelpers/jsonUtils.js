import fs from "fs";
import path from 'path';
import { dialog } from "electron";
const appFolder = process.cwd(); // ili path.dirname(process.execPath)
//Development
const dataFolder = path.join(appFolder, "src/electron", "data");
//Production
// const dataFolder = path.join(appFolder, 'data');
const FILE_NAME = 'dostavneTure.json';
if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}
export const getFilePath = (fileName) => {
    return path.join(dataFolder, fileName);
};
export function readJsonFile(fileName) {
    try {
        const filePath = getFilePath(fileName);
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content);
    }
    catch (error) {
        console.error(`Greška pri čitanju fajla ${fileName}:`, error);
        throw error;
    }
}
export function writeJsonFile(fileName, data) {
    try {
        const filePath = getFilePath(fileName);
        console.log("filePath", filePath);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
    catch (error) {
        console.error(`Greška pri pisanju fajla ${fileName}:`, error);
        throw error;
    }
}
export function updateJsonItemById(fileName, id, updatedFields) {
    try {
        const items = readJsonFile(fileName);
        const updated = items.map(item => item.id === id ? { ...item, ...updatedFields } : item);
        writeJsonFile(fileName, updated);
    }
    catch (error) {
        console.error(`Greška pri ažuriranju item-a ID ${id} u fajlu ${fileName}:`, error);
        throw error;
    }
}
export function deleteJsonItemById(fileName, id, idKey) {
    try {
        const items = readJsonFile(fileName);
        const filtered = items.filter(item => item[idKey] !== id);
        writeJsonFile(fileName, filtered);
    }
    catch (error) {
        console.error(`Greška pri brisanju item-a ID ${id} u fajlu ${fileName}:`, error);
        throw error;
    }
}
export function appendJsonItem(fileName, newItem) {
    try {
        const items = readJsonFile(fileName);
        items.push(newItem);
        writeJsonFile(fileName, items);
    }
    catch (error) {
        console.error(`Greška pri dodavanju novog item-a u fajl ${fileName}:`, error);
        throw error;
    }
}
// Dodavanje nove ture sa unikatnim ID-jem i praznom listom klinika
export function dodajNovuTuru() {
    const data = readJsonFile(FILE_NAME);
    const id = getNextId(data.ture);
    const novaTura = {
        id,
        klinike: [],
    };
    data.ture.push(novaTura);
    writeJsonFile(FILE_NAME, data);
    return id;
}
// Brisanje ture i vraćanje njenih klinika u neraspoređene
export function obrisiTuru(id) {
    const data = readJsonFile(FILE_NAME);
    const tura = data.ture.find(t => t.id === id);
    if (!tura)
        throw new Error(`Tura sa ID ${id} ne postoji`);
    // Dodaj sve njene klinike u neraspoređene
    data.nerasporedjeneKlinike.push(...tura.klinike);
    data.ture = data.ture.filter(t => t.id !== id);
    writeJsonFile(FILE_NAME, data);
}
// Dodavanje klinike u postojeću turu
export function dodajKlinikuUTuru(turaId, klinikaId) {
    const data = readJsonFile(FILE_NAME);
    const tura = data.ture.find(t => t.id === turaId);
    if (!tura)
        throw new Error(`Tura sa ID ${turaId} ne postoji`);
    // Ukloni kliniku iz neraspoređenih ako postoji
    data.nerasporedjeneKlinike = data.nerasporedjeneKlinike.filter(id => id !== klinikaId);
    // Dodaj kliniku u turu ako već nije tu
    if (!tura.klinike.includes(klinikaId)) {
        tura.klinike.push(klinikaId);
    }
    writeJsonFile(FILE_NAME, data);
}
// Brisanje klinike iz ture i vraćanje u neraspoređene
export function ukloniKlinikuIzTure(turaId, klinikaId) {
    const data = readJsonFile(FILE_NAME);
    const tura = data.ture.find(t => t.id === turaId);
    if (!tura)
        throw new Error(`Tura sa ID ${turaId} ne postoji`);
    tura.klinike = tura.klinike.filter(id => id !== klinikaId);
    // Dodaj kliniku nazad u neraspoređene ako već nije tamo
    if (!data.nerasporedjeneKlinike.includes(klinikaId)) {
        data.nerasporedjeneKlinike.push(klinikaId);
    }
    writeJsonFile(FILE_NAME, data);
}
// Dodavanje klinike u neraspoređene (ako već nije tamo)
export function dodajKlinikuUNerasporedjene(klinikaId) {
    const data = readJsonFile(FILE_NAME);
    if (!data.nerasporedjeneKlinike.includes(klinikaId)) {
        data.nerasporedjeneKlinike.push(klinikaId);
        writeJsonFile(FILE_NAME, data);
    }
}
// Brisanje klinike iz neraspoređenih
export function ukloniKlinikuIzNerasporedjenih(klinikaId) {
    const data = readJsonFile(FILE_NAME);
    const preDuzina = data.nerasporedjeneKlinike.length;
    data.nerasporedjeneKlinike = data.nerasporedjeneKlinike.filter(id => id !== klinikaId);
    if (data.nerasporedjeneKlinike.length !== preDuzina) {
        writeJsonFile(FILE_NAME, data);
    }
}
// Pomocna funkcija za generisanje ID-ja
function getNextId(ture) {
    const ids = ture.map(t => t.id);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}
export async function ocistiNevazecuKlinikuIzTura(clinickId) {
    const data = readJsonFile(FILE_NAME);
    // Očisti tura.klinike
    data.ture = data.ture.map(tura => ({
        ...tura,
        klinike: tura.klinike.filter(id => id !== clinickId)
    }));
    // Očisti nerasporedjene klinike
    data.nerasporedjeneKlinike = data.nerasporedjeneKlinike.filter(id => id !== clinickId);
    writeJsonFile(FILE_NAME, data);
}
export async function selectFolder() {
    try {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        return result.canceled ? null : result.filePaths[0];
    }
    catch (error) {
        console.log("Greška pri selektovanju foldera", error);
        return null;
    }
}
