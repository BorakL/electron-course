import path from 'path';
import { dialog } from "electron";
import ExcelJS from 'exceljs';
const appFolder = process.cwd(); // ili path.dirname(process.execPath)
//Development
// const dataFolder = path.join(appFolder, "src/electron","data");
//Production
const dataFolder = path.join(appFolder, 'data');
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
export async function selectFile() {
    try {
        const result = await dialog.showOpenDialog({
            properties: ['openFile']
        });
        return result.canceled ? null : result.filePaths[0];
    }
    catch (error) {
        console.log("Greška pri selektovanju fajla", error);
        return null;
    }
}
//Merdzuj sve excel fajlove iz jednog foldera u jedan excel fajl
import fs from "fs";
export async function mergeExcels(folderPath, outputPath) {
    const filesForCheck = ["BATAJNICA NEFROLOGIJA", "FAKULTET"];
    const mainWorkbook = new ExcelJS.Workbook();
    const files = fs.readdirSync(folderPath)
        .filter((file) => file.endsWith(".xlsx"));
    files.sort((a, b) => {
        const aNum = parseInt(a);
        const bNum = parseInt(b);
        return aNum - bNum;
    });
    const counterMap = {};
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        // Extract number prefix before first space
        const match = file.match(/^(\d+)\s+/);
        if (!match) {
            console.log(`Skipping file (no number prefix): ${file}`);
            continue;
        }
        const prefix = match[1];
        // Prepare counter
        counterMap[prefix] = (counterMap[prefix] ?? 0) + 1;
        const sheetName = `${prefix}-${counterMap[prefix]}${filesForCheck.some(f => file.includes(f)) ? "-Proveri" : ""}`;
        const tempWorkbook = new ExcelJS.Workbook();
        await tempWorkbook.xlsx.readFile(filePath);
        const sourceSheet = tempWorkbook.worksheets[0];
        const targetSheet = mainWorkbook.addWorksheet(sheetName);
        // Copy full sheet
        await copySheet(sourceSheet, targetSheet);
        console.log(`✔ Added sheet: ${sheetName}`);
    }
    mainWorkbook.eachSheet(sheet => {
        sheet.pageSetup = {
            orientation: 'portrait',
            paperSize: 9,
            horizontalCentered: true,
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 1,
            margins: {
                left: 0.25,
                right: 0.25,
                top: 0.4,
                bottom: 0.25,
                header: 0.4,
                footer: 0.25
            }
        };
    });
    await mainWorkbook.xlsx.writeFile(outputPath);
    console.log(`\n🎉 Done! File saved as: ${outputPath}`);
}
/* -----------------------------------------------------------
    COPY SHEET FUNCTION (WITH TYPE ANNOTATIONS)
------------------------------------------------------------ */
async function copySheet(source, target) {
    const tableParams = {
        firstRow: 12,
        lastRowTitle: "UKUPNO:",
    };
    /* ---- FIND LAST ROW FIRST ---- */
    let lastRowNumber = -1;
    for (let r = 1; r <= source.rowCount; r++) {
        const val = source.getRow(r).getCell(1).value?.toString() || "";
        if (val.includes(tableParams.lastRowTitle)) {
            lastRowNumber = r;
            break;
        }
    }
    if (lastRowNumber === -1) {
        lastRowNumber = source.rowCount;
    }
    /* ----- Copy Column Widths ----- */
    source.columns.forEach((col, index) => {
        if (col && typeof col.width === "number") {
            target.getColumn(index + 1).width = col.width * 1.11;
        }
    });
    /* ----- Copy Cells: Values + Style ----- */
    source.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        const newRow = target.getRow(rowNumber);
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const newCell = newRow.getCell(colNumber);
            newCell.value = cell.value;
            // if (cell.style && Object.keys(cell.style).length !== 0) newCell.style = JSON.parse(JSON.stringify(cell.style));
            if (cell.style && Object.keys(cell.style).length !== 0) {
                if (cell.style.font && Object.keys(cell.style.font).length !== 0)
                    newCell.style.font = JSON.parse(JSON.stringify(cell.style.font));
                if (cell.style.border && Object.keys(cell.style.border).length !== 0)
                    newCell.style.border = JSON.parse(JSON.stringify(cell.style.border));
                if (cell.style.fill && Object.keys(cell.style.fill).length !== 0)
                    newCell.style.fill = JSON.parse(JSON.stringify(cell.style.fill));
                if (cell.style.alignment && Object.keys(cell.style.alignment).length !== 0)
                    newCell.style.alignment = JSON.parse(JSON.stringify(cell.style.alignment));
            }
            if (cell.formula) {
                newCell.value = { formula: cell.formula, result: cell.result };
            }
        });
        /* ---- HIDE EMPTY ROWS BETWEEN FIRST ROW AND LAST "UKUPNO:" ROW ---- */
        if (rowNumber >= tableParams.firstRow && rowNumber < lastRowNumber) {
            const value = row.getCell(1).value;
            if (value === null || value === "" || value === undefined) {
                newRow.hidden = true;
            }
        }
        newRow.height = row.height * 1.25;
    });
    target.mergeCells("A1:C1");
}
