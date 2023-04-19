"use strict";

const LETTERS = {
  3: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  4: ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', '0']
}

const CLASSES = {
  3: {
    'board': 'sudoku',
    'square': 'sudoku-square',
    'squareText': 'sudoku-square-text',
    'squareFixed': 'sudoku-square sudoku-square-fixed',
    'squareClicked': 'sudoku-square sudoku-clicked',
    'squareWon': 'sudoku-square sudoku-square-fixed sudoku-won',
    'row': 'sudoku-row'
  },
  4: {
    'board': 'hexoku',
    'square': 'hexoku-square',
    'squareText': 'hexoku-square-text',
    'squareFixed': 'hexoku-square hexoku-square-fixed',
    'squareClicked': 'hexoku-square hexoku-clicked',
    'squareWon': 'hexoku-square hexoku-square-fixed hexoku-won',
    'row': 'hexoku-row'
  }
}

export const hexoku = {
  squareTarget: -1,
  init(hiddenSquarePercentage = 0.5) {
    // Create our board, fill it, empty it, and add relevant event listeners.
    let root = null;
    let width = null;
    for (const _width in CLASSES) {
      root = document.getElementById(CLASSES[_width].board);
      if (root) {
        width = Number(_width);
        break;
      }
    }
    if (!root) {
      console.error("No matching ID found")
    }
    this.letters = LETTERS[width];
    this.tileWidth = width;
    this.boardWidth = width * width;
    this.numSquares = this.boardWidth * this.boardWidth;
    this.domBoard = new Array(this.numSquares).fill(0);
    let board = document.createElement("table");
    board.addEventListener('click', this.onClickBoard.bind(this), true);
    document.addEventListener('keydown', this.onType.bind(this), true);
    root.appendChild(board);
    for (let y = 0; y < this.boardWidth; y++) {
      let row = document.createElement("tr");
      row.setAttribute('class', CLASSES[width].row);
      board.appendChild(row);
      for (let x = 0; x < this.boardWidth; x++) {
        let square = document.createElement("td");
        square.setAttribute('class', CLASSES[width].square);
        row.appendChild(square);
        let squareTextElement = document.createElement("span");
        squareTextElement.setAttribute('class', CLASSES[width].squareText);
        square.appendChild(squareTextElement);
        this.domBoard[y * this.boardWidth + x] = square;
      }
    }
    this.startGame(hiddenSquarePercentage);
  },
  startGame(hiddenSquarePercentage) {
    this.board = new Array(this.numSquares).fill('');
    this.board = this.generateSolvedBoard(this.tileWidth);
    this.board = this.hideSomeSquares(this.board, hiddenSquarePercentage);
    this.distinguishFilledSquares();
    this.render();
  },
  onType(event) {
    // Update the DOM and board when the user types a valid key having selected a square.
    let key = event.key.toString();
    if (this.squareTarget >= 0 && this.letters.includes(key)) {
      this.board[this.squareTarget] = key
      for (let child of this.domBoard[this.squareTarget].children) {
        child.innerText = key
      }
      if (this.isBoardComplete(this.board)) {
        // Player has won
        for (let i = 0; i < this.numSquares; i++) {
          this.domBoard[i].setAttribute('class', CLASSES[this.tileWidth].squareWon);
        }
      } else {
        this.domBoard[this.squareTarget].setAttribute('class', CLASSES[this.tileWidth].square);
      }
      this.squareTarget = -1;
      this.render();
    }
  },

  onClickSquare(index, hexoku) {
    // Makes a square look "clicked". Also tag it as being the target of keyboard inputs.
    return function(_event) {
      this.setAttribute('class', CLASSES[hexoku.tileWidth].squareClicked);
      hexoku.squareTarget = index;
    }
  },


  render() {
    // Update DOM elements according to our in-memory board
    for (let i = 0; i < this.numSquares; i++) {
      this.domBoard[i].children[0].innerText = this.board[i];
    }
    console.log("Board is valid: ", this.isBoardValid(this.board));
  },
  squaresInRow(board, row) {
    // Return an array of the non-empty contents of all squares in row #{row}
    let squares = []
    for (let i = row * this.boardWidth; i < (row + 1) * this.boardWidth; i++) {
      if (board[i]) {
        squares.push(board[i]);
      }
    }
    return squares;
  },

  squaresInColumn(board, column) {
    // Return an array of the non-empty contents of all squares in column #{column}
    let squares = []
    for (let rowIndex = 0; rowIndex < this.numSquares; rowIndex += this.boardWidth) {
      if (board[rowIndex + column]) {
        squares.push(board[rowIndex + column]);
      }
    }
    return squares;
  },

  coordToTileIndex(row, column) {
    // Convert a {row, column} combination to a "tile index".
    return Math.floor(row / this.tileWidth) * this.tileWidth + Math.floor(column / this.tileWidth);
  },

  indexToTileIndex(index) {
    // Convert an array index to a {row, column} combination and return the "tile index"
    let column = index % this.boardWidth;
    let row = (index - column) / this.boardWidth;
    return this.coordToTileIndex(row, column);
  },

  squaresInTile(board, tileIndex) {
    // Return an array of the non-empty contents of all squares in tile #{tileIndex}
    let squares = []
    let rowStart = this.tileWidth * Math.floor(tileIndex / this.tileWidth)
    let columnStart = this.tileWidth * (tileIndex % this.tileWidth);
    for (let row = rowStart; row < rowStart + this.tileWidth; row++) {
      let rowIndex = row * this.boardWidth;
      for (let column = columnStart; column < columnStart + this.tileWidth; column++) {
        if (board[rowIndex + column]) {
          squares.push(board[rowIndex + column]);
        }
      }
    }
    return squares;
  },
  onClickBoard(_event) {
    // Reset the class on all squares so none appear "clicked". Reset the target so typing does nothing again.
    if (this.squareTarget != -1) {
      let i = this.squareTarget;
      if (this.domBoard[i].getAttribute('class') == CLASSES[this.tileWidth].squareClicked) {
        this.domBoard[i].setAttribute('class', CLASSES[this.tileWidth].square);
      }
    }
    this.squareTarget = -1;
  },
  doesArrayHaveDuplicates(array) {
    // Helper for checking if an array has any duplicate items
    return array.filter((x, i) => array.indexOf(x) != i).length > 0;
  },
  isPlacementValid(board, index, value) {
    // Check if it is valid to place 'value' at square 'index'
    let column = index % this.boardWidth;
    let row = (index - column) / this.boardWidth;

    // Test row
    let isRowValid = !(this.squaresInRow(board, row).includes(value));

    // Test column
    let isColumnValid = !(this.squaresInColumn(board, column).includes(value));

    // Test the surrounding tile
    let isTileValid = !(this.squaresInTile(board, this.coordToTileIndex(row, column)).includes(value));
    return isRowValid && isColumnValid && isTileValid;
  },
  isBoardValid(board) {
    // Check that our board abides by the rules of Sudoku
    // Rows, columns, and tiles are all checked
    for (let i = 0; i < this.boardWidth; i++) {
      let rowDuplicates = this.doesArrayHaveDuplicates(this.squaresInRow(board, i));
      let columnDuplicates = this.doesArrayHaveDuplicates(this.squaresInColumn(board, i));
      let tileDuplicates = this.doesArrayHaveDuplicates(this.squaresInTile(board, i));
      if (rowDuplicates || columnDuplicates || tileDuplicates) {
        return false;
      }
    }
    return true;
  },
  isBoardComplete(board) {
    // Check whether the board is complete and the player has 'won'
    for (let i = 0; i < this.numSquares; i++) {
      if (board[i] == '') {
        return false;
      }
    }
    return this.isBoardValid(board);
  },
  generateSolvedBoard() {
    // Randomly generate a solved board
    let board = Array(this.numSquares).fill('')
    let history = Array(this.numSquares).fill(0);
    history[0] = Array.from(this.letters);

    let square = 0;
    while (square < this.numSquares) {
      if (history[0].length == 0) {
        console.log("Could not generate any board at all. Shameful!");
        return;
      }

      // Reset all possible options for the next square
      if (square < this.numSquares - 1) {
        history[square + 1] = Array.from(this.letters);
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
    return board;
  },
  hideSomeSquares(board, percentage) {
    // Replace {percentage}% of squares in board with empty space
    let squares = Array(this.numSquares).fill(0).map((_x, i) => i);
    for (let squareNumber = 0; squareNumber < Math.ceil(this.numSquares * percentage); squareNumber++) {
      let index = Math.floor(Math.random() * squares.length);
      let square = squares.splice(index, 1)[0];
      board[square] = '';
    }
    return board
  },
  distinguishFilledSquares() {
    // Set a 'fixed' CSS class for the squares that the player starts with.
    // Add an event listener for the squares that the player can edit.
    for (let squareNumber = 0; squareNumber < this.numSquares; squareNumber++) {
      if (this.board[squareNumber]) {
        this.domBoard[squareNumber].setAttribute('class', CLASSES[this.tileWidth].squareFixed);
      } else {
        this.domBoard[squareNumber].addEventListener('click', this.onClickSquare(squareNumber, this).bind(this.domBoard[squareNumber]));
      }
    }
  }
};

