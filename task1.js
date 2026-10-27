const MIN_NUMBER = 1;
const MAX_NUMBER = 20;
const START_LIVES = 3;
const ZERO = 0;
const STEP = 1;

const numberOutput = document.querySelector('#game-number');
const livesOutput = document.querySelector('#game-lives');
const streakOutput = document.querySelector('#game-streak');
const bestOutput = document.querySelector('#game-best');
const gameMessage = document.querySelector('#game-message');
const higherButton = document.querySelector('#game-higher');
const lowerButton = document.querySelector('#game-lower');
const restartButton = document.querySelector('#game-restart');

let currentNumber;
let lives;
let streak;
let bestStreak = ZERO;

// Both ends of the range can be generated.
function randomNumber() {
  return Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + STEP)) + MIN_NUMBER;
}

function showGameMessage(message, success) {
  gameMessage.textContent = message;
  gameMessage.classList.toggle('success', success);
  gameMessage.classList.toggle('error', !success);
}

function renderGame() {
  numberOutput.textContent = currentNumber;
  livesOutput.textContent = lives;
  streakOutput.textContent = streak;
  bestOutput.textContent = bestStreak;
  higherButton.disabled = lives === ZERO;
  lowerButton.disabled = lives === ZERO;
}

function playMove(guess) {
  // Reject invalid moves before generating a number or changing state.
  if (guess !== 'higher' && guess !== 'lower') {
    showGameMessage('Choose Higher or Lower.', false);
    return;
  }
  if (lives === ZERO) {
    showGameMessage('Game over. Press Restart to play again.', false);
    return;
  }

  const previousNumber = currentNumber;
  const nextNumber = randomNumber();
  let message;
  let correct;

  if (nextNumber === previousNumber) {
    correct = true;
    message = 'Equal numbers count as a correct guess!';
  } else if ((guess === 'higher' && nextNumber > previousNumber) ||
             (guess === 'lower' && nextNumber < previousNumber)) {
    correct = true;
    message = 'Correct guess!';
  } else {
    correct = false;
    message = 'Wrong guess. You lost a life.';
  }

  if (correct) {
    streak += STEP;
    if (streak > bestStreak) bestStreak = streak;
  } else {
    lives -= STEP;
    streak = ZERO;
  }
  currentNumber = nextNumber;
  if (lives === ZERO) message += ' Game over. Press Restart.';
  showGameMessage(`${previousNumber} → ${nextNumber}. ${message}`, correct);
  renderGame();
}

function restartGame() {
  currentNumber = randomNumber();
  lives = START_LIVES;
  streak = ZERO;
  // Keep the best streak when a new round starts.
  gameMessage.textContent = `Guess the next number (${MIN_NUMBER}–${MAX_NUMBER}).`;
  gameMessage.classList.remove('success', 'error');
  renderGame();
}

higherButton.addEventListener('click', event => playMove(event.currentTarget.dataset.guess));
lowerButton.addEventListener('click', event => playMove(event.currentTarget.dataset.guess));
restartButton.addEventListener('click', restartGame);
restartGame();
