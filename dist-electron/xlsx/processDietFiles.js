import { promises as fsp } from 'fs';
import path from 'path';
import XlsxPopulate from 'xlsx-populate';
import hideRow from './hideRow.js';
import { removeDiets } from './removeDiets.js';
const processDietFiles = async (dietFilters, tableParams, folderPath) => {
    const files = await fsp.readdir(folderPath);
    for (const fileName of files) {
        const filePath = path.join(folderPath, fileName);
        try {
            const workbook = await XlsxPopulate.fromFileAsync(filePath);
            const sheet = workbook.sheet(0);
            const kopiraneGrupe = new Set();
            let currentRow = tableParams.firstRow;
            let totalSum = 0;
            let totalSumRow = null;
            while (true) {
                const dietCell = sheet.cell(`${tableParams.dietColumn}${currentRow}`);
                const dietName = dietCell.value();
                if (!dietName ||
                    typeof dietName !== 'string' ||
                    dietName.toLowerCase().includes(tableParams.lastRowTitle.toLowerCase())) {
                    totalSumRow = currentRow;
                    break;
                }
                let hasMatch = false;
                for (const filter of dietFilters) {
                    if (!filter?.title || !Array.isArray(filter.keywords))
                        continue;
                    const hasKeyword = filter.keywords.some(keyword => dietName.toUpperCase().includes(keyword.toUpperCase()));
                    if (hasKeyword) {
                        hasMatch = true;
                        if (!kopiraneGrupe.has(filter.title)) {
                            const ext = path.extname(filePath);
                            const base = path.basename(filePath, ext);
                            const dir = path.dirname(filePath);
                            const copyFilePath = path.join(dir, `${base} - ${filter.title}${ext}`);
                            await fsp.copyFile(filePath, copyFilePath);
                            kopiraneGrupe.add(filter.title);
                            await removeDiets(copyFilePath, filter, tableParams);
                        }
                        hideRow(sheet, currentRow);
                    }
                }
                if (!hasMatch) {
                    const amountCell = sheet.cell(`${tableParams.quantityColumn}${currentRow}`);
                    const rawValue = amountCell.value();
                    const amount = parseFloat(String(rawValue));
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
};
export default processDietFiles;
