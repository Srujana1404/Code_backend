import * as xlsx from "xlsx";
import { Request, Response } from "express";
import path from "path";

import dbQuery from "../services/db";
import * as logger from "../services/logger";
import { responses } from "../services/common";
import { format } from "date-fns/format";

const supportedExtensions = [".xlsx", ".csv"];
const tables = [
  "timetable",
  "faculty",
  "studentinfo",
  "subjects",
];

function processCSVStudents(data: string, username: string, branch: string, batch: string) {
  if (username === 'admin' || username === 'fmegcet') {
    return data
      .trim()
      .split("\n")
      .map((row) =>
        row
          .trim()
          .split(",")
          .filter((cell) => cell !== null && cell !== "")
          .map((cell) => (cell ? `'${cell.trim()}'` : "NULL"))
          .concat(`${parseInt(batch)}`, "'undone'", "'undone'", `md5('${row.split(",")[0]}')`)
      )
      .map((row) => `(${row.join(",")})`);
  } else {
    return data
      .trim()
      .split("\n")
      .map((row) =>
        row
          .trim()
          .split(",")
          .filter((cell) => cell !== null && cell !== "")
          .map((cell) => (cell ? `'${cell.trim()}'` : "NULL"))
          .concat(`'${branch}'`, `${parseInt(batch)}`, "'undone'", "'undone'", `md5('${row.split(",")[0]}')`)
      )
      .map((row) => `(${row.join(",")})`);
  }
}

function processCSVTimeTable(data: string, branch: string, username: string) {
  if (username === 'admin' || username === 'fmegcet') {
    return data
      .trim()
      .split("\n")
      .map((row) =>
        row
          .trim()
          .split(",")
          .map((cell) => (cell ? `'${cell.trim()}'` : "NULL"))
      )
      .map((row) => `(${row.join(",")})`);
  } else {
    return data
      .trim()
      .split("\n")
      .map((row) =>
        row
          .trim()
          .split(",")
          .map((cell) => (cell ? `'${cell.trim()}'` : "NULL"))
          .concat(`'${branch}'`)
      )
      .map((row) => `(${row.join(",")})`);
  }
}

function processCSVFile(data: string): string[] {
  // Split by lines (rows)
  const rows = data.trim().split(/\r?\n/);

  return rows.map((row) => {
    // Split using regex to handle quoted commas
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        if (row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current);

    // Escape quotes for SQL
    const escaped = cells.map((cell) =>
      cell
        ? `'${cell.trim().replace(/'/g, "''")}'`
        : 'NULL'
    );

    return `(${escaped.join(",")})`;
  });
}



export async function uploadFromLoc(location: string, tableName: string, branch: string, batch: string, username: string) {
  try {
    const workbook = xlsx.readFile(location);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);


    try {
      if (tableName === "studentinfo") {
        const rows = processCSVStudents(data, username, branch, batch);
        let [_header, ...values] = rows;
        const query = `INSERT IGNORE INTO ${tableName} VALUES ${values.join(", ")};`;
        const result = await dbQuery(query);
        logger.log("info", `Restoring ${tableName} done! \nWith result:`, result);
        return responses.DoneMSG;
      } else if (tableName === "mcq_questions") {
        const rows = processCSVFile(data);
        let [_header, ...values] = rows;
        const result = await dbQuery(
          `INSERT IGNORE INTO ${tableName} (question_text) VALUES ${values.join(", ")};`
        );
        logger.log("info", `Restoring ${tableName} done! \nWith result:`, result);
        return responses.DoneMSG;
      } else if (tableName === "mcq_options") {
        const rows = processCSVFile(data);
        let [_header, ...values] = rows;
        const result = await dbQuery(
          `INSERT IGNORE INTO ${tableName} (question_id , option_text , is_correct)  VALUES ${values.join(", ")};`
        );
        logger.log("info", `Restoring ${tableName} done! \nWith result:`, result);
        return responses.DoneMSG;
      } else if (tableName === "contest_mcq_map") {
        const rows = processCSVFile(data);
        let [_header, ...values] = rows;
        const result = await dbQuery(
          `INSERT IGNORE INTO ${tableName} (contest_id,question_id, marks,negative_marks  ) VALUES ${values.join(", ")};`
        );
        logger.log("info", `Restoring ${tableName} done! \nWith result:`, result);
        return responses.DoneMSG;
      } else if (tableName === "electives") {
        const rows = processCSVFile(data);
        let [_header, ...values] = rows;
        const result = await dbQuery(
          `INSERT IGNORE INTO ${tableName} VALUES ${values.join(", ")};`
        );
        logger.log("info", `Restoring ${tableName} done! \nWith result:`, result);
        return responses.DoneMSG;
      }
      else if (tableName === "cf1") {
        const rows = processCSVFile(data);
        let [_header, ...values] = rows;
        const result = await dbQuery(
          `INSERT IGNORE INTO ${tableName} VALUES ${values.join(", ")};`
        );
        logger.log("info", `Restoring ${tableName} done! \nWith result:`, result);
        return responses.DoneMSG;
      }
      else if (tableName === "cf2") {
        const rows = processCSVFile(data);
        let [_header, ...values] = rows;
        const result = await dbQuery(
          `INSERT IGNORE INTO ${tableName} VALUES ${values.join(", ")};`
        );
        logger.log("info", `Restoring ${tableName} done! \nWith result:`, result);
        return responses.DoneMSG;
      }
    } catch (err) {
      logger.log(
        "error",
        `Restoring ${tableName} failed: error inserting data into MySQL:`,
        err
      );
      return responses.ErrorWhileDBRequest;
    }
  } catch (err) {
    logger.log("error", "Error reading file:", err);
    return responses.ErrorWhileReadingOrProcessing;
  }
}

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const { tableName } = req.params;
    const branch = req.body.branchInToken;
    const batch = req.body.batch;
    const username = req.body.usernameInToken;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || !files['file'] || files['file'].length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = files['file'][0];
    const fileExtension = path.extname(file.originalname);

    if (!supportedExtensions.includes(fileExtension)) {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    const result = await uploadFromLoc(file.path, `${tableName}`, `${branch}`, `${batch}`, `${username}`);
    if (result === responses.DoneMSG) {
      return res.json({ done: true });
    } else {
      return res.status(500).json({ error: 'Upload failed' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
