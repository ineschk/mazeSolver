"use client"; // Enables client-side rendering

import { useState } from "react";

interface Solution {
  path: number[][];
  expanded_nodes: number[][];
  explanation: string;
}

const mazeData = [
  ["8", "#", "9", "#", "11", "#", "#", "#", "18", "19", "#", "B"],
  [" ", "#", " ", "#", "10", "12", "13", "#", " ", "#", "#", " "],
  ["6", "5", "7", "#", " ", "#", "14", " ", "17", "#", "#", " "],
  ["#", " ", "#", "#", " ", "#", " ", "#", " ", "#", "#", " "],
  ["#", "3", " ", "2", "4", "#", " ", "#", "20", " ", " ", "21"],
  ["#", "#", "#", " ", "#", "#", " ", "#", "#", "#", "#", "#"],
  [" ", " ", " ", " ", "#", "#", " ", " ", " ", " ", " ", " "],
  ["A", " ", " ", "1", "#", "#", "15", " ", " ", " ", " ", "16"],
];

export default function Home() {
  const [algorithm, setAlgorithm] = useState<string | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [expanded, setExpanded] = useState<number[][]>([]);
  const [path, setPath] = useState<number[][]>([]);
  const [step, setStep] = useState(0);

  const solveMaze = async (method: string) => {
    setAlgorithm(method);
    setExpanded([]);
    setPath([]);
    setStep(0);

    try {
      console.log(`Fetching: http://127.0.0.1:8000/solve/${method}`);
      const response = await fetch(`http://127.0.0.1:8000/solve/${method}`);
      const data: Solution = await response.json();
      console.log("Fetched solution:", data);
      setSolution(data);
      animateSearch(data.expanded_nodes, data.path);
    } catch (error) {
      console.error("Error fetching solution:", error);
    }
  };

  const animateSearch = (expandedNodes: number[][], finalPath: number[][]) => {
    let currentExpanded: number[][] = [];
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < expandedNodes.length) {
        currentExpanded.push(expandedNodes[currentStep]);
        setExpanded([...currentExpanded]);
        setStep(currentStep + 1);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setPath(finalPath);
        }, 500);
      }
    }, 100);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Maze Solver 🧩</h1>
      <p className="text-lg text-gray-700">Choose an algorithm to solve the maze:</p>

      <div className="mt-6 flex space-x-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => solveMaze("bfs")}>
          Solve with BFS
        </button>
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => solveMaze("dfs")}>
          Solve with DFS
        </button>
        <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => solveMaze("a_star")}>
          Solve with A*
        </button>
      </div>

      {/* Solution explanation */}
      {solution && (
        <div className="mt-6 p-4 border rounded bg-white shadow-md w-full max-w-lg text-center">
          <h2 className="text-xl font-semibold text-gray-800">Solution ({algorithm?.toUpperCase()})</h2>
          <p className="mt-2 text-gray-600">{solution?.explanation}</p>
        </div>
      )}

      {/* Maze Visualization */}
      <div className="grid gap-1 border p-4 mt-6 bg-white shadow-md" style={{ gridTemplateColumns: `repeat(${mazeData[0].length}, 30px)` }}>
        {mazeData.flatMap((row, i) =>
          row.map((cell, j) => {
            const isWall = cell === "#";
            const isStart = i === 7 && j === 0;
            const isEnd = i === 0 && j === 11;
            const isPath = path.some(([x, y]) => x === i && y === j);
            const isExpanded = expanded.some(([x, y]) => x === i && y === j);

            return (
              <div
                key={`${i}-${j}`}
                className={`w-8 h-8 border flex items-center justify-center
                  ${isWall ? "bg-black" : isPath ? "bg-red-400" : isExpanded ? "bg-gray-300" : "bg-white"}
                  ${isStart ? "bg-green-500 text-white font-bold" : ""} 
                  ${isEnd ? "bg-blue-500 text-white font-bold" : ""}`}>
                {!isWall && !isStart && !isEnd ? cell : ""}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
