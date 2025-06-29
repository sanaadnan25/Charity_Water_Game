// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timerInterval; // Timer interval reference
let timeLeft = 30; // Default game time
let dropInterval = 700; // ms, default for normal
let dropDuration = 2.8; // seconds, default for normal
let cleanRatio = 0.7;   // default for normal
let selectedDifficulty = null;

// Difficulty settings
const difficultySettings = {
  easy:   { dropInterval: 900, dropDuration: 3.5, cleanRatio: 0.85, time: 35 },
  normal: { dropInterval: 700, dropDuration: 2.8, cleanRatio: 0.7,  time: 30 },
  hard:   { dropInterval: 450, dropDuration: 2.1, cleanRatio: 0.55, time: 25 }
};

// Difficulty button logic
// Move all logic outside DOMContentLoaded and ensure script is loaded at the end of <body>
const diffBtns = Array.from(document.querySelectorAll('.difficulty-btn'));
const startBtn = document.getElementById("start-btn");

// Hide start button initially
startBtn.classList.remove('show');
startBtn.style.display = 'none';

// Attach event listeners immediately
diffBtns.forEach(btn => {
  btn.disabled = false;
  btn.addEventListener('click', function() {
    diffBtns.forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    selectedDifficulty = this.dataset.difficulty;
    startBtn.classList.add('show');
    startBtn.style.display = 'inline-block';
    startBtn.disabled = false;
  });
});

// Wait for button click to start the game
startBtn.addEventListener("click", startGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;
  if (!selectedDifficulty) return; // Don't start if no difficulty

  // Set difficulty parameters
  const settings = difficultySettings[selectedDifficulty];
  dropInterval = settings.dropInterval;
  dropDuration = settings.dropDuration;
  cleanRatio = settings.cleanRatio;
  timeLeft = settings.time;

  gameRunning = true;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("score").textContent = 0;

  // Disable difficulty buttons during game
  diffBtns.forEach(b => b.disabled = true);
  startBtn.disabled = true;
  startBtn.classList.remove('show');
  startBtn.style.display = 'none';

  // Start timer
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  // Create new drops at the selected interval
  dropMaker = setInterval(createDrop, dropInterval);
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");

  // Use cleanRatio for current difficulty
  const isClean = Math.random() < cleanRatio; // 70% clean, 30% polluted
  drop.className = isClean ? "water-drop" : "water-drop bad-drop";

  // Set all drops to the same size
  const size = 80;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract drop size to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - size);
  drop.style.left = xPosition + "px";

  // Use dropDuration for current difficulty
  drop.style.animationDuration = dropDuration + "s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });

  // Add click event for scoring
  drop.addEventListener("click", function (e) {
    if (!gameRunning) return;
    let scoreElem = document.getElementById("score");
    let score = parseInt(scoreElem.textContent, 10);
    const dropRect = drop.getBoundingClientRect();
    const containerRect = document.getElementById("game-container").getBoundingClientRect();
    if (drop.classList.contains("bad-drop")) {
      score--;
      // Show -1 animation
      const minusOne = document.createElement("div");
      minusOne.className = "minus-one";
      minusOne.textContent = "-1";
      minusOne.style.left = (dropRect.left - containerRect.left + dropRect.width/2 - 20) + "px";
      minusOne.style.top = (dropRect.top - containerRect.top + dropRect.height/2 - 30) + "px";
      document.getElementById("game-container").appendChild(minusOne);
      setTimeout(() => minusOne.remove(), 1000);
    } else {
      score++;
      // Show +1 animation
      const plusOne = document.createElement("div");
      plusOne.className = "plus-one";
      plusOne.textContent = "+1";
      plusOne.style.left = (dropRect.left - containerRect.left + dropRect.width/2 - 20) + "px";
      plusOne.style.top = (dropRect.top - containerRect.top + dropRect.height/2 - 30) + "px";
      document.getElementById("game-container").appendChild(plusOne);
      setTimeout(() => plusOne.remove(), 1000);
    }
    scoreElem.textContent = score;
    drop.remove(); // Remove drop after click
  });
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  // Remove all drops
  document.querySelectorAll('.water-drop, .bad-drop').forEach(d => d.remove());
  // Show final score overlay
  showFinalScore();
  // Re-enable difficulty buttons after game ends
  diffBtns.forEach(b => b.disabled = false);
  startBtn.disabled = !selectedDifficulty;
}

function showFinalScore() {
  let overlay = document.createElement('div');
  overlay.className = 'final-score-overlay';
  let score = parseInt(document.getElementById("score").textContent, 10);

  // Determine win threshold based on difficulty
  let winThreshold = 10;
  if (selectedDifficulty === "normal") winThreshold = 13;
  if (selectedDifficulty === "hard") winThreshold = 16;

  let win = score >= winThreshold;
  let message = win ? "🎉 You Win! 🎉" : "Game Over";
  let subMessage = win
    ? `Congratulations! You scored at least ${winThreshold}!`
    : `Try again to reach ${winThreshold} points.`;
  overlay.innerHTML = `<div class="final-score-content">${message}<br><span class='final-score-number'>Your Score: ${score}</span><br><span style='font-size:1.2rem;'>${subMessage}</span><br><button id='restart-btn'>Play Again</button></div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('show'), 10);
  if (win) showConfetti();
  document.getElementById('restart-btn').onclick = function() {
    overlay.remove();
    removeConfetti();
    // Reset difficulty selection state
    diffBtns.forEach(b => b.disabled = false);
    startBtn.disabled = !selectedDifficulty;
    document.getElementById("score").textContent = 0;
    document.getElementById("time").textContent = difficultySettings[selectedDifficulty].time;
    // Show start button again for next game
    startBtn.classList.add('show');
    startBtn.style.display = 'inline-block';
  };
}

// Confetti animation
function showConfetti() {
  for (let i = 0; i < 80; i++) {
    let conf = document.createElement('div');
    conf.className = 'confetti';
    conf.style.left = Math.random() * 100 + 'vw';
    conf.style.background = `hsl(${Math.random()*360},90%,60%)`;
    conf.style.animationDelay = (Math.random()*0.7) + 's';
    document.body.appendChild(conf);
  }
}
function removeConfetti() {
  document.querySelectorAll('.confetti').forEach(c => c.remove());
}

function removeConfetti() {
  document.querySelectorAll('.confetti').forEach(c => c.remove());
}
