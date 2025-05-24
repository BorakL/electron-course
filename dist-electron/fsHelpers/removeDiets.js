import XlsxPopulate from 'xlsx-populate';
import hideRow from './hideRow.js';
export async function removeDiets(copyFilePath, filterGroup, tableParams) {
    const { dietColumn, quantityColumn, firstRow, lastRowTitle } = tableParams;
    const workbook = await XlsxPopulate.fromFileAsync(copyFilePath);
    const sheet = workbook.sheet(0);
    let currentRow = firstRow;
    let totalSumRow = null;
    let totalSum = 0;
    while (true) {
        const dietCell = sheet.cell(`${dietColumn}${currentRow}`);
        const dietName = dietCell.value();
        if (!dietName)
            break;
        if (typeof dietName === 'string' &&
            dietName.toLowerCase().includes(lastRowTitle.toLowerCase())) {
            totalSumRow = currentRow;
            break;
        }
        const hasKeyword = filterGroup.keywords.some(keyword => typeof dietName === 'string' &&
            dietName.toUpperCase().includes(keyword.toUpperCase()));
        if (!hasKeyword) {
            hideRow(sheet, currentRow);
        }
        else {
            const amountCell = sheet.cell(`${quantityColumn}${currentRow}`);
            const amount = parseFloat(amountCell.value());
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
        console.error("Greška prilikom pisanja fajla:", err);
    }
}
