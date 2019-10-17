const canvas = document.getElementById('maze')
const rdButton = document.getElementById("option")
const primButton = document.getElementById("option2")
const dfsButtion =  document.getElementById("option3")
const generator = document.getElementById("generator")
const solve = document.getElementById("solve")
const size = document.getElementById("size")

const ctx  = canvas.getContext("2d")
canvas.width = 600  
canvas.height = 600


let option;


// Base Cell

class Cell {
    constructor(state) {
        this.state = state
        this.row = null
        this.col = null
        this.visited = state === "W" ? false : true
        this.isBorder = false
        this.color = '#FFFFFF'
        this.direction = null
        this.traversed = false
    }

    changeColor(){
        switch(this.state) {
            // Fake wall that turns into PS
            case " ":
                this.color = "#696969"
                break
            // Passage
            case "PS":
                this.color = "#FFFFFF"
                break
            // Start
            case "S":
                this.color = "#32CD32"
                break
            // End
            case "E":
                this.color = "#FF0000"
                break
            // Path
            case "P":
                this.color = "#A0522D"
                break
            // Wall
            case "W":
                this.color = "#696969"
                break
            // Back Path
            case "B":
                this.color = "#043693"
                break
            // Fake passage that turns into P
            case "#":
                this.color = "#FFFFFF"
                break
            // Fake passage that turns into B
            case "$":
                this.color = "#FFFFFF"
                break
            // Fake passage that turns into W
            case "WS":
                this.color = "#FFFFFF"
                break
        }
    }


    setPosition(x, y) {
        this.col = x
        this.row = y
    }

    scanNeighbours() {
        let col = this.col
        let row = this.row
        return [[col - 1, row , 'N'], [col + 1, row, 'S'], [col , row - 1, 'W'], [col, row + 1, 'E']]
    }
}

// Base Maze

class Maze {
    constructor() {
        this.cells = []
        this.start = null
        this.end = null
        this.animation = []
        this.emptyAnim = []
    }

    getNeighbours(cell) {
        let neighboursCords;
        neighboursCords = cell.scanNeighbours()

        neighboursCords = neighboursCords.filter(cell => {
            if(cell[0] < this.cells.length - 1 && cell[0] > 0 && cell[1] < this.cells[0].length - 1 && cell[1] > 0){
                return cell
            }
        })
        let neighbours = neighboursCords.map(cell => {
            let newCell = this.cells[cell[0]][cell[1]]
            newCell.direction = cell[2]
            return newCell
        })
        return neighbours
    }

    getNotVisitedNeighbours(neighbours) {
        return neighbours.filter(cell => this.checkCell(cell))
    }

    getVisitedNeighbours(neighbours) {
        return neighbours.filter(cell => {
            if(cell.state === "PS" || cell.state === "E") {
                return cell
            }
        })
    }

    changeCellToPassage(cell) {
        cell.state = " "
        cell.visited = true
        this.emptyAnim.push(cell)
    }

    checkCell(cell) {
        if(!cell.visited && !cell.isBorder && cell.state === "W") {
            return true
        }else {
            return false
        }
    }

    getPassages() {
        let passages = []
        for(let i=0; i < this.cells.length; i++) {
            for(let j=0; j<this.cells[0].length; j++){
                if(this.cells[i][j].state === "PS"){
                    passages.push(this.cells[i][j])
                }
            }
        }
        return passages
    }

    placeStartAndEndPoint() {
        let emptyCells = this.getPassages()
        if(emptyCells.length > 0) {
            let randomIndex = Math.floor(Math.random() * emptyCells.length)
            let randomIndex1 = Math.floor(Math.random() * emptyCells.length)
            if(randomIndex !== randomIndex1) { 
                this.start = emptyCells[randomIndex]
                this.start.state = "S"
                this.end = emptyCells[randomIndex1]
                this.end.state = "E"
            }else {
                this.start = emptyCells[randomIndex]
                this.start.state = "S"
                randomIndex1 = Math.floor(Math.random() * emptyCells.length)
                this.end = emptyCells[randomIndex1]
                this.end.state = "E"
            }
        }
    }

    dfs() {
        let curCell;
        let stack = [this.start]
        while(true) {
            curCell = stack[stack.length - 1]
            curCell.traversed = true
            if(curCell.state === "PS") {
                curCell.state = "#"
            }
            if(curCell === this.end) {
                break
            }
            let untraversed = 0
            this.getVisitedNeighbours(this.getNeighbours(curCell)).forEach(cell => {
                if(!cell.traversed) {
                    stack.push(cell)
                    untraversed++                   
                }
            })

            if(untraversed === 0) {
                curCell.state = "$"
                stack.pop()
            }
            this.animation.push(curCell)
        }
    }

    solvingStep(cell) {
        cell.state = "P"
        this.render()
    }

    repeateStep(cell) {
        cell.state = "B"
        this.render()
    }

    render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        let columns =  this.cells[0].length
        let rows = this.cells.length
        let cellWidth = canvas.width / columns
        let cellHeight =  canvas.height / rows
        let cellLength = cellHeight > cellWidth ? cellWidth : cellHeight;
        for(let row=0; row < rows; row++) {
            for(let col=0; col < columns; col++) {
                let cell = this.cells[row][col]
                cell.changeColor()
                ctx.fillStyle = cell.color
                let rectX = col * cellLength
                let rectY = row * cellLength
                ctx.fillRect(rectX, rectY, cellLength, cellLength)
            }
        }
    }
}

// Cell for DFS maze

class DFSCell extends Cell {
    constructor(state) {
        super(state)
    }

    scanNeighboursDouble() {
        let col = this.col
        let row = this.row
        return [[col - 2, row , 'North'], [col + 2, row, 'South'], [col , row - 2, 'West'], [col, row + 2, 'East'], [col - 2, row + 1, 'NE'] , [col - 2, row - 1, 'NW'], [col + 2, row + 1, 'SE'], [col + 2, row - 1, 'SW']]
    }

    scanNeighbours() {
        let col = this.col
        let row = this.row
        return [[col - 1, row , 'North'], [col + 1, row, 'South'], [col , row - 1, 'West'], [col, row + 1, 'East'], [col - 1, row + 1, 'NE'] , [col - 1, row - 1, 'NW'], [col + 1, row + 1, 'SE'], [col + 1, row - 1, 'SW']]
    }

    scanDFS() {
        let col = this.col
        let row = this.row
        return [[col - 1, row , 'N'], [col + 1, row, 'S'], [col , row - 1, 'W'], [col, row + 1, 'E']]
    }
}

// DFS maze 

class DFSMaze extends Maze {
    constructor() {
        super()
    }
    
    initializeGrid(resolution) {
        for(let i=0; i < resolution; i++) {
            this.cells.push([])
            for(let j=0; j < resolution; j++) {
                if(i === 0 || i === resolution - 1 || j === 0 || j === resolution - 1) {
                    let cell = new DFSCell("W")
                    cell.setPosition(i, j)
                    cell.isBorder = true
                    this.cells[i].push(cell)
                }else { 
                    let cell = new DFSCell("W")
                    cell.setPosition(i, j)
                    this.cells[i].push(cell)
                }
            }
        }
    }

    getNeighbours(cell, option="dfs") {
        let neighboursCords;
        if(option === "double") {
            neighboursCords = cell.scanNeighboursDouble()
        }else if(option === "one") {
            neighboursCords = cell.scanNeighbours()
        }else if(option === "dfs") {
            neighboursCords = cell.scanDFS()
        }
        neighboursCords = neighboursCords.filter(cell => {
            if(cell[0] < this.cells.length - 1 && cell[0] > 0 && cell[1] < this.cells[0].length - 1 && cell[1] > 0){
                return cell
            }
        })
        let neighbours = neighboursCords.map(cell => {
            let newCell = this.cells[cell[0]][cell[1]]
            newCell.direction = cell[2]
            return newCell
        })
        return neighbours
    }

    checkIfValidPosition(cell){
        let neighbours = this.getNeighbours(cell, "one")
        let diagonalNeigh = neighbours.filter(cell => {
            if(cell.direction === "NW" && cell.state === " " || cell.direction === "NE" && cell.state === " " || cell.direction === "SE" && cell.state === " " || cell.direction === "SW" && cell.state === " ") {
                return cell
            }
        })
        let neigh = neighbours.filter(cell => {
            if(cell.direction === "West" && cell.state === " " || cell.direction === "East" && cell.state === " " || cell.direction === "North" && cell.state === " " || cell.direction === "South" && cell.state === " ") {
                return cell
            }
        })
        if(diagonalNeigh.length > 0 || neigh.length > 1) {
            return false
        }else {
            return true
        }
       
    }

    makeDiagonalCellsVisited(cell) {
        let neighbours = this.getNeighbours(cell, "one")
        let diagonalNeigh = neighbours.filter(cell => {
            if(cell.direction === "NW" || cell.direction === "NE" || cell.direction === "SE" || cell.direction === "SW") {
                return cell
            }
        })
        diagonalNeigh.forEach(cell => {
            cell.visited = true;
        })
    }

    marksCellBetween(nCell) {
        let cellBetween
        if(nCell.direction === "South") {
            cellBetween = this.cells[nCell.col - 1][nCell.row]
        }else if(nCell.direction === "North") {
            cellBetween = this.cells[nCell.col + 1][nCell.row]
        }else if(nCell.direction === "East") {
            cellBetween = this.cells[nCell.col][nCell.row - 1]    
        }else if(nCell.direction === "West") {
            cellBetween = this.cells[nCell.col][nCell.row + 1]    
        }

        this.changeCellToPassage(cellBetween)
        return cellBetween
    }

    DFS([x1, x2], [y1, y2], [s1, s2]) {
        if(s1 >= x2 || s2 >= y2 || s1 <= x1 || s2 <= y1) {
            return
        }
        let startingCell = this.cells[s1][s2]
        this.makeDiagonalCellsVisited(startingCell)
        let availableCells = [startingCell]
        let cellToHandle;
        let neighbours;
        let ranIndx;
        while(availableCells.length >= 1) {
            cellToHandle = availableCells.pop()
            this.changeCellToPassage(cellToHandle)
            neighbours = this.getNotVisitedNeighbours(this.getNeighbours(cellToHandle, "double"))
            neighbours = neighbours.filter(cell => {
                if(cell.direction === "West" || cell.direction === "East"  || cell.direction === "South"  || cell.direction === "North") {
                    return cell
                }
            })
            ranIndx = Math.floor(Math.random() * neighbours.length)
            neighbours.forEach((cell,index) => {
                if(this.checkIfValidPosition(cell, "DFS") && index !== ranIndx) {
                    this.makeDiagonalCellsVisited(cell)
                    this.marksCellBetween(cell)
                    this.changeCellToPassage(cell)
                    availableCells.push(cell)
                }
            })
            if(neighbours.length > 0) {
                if(this.checkIfValidPosition(neighbours[ranIndx], "DFS")){
                    this.makeDiagonalCellsVisited(neighbours[ranIndx])
                    this.marksCellBetween(neighbours[ranIndx])
                    availableCells.push(neighbours[ranIndx])
                }
            }
        }

    }
}


// Recursive Division maze 

class RDMaze extends Maze {
    constructor() {
        super()
    }

    initializeGrid(resolution) {
        for(let i=0; i < resolution; i++) {
            this.cells.push([])
            for(let j=0; j < resolution; j++) {
                if(i === 0 || i === resolution - 1 || j === 0 || j === resolution - 1) {
                    let cell = new Cell("W")
                    cell.setPosition(i, j)
                    cell.isBorder = true
                    this.cells[i].push(cell)
                }else { 
                    let cell = new Cell("PS")
                    cell.setPosition(i, j)
                    this.cells[i].push(cell)
                }
            }
        }
    }

    recursiveDivision([x1, x2], [y1, y2]) {
        let width = x2 - x1
        let height = y2 - y1
        if(width >= height) {
            if(x2 - x1 > 3) {
                let bisection = Math.ceil((x1 + x2) / 2)
                let max = y2 - 1
                let min = y1 + 1
                let randomPassage = Math.floor(Math.random() * (max - min + 1)) + min
                let first = false
                let second = false
                if(this.cells[y2][bisection].state === "PS"){
                    randomPassage = max
                    first= true
                }
                if(this.cells[y1][bisection].state === "PS"){
                    randomPassage = min
                    second = true
                }
                for(let i= y1 + 1; i < y2; i++) {
                    if(first && second) {
                        if(i === max || i === min) {
                            continue
                        }
                    }else if(i === randomPassage) {
                        continue
                    }
                    this.cells[i][bisection].state = "WS"
                    this.emptyAnim.push(this.cells[i][bisection])
                }
                this.recursiveDivision([x1, bisection], [y1, y2])
                this.recursiveDivision([bisection, x2], [y1, y2])
            }
        }else{
            if(y2 - y1 > 3) {
                let bisection = Math.ceil((y1 + y2) / 2)
                let max = x2 - 1
                let min = x1 + 1
                let randomPassage = Math.floor(Math.random() * (max - min + 1)) + min
                let first = false
                let second = false
                if(this.cells[bisection][x2].state === "PS") {
                    randomPassage = max
                    first = true
                }
                if(this.cells[bisection][x1].state === "PS") {
                    randomPassage = min
                    second =  true
                }
                for(let i = x1 + 1; i < x2; i++) {
                    if(first && second) {
                        if(i === max || i === min) {
                            continue
                        }
                    }else if(i === randomPassage) {
                        continue
                    }
                    this.cells[bisection][i].state = "WS"
                    this.emptyAnim.push(this.cells[bisection][i])
                } 
                this.recursiveDivision([x1, x2], [y1, bisection])
                this.recursiveDivision([x1, x2], [bisection, y2])   
            }
        }   
    }


}

// Prim's maze

class PrimMaze extends Maze{
    constructor() {
        super()
    }

    initializeGrid(resolution) {
        for(let i=0; i < resolution; i++) {
            this.cells.push([])
            for(let j=0; j < resolution; j++) {
                if(i === 0 || i === resolution - 1 || j === 0 || j === resolution - 1) {
                    let cell = new Cell("W")
                    cell.setPosition(i, j)
                    cell.isBorder = true
                    this.cells[i].push(cell)
                }else { 
                    let cell = new Cell("W")
                    cell.setPosition(i, j)
                    this.cells[i].push(cell)
                }
            }
        }
    }

    checkIfValidPosition(cell){
        if(cell.direction === "N") {
            if(this.cells[cell.col - 1][cell.row - 1].state === " " || this.cells[cell.col - 1][cell.row + 1].state === " " || this.cells[cell.col - 1][cell.row].state === " ") {
                return false
            }else {
                return true
            }
        }else if(cell.direction === "S") {
            if(this.cells[cell.col + 1][cell.row - 1].state === " " || this.cells[cell.col + 1][cell.row + 1].state === " " || this.cells[cell.col + 1][cell.row].state === " ") {
                return false
            }else {
                return true
            }
        }else if(cell.direction === "W") {
            if(this.cells[cell.col + 1][cell.row - 1].state === " " || this.cells[cell.col - 1][cell.row - 1].state === " " || this.cells[cell.col][cell.row - 1].state === " ") {
                return false
            }else {
                return true
            }
        }else if(cell.direction === "E") {
            if(this.cells[cell.col - 1][cell.row + 1].state === " " || this.cells[cell.col + 1][cell.row + 1].state === " " || this.cells[cell.col][cell.row + 1].state === " ") {
                return false
            }else {
                return true
            }             
        }
    }
    

    prim([x1, x2], [y1, y2], [s1, s2]) {
        if(s1 >= x2 || s2 >= y2 || s1 <= x1 || s2 <= y1) {
            return
        }
        let startingCell = this.cells[s1][s2]
        this.changeCellToPassage(startingCell)
        let availableCells = this.getNotVisitedNeighbours(this.getNeighbours(startingCell))
        let randIndx
        let cellToHandle
        let neighbours
        while(availableCells.length > 0) {
            randIndx = Math.floor(Math.random() * availableCells.length)
            cellToHandle = availableCells[randIndx]
            availableCells.splice(randIndx, 1)
            this.changeCellToPassage(cellToHandle)
            neighbours = this.getNotVisitedNeighbours(this.getNeighbours(cellToHandle)).filter(cell => {
                if(this.checkIfValidPosition(cell)){
                    return cell
                }
            })
            neighbours.forEach(cell => {
                if(availableCells.includes(cell)) {
                    cell.visited = true
                    availableCells.splice(availableCells.indexOf(cell), 1)
                }else{
                    availableCells.push(cell)
                }
            })

            availableCells = availableCells.filter(cell => {
                if(this.checkIfValidPosition(cell)) {
                    return cell
                }
            })
        }
    }
}

function getAlgorithmName(e) {
    option = e.target.value
}

function generate(option, size) {
    if(size > 150 || size < 10) {
        alert("Pick size between 10-150")
        return
    }
    if(option) {
        generator.disabled = true
    }
    option = undefined || null ? "RD" : option
    if(option === "RD") {
        solve.disabled = true
        newMaze = new RDMaze()
        newMaze.initializeGrid(size)
        newMaze.recursiveDivision([0, size-1], [0, size-1], size)
        let passage = newMaze.emptyAnim.shift()
        function carving() {
            if(newMaze.emptyAnim.length >= 1) {
             passage.state = "W"
             newMaze.render()
             passage = newMaze.emptyAnim.shift()
             requestAnimationFrame(carving)   
            }else {
                newMaze.placeStartAndEndPoint()
                newMaze.render()
                solve.disabled = false
                generator.disabled = false
            }
        }
        requestAnimationFrame(carving)
    }else if(option === "prim") {
        solve.disabled = true
        newMaze = new PrimMaze()
        newMaze.initializeGrid(size, option)
        newMaze.prim([0, size-1], [0, size-1], [1, 1])
        let passage = newMaze.emptyAnim.shift()
        function carving() {
            if(newMaze.emptyAnim.length >= 1) {
             passage.state = "PS"
             newMaze.render()
             passage = newMaze.emptyAnim.shift()
             requestAnimationFrame(carving)   
            }else {
                newMaze.placeStartAndEndPoint()
                newMaze.render()
                solve.disabled = false
                generator.disabled = false
            }
        }
        requestAnimationFrame(carving)
    }else if(option === "DFS") {
        solve.disabled = true
        newMaze = new DFSMaze()
        newMaze.initializeGrid(size, option)
        newMaze.DFS([0, size-1], [0, size-1], [1, 1])
        let passage = newMaze.emptyAnim.shift()
        function carving() {
            if(newMaze.emptyAnim.length >= 1) {
             passage.state = "PS"
             newMaze.render()
             passage = newMaze.emptyAnim.shift()
             requestAnimationFrame(carving)   
            }else {
                newMaze.placeStartAndEndPoint()
                newMaze.render()
                solve.disabled = false
                generator.disabled = false
            }
        }
        requestAnimationFrame(carving)
    }else {
        alert("Pick algorithm first!")
    }
}

function solveMaze() {
    if(newMaze !== undefined) {
        solve.disabled = true
        newMaze.dfs()
        let currentCell = newMaze.animation.shift()
        let array = []
        function animate() {
            if(currentCell) {
                if(currentCell.state === "#") {
                    newMaze.solvingStep(currentCell)
                    array.push(currentCell)
                }else if(currentCell.state === "$") {
                    newMaze.repeateStep(currentCell)
                }
                currentCell = newMaze.animation.shift()
                requestAnimationFrame(animate)
            }else{
                alert("End cell has been found!")
            }
        }
        requestAnimationFrame(animate)
    }
}

function handleGenerator() {
    generate(option, size.value);
}


rdButton.addEventListener("click", getAlgorithmName)
primButton.addEventListener("click", getAlgorithmName)
dfsButtion.addEventListener("click" , getAlgorithmName)

generator.addEventListener("click", handleGenerator)
solve.addEventListener("click", solveMaze)