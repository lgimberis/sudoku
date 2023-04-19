import { Sudoku } from "./sudoku.js"

const DIFFICULTIES = {
  "difficulty-easy": 0.3,
  "difficulty-medium": 0.5,
  "difficulty-hard": 0.7
}

window.addEventListener('load', () => {
  let sudoku = new Sudoku(0.5);
  let restartForm = document.getElementById('sudoku-form');
  restartForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let formData = new FormData(restartForm);
    let percentageHidden = DIFFICULTIES["difficulty-medium"];
    for (const [key, value] of formData.entries()) {
      if (key == "sudoku-difficulty") {
        percentageHidden = DIFFICULTIES[value];
      }
    }
    sudoku.startGame(percentageHidden);
  });
});


