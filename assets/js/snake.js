(function () {
  "use strict";

  const canvas = document.getElementById("snake-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("snake-score");
  const bestEl = document.getElementById("snake-best");
  const statusEl = document.getElementById("snake-status");
  const startBtn = document.getElementById("snake-start");
  const gridSize = 20;
  const tileCount = canvas.width / gridSize;
  const bestKey = "ricardocoto-snake-best";

  let snake = [];
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let food = { x: 10, y: 10 };
  let score = 0;
  let best = Number(localStorage.getItem(bestKey) || 0);
  let loopId = null;
  let running = false;
  let tickMs = 130;

  bestEl.textContent = String(best);

  function accentColor() {
    return getComputedStyle(document.documentElement).getPropertyValue("--accent-color").trim() || "#0563bb";
  }

  function resetGame() {
    snake = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    tickMs = 130;
    scoreEl.textContent = "0";
    placeFood();
    statusEl.textContent = "Playing...";
  }

  function placeFood() {
    do {
      food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
      };
    } while (snake.some((part) => part.x === food.x && part.y === food.y));
  }

  function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * gridSize + 1, y * gridSize + 1, gridSize - 2, gridSize - 2);
  }

  function draw() {
    ctx.fillStyle = "#1e2228";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCell(food.x, food.y, "#e74c3c");

    snake.forEach((part, index) => {
      drawCell(part.x, part.y, index === 0 ? accentColor() : "#7eb6f0");
    });
  }

  function gameOver() {
    running = false;
    clearInterval(loopId);
    loopId = null;
    startBtn.textContent = "Play Again";
    statusEl.textContent = `Game over. Score: ${score}`;
  }

  function update() {
    direction = nextDirection;

    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };

    if (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount) {
      gameOver();
      return;
    }

    if (snake.some((part) => part.x === head.x && part.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 1;
      scoreEl.textContent = String(score);
      if (score > best) {
        best = score;
        bestEl.textContent = String(best);
        localStorage.setItem(bestKey, String(best));
      }
      tickMs = Math.max(70, tickMs - 3);
      placeFood();
      restartLoop();
    } else {
      snake.pop();
    }

    draw();
  }

  function restartLoop() {
    if (!running) return;
    clearInterval(loopId);
    loopId = setInterval(update, tickMs);
  }

  function startGame() {
    resetGame();
    running = true;
    startBtn.textContent = "Restart";
    draw();
    restartLoop();
    canvas.focus();
  }

  function setDirection(x, y) {
    if (!running) return;
    if (x === -direction.x && y === -direction.y) return;
    nextDirection = { x, y };
  }

  function handleKeydown(event) {
    const key = event.key;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key)) {
      event.preventDefault();
    }

    if (key === " " && !running) {
      startGame();
      return;
    }

    if (!running) return;

    if (key === "ArrowUp") setDirection(0, -1);
    if (key === "ArrowDown") setDirection(0, 1);
    if (key === "ArrowLeft") setDirection(-1, 0);
    if (key === "ArrowRight") setDirection(1, 0);
  }

  startBtn.addEventListener("click", startGame);
  canvas.addEventListener("keydown", handleKeydown);
  document.addEventListener("keydown", (event) => {
    if (document.activeElement === canvas) return;
    if (!canvas.closest("#snake-game")) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
      canvas.focus();
      handleKeydown(event);
    }
  });

  document.querySelectorAll("[data-snake-dir]").forEach((button) => {
    button.addEventListener("click", () => {
      const [x, y] = button.dataset.snakeDir.split(",").map(Number);
      if (!running) startGame();
      setDirection(x, y);
      canvas.focus();
    });
  });

  draw();
})();
