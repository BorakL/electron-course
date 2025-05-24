import { WorksheetLike } from "xlsx-populate";

const hideRow = (sheet: WorksheetLike, currentRow: number): void => {
  const maxCol = sheet.usedRange().endCell().columnNumber();

  for (let col = 1; col <= maxCol; col++) {
    const cell = sheet.cell(currentRow, col);
    cell.value('');
    cell.style({});
  }

  sheet.row(currentRow).hidden(true);
};

export default hideRow;
