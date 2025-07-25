import XlsxPopulate from 'xlsx-populate';
import hideRow from './hideRow.js';
import { hasKeyword } from '../util.js';
export async function removeDiets(copyFilePath, filterGroup, tableParams) {
    const { dietColumn, quantityColumn, firstRow, lastRowTitle } = tableParams;
    const workbook = await XlsxPopulate.fromFileAsync(copyFilePath);
    const sheet = workbook.sheet(0);
    let currentRow = firstRow;
    let totalSumRow = null;
    let totalSum = 0;
    while (true) {
        const dietCell = sheet.cell(`${dietColumn}${currentRow}`);
        const dietName = dietCell.value()?.toString();
        if (!dietName)
            break;
        if (typeof dietName === 'string' &&
            dietName.toLowerCase().includes(lastRowTitle.toLowerCase())) {
            totalSumRow = currentRow;
            break;
        }
        const hasKeywordData = hasKeyword(filterGroup, dietName);
        if (!hasKeywordData) {
            hideRow(sheet, currentRow);
        }
        else {
            const amountCell = sheet.cell(`${quantityColumn}${currentRow}`);
            const rawValue = amountCell.value();
            const amount = parseFloat(String(rawValue));
            if (!isNaN(amount)) {
                totalSum += amount;
            }
        }
        currentRow++;
    }
    if (totalSumRow) {
        sheet.cell(`${quantityColumn}${totalSumRow}`).value(totalSum);
    }
    try {
        await workbook.toFileAsync(copyFilePath);
    }
    catch (err) {
        console.error('Greška prilikom pisanja fajla:', err);
    }
}
