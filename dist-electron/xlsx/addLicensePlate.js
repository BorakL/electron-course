import { promises as fsp } from 'fs';
import path from 'path';
import XlsxPopulate from 'xlsx-populate';
const vanRfzoData = {
    datum: "23-2-2025",
    vanRfzo: {
        "ENDOKRINOLOGIJA": {
            "Opšta dijeta": 2,
            "Posna dijeta": 1
        },
        "OČNO": {
            "Opšta dijeta": 1
        },
        "NEFROLOGIJA": {
            "Pankreatična dijeta": 3
        },
        "ORTOPEDIJA UKC": {
            "Opšta dijeta": 2,
            "Dečija dijeta": 3
        },
        "PULMOLOGIJA": {
            "Opšta dijeta": 1
        }
    }
};
const addLicensePlate = async (folderPath, tableParams) => {
    const files = await fsp.readdir(folderPath);
    const dateMatch = folderPath.match(/(\d{1,2})[-.](\d{1,2})[-.](\d{4})/);
    if (!dateMatch) {
        throw new Error(`❌ Datum nije pronađen u nazivu foldera: ${folderPath}`);
    }
    const [, day, month, year] = dateMatch;
    const folderDate = `${day}-${month}-${year}`;
    const dataDate = typeof vanRfzoData.datum === "string"
        ? vanRfzoData.datum
        : `${vanRfzoData.datum.getDate()}-${vanRfzoData.datum.getMonth() + 1}-${vanRfzoData.datum.getFullYear()}`;
    if (folderDate !== dataDate) {
        throw new Error(`❌ Datum NE ODGOVARA!\nFolder: ${folderDate}\nvanRfzoData: ${dataDate}`);
    }
    for (const fileName of files) {
        const filePath = path.join(folderPath, fileName);
        const match = fileName.match(/^\d+\s+([^-]+?)(?:\s*-\s*.*)?$/);
        const clinickName = match ? match[1].trim() : null;
        try {
            const workbook = await XlsxPopulate.fromFileAsync(filePath);
            const sheet = workbook.sheet(0);
            if (fileName.toLowerCase().includes('van rfzo') && clinickName) {
                // Obriši postojeće redove između firstRow i lastRowTitle
                let currentRow = tableParams.firstRow;
                const lastRowTitle = tableParams.lastRowTitle.toLowerCase();
                while (true) {
                    const firstCell = sheet.cell(currentRow, 1);
                    const value = firstCell.value();
                    if (typeof value === 'string' && value.toLowerCase() === lastRowTitle)
                        break;
                    const lastCol = sheet.usedRange().endCell().columnNumber();
                    for (let col = 1; col <= lastCol; col++) {
                        sheet.cell(currentRow, col).value(null);
                    }
                    currentRow++;
                }
                const vanRfzoDiets = vanRfzoData.vanRfzo[clinickName.toUpperCase()];
                if (vanRfzoDiets) {
                    const diets = Object.entries(vanRfzoDiets);
                    let insertRow = tableParams.firstRow;
                    const neededRows = diets.length;
                    // Otkrivamo (unhide) samo onoliko redova koliko je potrebno
                    for (let i = 0; i < neededRows; i++) {
                        sheet.row(tableParams.firstRow + i).hidden(false);
                    }
                    // Popuni dijete
                    for (const [dietName, quantity] of diets) {
                        sheet.cell(insertRow, 1).value(dietName.toUpperCase());
                        sheet.cell(insertRow, 2).value("KOM");
                        sheet.cell(insertRow, 3).value(quantity);
                        insertRow++;
                    }
                }
            }
            await workbook.toFileAsync(filePath);
        }
        catch (e) {
            console.error(`❌ Greška u fajlu ${fileName}:`, e);
        }
    }
};
export default addLicensePlate;
