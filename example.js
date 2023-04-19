import { Hexoku } from "./hexoku.js"

window.addEventListener('load', () => {
  let hexoku = new Hexoku(0.5);
  let restartButton = document.getElementById('hexoku-restart');
  restartButton.addEventListener('click', hexoku.startGame.bind(hexoku, 0.5));
});
