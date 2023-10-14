// JavaScript source code
import React, { useState } from 'react';
import axios from 'axios';
import PriorityQueue from 'js-priority-queue';

const gridSize = 20;

const createEmptyGrid = () => {
    return Array.from({length:gridSize}, () => Array(gridSize).fill(0));
};

const heuristic = (a,b) => {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
};

const getNeighbors = (grid, node) => {
    const neighbors = [];
    const directions = [
        { row: -1, col: 0 },
        { row: 1,  col: 0 },
        { row: 0, col: -1 },
        { row: 0,  col: 1 },
    ];

    directions.forEach(dir => {
        const newRow = node.row + dir.row;
        const newCol = node.col + dir.col;
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            neighbors.push({ row: newRow, col: newCol });
        }
    });

    return neighbors;

};

const aStarSearch = (grid, start, goal) => {
    const frontier = new PriorityQueue({ comparator: (a,b) => a.priority - b.priority });
    frontier.queue({ node: start, priority: 0});
    const cameFrom = {};
    const costSoFar = {};
    cameFrom[`${start.row}-${start.col}`] = null;
    costSoFar[`${start.row}-${start.col}`] = 0;

    while (frontier.length) {
        const current = frontier.dequeue().node;

        if (current.row === goal.row && current.col === goal.col) {
            break;
        }
        
        getNeighbors(grid, current).forEach(next => {
            const newCost = costSoFar[`${current.row}-${current.col}`] + 1;
            if (!costSoFar[`${next.row}-${next.col}`] || newCost < costSoFar[`${next.row}-${next.col}`]) {
                costSoFar[`${next.row}-${next.col}`] = newCost;
                const priority = newCost + heuristic(goal, next);
                frontier.queue({node: next, priority: priority });
                cameFrom[`${next.row}-${next.col}`] = current;
            }
        });
    
    }

    return cameFrom;
};

const Visualizer = () => {
    const [grid, setGrid] = useState(createEmptyGrid());
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('AStar');

    const handleCellClick = (row, col) => {
        if (!start) {
            setStart({ row, col });
            const newGrid = [...grid];
            newGrid[row][col] = 1; // Represent start with 1
            setGrid(newGrid);
        } else if (!end) {
            setEnd({ row, col });
            const newGrid = [...grid];
            newGrid[row][col] = 2; // Represent end with 2
            setGrid(newGrid);
        }
    };

    const reconstructPath = (cameFrom, start, end) => {
        let current = end;
        const path = [current];

        while (current.row !== start.row || current.col !== start.col) {
            current = cameFrom[`${current.row}-${current.col}`];
            path.push(current);
        }

        path.reverse();
        return path;
    }
    
    // A simple pathfinding algorithm just to illustrate

    const runAlgorithm = () => {
        if (!start || !end) return;
        
        const cameFrom = aStarSearch(grid, start, end);
        const path = reconstructPath(cameFrom, start, end);
        
        if (path.length > 2) {
            const newGrid = [...grid];
            path.forEach(node => {
                if ((node.row !== start.row || node.col !== start.col)
                && (node.row !== end.row || node.col !== end.col)) {
            newGrid[node.row][node.col] = 3;
                }
            });
        setGrid(newGrid);
    } else {
        console.error("Couldn't find a valid path between start and end points.");
    }
};
    const handleSavePath = async () => {
        const cameFrom = aStarSearch(grid, start, end);
        const path = reconstructPath(cameFrom, start, end);

        try {
            const response = await axios.post('http://localhost:5000/api/path', { path });
            console.log(response.data);
        } catch (error) {
            console.error("Error saving path:", error);
        }
    };

    const resetGrid = () => {
        setGrid(createEmptyGrid)();
        setStart(null);
        setEnd(null);
    };

    return (
        <div>
            <select value={selectedAlgorithm} onChange={(e) => setSelectedAlgorithm(e.target.value)}>
                <option value="AStar">A*</option>
                {/*Adding more algorithms as options here */}
            </select>
            <button onClick={runAlgorithm}>Run Algorithm</button>
            <button onClick={handleSavePath}>Save Path</button>
            <button onClick={resetGrid}>Reset Grid</button>

        
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 20px)`}}>
            {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        style={{
                            width: 20,
                            height: 20,
                            border: '1px solid black',
                            backgroundColor: cell === 0 ? 'white' : cell === 1 ? 'blue' : cell === 2 ? 'red' : 'green'
                        }}
                    />
                ))
            )}
        </div>
    </div>
    );
}
export default Visualizer;
