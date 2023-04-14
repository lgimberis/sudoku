"use strict";
const TILE_WIDTH = 3;
const BOARD_WIDTH = TILE_WIDTH * TILE_WIDTH;
const BOARD_SQUARES = BOARD_WIDTH * BOARD_WIDTH;
const LETTERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] //, 'a', 'b', 'c', 'd', 'e', 'f', '0']

function setup() {
  // Create our board, fill it, empty it, and add relevant event listeners.

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
  hideSomeSquares(this.board, 0.5);
  this.render();
}

function onType(event) {
  // Update the DOM and board when the user types a valid key having selected a square.
  let key = event.key.toString();
  if (this.squareTarget >= 0 && LETTERS.includes(key)) {
    this.board[this.squareTarget] = key
    for (let child of this.domBoard[this.squareTarget].children) {
      child.innerText = key
    }
    this.domBoard[this.squareTarget].setAttribute('class', 'hexoku-square');
    this.squareTarget = -1;
    this.render();
  }
}

function onClickSquare(index, hexoku) {
  // Makes a square look "clicked". Also tag it as being the target of keyboard inputs.
  return function(event) {
    this.setAttribute('class', 'hexoku-square hexoku-clicked');
    hexoku.squareTarget = index;
  }
}

function onClickBoard(event) {
  // Reset the class on all squares so none appear "clicked". Reset the target so typing does nothing again.
  for (let i = 0; i < BOARD_SQUARES; i++) {
    this.domBoard[i].setAttribute('class', 'hexoku-square');
  }
  this.squareTarget = -1;
}

function render() {
  // Update DOM elements according to our in-memory board
  for (let i = 0; i < BOARD_SQUARES; i++) {
    this.domBoard[i].innerText = this.board[i];
  }
  console.log("Board is valid: ", this.isBoardValid(this.board));
}

function squaresInRow(board, row) {
  // Return an array of the non-empty contents of all squares in row #{row}
  let squares = []
  for (let i = row * BOARD_WIDTH; i < (row + 1) * BOARD_WIDTH; i++) {
    if (board[i]) {
      squares.push(board[i]);
    }
  }
  return squares;
}

function squaresInColumn(board, column) {
  // Return an array of the non-empty contents of all squares in column #{column}
  let squares = []
  for (let rowIndex = 0; rowIndex < BOARD_SQUARES; rowIndex += BOARD_WIDTH) {
    if (board[rowIndex + column]) {
      squares.push(board[rowIndex + column]);
    }
  }
  return squares;
}

function coordToTileIndex(row, column) {
  // Convert a {row, column} combination to a "tile index".
  return Math.floor(row / TILE_WIDTH) * TILE_WIDTH + Math.floor(column / TILE_WIDTH);
}

function indexToTileIndex(index) {
  // Convert an array index to a {row, column} combination and return the "tile index"
  let column = index % BOARD_WIDTH;
  let row = (index - column) / BOARD_WIDTH;
  return this.coordToTileIndex(row, column);
}

function squaresInTile(board, tileIndex) {
  // Return an array of the non-empty contents of all squares in tile #{tileIndex}
  let squares = []
  let rowStart = TILE_WIDTH * Math.floor(tileIndex / TILE_WIDTH)
  let columnStart = TILE_WIDTH * (tileIndex % TILE_WIDTH);
  for (let row = rowStart; row < rowStart + TILE_WIDTH; row++) {
    let rowIndex = row * BOARD_WIDTH;
    for (let column = columnStart; column < columnStart + TILE_WIDTH; column++) {
      if (board[rowIndex + column]) {
        squares.push(board[rowIndex + column]);
      }
    }
  }
  return squares;
}

function doesArrayHaveDuplicates(array) {
  // Helper function for checking if an array has any duplicate items
  return array.filter((x, i) => array.indexOf(x) != i).length > 0;
}

function isPlacementValid(board, index, value) {
  // Check if it is valid to place 'value' at square 'index'
  let column = index % BOARD_WIDTH;
  let row = (index - column) / BOARD_WIDTH;

  // Test row
  let isRowValid = !(this.squaresInRow(board, row).includes(value));

  // Test column
  let isColumnValid = !(this.squaresInColumn(board, column).includes(value));

  // Test the surrounding tile
  let isTileValid = !(this.squaresInTile(board, this.coordToTileIndex(row, column)).includes(value));
  return isRowValid && isColumnValid && isTileValid;
}

function isBoardValid(board) {
  // Check that our board abides by the rules of Sudoku
  // Rows, columns, and tiles are all checked
  for (let i = 0; i < BOARD_WIDTH; i++) {
    let rowDuplicates = doesArrayHaveDuplicates(this.squaresInRow(board, i));
    let columnDuplicates = doesArrayHaveDuplicates(this.squaresInColumn(board, i));
    let tileDuplicates = doesArrayHaveDuplicates(this.squaresInTile(board, i));
    if (rowDuplicates || columnDuplicates || tileDuplicates) {
      return false;
    }
  }
  return true;
}

function generateSolvedBoard() {
  // Randomly generate a solved board
  let board = Array(BOARD_SQUARES).fill('')
  let history = Array(BOARD_SQUARES).fill(0);
  history[0] = Array.from(LETTERS);

  let square = 0;
  while (square < BOARD_SQUARES) {
    if (history[0].length == 0) {
      console.log("Could not generate any board at all. Shameful!");
      return;
    }

    // Reset all possible options for the next square
    if (square < BOARD_SQUARES - 1) {
      history[square + 1] = Array.from(LETTERS);
    }

    let placed = false;
    while (!placed && history[square].length > 0) {
      let letterIndex = Math.floor(Math.random() * history[square].length);
      let letter = history[square].splice(letterIndex, 1)[0];

      if (this.isPlacementValid(board, square, letter)) {
        board[square] = letter;
        placed = true;
        square++;
      }

    }

    if (!placed) {
      board[square] = '';
      square--;
    }
  }
  this.board = board;
}

function hideSomeSquares(board, percentage) {
  // Replace {percentage}% of squares in board with empty space
  let squares = Array(BOARD_SQUARES).fill(0).map((x, i) => i);
  for (let squareNumber = 0; squareNumber < Math.floor(BOARD_SQUARES * percentage); squareNumber++) {
    let index = Math.floor(Math.random() * squares.length);
    let square = squares.splice(index, 1)[0];
    board[square] = '';
  }
}

let hexoku = {
  setup: setup,
  render: render,
  squaresInRow: squaresInRow,
  squaresInColumn: squaresInColumn,
  squaresInTile: squaresInTile,
  coordToTileIndex: coordToTileIndex,
  isBoardValid: isBoardValid,
  isPlacementValid: isPlacementValid,
  generateSolvedBoard: generateSolvedBoard,
  onClickBoard: onClickBoard,
  squareTarget: -1,
  onType: onType
};

window.addEventListener('load', hexoku.setup());
