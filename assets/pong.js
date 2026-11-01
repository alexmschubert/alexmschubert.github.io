(() => {
  'use strict';
  const board = document.getElementById('pong-board');
  const ctx = board.getContext('2d');
  const cabinet = document.getElementById('pong-cabinet');
  const overlay = document.getElementById('pong-overlay');
  const title = document.getElementById('pong-overlay-title');
  const startButton = document.getElementById('pong-start');
  const pauseButton = document.getElementById('pong-pause');
  const restartButton = document.getElementById('pong-restart');
  const status = document.getElementById('pong-status');
  const playerScore = document.getElementById('pong-player-score');
  const cpuScore = document.getElementById('pong-cpu-score');
  const game = new PongGame();
  const keys = new Set();
  let state = 'ready';
  let frame = null;
  let lastTime = null;
  let targetY = null;
  function draw() {
    ctx.fillStyle = '#0e2039';
    ctx.fillRect(0, 0, board.width, board.height);
    ctx.strokeStyle = '#3a5270';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 10]);
    ctx.beginPath(); ctx.moveTo(board.width / 2, 15); ctx.lineTo(board.width / 2, board.height - 15); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#dce8f7';
    ctx.fillRect(game.leftX, game.player, game.paddleWidth, game.paddleHeight);
    ctx.fillStyle = '#8eafd8';
    ctx.fillRect(game.rightX, game.cpu, game.paddleWidth, game.paddleHeight);
    ctx.fillStyle = '#e5a16b';
    ctx.beginPath(); ctx.arc(game.ball.x, game.ball.y, game.radius, 0, Math.PI * 2); ctx.fill();
  }
  function stop() { cancelAnimationFrame(frame); frame = null; lastTime = null; }
  function showOverlay(text, button) {
    title.textContent = text;
    startButton.textContent = button;
    overlay.hidden = false;
  }
  function tick(time) {
    if (state !== 'playing') return;
    const seconds = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, .05);
    lastTime = time;
    const before = `${game.playerScore}:${game.cpuScore}`;
    game.update(seconds, { up: keys.has('up'), down: keys.has('down'), targetY });
    playerScore.textContent = game.playerScore;
    cpuScore.textContent = game.cpuScore;
    draw();
    if (state !== 'playing') return;
    if (game.status === 'over') {
      state = 'over';
      stop();
      pauseButton.disabled = true;
      const result = game.winner === 'player' ? 'You won' : 'Computer wins';
      status.textContent = `${result}. ${game.playerScore}–${game.cpuScore}.`;
      showOverlay(result, 'Play again');
      startButton.focus({ preventScroll: true });
      return;
    }
    if (before !== `${game.playerScore}:${game.cpuScore}`) status.textContent = `You ${game.playerScore}, computer ${game.cpuScore}.`;
    frame = requestAnimationFrame(tick);
  }
  function play(reset = false) {
    stop();
    if (reset || state !== 'paused') game.reset();
    keys.clear(); targetY = null;
    state = 'playing';
    overlay.hidden = true;
    pauseButton.disabled = false;
    pauseButton.textContent = 'Pause';
    restartButton.disabled = false;
    status.textContent = 'Playing';
    playerScore.textContent = game.playerScore;
    cpuScore.textContent = game.cpuScore;
    draw();
    board.focus({ preventScroll: true });
    frame = requestAnimationFrame(tick);
  }
  function pause() {
    keys.clear(); targetY = null;
    if (state !== 'playing') return;
    state = 'paused'; stop();
    pauseButton.textContent = 'Resume';
    status.textContent = 'Paused';
    showOverlay('Paused', 'Resume');
  }
  function direction(event) {
    if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') return 'up';
    if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') return 'down';
    return null;
  }
  board.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const move = direction(event);
    if (move && state === 'playing') { event.preventDefault(); keys.add(move); targetY = null; }
    if (event.code === 'Space') {
      event.preventDefault();
      if (!event.repeat) state === 'playing' ? pause() : play();
    }
    if (event.key === 'Escape') pause();
  });
  board.addEventListener('keyup', event => { const move = direction(event); if (move) keys.delete(move); });
  function pointAt(event) {
    if (state !== 'playing') return;
    const rect = board.getBoundingClientRect();
    targetY = (event.clientY - rect.top) / rect.height * game.height;
  }
  board.addEventListener('pointerdown', event => {
    if (state !== 'playing') return;
    event.preventDefault();
    board.focus({ preventScroll: true });
    board.setPointerCapture(event.pointerId);
    pointAt(event);
  });
  board.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' && !board.hasPointerCapture(event.pointerId)) return;
    pointAt(event);
  });
  board.addEventListener('pointercancel', () => { targetY = null; });
  startButton.addEventListener('click', () => play());
  pauseButton.addEventListener('click', () => state === 'paused' ? play() : pause());
  restartButton.addEventListener('click', () => play(true));
  cabinet.addEventListener('focusout', event => { if (event.relatedTarget && !cabinet.contains(event.relatedTarget)) pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('blur', pause);
  window.addEventListener('pagehide', pause);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pause(); }).observe(cabinet);
  }
  draw();
})();
