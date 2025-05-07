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
    const filePath = getFilePath(fileName);
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
}
export function writeJsonFile(fileName, data) {
    const filePath = getFilePath(fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
export function appendJsonItem(fileName, newItem) {
    const items = readJsonFile(fileName);
    items.push(newItem);
    writeJsonFile(fileName, items);
}
export function updateJsonItemById(fileName, id, updatedFields) {
    const items = readJsonFile(fileName);
    const updated = items.map(item => item.id === id ? { ...item, ...updatedFields } : item);
    writeJsonFile(fileName, updated);
}
export function deleteJsonItemById(fileName, id) {
    const items = readJsonFile(fileName);
    const filtered = items.filter(item => item.id !== id);
    writeJsonFile(fileName, filtered);
}
export function addKlinikaToTura(fileName, turaId, klinikaId) {
    const ture = readJsonFile(fileName);
    const updated = ture.map(tura => tura.id === turaId && !tura.klinike.includes(klinikaId)
        ? { ...tura, klinike: [...tura.klinike, klinikaId] }
        : tura);
    writeJsonFile(fileName, updated);
}
export function removeKlinikaFromTura(fileName, turaId, klinikaId) {
    const ture = readJsonFile(fileName);
    const updated = ture.map(tura => tura.id === turaId
        ? { ...tura, klinike: tura.klinike.filter(id => id !== klinikaId) }
        : tura);
    writeJsonFile(fileName, updated);
}
