import { Hexoku } from "./hexoku.js"

const DIFFICULTIES = {
  "difficulty-easy": 0.3,
  "difficulty-medium": 0.5,
  "difficulty-hard": 0.7
}

window.addEventListener('load', () => {
  let hexoku = new Hexoku(0.5);
  let restartForm = document.getElementById('hexoku-form');
  restartForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let formData = new FormData(restartForm);
    let percentageHidden = DIFFICULTIES["difficulty-medium"];
    for (const pair of formData.entries()) {
      let key = pair[0];
      let value = pair[1];
      if (key == "hexoku-difficulty") {
        percentageHidden = DIFFICULTIES[value];
      }
    }
    hexoku.startGame(percentageHidden);
  });
});


