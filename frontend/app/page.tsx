"use client";

import { useState, useEffect } from "react";

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
  const [robotPosition, setRobotPosition] = useState<number[] | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const solveMaze = async (method: string) => {
    setAlgorithm(method);
    setExpanded([]);
    setPath([]);
    setStepIndex(0);
    setRobotPosition(null);

    try {
      const response = await fetch(`https://maze-solver-backend.onrender.com/solve/${method}`);
      const data: Solution = await response.json();
      setSolution(data);
      animateSearch(data.expanded_nodes, data.path);
    } catch (error) {
      console.error("Error fetching solution:", error);
    }
  };

  const animateSearch = (expandedNodes: number[][], finalPath: number[][]) => {
    let currentExpanded: number[][] = [];
    let currentStep = 0;

    const expandInterval = setInterval(() => {
      if (currentStep < expandedNodes.length) {
        currentExpanded.push(expandedNodes[currentStep]);
        setExpanded([...currentExpanded]);
        currentStep++;
      } else {
        clearInterval(expandInterval);
        setTimeout(() => {
          setPath(finalPath);
          setRobotPosition(finalPath[0]); // Start the robot at the beginning of the path
          moveRobot(finalPath);
        }, 500);
      }
    }, 100);
  };

  const moveRobot = (path: number[][]) => {
    let index = 0;

    const moveInterval = setInterval(() => {
      if (index < path.length) {
        setRobotPosition(path[index]);
        index++;
      } else {
        clearInterval(moveInterval);
      }
    }, 500); // Robot moves every 500ms
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Maze Solver 🤖</h1>
      <p className="text-lg text-gray-400">Choose an algorithm to solve the maze:</p>

      <div className="mt-6 flex space-x-4">
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded" onClick={() => solveMaze("bfs")}>
          Solve with BFS
        </button>
        <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded" onClick={() => solveMaze("dfs")}>
          Solve with DFS
        </button>
        <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded" onClick={() => solveMaze("a_star")}>
          Solve with A*
        </button>
      </div>

      {solution && (
        <div className="mt-6 p-4 border border-gray-700 rounded bg-gray-800 shadow-md w-full max-w-lg text-center">
          <h2 className="text-xl font-semibold">Solution ({algorithm?.toUpperCase()})</h2>
          <p className="mt-2 text-gray-400">{solution?.explanation}</p>
        </div>
      )}

      <div className="grid gap-1 border border-gray-700 p-4 mt-6 bg-gray-900 shadow-md" style={{ gridTemplateColumns: `repeat(${mazeData[0].length}, 32px)` }}>
        {mazeData.flatMap((row, i) =>
          row.map((cell, j) => {
            const isWall = cell === "#";
            const isStart = i === 7 && j === 0;
            const isEnd = i === 0 && j === 11;
            const isPath = path.some(([x, y]) => x === i && y === j);
            const isExpanded = expanded.some(([x, y]) => x === i && y === j);
            const isRobot = robotPosition && robotPosition[0] === i && robotPosition[1] === j;

            return (
              <div
                key={`${i}-${j}`}
                className={`maze-cell w-8 h-8 border flex items-center justify-center
                  ${isWall ? "bg-gray-700" : isPath ? "bg-red-500" : isExpanded ? "bg-gray-500" : "bg-gray-800"}
                  ${isStart ? "bg-green-500 text-white font-bold" : ""} 
                  ${isEnd ? "bg-blue-500 text-white font-bold" : ""}`}>
                {isRobot ? "🤖" : (!isWall && !isStart && !isEnd ? cell : "")}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
