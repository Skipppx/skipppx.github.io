/* eslint-disable */
"use client";
import { Granboard } from "@/services/granboard";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Excel, { CellValue, Worksheet } from "exceljs";
import { json } from "stream/consumers";
import 'animate.css';

export default function Home() {

  var tablestart = '<table>';
  var tableend = '</table>';
  const saveWorkbookToServer = async (workbook: Excel.Workbook) => {
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const base64Data = Buffer.from(buffer).toString("base64");
      console.log('saving winner sheet');

      const response = await fetch('/api/save-pastwinners', {
        mode: 'cors',
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workbookData: base64Data }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save file: ${response.statusText}`);
      }

      console.log("File saved successfully on the server.");
    } catch (error) {
      console.error("Error saving file to server:", error);
    }
  };

  const readDataFromFile = (data: ArrayBuffer) => {
    const workbook = new Excel.Workbook();
    workbook.xlsx
      .load(data)
      .then(async (workbook) => {
        if (!document.querySelector("table")) {
        workbook.eachSheet((sheet) => {

          var newRows = sheet.getSheetValues().slice(2); // Skip header row
          newRows.sort((a: any, b: any) => (b[4] ?? 0) - (a[4] ?? 0)); // Sort descending by date

          function sortColumn(worksheet: Worksheet, column: number, h2l: boolean = true, startRow: number = 1, endRow?: number): void {
            endRow = endRow || worksheet.actualRowCount;
            column--;
        
            const sortFunction = (a: CellValue[], b: CellValue[]): number => {
                if (a[column] === b[column]) {
                    return 0;
                }
                else {
                    if(h2l) {
                        return ((a[column] ?? 0) > (b[column] ?? 0) && h2l) ? -1 : 1;
                    }
                    else {
                        return ((a[column] ?? 0) < (b[column] ?? 0)) ? -1 : 1;
                    }
                }
            }
        
            let rows: CellValue[][] = [];
            for (let i = startRow; i <= (endRow ?? worksheet.actualRowCount); i++) {
                let row: CellValue[] = [];
                for (let j = 1; j <= worksheet.columnCount; j++) {
                    row.push(worksheet.getRow(i).getCell(j).value);
                }
                rows.push(row); 
            }
            rows.sort(sortFunction);
        
            // Remove all rows from worksheet then add all back in sorted order
            worksheet.spliceRows(startRow, endRow, ...rows);
        }
          sortColumn(sheet, 4, true, 2, sheet.rowCount);
            

          // Save the updated workbook to the server
          saveWorkbookToServer(workbook);

          // Generate HTML table
          sheet.eachRow((row, rowIndex) => {
            console.log('row values ' + row.values);
            if (rowIndex === 1) {
              row.eachCell((cell, cellIndex) => {
                tablestart += `<th>${cell.value}</th>`;
              });
              tablestart += "</tr>";
            }
            else {
              tablestart += "<tr>";
              row.eachCell((cell, cellIndex) => {
                if (cellIndex === 4) {
                  // tablestart += `<td id='date`+cellIndex+`'>${cell.value}</td>`;
                  var strValue = JSON.stringify(cell.value)
                  const splitDate = strValue.split("T");
                  let output = splitDate[0].split(`"`)[1];
                  let output2 = output.split(`-`);
                  let finalOutput = output2[2] + "-" + output2[1] + "-" + output2[0];
                  tablestart += `<td id='date`+cellIndex+`'>${finalOutput}</td>`;
                }
                else if (cellIndex === 2) {
                  tablestart += `<td id='score`+cellIndex+`'>${cell.value}</td>`;
                }
                else if (cellIndex === 3) {
                  if (typeof cell.value == 'object' && cell.value !== null) {
                    for (const [key, value] of Object.entries(cell.value)) {
                      if (key === 'text') {
                        if (!!value.richText[0].text) {
                          tablestart += `<td id='email`+rowIndex+`'>${value.richText[0].text}</td>`;
                        } else {
                          tablestart += `<td id='email`+rowIndex+`'>N/A</td>`;
                        }
                      }
                    }
                  } else if (typeof cell.value == 'string' && cell.value !== null) {
                    tablestart += `<td id='email`+rowIndex+`'>${cell.value}</td>`;
                  }
                  else {
                    tablestart += `<td id='email`+rowIndex+`'>N/A</td>`;
                  }
                }
                else {
                  tablestart += `<td id='name`+cellIndex+`'>${cell.value}</td>`;
                }
              });
              tablestart += "</tr>";
            }
          });
          var tableLeaderboard = document.getElementById('tableLeaderboard');
          if (tableLeaderboard) {
            tableLeaderboard.innerHTML = tablestart + tableend;
          }
        });
      };
      })
      .catch((error) => {
        console.error("Error reading Excel file:", error);
      });
  };

  const loadFileFromPath = async () => {
    try {
      console.log('loading leader sheet from Google Cloud Storage');
      const response = await fetch("https://storage.googleapis.com/kid-a/pastwinners.xlsx", {
        mode: "cors", // Ensure CORS mode is enabled
        // method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      readDataFromFile(arrayBuffer);
    } catch (error) {
      console.error("Error loading file from Google Cloud Storage:", error);
    }
  
  };
  useEffect(() => {
    loadFileFromPath();
  }, []);

  

  return (
    <main className="flex min-h-screen flex-col items-start gap-4 px-24 py-10">
      <div className="w-full h-20 text-white font-medium rounded-lg text-4xl px-5 py-2.5 text-left">
      </div>
      <div id="tableLeaderboard">
      </div>
      <div className="grid grid-cols-2">
      </div>
    </main>
  );
}
