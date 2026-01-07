declare module "xlsx" {
  export interface WorkSheet {
    [key: string]: any;
    "!ref"?: string;
  }

  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [key: string]: WorkSheet };
  }

  export function read(data: ArrayBuffer, options?: { type: string }): WorkBook;
  export function write(
    workbook: WorkBook,
    options?: { bookType?: string; type: string }
  ): ArrayBuffer;
  export function writeFile(
    workbook: WorkBook,
    filename: string,
    options?: { bookType?: string }
  ): void;

  export namespace utils {
    function sheet_to_json(
      worksheet: WorkSheet,
      options?: { header: number }
    ): any[][];
    function decode_range(range: string): {
      s: { r: number; c: number };
      e: { r: number; c: number };
    };
    function encode_cell(cell: { r: number; c: number }): string;
    function book_new(): WorkBook;
    function aoa_to_sheet(data: any[][]): WorkSheet;
    function book_append_sheet(
      workbook: WorkBook,
      worksheet: WorkSheet,
      sheetName: string
    ): void;
  }
}
