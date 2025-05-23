/* eslint-disable */

import { NextApiRequest, NextApiResponse } from "next";
import { Storage } from "@google-cloud/storage";
import * as Excel from "exceljs";
import path from "path";
import fs from "fs";

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || "{}"),
});

const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || "kid-a";
console.log(bucketName);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // if (req.method !== "POST") {
  //   console.log('REQ METHOD ' + req.method);
  //   return res.status(405).json({ error: "Method not allowed" });
  // }
  if (req.method) {
    console.log('REQ METHOD ' + req.method);
  }

  try {
    const { workbookData } = req.body;
    if (!workbookData) {
      console.error("Missing workbookData in request body");
      return res.status(400).json({ error: "Missing workbookData" });
    } 

    // Recreate the workbook from the sent data
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(Buffer.from(workbookData, "base64") as unknown as Excel.Buffer);

    // Generate a buffer for the workbook
    const workbookBuffer = await workbook.xlsx.writeBuffer();

    // Upload the buffer directly to Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const file = bucket.file("leaderboard.xlsx");

    await file.save(new Uint8Array(workbookBuffer), {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      resumable: false, // Ensure the file is overwritten
    });

    await file.setMetadata({
      cacheControl: "no-cache", // Prevent caching issues
    });

    res.status(200).json({ message: "File saved successfully to Google Cloud Storage" });
  } catch (error) {
    console.error("Error saving file:", error);
    res.status(500).json({ error: "Failed to save filea" });
  }

  // try {
  //   const { workbookData } = req.body;

  //   // Recreate the workbook from the sent data
  //   const workbook = new Excel.Workbook();
  //   await workbook.xlsx.load(Buffer.from(workbookData, "base64") as unknown as Excel.Buffer);

  //   // Define the file path to save the workbook
  //   const filePath = path.join(process.cwd(), "public/data/leaderboard.xlsx");

  //   // Ensure the directory exists
  //   fs.mkdirSync(path.dirname(filePath), { recursive: true });

  //   // Save the workbook to the file system
  //   await workbook.xlsx.writeFile(filePath);

  //   res.status(200).json({ message: "File saved successfully" });
  // } catch (error) {
  //   console.error("Error saving file:", error);
  //   res.status(500).json({ error: "Failed to save file" });
  // }
}
