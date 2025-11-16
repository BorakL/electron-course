declare module 'xlsx-populate' {
  export interface Cell {
    value(): string | number | boolean | Date | null;
    value(val: string | number | boolean | Date | null): void;
    style(styleDef: object): void;
  }

  export interface Row {
    hidden(val: boolean): void;
    insert(): Row;
  }

  export interface Worksheet {
    cell(row: number, column: number): Cell;
    cell(address: string): Cell;
    lastColumnNumber():number;
    row(row: number): Row;
    usedRange(): {
      endCell(): {
        columnNumber(): number;
      };
    };
    insertRows(row: number, amount: number): void;
    range(startRow: number, startCol: number, endRow: number, endCol: number): Range;
    name(): string;
    name(newName: string): Sheet;
  }

  export interface Workbook {
    sheet(index: number): Worksheet;
    toFileAsync(path: string): Promise<void>;
    sheets(): Sheet[];
    addSheet(name?: string): Sheet;
    deleteSheet(sheet: string | Sheet): void;
  }

  // export interface WorksheetLike {
  //   usedRange(): {
  //     endCell(): {
  //       columnNumber(): number;
  //     };
  //   };
  //   cell(row: number, col: number): {
  //     value(val?: string): void;
  //     style(styles: Record<string, unknown>): void;
  //   };
  //   row(row: number): {
  //     hidden(hide: boolean): void;
  //     value(val?: string): void;
  //   };
  //   range(startRow: number, startCol: number, endRow: number, endCol: number): Range;

  // }

  export interface Range {
    value(): string | number | boolean | Date | null;
    value(val: string | number | boolean | Date | null): void;
    
    // za manipulaciju Range podacima
    values(): (string | number | boolean | Date | null)[][];
    values(array: (string | number | boolean | Date | null)[][]): void;

    clear(): void;
}

  const XlsxPopulate: {
    fromFileAsync(filePath: string): Promise<Workbook>;
  };

  export default XlsxPopulate;
}
