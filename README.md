# AI Maze Solver — BFS + A* Search

An interactive maze pathfinding visualizer built with HTML, CSS, JavaScript, Python and Flask.

## Features
- Editable 15 × 15 maze grid
- BFS and A* pathfinding
- Animated explored cells and final path
- Random maze generation and reset
- Path length, explored-node count and execution-time metrics
- Handles unreachable destinations

## Run locally (Windows)

1. Install Python 3.10 or newer.
2. Open a terminal in this project folder.
3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the server:

   ```bash
   python app.py
   ```

5. Open http://127.0.0.1:5000 in your browser.

## Deploy on Render

1. Push this folder to a GitHub repository.
2. In Render, create a **New Web Service** and connect the repository.
3. Use these settings:
   - Runtime: Python 3
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app`
4. Deploy. Render will provide a public URL.

## API

`POST /solve`

Example JSON:

```json
{
  "grid": [[0, 0], [1, 0]],
  "start": [0, 0],
  "goal": [1, 1],
  "algorithm": "bfs"
}
```

The response includes success status, explored cells, path, path length, explored-node count and execution time.

## Algorithms

- **BFS:** Uses a FIFO queue and finds a shortest path when all moves have equal cost. Time complexity: O(V + E).
- **A\*:** Uses `f(n) = g(n) + h(n)` and Manhattan distance. With four-direction movement and equal step costs, this heuristic is admissible and consistent.
