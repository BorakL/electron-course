import { promises as fsp } from 'fs'; 
import path from 'path';
import XlsxPopulate from 'xlsx-populate';
import { TableParams } from './processDietFiles.js';

const addLicensePlate = async (
    folderPath: string,
    tableParams: TableParams
): Promise<void> => { 
    const files = await fsp.readdir(folderPath);

    for (const fileName of files) {
        const filePath = path.join(folderPath, fileName);

        try {
            const workbook = await XlsxPopulate.fromFileAsync(filePath);
            const sheet = workbook.sheet(0);

            // Ako fileName sadrži 'van RFZO', briši sadržaj između firstRow i lastRowTitle
            if (fileName.toLowerCase().includes('van rfzo')) {
                let currentRow = tableParams.firstRow;
                const lastRowTitle = tableParams.lastRowTitle.toLowerCase();

                // Prolazimo redove dok ne nađemo red gde piše lastRowTitle
                while (true) {
                    const firstCell = sheet.cell(currentRow, 1); // uzimamo prvu kolonu za poređenje
                    const cellValue = firstCell.value();
                    if (typeof cellValue === 'string' && cellValue.toLowerCase() === lastRowTitle) {
                        break; // Stigli smo do reda UKUPNO
                    }

                    // Brišemo sve ćelije u tom redu
                    const lastCol = sheet.usedRange().endCell().columnNumber();
                    for (let col = 1; col <= lastCol; col++) {
                        sheet.cell(currentRow, col).value(null);
                    }

                    currentRow++;
                }
            }

            // Snimamo fajl
            await workbook.toFileAsync(filePath);
        } catch (e) {
            console.error(`❌ Greška u fajlu ${fileName}:`, e);
        }
    }
};

export default addLicensePlate;
