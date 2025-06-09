import XlsxPopulate, { Workbook, Worksheet } from 'xlsx-populate';
import hideRow from './hideRow.js';
import { hasKeyword } from '../util.js';

interface FilterGroup {
  title: string;
  keywords: string[];
}

interface TableParams {
  dietColumn: string;
  quantityColumn: string;
  firstRow: number;
  lastRowTitle: string;
}

export async function removeDiets(
  copyFilePath: string,
  filterGroup: FilterGroup,
  tableParams: TableParams
): Promise<void> {
  const { dietColumn, quantityColumn, firstRow, lastRowTitle } = tableParams;

  const workbook: Workbook = await XlsxPopulate.fromFileAsync(copyFilePath);
  const sheet: Worksheet = workbook.sheet(0);

  let currentRow = firstRow;
  let totalSumRow: number | null = null;
  let totalSum = 0;

  while (true) {
    const dietCell = sheet.cell(`${dietColumn}${currentRow}`);
    const dietName = dietCell.value()?.toString();

    if (!dietName) break;

    if (
      typeof dietName === 'string' &&
      dietName.toLowerCase().includes(lastRowTitle.toLowerCase())
    ) {
      totalSumRow = currentRow;
      break;
    }

  const hasKeywordData = hasKeyword(filterGroup,dietName)

    if (!hasKeywordData) {
      hideRow(sheet, currentRow);
    } else {
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
  } catch (err) {
    console.error('Greška prilikom pisanja fajla:', err);
  }
}
