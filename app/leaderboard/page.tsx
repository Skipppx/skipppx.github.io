/* eslint-disable */
"use client";
import { Granboard } from "@/services/granboard";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Excel, { CellValue, Worksheet } from "exceljs";

export default function Home() {

  var tablestart = '<table><th>Position</th>';
  var tableend = '</table>';
  var position = 1;
  const workbook = new Excel.Workbook();
  const workbook2 = new Excel.Workbook();


  const saveWorkbookToServer = async (workbook: Excel.Workbook) => {
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const base64Data = Buffer.from(buffer).toString("base64");

      const response = await fetch("/api/save-leaderboard", {
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
  const saveWinnerWorkbookToServer = async (workbook2: Excel.Workbook) => {
    try {
      const buffer = await workbook2.xlsx.writeBuffer();
      const base64Data = Buffer.from(buffer).toString("base64");

      const response = await fetch("/api/save-pastwinners", {
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

   function addWeeks (weeks: number, date = new Date()) {  
    date.setDate(date.getDate() + weeks * 7)
  
    return date
  }
  const readWinnersDataFromFile = (data: ArrayBuffer) => {
      workbook2.xlsx
        .load(data)
        .then(async (workbook2) => {
          var newDate = new Date();
          var oldDate;
          var recentDate;
          workbook2.eachSheet((sheet2) => {
            sheet2.eachRow(async (row, rowIndex) => {
              if (rowIndex ===2) {
                // console.log('MOST RECENT DATE PAST WINNERS ' + row.getCell(4).value);
                //date of the most recent past winner
                // use this to reset every 7 days
                const cellValue = row.getCell(4).value;
                oldDate = cellValue instanceof Date ? cellValue : undefined;
                if (oldDate) {
                  var checkWeek = addWeeks(1, oldDate);
                  // if it has been more than or exactly 7 days since the last winner
                  if (checkWeek <= newDate) {
                    // console.log('It has been 7 days or more - resetting');
                    const response1 = await fetch("data/leaderboard.xlsx");
                    if (!response1.ok) {
                      throw new Error(`Failed to fetch file: ${response1.statusText}`);
                    }
                    const arrayBuffer = await response1.arrayBuffer();
                    workbook.xlsx
                    .load(arrayBuffer)
                    .then(async (workbook) => {
                      var winnerName: string;
                      var winnerEmail: string;
                      var winnerScore: number;

                      workbook.eachSheet(async (sheet) => {
                        sheet.eachRow((row, rowIndex) => {
                          if (rowIndex === 2) {
                            row.eachCell((cell, cellIndex) => {
                              //name
                              if (cellIndex === 1) {
                                winnerName = typeof cell.value === 'string' ? cell.value : '';
                              }
                              //email
                              if (cellIndex === 2) {
                                if (typeof cell.value == 'object' && cell.value !== null) {
                                  for (const [key, value] of Object.entries(cell.value)) {
                                    if (key === 'text') {
                                      winnerEmail = (value.richText[0].text);
                                    }
                                  }
                                } else if (typeof cell.value == 'string' && cell.value !== null) {
                                  winnerEmail = cell.value;
                                }
                              }
                              //score
                              if (cellIndex === 3) {
                                winnerScore = typeof cell.value === 'number' ? cell.value : 0;
                              }
                            });
                          }
                        });
                        // console.log('newdate ' + newDate);
                        // console.log(new Date().toLocaleDateString('en-GB'))
                        var winner = [winnerName, winnerScore, winnerEmail, newDate];
                        if (winnerName && winnerEmail && winnerScore) {
                         sheet2.spliceRows(2, 0, winner);
                        } 
                        saveWinnerWorkbookToServer(workbook2);
                        await sheet.eachRow((row, rowIndex) => {
                          var newRows = sheet.getSheetValues().slice(1);
                          sheet.eachRow((row, rowIndex) => {
                            if (rowIndex !== 1 ) {
                              sheet.spliceRows(2, rowIndex); // Clear existing rows
                            }
                          })
                          saveWorkbookToServer(workbook);                        })
                      })
                    })
                  } else {
                    // console.log('Not yet 7 days');
                  }
                } else {
                  console.log('Invalid oldDate, cannot add weeks');
                }
              }
            });
        });
        })
      };

  const readDataFromFile = (data: ArrayBuffer) => {
    workbook.xlsx
      .load(data)
      .then(async (workbook) => {
        if (!document.querySelector("table")) {
        workbook.eachSheet((sheet) => {
          //sort rows by score
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
          sortColumn(sheet, 3, true, 2, sheet.rowCount);

          // Save the updated workbook to the server
          saveWorkbookToServer(workbook);

          // Generate HTML table
          sheet.eachRow((row, rowIndex) => {
            if (rowIndex === 1) {
              row.eachCell((cell, cellIndex) => {
                //dont show email or date
                if (cellIndex !== 2 && cellIndex !== 4) {
                  tablestart += `<th>${cell.value}</th>`;
                }
              });
              tablestart += "</tr>";
            }
            else {
              tablestart += "<tr><td>" + position + "</td>";
              position++;
              row.eachCell((cell, cellIndex) => {
                if (cellIndex !== 4) {
                if (cellIndex === 3) {
                  // if (!row.getCell(2).value || row.getCell(2).value == null) {
                  //   tablestart += `<td id='email`+rowIndex+`'>N/A</td>`;
                  // } 
                  tablestart += `<td id='score`+rowIndex+`'>${cell.value}</td>`;
                }
                else if (cellIndex === 2) { // if email it returns as object so check and get value
                    // if (typeof cell.value == 'object' && cell.value !== null) {
                    //     for (const [key, value] of Object.entries(cell.value)) {
                    //       if (key === 'text') {
                    //         tablestart += `<td id='email`+rowIndex+`'>${value.richText[0].text}</td>`;
                    //       }
                    //     }
                    // } else if (typeof cell.value == 'string' && cell.value !== null) {
                    //   tablestart += `<td id='email`+rowIndex+`'>${cell.value}</td>`;
                    // }
                    //  else {
                    //   tablestart += `<td id='email`+rowIndex+`'>N/A</td>`;
                    // }
                }
                else {
                  tablestart += `<td id='name`+rowIndex+`'>${cell.value}</td>`;
                }
              };
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
      const response = await fetch("data/leaderboard.xlsx");
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      readDataFromFile(arrayBuffer);
    } catch (error) {
      console.error("Error loading file:", error);
    }  };
  useEffect(() => {
    loadFileFromPath();
  }, []);

  const loadWinnersFileFromPath = async () => {
    try {
      const response = await fetch("data/pastwinners.xlsx");
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      readWinnersDataFromFile(arrayBuffer);
    } catch (error) {
      console.error("Error loading file:", error);
    }
  };
  useEffect(() => {
    loadWinnersFileFromPath();
  }, []);

  

  return (    <main className="flex min-h-screen flex-col items-start gap-4 px-24 py-10">
      <div className="w-full h-20 text-white font-medium rounded-lg text-4xl px-5 py-2.5 text-left">
        This Week's Leaderboard
      </div>
      <div id="tableLeaderboard">
      </div>
      <div className="grid grid-cols-2">
      <Link
        href="/"
        className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
      >
        Home
      </Link>
      </div>
    </main>
  );
}
