import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import dietFilters from './utils/diet-filters.json' assert { type: 'json' };
import { removeDiets } from './removeDiets.js';
import XlsxPopulate from 'xlsx-populate';
import hideRow from './hideRow.js';
const folderPath = './excel_fajlovi';
const tableParams = {
    dietColumn: "A",
    quantityColumn: "C",
    firstRow: 12,
    lastRowTitle: "ukupno:"
};
fs.readdir(folderPath, async (err, files) => {
    if (err) {
        console.error('Greška pri čitanju foldera:', err);
        return;
    }
    for (const fileName of files) {
        let totalSumRow = null;
        let totalSum = 0;
        const filePath = path.join(folderPath, fileName);
        try {
            const workbook = await XlsxPopulate.fromFileAsync(filePath);
            const sheet = workbook.sheet(0);
            const kopiraneGrupe = new Set();
            let currentRow = tableParams.firstRow;
            while (true) {
                const dietCell = sheet.cell(`${tableParams.dietColumn}${currentRow}`);
                const dietName = dietCell.value();
                if (!dietName ||
                    typeof dietName !== 'string' ||
                    dietName.toLowerCase().includes(tableParams.lastRowTitle)) {
                    totalSumRow = currentRow;
                    break;
                }
                let hasMatch = false;
                for (const filter of dietFilters) {
                    if (!filter)
                        continue;
                    const { shortTitle, keywords } = filter;
                    if (!Array.isArray(keywords) || !shortTitle)
                        continue;
                    const hasKeyword = keywords.some(keyword => dietName.toUpperCase().includes(keyword.toUpperCase()));
                    if (hasKeyword) {
                        hasMatch = true;
                        if (!kopiraneGrupe.has(shortTitle)) {
                            const ext = path.extname(filePath);
                            const base = path.basename(filePath, ext);
                            const dir = path.dirname(filePath);
                            const copyFilePath = path.join(dir, `${base} - ${shortTitle}${ext}`);
                            await fsp.copyFile(filePath, copyFilePath);
                            kopiraneGrupe.add(shortTitle);
                            await removeDiets(copyFilePath, filter, tableParams);
                        }
                        hideRow(sheet, currentRow);
                    }
                }
                if (!hasMatch) {
                    const amountCell = sheet.cell(`${tableParams.quantityColumn}${currentRow}`);
                    const amount = parseFloat(amountCell.value());
                    if (!isNaN(amount)) {
                        totalSum += amount;
                    }
                }
                currentRow++;
            }
            if (totalSumRow) {
                sheet.cell(`${tableParams.quantityColumn}${totalSumRow}`).value(totalSum);
            }
            await workbook.toFileAsync(filePath);
        }
        catch (e) {
            console.error(`❌ Greška u fajlu ${fileName}:`, e);
        }
    }
});
