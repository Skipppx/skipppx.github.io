/* eslint-disable */
import { CreateSegment, Segment, SegmentID } from "./boardinfo";
import { useEffect, useRef, useState } from "react";
import Excel from "exceljs";
import Swal from "sweetalert2";
// import moment from 'moment';
// moment.locale('en');

const GRANBOARD_UUID = "442f1570-8a00-9a28-cbe1-e1d4212d53eb";
let hitsTaken: number = 1;
let totalScore: number = 0;

const SEGMENT_MAPPING = {
  "50-46-51-64": SegmentID.INNER_1,
  "50-46-52-64": SegmentID.TRP_1,
  "50-46-53-64": SegmentID.OUTER_1,
  "50-46-54-64": SegmentID.DBL_1,
  "57-46-49-64": SegmentID.INNER_2,
  "57-46-48-64": SegmentID.TRP_2,
  "57-46-50-64": SegmentID.OUTER_2,
  "56-46-50-64": SegmentID.DBL_2,
  "55-46-49-64": SegmentID.INNER_3,
  "55-46-48-64": SegmentID.TRP_3,
  "55-46-50-64": SegmentID.OUTER_3,
  "56-46-52-64": SegmentID.DBL_3,
  "48-46-49-64": SegmentID.INNER_4,
  "48-46-51-64": SegmentID.TRP_4,
  "48-46-53-64": SegmentID.OUTER_4,
  "48-46-54-64": SegmentID.DBL_4,
  "53-46-49-64": SegmentID.INNER_5,
  "53-46-50-64": SegmentID.TRP_5,
  "53-46-52-64": SegmentID.OUTER_5,
  "52-46-54-64": SegmentID.DBL_5,
  "49-46-48-64": SegmentID.INNER_6,
  "49-46-49-64": SegmentID.TRP_6,
  "49-46-51-64": SegmentID.OUTER_6,
  "52-46-52-64": SegmentID.DBL_6,
  "49-49-46-49-64": SegmentID.INNER_7,
  "49-49-46-50-64": SegmentID.TRP_7,
  "49-49-46-52-64": SegmentID.OUTER_7,
  "56-46-54-64": SegmentID.DBL_7,
  "54-46-50-64": SegmentID.INNER_8,
  "54-46-52-64": SegmentID.TRP_8,
  "54-46-53-64": SegmentID.OUTER_8,
  "54-46-54-64": SegmentID.DBL_8,
  "57-46-51-64": SegmentID.INNER_9,
  "57-46-52-64": SegmentID.TRP_9,
  "57-46-53-64": SegmentID.OUTER_9,
  "57-46-54-64": SegmentID.DBL_9,
  "50-46-48-64": SegmentID.INNER_10,
  "50-46-49-64": SegmentID.TRP_10,
  "50-46-50-64": SegmentID.OUTER_10,
  "52-46-51-64": SegmentID.DBL_10,
  "55-46-51-64": SegmentID.INNER_11,
  "55-46-52-64": SegmentID.TRP_11,
  "55-46-53-64": SegmentID.OUTER_11,
  "55-46-54-64": SegmentID.DBL_11,
  "53-46-48-64": SegmentID.INNER_12,
  "53-46-51-64": SegmentID.TRP_12,
  "53-46-53-64": SegmentID.OUTER_12,
  "53-46-54-64": SegmentID.DBL_12,
  "48-46-48-64": SegmentID.INNER_13,
  "48-46-50-64": SegmentID.TRP_13,
  "48-46-52-64": SegmentID.OUTER_13,
  "52-46-53-64": SegmentID.DBL_13,
  "49-48-46-51-64": SegmentID.INNER_14,
  "49-48-46-52-64": SegmentID.TRP_14,
  "49-48-46-53-64": SegmentID.OUTER_14,
  "49-48-46-54-64": SegmentID.DBL_14,
  "51-46-48-64": SegmentID.INNER_15,
  "51-46-49-64": SegmentID.TRP_15,
  "51-46-50-64": SegmentID.OUTER_15,
  "52-46-50-64": SegmentID.DBL_15,
  "49-49-46-48-64": SegmentID.INNER_16,
  "49-49-46-51-64": SegmentID.TRP_16,
  "49-49-46-53-64": SegmentID.OUTER_16,
  "49-49-46-54-64": SegmentID.DBL_16,
  "49-48-46-49-64": SegmentID.INNER_17,
  "49-48-46-48-64": SegmentID.TRP_17,
  "49-48-46-50-64": SegmentID.OUTER_17,
  "56-46-51-64": SegmentID.DBL_17,
  "49-46-50-64": SegmentID.INNER_18,
  "49-46-52-64": SegmentID.TRP_18,
  "49-46-53-64": SegmentID.OUTER_18,
  "49-46-54-64": SegmentID.DBL_18,
  "54-46-49-64": SegmentID.INNER_19,
  "54-46-48-64": SegmentID.TRP_19,
  "54-46-51-64": SegmentID.OUTER_19,
  "56-46-53-64": SegmentID.DBL_19,
  "51-46-51-64": SegmentID.INNER_20,
  "51-46-52-64": SegmentID.TRP_20,
  "51-46-53-64": SegmentID.OUTER_20,
  "51-46-54-64": SegmentID.DBL_20,
  "56-46-48-64": SegmentID.BULL,
  "52-46-48-64": SegmentID.DBL_BULL,
  "66-84-78-64": SegmentID.RESET_BUTTON,
  "79-85-84-64": SegmentID.MISS,
};

const saveWorkbookToServer = async (workbook: Excel.Workbook) => {
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const base64Data = Buffer.from(buffer).toString("base64");
      console.log('saving leaderboard sheet');

      const response = await fetch('/api/save-leaderboard', {
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


const readDataFromFile = (data: ArrayBuffer, item: any) => {
  const workbook = new Excel.Workbook();
  workbook.xlsx
    .load(data)
    .then(async (workbook) => {
      workbook.eachSheet((sheet) => {
       sheet.addRow(item);
       console.log('addrow');
    })})
    .catch((error) => {
      console.error("Error reading Excel file:", error);
    });
  }

const loadFileFromPath = async (item: any) => {
  try {
    console.log('loading leader sheet from Google Cloud Storage');
    const response = await fetch("https://storage.googleapis.com/kid-a/leaderboard.xlsx");
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    readDataFromFile(arrayBuffer, item);
  } catch (error) {
    console.error("Error loading file from Google Cloud Storage:", error);
  }
};
    


export class Granboard {
  private readonly bluetoothConnection: BluetoothRemoteGATTCharacteristic;

  public segmentHitCallback?: (segment: Segment) => void;

  public static async ConnectToBoard(): Promise<Granboard> {
    const boardBluetooth = await navigator.bluetooth.requestDevice({
      filters: [{ services: [GRANBOARD_UUID] }],
    });

    if (!boardBluetooth || !boardBluetooth.gatt) {
      throw new Error("This PC's Bluetooth could not find the board. Please make sure the board is connected.");
    }

    if (!boardBluetooth.gatt.connected) {
      await boardBluetooth.gatt.connect();
    }

    const service = await boardBluetooth.gatt.getPrimaryService(GRANBOARD_UUID);

    const boardCharacteristic = (await service.getCharacteristics()).find(
      (characteristic) => characteristic.properties.notify
    );

    if (!boardCharacteristic) {
      throw new Error("This PC's Bluetooth could not find the board. Please make sure the board is connected.");
    }

    const board = new Granboard(boardCharacteristic);

    await boardCharacteristic.startNotifications();

    return board;
  }

  private constructor(bluetoothConnection: BluetoothRemoteGATTCharacteristic) {
    this.bluetoothConnection = bluetoothConnection;

    this.bluetoothConnection.addEventListener(
      "characteristicvaluechanged",
      this.onSegmentHit.bind(this)
    );
  }

  private async onSegmentHit() {
    const nameInputElement = document.querySelector('#nameInput') as HTMLInputElement | null;
    if (!nameInputElement || !nameInputElement.placeholder) {
      Swal.fire({
        title: "Who's Playing?",
        html:
        '<span class="swal-red">Please get your darts ready, and remove any remaining on the board!</span>' + 
        '<input id="swal-input1" class="swal2-input" placeholder="Name">' +
          '<input id="swal-input2" class="swal2-input" placeholder="Email (Optional)">',
        focusConfirm: false,
        preConfirm: () => {
          return [
            (document.getElementById('swal-input1') as HTMLInputElement)?.value || "",
            (document.getElementById('swal-input2') as HTMLInputElement)?.value || "",
          ]
        }
      }).then((result) => {
        //reset hits & total
        const allResultsSpans = document.getElementsByClassName('spanResult');
        Array.from(allResultsSpans).forEach(element => {
          element.innerHTML = '';
        });
        const totalSpan = document.getElementById('spanTotal');
        if (totalSpan) {
          totalSpan.innerHTML = '';
        }

        if (result.value) {
            const nameInput = document.getElementById('nameInput') as HTMLInputElement || "";
            const emailInput = document.getElementById('emailInput') as HTMLInputElement || "";
            if (nameInput) {
              nameInput.innerHTML = result.value[0];
              nameInput.placeholder = result.value[0];
            }
            if (emailInput) {
              emailInput.innerHTML = result.value[1];
              emailInput.placeholder = result.value[1];
            }
        }
      });
    }
    if (!document.querySelector('.swal2-backdrop-show')) {
      if (hitsTaken < 7) {
        if (!this.bluetoothConnection.value) {
          return; // There is no new value
        }

        const segmentUID = new Uint8Array(
          this.bluetoothConnection.value.buffer
        ).join("-");
        const segmentID = (SEGMENT_MAPPING as any)[segmentUID]; // There is probably a type safe way without resulting to "any"

        if (segmentID !== undefined) {
          var segmentString = segmentID.toString()
          this.segmentHitCallback?.(CreateSegment(segmentID));

          hitsTaken += 1;
          var value = CreateSegment(segmentID)['Value'];
          totalScore += value;

          const dialog = document.querySelector("dialog");
          const nameInput = document.querySelector("#nameInput");
          const emailInput = document.querySelector("#emailInput");
          const name = nameInput ? (nameInput as HTMLInputElement).placeholder : "";
          const email = emailInput ? (emailInput as HTMLInputElement).placeholder : "";

          const resultId = 'spanResult' + JSON.stringify(hitsTaken - 1)
          const resultBox = document.getElementById(resultId);
          const totalBox = document.getElementById('spanTotal');

          if (resultBox) {
            resultBox.textContent = JSON.stringify(value);
          }

          if (totalBox) {
            totalBox.textContent = JSON.stringify(totalScore);
          }

          if (dialog) {
            dialog.querySelector("#nameSpan")!.textContent = "Name: " + name;
            dialog.querySelector("#hitSpan")!.textContent = "Last Hit: " + value;
            dialog.querySelector("#scoreSpan")!.textContent = "Current Total Score: " + totalScore;
            dialog.querySelector("#dartsSpan")!.textContent = "Darts Remaining: " + (7 - hitsTaken);
            // dialog.show();
          } else {
            console.log("Dialog element not found.");
          }

          if (hitsTaken > 6) {
            Swal.fire ({
              title: 'Out of Darts, ' + name + '!',
              text: 'Your score was: ' + totalScore +  '. \n\nThis has been added to the leaderboard. Want to play again?',
              icon: 'warning',
              showConfirmButton: true,
              showCancelButton: true,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No'
            }).then((result) => {
              if (result.isConfirmed) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'center',
                    iconColor: 'green',
                    customClass: {
                      popup: 'colored-toast',
                    },
                    showConfirmButton: false,
                    timer: 10000,
                    timerProgressBar: true,
                  })
                Toast.fire({
                      icon: 'warning',
                      title: 'Remove the previous darts now, and get ready to throw!',
                    });
                // do nothing
                // let timerInterval: string | number | NodeJS.Timeout | undefined;
                //   Swal.fire({
                //     title: "Go!",
                //     html: "Begin throwing more darts to continue!",
                //     timer: 1000,
                //     timerProgressBar: true,
                //     didOpen: () => {
                //       Swal.showLoading();
                //       const popup = Swal.getPopup();
                //       const timer = popup ? popup.querySelector("b") : null;
                //       timerInterval = setInterval(() => {
                //         if (timer) {
                //           timer.textContent = `${Swal.getTimerLeft()}`;
                //         }
                //       }, 100);
                //     },
                //     willClose: () => {
                //       clearInterval(timerInterval);
                //     }
                //   }).then((result) => {
                //     /* Read more about handling dismissals below */
                //     if (result.dismiss === Swal.DismissReason.timer) {
                //       console.log("I was closed by the timer");
                //     }
                //   });
              } else {
                Swal.fire({
                      title: "Who's Playing?",
                      html:
                      '<span class="swal-red">Please get your darts ready, and remove any remaining on the board!</span>' + 
                      '<input id="swal-input1" class="swal2-input" placeholder="Name">' +
                        '<input id="swal-input2" class="swal2-input" placeholder="Email (Optional)">',
                      focusConfirm: false,
                      preConfirm: () => {
                        return [
                          (document.getElementById('swal-input1') as HTMLInputElement)?.value || "",
                          (document.getElementById('swal-input2') as HTMLInputElement)?.value || "",
                        ]
                      }
                    }).then((result) => {
                      //reset hits & total
                      const allResultsSpans = document.getElementsByClassName('spanResult');
                      Array.from(allResultsSpans).forEach(element => {
                        element.innerHTML = '';
                      });
                      const totalSpan = document.getElementById('spanTotal');
                      if (totalSpan) {
                        totalSpan.innerHTML = '';
                      }

                      if (result.value) {
                          const nameInput = document.getElementById('nameInput') as HTMLInputElement || "";
                          const emailInput = document.getElementById('emailInput') as HTMLInputElement || "";
                          if (nameInput) {
                            nameInput.innerHTML = result.value[0];
                            nameInput.placeholder = result.value[0];
                          }
                          if (emailInput) {
                            emailInput.innerHTML = result.value[1];
                            emailInput.placeholder = result.value[1];
                          }
                      }
                    });
              }
            });
            loadFileFromPath([name, email, totalScore, new Date().toLocaleDateString('en-GB')]);
            console.log('loading leader sheet');
            const response = await fetch("https://storage.googleapis.com/kid-a/leaderboard.xlsx");
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.statusText}`);
              }
            const arrayBuffer = await response.arrayBuffer();
            const workbook = new Excel.Workbook();
            workbook.xlsx
              .load(arrayBuffer)
              .then(async (workbook) => {
                workbook.eachSheet((sheet) => {
                  var nameExists = false;
                  var emailExists = false;
                  var scoreExists = false;
                  var dateExists = false;

                  // find out if record exists, if not dont add it
                  sheet.eachRow((row, rowIndex) => {
                    row.eachCell((cell, cellIndex) => {
                      if (cellIndex === 1 && cell.value === name) {
                        nameExists = true;
                        console.log('NAME EXISTS');
                      }
                      if (cellIndex === 2 && cell.value === email) {
                        emailExists = true;
                        console.log('EMAIL EXISTS');
                      }
                      if (cellIndex === 3 && cell.value === totalScore) { 
                        scoreExists = true;
                        console.log('SCORE EXISTS');
                      }
                      if (cellIndex === 4 && cell.value === new Date().toLocaleDateString('en-GB')) {
                        dateExists = true;
                        console.log('DATE EXISTS');
                      }
                    });
                  });
                  if (nameExists && emailExists && scoreExists && dateExists) {
                    // console.log('Record already exists, not adding a new one.');
                  }
                  else {
                      sheet.addRow([name, email, totalScore, new Date().toLocaleDateString('en-GB')]);
                  saveWorkbookToServer(workbook);
                  console.log('ADDING NEW RECORD')
                  }
                  totalScore = 0;
                  hitsTaken = 1;
                  //reset hits & total
                  const allResultsSpans = document.getElementsByClassName('spanResult');
                  Array.from(allResultsSpans).forEach(element => {
                    element.innerHTML = '';
                  });
                  const totalSpan = document.getElementById('spanTotal');
                  if (totalSpan) {
                    totalSpan.innerHTML = '';
                  }
                })})
              .catch((error) => {
                console.error("Error reading Excel file:", error);
              });
          }

        } else {
          // console.log('Unknown segment: ' + segmentUID);
        }
      }
      else {
      hitsTaken = 1;
      totalScore = 0;
      Swal.fire({
        title: "Who's Playing?",
        html:
        '<span class="swal-red">Please get your darts ready, and remove any remaining on the board!</span>' + 
        '<input id="swal-input1" class="swal2-input" placeholder="Name">' +
          '<input id="swal-input2" class="swal2-input" placeholder="Email (Optional)">',
        focusConfirm: false,
        preConfirm: () => {
          return [
            (document.getElementById('swal-input1') as HTMLInputElement)?.value || "",
            (document.getElementById('swal-input2') as HTMLInputElement)?.value || "",
          ]
        }
      }).then((result) => {
        //reset hits & total
        const allResultsSpans = document.getElementsByClassName('spanResult');
        Array.from(allResultsSpans).forEach(element => {
          element.innerHTML = '';
        });
        const totalSpan = document.getElementById('spanTotal');
        if (totalSpan) {
          totalSpan.innerHTML = '';
        }

        if (result.value) {
            const nameInput = document.getElementById('nameInput') as HTMLInputElement || "";
            const emailInput = document.getElementById('emailInput') as HTMLInputElement || "";
            if (nameInput) {
              nameInput.innerHTML = result.value[0];
              nameInput.placeholder = result.value[0];
            }
            if (emailInput) {
              emailInput.innerHTML = result.value[1];
              emailInput.placeholder = result.value[1];
            }
        }
      });
    }
  };
  }
}
