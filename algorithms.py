from collections import deque
from heapq import heappush, heappop
from time import perf_counter

DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def valid_grid(grid):
    if not isinstance(grid, list) or not grid or not isinstance(grid[0], list):
        raise ValueError("Grid must be a non-empty 2D list.")
    width = len(grid[0])
    if width == 0 or any(not isinstance(row, list) or len(row) != width for row in grid):
        raise ValueError("All grid rows must have the same non-zero width.")
    if any(cell not in (0, 1, False, True) for row in grid for cell in row):
        raise ValueError("Grid cells must be 0 (open) or 1 (wall).")

def inside(r, c, rows, cols):
    return 0 <= r < rows and 0 <= c < cols

def reconstruct_path(parent, start, goal):
    if goal != start and goal not in parent:
        return []
    path = [goal]
    while path[-1] != start:
        path.append(parent[path[-1]])
    path.reverse()
    return [[r, c] for r, c in path]

def bfs(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    queue = deque([start])
    visited = {start}
    parent = {}
    explored = []
    while queue:
        current = queue.popleft()
        explored.append([current[0], current[1]])
        if current == goal:
            break
        for dr, dc in DIRECTIONS:
            nr, nc = current[0] + dr, current[1] + dc
            nxt = (nr, nc)
            if inside(nr, nc, rows, cols) and not grid[nr][nc] and nxt not in visited:
                visited.add(nxt)
                parent[nxt] = current
                queue.append(nxt)
    path = reconstruct_path(parent, start, goal) if goal in visited else []
    return explored, path

def manhattan(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def astar(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    heap = []
    heappush(heap, (manhattan(start, goal), 0, start))
    g_score = {start: 0}
    parent = {}
    closed = set()
    explored = []
    while heap:
        _, cost, current = heappop(heap)
        if current in closed or cost != g_score.get(current):
            continue
        closed.add(current)
        explored.append([current[0], current[1]])
        if current == goal:
            break
        for dr, dc in DIRECTIONS:
            nr, nc = current[0] + dr, current[1] + dc
            nxt = (nr, nc)
            if not inside(nr, nc, rows, cols) or grid[nr][nc] or nxt in closed:
                continue
            tentative = cost + 1
            if tentative < g_score.get(nxt, float("inf")):
                g_score[nxt] = tentative
                parent[nxt] = current
                heappush(heap, (tentative + manhattan(nxt, goal), tentative, nxt))
    path = reconstruct_path(parent, start, goal) if goal in closed else []
    return explored, path

def solve_maze(grid, start, goal, algorithm="bfs"):
    valid_grid(grid)
    rows, cols = len(grid), len(grid[0])
    for label, point in (("start", start), ("goal", goal)):
        if len(point) != 2 or not all(isinstance(x, int) for x in point):
            raise ValueError(f"{label} must be a row/column pair.")
        if not inside(point[0], point[1], rows, cols):
            raise ValueError(f"{label} is outside the grid.")
        if grid[point[0]][point[1]]:
            raise ValueError(f"{label} cannot be placed on a wall.")

    began = perf_counter()
    if algorithm == "bfs":
        explored, path = bfs(grid, start, goal)
    elif algorithm in ("astar", "a*"):
        explored, path = astar(grid, start, goal)
    else:
        raise ValueError("Algorithm must be 'bfs' or 'astar'.")
    elapsed_ms = (perf_counter() - began) * 1000
    return {
        "success": bool(path),
        "explored": explored,
        "path": path,
        "path_length": max(0, len(path) - 1) if path else 0,
        "nodes_explored": len(explored),
        "execution_time_ms": round(elapsed_ms, 3),
        "algorithm": "A*" if algorithm in ("astar", "a*") else "BFS",
        "message": "Path found!" if path else "No path found."
    }
