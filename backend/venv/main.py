from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from collections import deque
import heapq

myapp = FastAPI()

# Allow frontend to communicate with backend
myapp.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# The maze definition
maze = [
    ['8', '#', '9', '#', '11','#', '#', '#', '18','19','#','B'],
    [' ', '#', ' ', '#', '10','12','13','#', ' ', '#','#',' '],
    ['6', '5', '7', '#', ' ', '#', '14',' ', '17', '#','#',' '],
    ['#', ' ', '#', '#', ' ', '#', ' ', '#', ' ' ,'#','#',' '],
    ['#', '3', ' ', '2', '4', '#', ' ', '#', '20',' ',' ','21'],
    ['#', '#', '#', ' ', '#', '#', ' ', '#', '#' ,'#','#','#'],
    [' ', ' ', ' ', ' ', '#', '#', ' ', ' ', ' ' ,' ',' ',' '],
    ['A', ' ', ' ', '1', '#', '#', '15',' ', ' ' ,' ',' ','16']
]

# Start and End positions
start = (7, 0)  # Position of 'A'
end = (0, 11)   # Position of 'B'

def bfs(maze, start, end):
    queue = deque([(start, [])])  # Queue stores (current position, path)
    visited = set()
    expanded_nodes = []  # Nodes visited during the search

    while queue:
        (x, y), path = queue.popleft()  # Get the front of the queue
        expanded_nodes.append((x, y))  # Track expanded nodes

        # If we reached the goal, return the path
        if (x, y) == end:
            return path + [(x, y)], expanded_nodes
        
        # Explore all 4 possible moves (right, down, left, up)
        for dx, dy in [(0,1), (1,0), (0,-1), (-1,0)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < len(maze) and 0 <= ny < len(maze[0]) and maze[nx][ny] != '#' and (nx, ny) not in visited:
                queue.append(((nx, ny), path + [(x, y)]))
                visited.add((nx, ny))
    
    return None, expanded_nodes  # Return None if no path is found

def dfs(maze, start, end):
    stack = [(start, [])]
    visited = set()
    expanded_nodes = []
    
    while stack:
        (x, y), path = stack.pop()
        
        if (x, y) in visited:
            continue
        visited.add((x, y))
        expanded_nodes.append((x, y))
        
        if (x, y) == end:
            return path + [(x, y)], expanded_nodes
        
        for dx, dy in [(0,1), (1,0), (0,-1), (-1,0)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < len(maze) and 0 <= ny < len(maze[0]) and maze[nx][ny] != '#' and (nx, ny) not in visited:
                stack.append(((nx, ny), path + [(x, y)]))
    
    return None, expanded_nodes

def a_star(maze, start, end):
    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    queue = [(0, start, [])]  # (cost, position, path)
    visited = set()
    expanded_nodes = []
    
    while queue:
        cost, (x, y), path = heapq.heappop(queue)
        
        if (x, y) in visited:
            continue
        visited.add((x, y))
        expanded_nodes.append((x, y))
        
        if (x, y) == end:
            return path + [(x, y)], expanded_nodes
        
        for dx, dy in [(0,1), (1,0), (0,-1), (-1,0)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < len(maze) and 0 <= ny < len(maze[0]) and maze[nx][ny] != '#' and (nx, ny) not in visited:
                new_cost = cost + 1 + heuristic((nx, ny), end)
                heapq.heappush(queue, (new_cost, (nx, ny), path + [(x, y)]))
    
    return None, expanded_nodes



@myapp.get("/solve/bfs")
def solve_bfs():
    path, expanded = bfs(maze, start, end)
    explanation = "BFS explores all neighbors level by level and guarantees the shortest path."
    return {"path": path, "expanded_nodes": expanded, "explanation": explanation}

@myapp.get("/solve/dfs")
def solve_dfs():
    path, expanded = dfs(maze, start, end)
    explanation = "DFS explores as deep as possible before backtracking."
    return {"path": path, "expanded_nodes": expanded, "explanation": explanation}

@myapp.get("/solve/a_star")
def solve_a_star():
    path, expanded = a_star(maze, start, end)
    explanation = "A* uses heuristics to find the shortest path efficiently."
    return {"path": path, "expanded_nodes": expanded, "explanation": explanation}


