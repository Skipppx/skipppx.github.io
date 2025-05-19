import { NextApiRequest, NextApiResponse } from "next";
import * as Excel from "exceljs";
import path from "path";
import fs from "fs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { workbookData } = req.body;

    // Recreate the workbook from the sent data
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(Buffer.from(workbookData, "base64") as unknown as Excel.Buffer);

    // Define the file path to save the workbook
    const filePath = path.join(process.cwd(), "public/data/pastwinners.xlsx");

    // Ensure the directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // Save the workbook to the file system
    await workbook.xlsx.writeFile(filePath);

    res.status(200).json({ message: "File saved successfully" });
  } catch (error) {
    console.error("Error saving file:", error);
    res.status(500).json({ error: "Failed to save file" });
  }
}
