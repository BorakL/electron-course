declare module 'xlsx-populate' {
  export interface Cell {
    value(): string | number | boolean | Date | null;
    value(val: string | number | boolean | Date | null): void;
    style(styleDef: object): void;
  }

  export interface Row {
    hidden(val: boolean): void;
  }

  export interface Worksheet {
    cell(row: number, column: number): Cell;
    cell(address: string): Cell;
    row(row: number): Row;
    usedRange(): {
      endCell(): {
        columnNumber(): number;
      };
    };
  }

  export interface Workbook {
    sheet(index: number): Worksheet;
    toFileAsync(path: string): Promise<void>;
  }

  export interface WorksheetLike {
    usedRange(): {
      endCell(): {
        columnNumber(): number;
      };
    };
    cell(row: number, col: number): {
      value(val?: string): void;
      style(styles: Record<string, unknown>): void;
    };
    row(row: number): {
      hidden(hide: boolean): void;
    };
  }

  const XlsxPopulate: {
    fromFileAsync(filePath: string): Promise<Workbook>;
  };

  export default XlsxPopulate;
}
