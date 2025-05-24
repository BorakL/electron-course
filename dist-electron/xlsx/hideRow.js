const hideRow = (sheet, currentRow) => {
    const maxCol = sheet.usedRange().endCell().columnNumber();
    for (let col = 1; col <= maxCol; col++) {
        const cell = sheet.cell(currentRow, col);
        cell.value('');
        cell.style({});
    }
    sheet.row(currentRow).hidden(true);
};
export default hideRow;
