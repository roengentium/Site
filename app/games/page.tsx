"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  Fog,
  AmbientLight,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  BoxGeometry,
  PlaneGeometry,
  SphereGeometry,
  Vector3,
  Raycaster,
  Clock,
} from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

type GameType = "menu" | "minesweeper" | "snake" | "ticTacToe" | "lightsOut" | "engine3D";

export default function GamesHubPage() {
  const [activeGame, setActiveGame] = useState<GameType>("menu");

  return (
    <main 
      className="relative min-h-screen w-full flex flex-col items-center justify-start py-16 px-4 bg-[#030303] text-zinc-300 select-none antialiased"
      style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
    >
      {/* Shared Background Visual Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat fixed filter grayscale brightness-[0.20] contrast-[1.1]"
        style={{ backgroundImage: "url('https://unsplash.com')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#030303] via-[#030303]/60 to-[#030303] fixed" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] fixed" />

      <div className="z-10 w-full max-w-2xl flex flex-col gap-8">
        
        {/* Navigation Breadcrumbs */}
        <nav className="w-full flex items-center justify-start gap-3 text-xs font-semibold tracking-wide">
          <Link href="/" className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150">Home</Link>
          <span className="text-zinc-800">/</span>
          <Link href="/projects" className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150">Projects</Link>
          <span className="text-zinc-800">/</span>
          <span className="text-zinc-200">Games</span>
        </nav>

        {/* Section Header */}
        <header className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Arcade Subsystem</h1>
          <p className="text-zinc-400 text-sm">A collection of custom sandbox web engines compiled natively for the browser layout.</p>
        </header>

        {/* Core Screen Renderer Box */}
        <div className="w-full rounded-2xl border border-zinc-900/80 bg-zinc-950/50 backdrop-blur-xl p-6 shadow-2xl flex flex-col items-center min-h-[450px] justify-center">
          {activeGame === "menu" && <GameMenu onSelectGame={setActiveGame} />}
          {activeGame === "minesweeper" && <MinesweeperGame onBack={() => setActiveGame("menu")} />}
          {activeGame === "snake" && <SnakeGame onBack={() => setActiveGame("menu")} />}
          {activeGame === "ticTacToe" && <TicTacToeGame onBack={() => setActiveGame("menu")} />}
          {activeGame === "lightsOut" && <LightsOutGame onBack={() => setActiveGame("menu")} />}
          {activeGame === "engine3D" && <Engine3DGame onBack={() => setActiveGame("menu")} />}
        </div>

        {/* System Monitoring Footer */}
        <footer className="w-full flex items-center justify-between text-[11px] text-zinc-600 font-medium tracking-wide border-t border-zinc-900/60 pt-6">
          <div>Active App Target: /games/{activeGame}</div>
          <div>Execution Sandbox: Stable</div>
        </footer>

      </div>
    </main>
  );
}

/* ==========================================
   GAME MODULE: MAIN GRID MENU
   ========================================== */
function GameMenu({ onSelectGame }: { onSelectGame: (game: GameType) => void }) {
  return (
    <div className="w-full grid sm:grid-cols-2 gap-4">
      <button 
        type="button"
        onClick={() => onSelectGame("minesweeper")}
        className="appearance-none text-left p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 text-zinc-200 shadow-none hover:bg-zinc-900/30 hover:border-zinc-800/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <h3 className="font-bold text-sm text-zinc-200 group-hover:text-emerald-400 transition-colors mb-1 font-mono">01. MINESWEEPER</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">Sweep tiles, avoid hidden coordinate logic clusters, and secure the clean field board data topology.</p>
      </button>

      <button 
        type="button"
        onClick={() => onSelectGame("snake")}
        className="appearance-none text-left p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 text-zinc-200 shadow-none hover:bg-zinc-900/30 hover:border-zinc-800/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
      >
        <h3 className="font-bold text-sm text-zinc-200 group-hover:text-cyan-400 transition-colors mb-1 font-mono">02. SNAKE_ARRAY</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">Direct a moving multi-node vector grid coordinate data path to capture localized cluster anomalies.</p>
      </button>

      <button 
        type="button"
        onClick={() => onSelectGame("ticTacToe")}
        className="appearance-none text-left p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 text-zinc-200 shadow-none hover:bg-zinc-900/30 hover:border-zinc-800/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
      >
        <h3 className="font-bold text-sm text-zinc-200 group-hover:text-violet-400 transition-colors mb-1 font-mono">03. TIC_TAC_TOE</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">Place Xs and Os across a 3×3 vector field and win by completing the target row.</p>
      </button>

      <button 
        type="button"
        onClick={() => onSelectGame("lightsOut")}
        className="appearance-none text-left p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 text-zinc-200 shadow-none hover:bg-zinc-900/30 hover:border-zinc-800/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
      >
        <h3 className="font-bold text-sm text-zinc-200 group-hover:text-amber-400 transition-colors mb-1 font-mono">04. LIGHTS_OUT</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">Toggle the square array to shut down the lighting grid and restore the dark matrix.</p>
      </button>

      <button 
        type="button"
        onClick={() => onSelectGame("engine3D")}
        className="appearance-none text-left p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 text-zinc-200 shadow-none hover:bg-zinc-900/30 hover:border-zinc-800/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
      >
        <h3 className="font-bold text-sm text-zinc-200 group-hover:text-sky-400 transition-colors mb-1 font-mono">05. ENGINE_3D</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">Run a Three.js first-person platformer demo with pointer-lock controls and 3D obstacles.</p>
      </button>
    </div>
  );
}

/* ==========================================
   GAME MODULE: MINESWEEPER ENGINE
   ========================================== */
interface Cell {
  r: number; c: number; isMine: boolean; isRevealed: boolean; isFlagged: boolean; count: number;
}

function MinesweeperGame({ onBack }: { onBack: () => void }) {
  const rows = 8; const cols = 8; const mineCount = 10;
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  const initializeBoard = useCallback(() => {
    let newGrid: Cell[][] = Array(rows).fill(null).map((_, r) =>
      Array(cols).fill(null).map((_, c) => ({
        r, c, isMine: false, isRevealed: false, isFlagged: false, count: 0,
      }))
    );

    let placedMines = 0;
    while (placedMines < mineCount) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        placedMines++;
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newGrid[r][c].isMine) continue;
        let neighbors = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (newGrid[r + i]?.[c + j]?.isMine) neighbors++;
          }
        }
        newGrid[r][c].count = neighbors;
      }
    }
    setGrid(newGrid); setGameOver(false); setWin(false);
  }, [rows, cols, mineCount]);

  useEffect(() => { initializeBoard(); }, [initializeBoard]);

  const revealCell = (r: number, c: number) => {
    if (gameOver || win || !grid[r]?.[c] || grid[r][c].isRevealed || grid[r][c].isFlagged) return;
    let nextGrid = grid.map(row => row.map(cell => ({ ...cell })));
    
    if (nextGrid[r][c].isMine) {
      nextGrid.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      }));
      setGrid(nextGrid);
      setGameOver(true);
      return;
    }

    const floodReveal = (row: number, col: number) => {
      if (!nextGrid[row]?.[col] || nextGrid[row][col].isRevealed || nextGrid[row][col].isMine) return;
      nextGrid[row][col].isRevealed = true;
      if (nextGrid[row][col].count === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) floodReveal(row + i, col + j);
        }
      }
    };

    floodReveal(r, c);
    
    let unrevealedSafeCells = 0;
    nextGrid.forEach(row => row.forEach(cell => { if (!cell.isMine && !cell.isRevealed) unrevealedSafeCells++; }));
    
    setGrid(nextGrid);
    if (unrevealedSafeCells === 0) setWin(true);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[320px]">
      <div className="flex justify-between w-full text-xs font-mono text-zinc-500">
        <button type="button" onClick={onBack} className="appearance-none rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-zinc-200 shadow-none hover:bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-colors duration-150">← EXIT</button>
        <span className={gameOver ? "text-rose-500" : win ? "text-emerald-400" : ""}>
          {gameOver ? "CRITICAL_BOOM" : win ? "SECTOR_CLEARED" : "GRID_ACTIVE"}
        </span>
        <button type="button" onClick={initializeBoard} className="appearance-none rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-zinc-200 shadow-none hover:bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-colors duration-150">RESET</button>
      </div>

      <div className="grid grid-cols-8 gap-1 p-2 rounded-xl border border-zinc-900 bg-black/40">
        {grid.map((row, r) => row.map((cell, c) => (
          <button
            key={`${r}-${c}`}
            type="button"
            onClick={() => revealCell(r, c)}
            className={`appearance-none w-8 h-8 rounded text-xs font-mono font-bold flex items-center justify-center border transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 ${
              cell.isRevealed 
                ? "!bg-zinc-900/60 !border-zinc-800 text-zinc-300" 
                : "!bg-zinc-800/40 !border-zinc-800/50 hover:!bg-zinc-700/30 text-transparent"
            }`}
          >
            {cell.isRevealed && cell.isMine ? "💣" : cell.isRevealed && cell.count > 0 ? cell.count : ""}
          </button>
        )))}
      </div>
    </div>
  );
}

/* ==========================================
   GAME MODULE: SNAKE VECTOR ROUTINE
   ========================================== */
type Point = { x: number; y: number };

function SnakeGame({ onBack }: { onBack: () => void }) {
  const gridSize = 15;
  const [snake, setSnake] = useState<Point[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Point>({ x: 3, y: 3 });
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
  const [isDead, setIsDead] = useState(false);
  const [score, setScore] = useState(0);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    while (true) {
      const newFood = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
      if (!currentSnake.some(s => s.x === newFood.x && s.y === newFood.y)) return newFood;
    }
  }, [gridSize]);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 7, y: 7 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection({ x: 1, y: 0 });
    setIsDead(false);
    setScore(0);
  }, [generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "KeyW"].includes(e.code) && direction.y === 0) setDirection({ x: 0, y: -1 });
      if (["ArrowDown", "KeyS"].includes(e.code) && direction.y === 0) setDirection({ x: 0, y: 1 });
      if (["ArrowLeft", "KeyA"].includes(e.code) && direction.x === 0) setDirection({ x: -1, y: 0 });
      if (["ArrowRight", "KeyD"].includes(e.code) && direction.x === 0) setDirection({ x: 1, y: 0 });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (isDead) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const nextHead = { x: head.x + direction.x, y: head.y + direction.y };

        if (nextHead.x < 0 || nextHead.x >= gridSize || nextHead.y < 0 || nextHead.y >= gridSize) {
          setIsDead(true);
          return prevSnake;
        }

        if (prevSnake.some(s => s.x === nextHead.x && s.y === nextHead.y)) {
          setIsDead(true);
          return prevSnake;
        }

        const newSnake = [nextHead, ...prevSnake];

        if (nextHead.x === food.x && nextHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 130);

    return () => clearInterval(interval);
  }, [direction, food, isDead, generateFood]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[300px]">
      <div className="flex justify-between w-full text-xs font-mono text-zinc-500">
        <button type="button" onClick={onBack} className="appearance-none rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-zinc-200 shadow-none hover:bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-colors duration-150">← EXIT</button>
        <span className={isDead ? "text-rose-500 font-bold" : ""}>
          {isDead ? "OVERFLOW_ERR" : `SCORE: ${score}`}
        </span>
        <button type="button" onClick={resetGame} className="appearance-none rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-zinc-200 shadow-none hover:bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-colors duration-150">RESET</button>
      </div>

      <div 
        className="grid bg-black/40 rounded-xl border border-zinc-900 p-1 relative overflow-hidden"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`, 
          width: "260px", 
          height: "260px" 
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, i) => {
          const x = i % gridSize;
          const y = Math.floor(i / gridSize);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;

          return (
            <div 
              key={i} 
              className={`m-[1px] rounded-[2px] transition-colors duration-150 ${
                isSnake 
                  ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
                  : isFood 
                    ? "bg-rose-500" 
                    : "bg-zinc-900/10"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

function TicTacToeGame({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState<string | null>(null);

  const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  const checkWinner = (nextBoard: string[]) => {
    for (const [a, b, c] of winConditions) {
      if (nextBoard[a] && nextBoard[a] === nextBoard[b] && nextBoard[a] === nextBoard[c]) {
        return nextBoard[a];
      }
    }
    return nextBoard.every(cell => cell !== "") ? "Draw" : null;
  };

  const handleClick = (index: number) => {
    if (winner || board[index]) return;
    const nextBoard = [...board];
    nextBoard[index] = currentPlayer;
    const result = checkWinner(nextBoard);
    setBoard(nextBoard);
    setWinner(result);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setCurrentPlayer("X");
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[320px]">
      <div className="flex justify-between w-full text-xs font-mono text-zinc-500">
        <button type="button" onClick={onBack} className="appearance-none rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-zinc-200 shadow-none hover:bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition-colors duration-150">← EXIT</button>
        <span className={winner ? "text-emerald-400 font-bold" : "text-zinc-400"}>
          {winner ? (winner === "Draw" ? "DRAW" : `${winner} WINS`) : `TURN: ${currentPlayer}`}
        </span>
        <button type="button" onClick={resetGame} className="appearance-none rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-zinc-200 shadow-none hover:bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition-colors duration-150">RESET</button>
      </div>

      <div className="grid grid-cols-3 gap-1 w-full max-w-[240px]">
        {board.map((cell, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            className="appearance-none h-20 rounded-xl border border-zinc-800 bg-zinc-900/70 text-3xl font-bold text-zinc-200 hover:bg-zinc-800/80 transition-colors duration-150"
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
}

function LightsOutGame({ onBack }: { onBack: () => void }) {
  const size = 5;
  const [grid, setGrid] = useState<boolean[]>(Array(size * size).fill(false));
  const [solved, setSolved] = useState(false);

  const toggleCell = (index: number) => {
    const nextGrid = [...grid];
    const x = index % size;
    const y = Math.floor(index / size);
    const toggle = (tx: number, ty: number) => {
      if (tx >= 0 && tx < size && ty >= 0 && ty < size) {
        const pos = ty * size + tx;
        nextGrid[pos] = !nextGrid[pos];
      }
    };

    toggle(x, y);
    toggle(x - 1, y);
    toggle(x + 1, y);
    toggle(x, y - 1);
    toggle(x, y + 1);

    setGrid(nextGrid);
    setSolved(nextGrid.every(value => !value));
  };

  const resetGame = () => {
    const start = Array(size * size).fill(false).map(() => Math.random() > 0.6);
    setGrid(start);
    setSolved(false);
  };

  useEffect(() => {
    resetGame();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[320px]">
      <div className="flex justify-between w-full text-xs font-mono text-zinc-500">
        <button type="button" onClick={onBack} className="appearance-none rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-zinc-200 shadow-none hover:bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-colors duration-150">← EXIT</button>
        <span className={solved ? "text-emerald-400 font-bold" : "text-zinc-400"}>
          {solved ? "ALL DARK" : "LIGHTS ON"}
        </span>
        <button type="button" onClick={resetGame} className="appearance-none rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-zinc-200 shadow-none hover:bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-colors duration-150">RESET</button>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, width: "240px" }}>
        {grid.map((isOn, index) => (
          <button
            key={index}
            type="button"
            onClick={() => toggleCell(index)}
            className={`h-12 rounded-xl border border-zinc-800 transition-colors duration-150 ${isOn ? "bg-amber-400/80" : "bg-zinc-900/70"}`}
          />
        ))}
      </div>
    </div>
  );
}

function Engine3DGame({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controlsRef = useRef<PointerLockControls | null>(null);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [goalReached, setGoalReached] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new Scene();
    scene.background = new Color(0x05101f);
    scene.fog = new Fog(0x05101f, 8, 25);

    const camera = new PerspectiveCamera(75, 1, 0.1, 1500);
    camera.position.set(0, 1.6, 8);

    const renderer = new WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.shadowMap.enabled = true;

    const ambientLight = new AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(5, 12, 5);
    scene.add(directionalLight);

    const floorMaterial = new MeshStandardMaterial({ color: 0x192840, roughness: 0.95, metalness: 0.1 });
    const floor = new Mesh(new PlaneGeometry(40, 40), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const platformMaterial = new MeshStandardMaterial({ color: 0x2f5c94, roughness: 0.7, metalness: 0.15 });
    const platforms = [
      { x: 0, y: 0.2, z: 0, w: 8, d: 8 },
      { x: 3.3, y: 1.2, z: 2.5, w: 3.4, d: 3.0 },
      { x: -4.0, y: 2.2, z: -1.4, w: 2.5, d: 3.2 },
      { x: 1.8, y: 3.5, z: -3.1, w: 2.0, d: 2.0 },
    ];

    const collisionObjects: Mesh[] = [];
    platforms.forEach((platform) => {
      const mesh = new Mesh(new BoxGeometry(platform.w, 0.4, platform.d), platformMaterial);
      mesh.position.set(platform.x, platform.y, platform.z);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      scene.add(mesh);
      collisionObjects.push(mesh);
    });

    const goalMaterial = new MeshStandardMaterial({ color: 0xf4c542, emissive: 0x704214, emissiveIntensity: 0.45 });
    const goal = new Mesh(new SphereGeometry(0.3, 20, 16), goalMaterial);
    goal.position.set(1.8, 4.1, -3.1);
    goal.castShadow = true;
    scene.add(goal);

    const controls = new PointerLockControls(camera, canvas);
    controlsRef.current = controls;
    const handleLock = () => setPointerLocked(true);
    const handleUnlock = () => setPointerLocked(false);
    controls.addEventListener("lock", handleLock);
    controls.addEventListener("unlock", handleUnlock);

    const moveState = { forward: false, backward: false, left: false, right: false, jump: false };
    const velocity = new Vector3();
    const direction = new Vector3();
    const raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 1.75);
    const winRef = { current: false };

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          moveState.forward = true;
          break;
        case "ArrowLeft":
        case "KeyA":
          moveState.left = true;
          break;
        case "ArrowDown":
        case "KeyS":
          moveState.backward = true;
          break;
        case "ArrowRight":
        case "KeyD":
          moveState.right = true;
          break;
        case "Space":
          if (velocity.y === 0) {
            velocity.y = 7.2;
          }
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          moveState.forward = false;
          break;
        case "ArrowLeft":
        case "KeyA":
          moveState.left = false;
          break;
        case "ArrowDown":
        case "KeyS":
          moveState.backward = false;
          break;
        case "ArrowRight":
        case "KeyD":
          moveState.right = false;
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    window.addEventListener("resize", resize);
    resize();

    const clock = new Clock();
    let frameId = 0;

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      raycaster.ray.origin.copy(controls.object.position);
      raycaster.ray.origin.y -= 0.1;

      const intersections = raycaster.intersectObjects(collisionObjects, false);
      const onObject = intersections.length > 0;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      velocity.y -= 9.8 * 5.0 * delta;

      direction.z = Number(moveState.forward) - Number(moveState.backward);
      direction.x = Number(moveState.right) - Number(moveState.left);
      direction.normalize();

      if (moveState.forward || moveState.backward) {
        controls.moveForward(direction.z * 6.5 * delta);
      }
      if (moveState.left || moveState.right) {
        controls.moveRight(direction.x * 6.5 * delta);
      }

      if (onObject) {
        velocity.y = Math.max(0, velocity.y);
      }

      controls.object.position.y += velocity.y * delta;

      if (controls.object.position.y < 1.6) {
        velocity.y = 0;
        controls.object.position.y = 1.6;
      }

      if (!winRef.current && controls.object.position.distanceTo(goal.position) < 0.6) {
        winRef.current = true;
        setGoalReached(true);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      controls.removeEventListener("lock", handleLock);
      controls.removeEventListener("unlock", handleUnlock);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      controls.unlock();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[640px]">
      <div className="flex justify-between w-full text-xs font-mono text-zinc-500">
        <button type="button" onClick={onBack} className="appearance-none rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-zinc-200 shadow-none hover:bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-colors duration-150">← EXIT</button>
        <span className="text-sky-400 font-semibold">ENGINE_3D</span>
        <span className="text-xs text-zinc-400">{pointerLocked ? (goalReached ? "GOAL ACHIEVED" : "WASD + SPACE to move") : "Click to lock pointer"}</span>
      </div>

      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-900 bg-[#030712] shadow-2xl">
        {!pointerLocked && (
          <button
            type="button"
            onClick={() => controlsRef.current?.lock()}
            className="absolute inset-x-10 top-1/3 z-10 rounded-2xl border border-sky-400/40 bg-sky-500/10 px-5 py-3 text-sm font-semibold text-sky-200 shadow-lg shadow-sky-500/10 backdrop-blur-md transition hover:bg-sky-500/20"
          >
            CLICK TO PLAY
          </button>
        )}
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      <div className="w-full rounded-2xl border border-zinc-900 bg-zinc-950/70 p-4 text-sm text-zinc-300">
        <p className="font-semibold text-zinc-100">Three.js First-Person Platformer</p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          Use pointer lock to navigate, jump to reach the floating goal, and experience an actual WebGL scene rendered by Three.js.
        </p>
      </div>
    </div>
  );
}
