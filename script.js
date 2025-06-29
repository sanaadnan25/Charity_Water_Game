// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timerInterval; // Timer interval reference
let timeLeft = 30; // Default game time

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  timeLeft = 30;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("score").textContent = 0;

  // Start timer
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  // Create new drops every 500 milliseconds (faster)
  dropMaker = setInterval(createDrop, 500);
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");

  // Randomly decide if this is a clean or polluted drop
  const isClean = Math.random() < 0.7; // 70% clean, 30% polluted
  drop.className = isClean ? "water-drop" : "water-drop bad-drop";

  // Set all drops to the same size
  const size = 80;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract drop size to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - size);
  drop.style.left = xPosition + "px";

  // Make drops fall for 2.8 seconds (faster)
  drop.style.animationDuration = "2.8s";

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
}

function showFinalScore() {
  let overlay = document.createElement('div');
  overlay.className = 'final-score-overlay';
  let score = parseInt(document.getElementById("score").textContent, 10);
  let win = score >= 10;
  let message = win ? "🎉 You Win! 🎉" : "Game Over";
  let subMessage = win ? "Congratulations! You scored at least 10!" : "Try again to reach 10 points.";
  overlay.innerHTML = `<div class="final-score-content">${message}<br><span class='final-score-number'>Your Score: ${score}</span><br><span style='font-size:1.2rem;'>${subMessage}</span><br><button id='restart-btn'>Play Again</button></div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('show'), 10);
  if (win) showConfetti();
  document.getElementById('restart-btn').onclick = function() {
    overlay.remove();
    removeConfetti();
    startGame();
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
