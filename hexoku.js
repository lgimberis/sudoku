"use strict";
const TILE_WIDTH = 3;
const BOARD_WIDTH = TILE_WIDTH * TILE_WIDTH;
const BOARD_SQUARES = BOARD_WIDTH * BOARD_WIDTH;
const LETTERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] //, 'a', 'b', 'c', 'd', 'e', 'f', '0']

function setup() {
  let root = document.getElementById("hexoku");
  this.board = new Array(BOARD_SQUARES).fill('');
  this.domBoard = new Array(BOARD_SQUARES).fill(0);
  let board = document.createElement("table");
  board.addEventListener('click', this.onClickBoard.bind(this), true);
  document.addEventListener('keydown', this.onType.bind(this), true);
  root.appendChild(board);
  for (let y = 0; y < BOARD_WIDTH; y++) {
    let row = document.createElement("tr");
    row.setAttribute('class', 'hexoku-row');
    board.appendChild(row);
    for (let x = 0; x < BOARD_WIDTH; x++) {
      let column = document.createElement("td");
      column.setAttribute('class', 'hexoku-square');
      column.addEventListener('click', onClickSquare(y * BOARD_WIDTH + x, this).bind(column));
      row.appendChild(column);
      let columnTextElement = document.createElement("span");
      columnTextElement.setAttribute('class', 'hexoku-square-text');
      column.appendChild(columnTextElement);
      this.domBoard[y * BOARD_WIDTH + x] = column;
    }
  }
  this.generateSolvedBoard();
  this.render();
}

function onType(event) {
  let key = event.key.toString();
  if (this.squareTarget >= 0 && LETTERS.includes(key)) {
    this.board[this.squareTarget] = key
    for (let child of this.domBoard[this.squareTarget].children) {
      child.innerText = key
    }
    this.domBoard[this.squareTarget].setAttribute('class', 'hexoku-square');
    this.squareTarget = -1;
  }
  this.render();
}

function onClickSquare(index, hexoku) {
  return function(event) {
    this.setAttribute('class', 'hexoku-square hexoku-clicked');
    hexoku.squareTarget = index;
  }
}

function onClickBoard(event) {
  for (let i = 0; i < BOARD_SQUARES; i++) {
    this.domBoard[i].setAttribute('class', 'hexoku-square');
  }
}

function render() {
  // Set all DOM elements according to our in-memory board
  for (let i = 0; i < BOARD_SQUARES; i++) {
    this.domBoard[i].innerText = this.board[i];
  }
  console.log("Board is valid: ", this.isBoardValid());
}

function squaresInRow(row) {
  let squares = []
  for (let i = row * BOARD_WIDTH; i < (row + 1) * BOARD_WIDTH; i++) {
    squares.push(this.board[i]);
  }
  return squares;
}

function squaresInColumn(column) {
  let squares = []
  for (let rowIndex = 0; rowIndex < BOARD_SQUARES; rowIndex += BOARD_WIDTH) {
    squares.push(this.board[rowIndex + column]);
  }
  return squares;
}

function coordToTileIndex(row, column) {
  return Math.floor(row / TILE_WIDTH) * TILE_WIDTH + Math.floor(column / TILE_WIDTH);
}

function indexToTileIndex(index) {
  let column = index % BOARD_WIDTH;
  let row = (index - column) / BOARD_WIDTH;
  return this.coordToTileIndex(row, column);
}

function squaresInTile(tileIndex) {
  let squares = []
  let rowStart = TILE_WIDTH * Math.floor(tileIndex / TILE_WIDTH)
  let columnStart = TILE_WIDTH * (tileIndex % TILE_WIDTH);
  for (let row = rowStart; row < rowStart + TILE_WIDTH; row++) {
    let rowIndex = row * BOARD_WIDTH;
    for (let column = columnStart; column < columnStart + TILE_WIDTH; column++) {
      squares.push(this.board[rowIndex + column]);
    }
  }
  return squares;
}

function testUniquePattern(iterationSkipSize, stepSize, iterationStart, iterationEnd, stepStart, stepEnd) {
  let start = 0;
  for (let iteration = 0; iteration < BOARD_WIDTH; iteration++) {
    if (iteration >= iterationStart && iteration <= iterationEnd) {
      let haveElements = []
      let index = start;
      for (let step = 0; step < BOARD_WIDTH; step++) {
        if (step >= stepStart && step <= stepEnd && this.board[index]) {
          if (haveElements.includes(this.board[index])) {
            return false;
          }
          haveElements.push(this.board[index]);
        }
        index += stepSize(step);
      }
    }
    start += iterationSkipSize(iteration);
  }
  return true;
}

function testAllPatterns(iterationSkipSize, stepSize) {
  return this.testUniquePattern(iterationSkipSize, stepSize, 0, BOARD_WIDTH - 1, 0, BOARD_WIDTH - 1)
}

function isPlacementValid(index, value) {
  // Is it valid to place 'value' at square 'index'?
  let column = index % BOARD_WIDTH;
  let row = (index - column) / BOARD_WIDTH;

  // Test row
  let isRowValid = !(this.squaresInRow(row).includes(value));

  // Test column
  let isColumnValid = !(this.squaresInColumn(column).includes(value));

  // Test the surrounding [4]x[4] square
  let isTileValid = !(this.squaresInTile(this.coordToTileIndex(row, column)).includes(value));
  return isRowValid && isColumnValid && isTileValid;
}

function isBoardValid() {
  // Test rows
  let rows = this.testAllPatterns((i) => BOARD_WIDTH, (i) => 1);

  // Test columns
  let columns = this.testAllPatterns((i) => 1, (i) => BOARD_WIDTH);

  // Test [4]x[4] squares
  let tiles = this.testAllPatterns(
    (i) => i % TILE_WIDTH == TILE_WIDTH - 1 ? ((TILE_WIDTH - 1) * BOARD_WIDTH + 1) * TILE_WIDTH : TILE_WIDTH,
    (i) => i % TILE_WIDTH == TILE_WIDTH - 1 ? BOARD_WIDTH - TILE_WIDTH + 1 : 1
  );

  return rows && columns && tiles;
}

function generateSolvedBoard() {
  // Randomly generate a solved board
  let board = Array(BOARD_SQUARES).fill('')
  for (let letter of LETTERS) {
    // Fill in the board, all copies of a digit at a time (e.g. all 0s, then all 1s, etc)
    let rows = Array(BOARD_WIDTH).fill(0).map((x, i) => i);
    let columns = Array.from(rows);

    for (let tile = 0; tile < BOARD_WIDTH; tile++) {
      let rowStart = Math.floor(tile / TILE_WIDTH) * TILE_WIDTH; // Lowest row that is in this tile
      let columnStart = (tile % TILE_WIDTH) * TILE_WIDTH; // Lowest column in the tile

      let row = -1;
      let column = -1;
      let deadlock = 0;
      while ((!rows.includes(row) || !columns.includes(column) || board[row * BOARD_WIDTH + column] != '') && deadlock < 1000) {
        row = rowStart + Math.floor(Math.random() * TILE_WIDTH);
        column = columnStart + Math.floor(Math.random() * TILE_WIDTH);
        deadlock++;
      }
      if (deadlock < 1000) {
        rows.splice(rows.indexOf(row), 1);
        columns.splice(columns.indexOf(column), 1);
        board[row * BOARD_WIDTH + column] = letter;
      } else {
        this.board = board;
        return;
        console.log("Deadlocked");
      }

    }
  }
  this.board = board;
}

function bruteForcePlaceSquares(numSquares) {
  // Get the player started by placing some Squares at random.
  let squaresAvailable = Array(BOARD_SQUARES).fill(0).map((x, i) => i);
  for (let squaresPlaced = 0; squaresPlaced < numSquares; squaresPlaced++) {
    // Pick a random empty Square
    let testSquareIndex = Math.floor(Math.random() * (BOARD_SQUARES - squaresPlaced));
    let testSquare = squaresAvailable.splice(testSquareIndex, 1)[0];
    let testValue = ''

    let lettersAvailable = Array(BOARD_WIDTH).fill(0).map((x, i) => LETTERS[i]);
    let thisSquareValid = false;
    while (!thisSquareValid && lettersAvailable.length) {
      let letterAvailableIndex = Math.floor(Math.random() * lettersAvailable.length);
      testValue = lettersAvailable.splice(letterAvailableIndex, 1)[0];
      thisSquareValid = this.isPlacementValid(testSquare, testValue)
      if (!thisSquareValid) { console.log("Value collision") }
    }
    if (lettersAvailable.length) {
      this.board[testSquare] = testValue;
    } else {
      console.log("No available tiles!")
      this.board[testSquare] = "!?";
    }
  }
}


let hexoku = {
  setup: setup,
  render: render,
  testAllPatterns: testAllPatterns,
  squaresInRow: squaresInRow,
  squaresInColumn: squaresInColumn,
  squaresInTile: squaresInTile,
  coordToTileIndex: coordToTileIndex,
  testUniquePattern: testUniquePattern,
  isBoardValid: isBoardValid,
  isPlacementValid: isPlacementValid,
  generateSolvedBoard: generateSolvedBoard,
  onClickBoard: onClickBoard,
  squareTarget: -1,
  onType: onType
};

window.addEventListener('load', hexoku.setup());
