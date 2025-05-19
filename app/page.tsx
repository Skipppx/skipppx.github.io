"use client";

import { Granboard } from "@/services/granboard";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Excel from "exceljs";
import 'animate.css';


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

export default function Home() {
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
      const response = await fetch("data/leaderboard.xlsx");
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    console.log("loaded");

    for (let index = 0; index < 20; index++) {
      const start_rad = 0.05 * Math.PI + index * 0.1 * Math.PI;
      const end_rad = start_rad + 0.1 * Math.PI;
      const colour1 = '#ffb914';
      const colour2 = '#ff9100';

      // double
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = index % 2 === 0 ? colour1 : colour2;
      ctx.beginPath();
      ctx.moveTo(250, 250); 
      ctx.arc(250, 250, 240, start_rad, end_rad, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // outer single
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = index % 2 === 0 ? "#000000" : "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(250, 250); 
      ctx.arc(250, 250, 220, start_rad, end_rad, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // triple
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = index % 2 === 0 ? colour1 : colour2;
      ctx.beginPath();
      ctx.moveTo(250, 250); 
      ctx.arc(250, 250, 140, start_rad, end_rad, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // inner single
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = index % 2 === 0 ? "#000000" : "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(250, 250); 
      ctx.arc(250, 250, 120, start_rad, end_rad, false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // outer bull
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = colour1;
      ctx.beginPath();
      ctx.arc(250, 250, 30, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.stroke();

      // inner bull
      ctx.strokeStyle = "#000000";
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
      <div className="flex min-h-screen flex-col items-center justify-between px-24 py-10 gap-4">
        <div className="flex flex-row gap-4">
        <input
            id="nameInput"
            type="text"
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            placeholder="Enter your name to start."
          >
          </input>
          <input
            id="emailInput"
            type="text"
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            placeholder="Enter your email (optional)."
          >
          </input>
          </div>
        <canvas ref={canvasRef} width={500} height={500} />
        <div className="items-center">
          <button
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            onClick={onConnectionTest}
          >
            {connectionState}
          </button>
        </div>
        <Link
          href="/leaderboard"
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        >
          Click here for Leaderboard
        </Link>
      </div>
    </main>
  );
}
