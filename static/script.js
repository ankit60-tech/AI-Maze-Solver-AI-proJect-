const SIZE = 15;
const START = [0, 0];
const GOAL = [14, 14];
let walls = new Set();
let isDrawing = false;
let isSolving = false;
const gridEl = document.getElementById("grid");
const solveBtn = document.getElementById("solve");
const messageEl = document.getElementById("message");

const key = (r,c) => `${r},${c}`;
const isSpecial = (r,c) => (r===START[0] && c===START[1]) || (r===GOAL[0] && c===GOAL[1]);

function renderGrid(explored = [], path = []) {
  const exploredSet = new Set(explored.map(p => key(p[0],p[1])));
  const pathSet = new Set(path.map(p => key(p[0],p[1])));
  gridEl.innerHTML = "";
  for (let r=0;r<SIZE;r++) for (let c=0;c<SIZE;c++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.row = r; cell.dataset.col = c;
    const k = key(r,c);
    if (walls.has(k)) cell.classList.add("wall");
    if (exploredSet.has(k)) cell.classList.add("explored");
    if (pathSet.has(k)) cell.classList.add("path");
    if (r===START[0] && c===START[1]) cell.className = "cell start";
    if (r===GOAL[0] && c===GOAL[1]) cell.className = "cell goal";
    cell.addEventListener("pointerdown", e => { e.preventDefault(); isDrawing=true; toggleWall(r,c); });
    cell.addEventListener("pointerenter", () => { if(isDrawing) addWall(r,c); });
    gridEl.appendChild(cell);
  }
}
function clearMetrics() {
  document.getElementById("pathLength").textContent = "—";
  document.getElementById("nodesExplored").textContent = "—";
  document.getElementById("runtime").textContent = "—";
}
function setMessage(text, type="") {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}
function addWall(r,c) {
  if(isSolving || isSpecial(r,c)) return;
  walls.add(key(r,c)); clearMetrics(); renderGrid();
}
function toggleWall(r,c) {
  if(isSolving || isSpecial(r,c)) return;
  const k=key(r,c);
  walls.has(k) ? walls.delete(k) : walls.add(k);
  clearMetrics(); renderGrid();
}
window.addEventListener("pointerup", () => { isDrawing=false; });
gridEl.addEventListener("pointerleave", () => { isDrawing=false; });

function makeGrid() {
  return Array.from({length:SIZE},(_,r)=>Array.from({length:SIZE},(_,c)=>walls.has(key(r,c))?1:0));
}
const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
async function animate(explored,path) {
  const pathSet = new Set(path.map(p=>key(...p)));
  const seen = [];
  for(let i=0;i<explored.length;i++) {
    seen.push(explored[i]);
    if(i%3===0 || i===explored.length-1) {
      renderGrid(seen,[]);
      await sleep(12);
    }
  }
  for(let i=1;i<=path.length;i++) {
    renderGrid(explored,path.slice(0,i));
    await sleep(35);
  }
}
async function solve() {
  if(isSolving) return;
  isSolving=true; solveBtn.disabled=true;
  document.getElementById("random").disabled=true;
  document.getElementById("reset").disabled=true;
  clearMetrics(); setMessage("Searching the maze…");
  renderGrid();
  try {
    const response = await fetch("/solve", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({grid:makeGrid(),start:START,goal:GOAL,algorithm:document.getElementById("algorithm").value})
    });
    const result = await response.json();
    if(!response.ok) throw new Error(result.error || "The server could not solve this maze.");
    await animate(result.explored,result.path);
    document.getElementById("pathLength").textContent=result.success?result.path_length:"—";
    document.getElementById("nodesExplored").textContent=result.nodes_explored;
    document.getElementById("runtime").textContent=result.execution_time_ms;
    setMessage(`${result.algorithm}: ${result.message}`,result.success?"success":"error");
  } catch(err) {
    setMessage(`Error: ${err.message}. Please refresh and try again.`,"error");
  } finally {
    isSolving=false; solveBtn.disabled=false;
    document.getElementById("random").disabled=false;
    document.getElementById("reset").disabled=false;
  }
}
function randomMaze() {
  if(isSolving)return;
  walls.clear();
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) {
    if(!isSpecial(r,c) && Math.random()<0.27) walls.add(key(r,c));
  }
  // Keep a simple guaranteed corridor so the generated maze is usually solvable.
  for(let c=0;c<SIZE;c++) walls.delete(key(0,c));
  for(let r=0;r<SIZE;r++) walls.delete(key(r,SIZE-1));
  clearMetrics(); setMessage("Random maze generated. Choose BFS or A* and solve.");
  renderGrid();
}
function reset() {
  if(isSolving)return;
  walls.clear(); clearMetrics(); setMessage("Grid reset. Draw walls or generate a random maze.");
  renderGrid();
}
solveBtn.addEventListener("click",solve);
document.getElementById("random").addEventListener("click",randomMaze);
document.getElementById("reset").addEventListener("click",reset);
document.getElementById("algorithm").addEventListener("change",()=>{clearMetrics();setMessage("Algorithm changed. Ready to solve.");});
renderGrid();
