from flask import Flask, render_template, request, jsonify
from algorithms import solve_maze
import os

app = Flask(__name__)

@app.get("/")
def index():
    return render_template("index.html")

@app.post("/solve")
def solve():
    data = request.get_json(silent=True) or {}
    try:
        grid = data["grid"]
        start = tuple(data["start"])
        goal = tuple(data["goal"])
        algorithm = data.get("algorithm", "bfs").lower()
        result = solve_maze(grid, start, goal, algorithm)
        return jsonify(result)
    except (KeyError, TypeError, ValueError, IndexError) as exc:
        return jsonify({"success": False, "error": f"Invalid maze input: {exc}"}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
