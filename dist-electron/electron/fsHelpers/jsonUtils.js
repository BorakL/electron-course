import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFolder = path.join(__dirname, "..", "..", "data");
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
export function deleteJsonItemById(fileName, id) {
    try {
        const items = readJsonFile(fileName);
        const filtered = items.filter(item => item.id !== id);
        writeJsonFile(fileName, filtered);
    }
    catch (error) {
        console.error(`Greška pri brisanju item-a ID ${id} u fajlu ${fileName}:`, error);
        throw error;
    }
}
export function addKlinikaToTura(fileName, turaId, klinikaId) {
    try {
        const ture = readJsonFile(fileName);
        const updated = ture.map(tura => tura.id === turaId && !tura.klinike.includes(klinikaId)
            ? { ...tura, klinike: [...tura.klinike, klinikaId] }
            : tura);
        writeJsonFile(fileName, updated);
    }
    catch (error) {
        console.error(`Greška pri dodavanju klinike ID ${klinikaId} u turu ID ${turaId}:`, error);
        throw error;
    }
}
export function removeKlinikaFromTura(fileName, turaId, klinikaId) {
    try {
        const ture = readJsonFile(fileName);
        const updated = ture.map(tura => tura.id === turaId
            ? { ...tura, klinike: tura.klinike.filter(id => id !== klinikaId) }
            : tura);
        writeJsonFile(fileName, updated);
    }
    catch (error) {
        console.error(`Greška pri uklanjanju klinike ID ${klinikaId} iz ture ID ${turaId}:`, error);
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
