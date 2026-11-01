(() => {
  'use strict';
  const cabinet = document.getElementById('signal-cabinet');
  const board = document.getElementById('signal-board');
  const ctx = board.getContext('2d');
  const score = document.getElementById('signal-score');
  const round = document.getElementById('signal-round');
  const feedback = document.getElementById('signal-feedback');
  const status = document.getElementById('signal-status');
  const explanation = document.getElementById('signal-explanation');
  const reference = document.getElementById('signal-reference');
  const progress = document.getElementById('signal-progress');
  const reset = document.getElementById('signal-reset');
  const next = document.getElementById('signal-next');
  const buttons = [...cabinet.querySelectorAll('[data-answer]')];
  const game = new SignalGame();
  function draw() {
    const trace = game.trace;
    const x = t => 45 + t / 4 * 810;
    const y = value => 190 - value * 81;
    const scale = board.getBoundingClientRect().width / board.width || 1;
    const font = size => `${Math.round(size / scale)}px monospace`;
    ctx.fillStyle = '#0e2039'; ctx.fillRect(0, 0, board.width, board.height);
    ctx.lineWidth = .7;
    for (let i = 0; i <= 100; i++) {
      ctx.strokeStyle = i % 5 === 0 ? '#29415b' : '#172f49';
      ctx.beginPath(); ctx.moveTo(x(i * .04), 45); ctx.lineTo(x(i * .04), 255); ctx.stroke();
    }
    for (let i = -8; i <= 17; i++) {
      ctx.strokeStyle = i % 5 === 0 ? '#29415b' : '#172f49';
      ctx.beginPath(); ctx.moveTo(45, y(i * .1)); ctx.lineTo(855, y(i * .1)); ctx.stroke();
    }
    ctx.setLineDash([6, 6]); ctx.strokeStyle = '#71869e'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(45, y(0)); ctx.lineTo(855, y(0)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = '#dce8f7'; ctx.lineWidth = 2;
    ctx.beginPath();
    trace.values.forEach((value, i) => { if (!i) ctx.moveTo(x(0), y(value)); else ctx.lineTo(x(i / (trace.values.length - 1) * 4), y(value)); });
    ctx.stroke();
    ctx.font = font(11); ctx.fillStyle = '#b9c8dc';
    ctx.fillText('4 s schematic', 45, 28);
    ctx.strokeStyle = '#8ea4bf';
    ctx.beginPath(); ctx.moveTo(x(.1), 277); ctx.lineTo(x(.3), 277); ctx.stroke();
    ctx.fillText('0.2 s', x(.1), 302);
    ctx.beginPath(); ctx.moveTo(875, y(0)); ctx.lineTo(875, y(.5)); ctx.stroke();
    ctx.textAlign = 'right'; ctx.fillText('0.5 mV', 855, 302); ctx.textAlign = 'left';
    if (game.selected === null) return;
    ctx.strokeStyle = '#e5a16b'; ctx.fillStyle = '#e5a16b'; ctx.lineWidth = 2; ctx.font = font(12);
    if (trace.st !== 0) {
      const beat = trace.beats[1];
      ctx.beginPath(); ctx.moveTo(x(beat + .065), y(trace.st)); ctx.lineTo(x(beat + .165), y(trace.st)); ctx.stroke();
      ctx.fillText('ST', x(beat + .07), y(trace.st) - (trace.st > 0 ? 13 : -25));
    } else if (trace.id === 'afib') {
      for (let i = 0; i < 3; i++) {
        const a = trace.beats[i], b = trace.beats[i + 1];
        ctx.beginPath(); ctx.moveTo(x(a), 65); ctx.lineTo(x(b), 65); ctx.moveTo(x(a), 60); ctx.lineTo(x(a), 70); ctx.moveTo(x(b), 60); ctx.lineTo(x(b), 70); ctx.stroke();
        ctx.font = font(10); ctx.textAlign = 'center'; ctx.fillText(`${(b - a).toFixed(2)} s`, (x(a) + x(b)) / 2, 50); ctx.textAlign = 'left';
      }
    } else if (trace.id === 'vt') {
      ctx.fillText('180 bpm · broad complexes', 45, 65);
    } else {
      const beat = trace.beats[1];
      ctx.fillText('P', x(beat - .20), y(.13) - 14);
      ctx.fillText('Regular · 75 bpm', x(2.2), 65);
    }
  }
  function render() {
    const answered = game.selected !== null;
    score.textContent = `${game.score} / 5`;
    round.textContent = `${game.index + 1} / 5`;
    buttons.forEach(button => {
      button.disabled = answered;
      button.classList.toggle('answer-correct', answered && button.dataset.answer === game.current.id);
      button.classList.toggle('answer-incorrect', answered && button.dataset.answer === game.selected && game.selected !== game.current.id);
      button.setAttribute('aria-pressed', String(button.dataset.answer === game.selected));
    });
    feedback.hidden = !answered;
    next.hidden = !answered;
    next.textContent = game.completed ? 'Play again' : 'Next ECG';
    progress.textContent = game.completed ? 'Round complete' : `Pattern ${game.index + 1} of 5`;
    status.textContent = answered ? `${game.selected === game.current.id ? 'Correct' : 'Answer'}: ${game.current.label}.` : '';
    explanation.textContent = answered ? game.current.explanation : '';
    reference.href = game.current.source;
    board.setAttribute('aria-label', game.current.description + (answered ? ` Illustrated pattern: ${game.current.label}.` : ''));
    draw();
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    if (game.answer(button.dataset.answer)) { render(); next.focus({ preventScroll: true }); }
  }));
  reset.addEventListener('click', () => { game.reset(); render(); buttons[0].focus({ preventScroll: true }); });
  next.addEventListener('click', () => { game.next(); render(); buttons[0].focus({ preventScroll: true }); });
  if ('ResizeObserver' in window) new ResizeObserver(draw).observe(board);
  render();
})();
