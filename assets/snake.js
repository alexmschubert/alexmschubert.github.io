(() => {
  'use strict';
  const board = document.getElementById('snake-board');
  const ctx = board.getContext('2d');
  const cabinet = board.closest('.game-cabinet');
  const overlay = document.getElementById('game-overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const startButton = document.getElementById('start-game');
  const pauseButton = document.getElementById('pause-game');
  const restartButton = document.getElementById('restart-game');
  const status = document.getElementById('game-status');
  const scoreLabel = document.getElementById('score');
  const bestLabel = document.getElementById('best');
  const game = new SnakeGame();
  let state = 'ready';
  let timer = null;
  let best = 0;
  try {
    const saved = Number(localStorage.getItem('as-snake-best'));
    if (Number.isInteger(saved) && saved >= 0 && saved <= 396) best = saved;
  } catch { /* The game also works with browser storage disabled. */ }
  const format = number => String(number).padStart(2, '0');
  bestLabel.textContent = format(best);

  function draw() {
    const cell = board.width / game.size;
    ctx.fillStyle = '#0e2039';
    ctx.fillRect(0, 0, board.width, board.height);
    ctx.strokeStyle = '#18324f';
    ctx.lineWidth = 1;
    for (let i = 1; i < game.size; i++) {
      ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, board.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(board.width, i * cell); ctx.stroke();
    }
    if (game.food) {
      ctx.fillStyle = '#e5a16b';
      ctx.fillRect(game.food.x * cell + 5, game.food.y * cell + 5, cell - 10, cell - 10);
    }
    game.snake.forEach((part, i) => {
      ctx.fillStyle = i === 0 ? '#e0ebfa' : '#8eafd8';
      ctx.fillRect(part.x * cell + 2, part.y * cell + 2, cell - 4, cell - 4);
    });
    const head = game.snake[0];
    ctx.fillStyle = '#233e60';
    const eyes = {
      right: [[21, 8], [21, 20]], left: [[6, 8], [6, 20]],
      up: [[8, 6], [20, 6]], down: [[8, 21], [20, 21]]
    }[game.direction];
    eyes.forEach(([x, y]) => ctx.fillRect(head.x * cell + x, head.y * cell + y, 3, 3));
  }
  function stopTimer() { clearTimeout(timer); timer = null; }
  function showOverlay(title, button) {
    overlayTitle.textContent = title;
    startButton.textContent = button;
    overlay.hidden = false;
  }
  function schedule() {
    stopTimer();
    timer = setTimeout(tick, Math.max(90, 155 - game.score * 2));
  }
  function tick() {
    if (state !== 'playing') return;
    const previousScore = game.score;
    game.step();
    draw();
    scoreLabel.textContent = format(game.score);
    if (game.score > best) {
      best = game.score;
      bestLabel.textContent = format(best);
      try { localStorage.setItem('as-snake-best', String(best)); } catch { /* Optional persistence. */ }
    }
    if (game.status === 'over' || game.status === 'won') {
      state = game.status;
      stopTimer();
      pauseButton.disabled = true;
      const won = state === 'won';
      status.textContent = `${won ? 'You won!' : 'Game over.'} Score: ${game.score}.`;
      showOverlay(won ? 'You won' : 'Game over', 'Play again');
      startButton.focus({ preventScroll: true });
      return;
    }
    if (game.score !== previousScore) status.textContent = `Score: ${game.score}.`;
    schedule();
  }
  function play(reset = false) {
    if (reset || state !== 'paused') game.reset();
    state = 'playing';
    scoreLabel.textContent = format(game.score);
    overlay.hidden = true;
    pauseButton.disabled = false;
    pauseButton.textContent = 'Pause';
    restartButton.disabled = false;
    status.textContent = 'Playing';
    draw();
    board.focus({ preventScroll: true });
    schedule();
  }
  function pause() {
    if (state !== 'playing') return;
    state = 'paused';
    stopTimer();
    status.textContent = 'Paused';
    pauseButton.textContent = 'Resume';
    showOverlay('Paused', 'Resume');
  }
  startButton.addEventListener('click', () => play());
  restartButton.addEventListener('click', () => play(true));
  pauseButton.addEventListener('click', () => state === 'paused' ? play() : pause());
  const keyDirections = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
  board.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const direction = keyDirections[event.key] || keyDirections[event.key.toLowerCase()];
    if (direction && state === 'playing') { event.preventDefault(); game.turn(direction); }
    if (event.code === 'Space') {
      event.preventDefault();
      if (!event.repeat) state === 'playing' ? pause() : play();
    }
    if (event.key === 'Escape' && state === 'playing') pause();
  });
  cabinet.querySelectorAll('[data-direction]').forEach(button => {
    button.addEventListener('click', () => { if (state === 'playing') game.turn(button.dataset.direction); });
  });
  cabinet.addEventListener('focusout', event => {
    if (event.relatedTarget && !cabinet.contains(event.relatedTarget)) pause();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('blur', pause);
  window.addEventListener('pagehide', () => { pause(); stopTimer(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pause(); }).observe(cabinet);
  }
  draw();
})();
