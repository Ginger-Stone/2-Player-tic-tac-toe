const gridSize = 3;
let gridMax = []; //store values to use when storing elements to 2D array
let BoardArray = new Array(gridSize)
  .fill(0)
  .map(() => new Array(gridSize).fill("")); //store played positions here -> initialized as empty
let gameStatus = document.getElementById("game-status");

function evaluateGame() {
  // TODO: horizontal check()
  // TODO: vertical check()
  // TODO: diagonal check()
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

generateBoard();
console.log(`grid max ${gridMax}`);
console.log(`board array ${BoardArray[2][0]}`);
