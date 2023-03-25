const gridSize = 4;
let gridMax = []; //store values to use when storing elements to 2D array
let BoardArray = new Array(gridSize)
  .fill(0)
  .map(() => new Array(gridSize).fill("")); //store played positions here -> initialized as empty
let gameStatus = document.getElementById("game-status");

function playerMove(id) {
  //   console.log(id);
  document.getElementById(id).innerText = id % 2 === 0 ? "X" : "O";
  id = Number(id);
  let divider = Math.floor(id / gridSize);
  let col = id - gridSize * divider;
  let row = Math.floor(id / gridSize);
  //   console.log(`row: ${row}, col: ${col}`);

  //   if the spot in array is blank add X or O then scwitch player
  if (BoardArray[row][col] === "") {
    BoardArray[row][col] = id % 2 === 0 ? "X" : "O";
    // [TODO:] switch player
  }
}

function evaluateGame() {
  // horizontal check()
}

function generateBoard() {
  let gameBoard = document.getElementById("game-board");
  for (let i = 0; i < gridSize * gridSize; i++) {
    // add values to be used to determine position of X's and O's in 2D array
    if (i < gridSize) {
      gridMax.push((i / gridSize) * 100);
    }
    let block = document.createElement("div");
    block.id = i;
    let gridClass = `grid${gridSize}X${gridSize}`;
    block.classList.add("game-block", gridClass);
    block.setAttribute("onclick", "playerMove(this.id)");
    gameBoard.append(block);
  }
}

function gameSetup() {}
generateBoard();
console.log(`grid max ${gridMax}`);
console.log(`board array ${BoardArray[2][0]}`);
