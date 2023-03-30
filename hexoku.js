"use strict";
const TILE_WIDTH = 4;
const BOARD_WIDTH = TILE_WIDTH * TILE_WIDTH;
const BOARD_SQUARES = BOARD_WIDTH * BOARD_WIDTH;
const LETTERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

function setup() {
  let root = document.getElementById("hexoku");
  this.board = new Array(BOARD_SQUARES);
  this.domBoard = {};
  let board = document.createElement("table");
  root.appendChild(board);
  for (let y = 0; y < BOARD_WIDTH; y++) {
    let row = document.createElement("tr");
    row.setAttribute('class', 'hexoku-row');
    board.appendChild(row);
    for (let x = 0; x < BOARD_WIDTH; x++) {
      let column = document.createElement("td");
      column.setAttribute('class', 'hexoku-square');
      row.appendChild(column);
      let columnTextElement = document.createElement("span");
      columnTextElement.setAttribute('class', 'hexoku-square-text');
      column.appendChild(columnTextElement);
      this.domBoard[y * BOARD_WIDTH + x] = columnTextElement;
    }
  }
}

function testUniquePattern(iterationSkipSize, stepSize, iterationStart, iterationEnd, stepStart, stepEnd) {
  let start = 0;
  for (let iteration = iterationStart; iteration < iterationEnd; iteration++) {
    let haveElements = []
    let index = start;
    for (let step = stepStart; step < stepEnd; step++) {
      if (this.board[index] && this.board[index] in haveElements) {
        return false;
      }
      haveElements.push(this.board[index]);
      index += stepSize(step);
    }
    start += iterationSkipSize(iteration);
  }
  return true;
}

function testAllPatterns(iterationSkipSize, stepSize) {
  return this.testUniquePattern(iterationSkipSize, 0, BOARD_WIDTH, 0, BOARD_WIDTH)
}

function isPlacementValid(index, value) {
  // Is it valid to place 'value' at square 'index'?
  // Test row
  let column = index % BOARD_WIDTH;
  let row = Math.floor((index - column) / BOARD_WIDTH);
  let rows = this.testUniquePattern((i) => { BOARD_WIDTH }, (i) => { 1 });

  // Test columns
  let columns = this.testUniquePattern((i) => { 1 }, (i) => { BOARD_WIDTH });

  // Test [4]x[4] squares
  let tiles = this.testUniquePattern(
    (i) => { i % TILE_WIDTH == TILE_WIDTH - 1 ? ((TILE_WIDTH - 1) * BOARD_WIDTH + 1) * TILE_WIDTH : TILE_WIDTH },
    (i) => { i % TILE_WIDTH == TILE_WIDTH - 1 ? BOARD_WIDTH - TILE_WIDTH + 1 : 1 }
  );
}

function isBoardValid() {
  // Test rows
  let rows = this.testAllPatterns((i) => { BOARD_WIDTH }, (i) => { 1 });

  // Test columns
  let columns = this.testAllPatterns((i) => { 1 }, (i) => { BOARD_WIDTH });

  // Test [4]x[4] squares
  let tiles = this.testAllPatterns(
    (i) => { i % TILE_WIDTH == TILE_WIDTH - 1 ? ((TILE_WIDTH - 1) * BOARD_WIDTH + 1) * TILE_WIDTH : TILE_WIDTH },
    (i) => { i % TILE_WIDTH == TILE_WIDTH - 1 ? BOARD_WIDTH - TILE_WIDTH + 1 : 1 }
  );

  return rows && columns && tiles;
}

function bruteForcePlaceSquares(numSquares) {
  // Get the player started by placing some Squares at random.
  for (let squaresPlaced = 0; squaresPlaced < numSquares; squaresPlaced++) {
    // Pick a random empty Square
    let testSquareIndex = 0;
    let squareIsEmpty = false;
    while (!squareIsEmpty) {
      testSquareIndex = Math.floor(Math.random() * BOARD_SQUARES);
      squareIsEmpty = this.board[testSquareIndex] == ''
    }
    let testValue = ''
    let thisSquareValid = false;
    while (!thisSquareValid) {
      testValue = LETTERS[Math.floor(Math.random() * BOARD_WIDTH)];
      thisSquareValid = this.isPlacementValid(testSquareIndex, testValue)
    }
    this.board[testSquareIndex] = testValue;
  }
}


let hexoku = {
  setup: setup,
  testUniquePattern: testUniquePattern,
  isBoardValid: isBoardValid
};

window.addEventListener('load', hexoku.setup());
