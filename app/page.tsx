"use client";

import { Granboard } from "../services/granboard";
import Link from "next/link";
import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import Excel from "exceljs";
import 'animate.css';
import Swal from "sweetalert2";
// import { list } from '@vercel/blob';


type Player = {
  id: number;
  firstName: string;
  score: number;
};

const getCellValue = (row: Excel.Row, cellIndex: number) => {
  const cell = row.getCell(cellIndex);
  return cell.value ? cell.value.toString() : "";
};

const readDataFromFile = (data: ArrayBuffer) => {
  const workbook = new Excel.Workbook();
  workbook.xlsx
    .load(data)
    .then((workbook) => {
      // const sheet = workbook.worksheets[0];
      // console.log(sheet, "sheet instance");
      // sheet.sort.apply([ 
      //       {
      //           key: 2,
      //           ascending: true
      //       },
      //   ], true);
      // console.log(workbook, "workbook instance");

      workbook.eachSheet((sheet, id) => {
        sheet.eachRow((row, rowIndex) => {
          // console.log(row.values, rowIndex);
        });
      });
    })
    .catch((error) => {
      console.error("Error reading Excel file:", error);
    });
};

export default async function Home() {
  // const [responseblob, setResponseBlob] = useState<any>(null);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await list();
  //       setResponseBlob(response);
  //       console.log(response);
  //     } catch (error) {
  //       console.error("Error fetching blobs:", error);
  //     }
  //   };

  //   fetchData();
  // }, []);
  // console.log(responseblob);

  const [granboard, setGranboard] = useState<Granboard>();
  const [connectionState, setConnectionState] = useState<
    "Click Here To Connect" | "Connecting..." | "Connected" | "Error - please click to retry."
  >("Click Here To Connect");

  const onConnectionTest = async () => {
    setConnectionState("Connecting...");

    try {
      setGranboard(await Granboard.ConnectToBoard());
      setConnectionState("Connected");
      console.log(Granboard);
    } catch (error) {
      console.error(error);
      setConnectionState("Error - please click to retry.");
    }
  };

  const loadFileFromPath = async () => {
    try {
      const response = await fetch("https://storage.googleapis.com/kid-a/leaderboard.xlsx", {
        mode: "cors", // Ensure CORS mode is enabled
      });
      if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
      const arrayBuffer = await response.arrayBuffer();
      readDataFromFile(arrayBuffer);
    } catch (error) {
      console.error("Error loading file:", error);
    }
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);



  useEffect(() => {
    Swal.fire({
      title: "Who's Playing?",
    });
      Swal.fire({
      title: "Who's Playing?",
      html:
      '<span class="swal-red">Please get your darts ready, and remove any remaining on the board!</span> <br>' + 
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
      if (result.value) {
          console.log("Result: " + result.value);
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

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    for (let index = 0; index < 20; index++) {
      const start_rad = 0.05 * Math.PI + index * 0.1 * Math.PI;
      const end_rad = start_rad + 0.1 * Math.PI;
      // const colour1 = '#ffb914';
      const colour1 = '#ffffff';
      const colour2 = '#ffb914';
      // const colour2 = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeStyle = "white";

      // double
      ctx.fillStyle = index % 2 === 0 ? colour1 : colour2;
      ctx.beginPath();
      ctx.moveTo(250, 250); 
      ctx.arc(250, 250, 240, start_rad, end_rad, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // outer single
      ctx.fillStyle = index % 2 === 0 ? "#000000" : "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(250, 250); 
      ctx.arc(250, 250, 220, start_rad, end_rad, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // triple
      ctx.fillStyle = index % 2 === 0 ? colour1 : colour2;
      ctx.beginPath();
      ctx.moveTo(250, 250); 
      ctx.arc(250, 250, 140, start_rad, end_rad, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // inner single
      ctx.fillStyle = index % 2 === 0 ? "#000000" : "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(250, 250); 
      ctx.arc(250, 250, 120, start_rad, end_rad, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // outer bull
      ctx.fillStyle = colour1;
      ctx.beginPath();
      ctx.arc(250, 250, 30, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.stroke();

      // inner bull
      ctx.fillStyle = "#e62236";
      ctx.beginPath();
      ctx.arc(250, 250, 10, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    loadFileFromPath();
  }, []);

  return (
    <main>
      <dialog style={
        { 
        position: "absolute", 
        top: 0, 
        right: 0, 
        marginRight: '1em', 
        marginTop: '1em',
        padding: '1em',
        border: 'none',
        backgroundColor: 'transparent',
        color: 'black',
        fontSize: '1.8em',
        textAlign: 'right',
        fontFamily: 'monospace',
      }
        }>
        <span className="animate__animated animate__bounce" id="nameSpan">Name: </span>
        <br/>
        <span className="animate__animated animate__bounce" id="hitSpan">Last Hit: </span>
        <br/>
        <span className="animate__animated animate__bounce" id="scoreSpan">Current Total Score: </span>
        <br/>
        <span className="animate__animated animate__bounce" id="dartsSpan">Remaining Darts: </span>
      </dialog>
      <div className="flex">
        <div className="inputsDiv flex flex-row">
        <span id="blackboxName"></span>
        <span id="blackboxEmail"></span>
          <input
              id="nameInput"
              type="text"
              className="content-name text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              placeholder="Name"
            >
            </input>
            <input
              id="emailInput"
              type="text"
              className="content-name text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              placeholder="Email"
            >
            </input>
          </div>
          <div id="blackBoxes"> 
          <div id="blackboxHit1"><span className="spanHit">Throw 1: </span><span className="spanResult" id="spanResult1"> </span></div>
          <div id="blackboxHit2"><span className="spanHit">Throw 2: </span><span className="spanResult spanResult2" id="spanResult2"> </span></div>
          <div id="blackboxHit3"><span className="spanHit">Throw 3: </span><span className="spanResult spanResult3" id="spanResult3"> </span></div>
          <div id="blackboxHit4"><span className="spanHit">Throw 4: </span><span className="spanResult spanResult4" id="spanResult4"> </span></div>
          <div id="blackboxHit5"><span className="spanHit">Throw 5: </span><span className="spanResult spanResult5" id="spanResult5"> </span></div>
          <div id="blackboxHit6"><span className="spanHit">Throw 6: </span><span className="spanResult spanResult6" id="spanResult6"> </span></div>
          <div id="totalBox"><span id="titleTotal">Total</span><span id="spanTotal"></span></div>
          </div>
        <canvas className={'canvasdb'} ref={canvasRef} width={500} height={500} />
          <Link
          href="/leaderboard"
          id="taptoLeader"
        >
          <span id='tapLeaderboard'>Tap for Leaderboard!</span>
        </Link>
        <div className="items-center">
          <button
            className="connectButton text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            onClick={onConnectionTest}
          >
            {connectionState}
          </button>
        </div>
      </div>
    </main>
  );
}
