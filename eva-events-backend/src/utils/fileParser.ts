import csv from 'csv-parser';
import XLSX from 'xlsx';
import { Readable } from 'stream';

export const parseFile = (file: Express.Multer.File): Promise<any[]> => {
  const buffer = file.buffer;
  const extension = file.mimetype;

  if (extension.includes('csv')) {
    return parseCSV(buffer);
  } else if (extension.includes('spreadsheetml') || extension.includes('excel')) {
    return parseExcel(buffer);
  } else {
    return Promise.reject(new Error('Unsupported file format'));
  }
};

const parseCSV = (buffer: Buffer): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const stream = Readable.from(buffer.toString());

    stream.pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

const parseExcel = (buffer: Buffer): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};
