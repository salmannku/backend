import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { UploadsHelpers } from '../helpers/uploads.helpers';
import { CommonEnums } from '../enums/common.enums';
import { CommonUtils } from './common.utils';
const createExcelFromJson = async (jsonData: any[], fileName: string,extendedPath:string="exportFolder") => {
  const outputDir = path.join('/public/static',extendedPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, fileName +'.xlsx');

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const workbook = XLSX.utils.book_new();
  const flattenedData = jsonData.map(data => flattenJson(data));
  const worksheetData = convertToWorksheetData(flattenedData);
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, filePath);

  const uploadResp = await UploadsHelpers.uploadFileToStorage({
    file: {
      originalname: fileName + '.xlsx',
      size: fs.statSync(filePath).size,
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: fs.readFileSync(filePath)
    }
  });

  console.log(`Excel file uploaded to server at ${uploadResp.file_url}`);
  return uploadResp.file_url?.replace("/public/", "").replace("public/","");
};

const flattenJson = (data: any, parentKey: string = '', result: any = {}) => {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (Array.isArray(data[key])) {
        result[newKey] = data[key].map((item: any) => JSON.stringify(item)).join(', ');
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        flattenJson(data[key], newKey, result);
      } else {
        result[newKey] = data[key];
      }
    }
  }
  return result;
};

const convertToWorksheetData = (flattenedData: any[]) => {
  const headers = Array.from(new Set(flattenedData.flatMap(Object.keys)));
  const worksheetData = [headers];

  flattenedData.forEach((item) => {
    const row = headers.map((header) => item[header] || '');
    worksheetData.push(row);
  });

  return worksheetData;
};

export const uploadStaticFiles = async (params: {
  file: any
  user_id?: string
  event_id?: string
  file_name?: string
}) => {
  try {
    let uploadPath = CommonEnums.uploadPaths.static;
    const fileSize = params.file.size
    const fileName = params.file.originalname
    const filetype = params.file.mimetype
    await CommonUtils.checkAndCreateDirectory(uploadPath)

    console.log('filetype', filetype)

    let extension = params.file.originalname.split('.').pop()

    let filePath = ''

    let ref = `${fileName}`

    filePath = `${uploadPath}/${ref}`

    const { buffer, originalname } = params.file

    await fs.writeFileSync(`${uploadPath}/${ref}`, buffer);
    let values: any = {
      file_name: fileName,
      file_size: fileSize,
      file_url: filePath,
      bucket: ''
    }
    return values;
  } catch (error) {
    throw (error)
  }
}

export const createExcelFromJsonWithoutUpload = async (jsonData: any[], fileName: string,extendedPath:string="exportFolder") => {
  const outputDir = path.join('/public',extendedPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, fileName +'.xlsx');

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const workbook = XLSX.utils.book_new();
  const flattenedData = jsonData.map(data => flattenJson(data));
  const worksheetData = convertToWorksheetData(flattenedData);
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, filePath);
  console.log(`Excel file uploaded to server at ${filePath}`);
  return filePath;
};

export { createExcelFromJson };
