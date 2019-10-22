# Maze-gen0
Maze generator that  displays the process of creating  and solving a maze.
After maze is generated  start and end points are placed randomly in place of cell with value passage, in order to solve maze **DFS algorithm** is used.
DFS picks direction randomly whenvere there is 2 possible ways and goes in that direction until hits dead end then backtracks to the latest  intersection and repeates the steps until finds end point.
Three algorithms are used to create a maze:
1) **Recursive division** - Starts with empty grid and bisects the field with a wall, either horizontally or vertically, then randomly picks a point in wall and makes it a passage.
2) **Prim's algorithm maze** - Starts with grid full of walls, adds all neighbours of the starting cell to the stack then picks one randomly and repeate the process until the maze is done.
3) **Depth Search First maze algorithm** - Starts with grid full of walls, turns all neighbours into passages and marks them as visited then adds the cell after neighbour to the stack and randomly chose which one will be on the top. Pops cell out of the stack and repeate until the maze is done.
