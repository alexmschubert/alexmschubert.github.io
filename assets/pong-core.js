/* Deterministic, browser-independent Pong rules. */
(function (root) {
  'use strict';
  class PongGame {
    constructor(random = Math.random) {
      this.random = random;
      this.width = 720;
      this.height = 480;
      this.paddleHeight = 86;
      this.paddleWidth = 10;
      this.leftX = 26;
      this.rightX = this.width - 36;
      this.radius = 6;
      this.targetScore = 7;
      this.reset();
    }
    reset() {
      this.player = (this.height - this.paddleHeight) / 2;
      this.cpu = this.player;
      this.playerScore = 0;
      this.cpuScore = 0;
      this.status = 'playing';
      this.winner = null;
      this.serve(this.random() < .5 ? -1 : 1);
    }
    serve(direction) {
      this.ball = { x: this.width / 2, y: this.height / 2, vx: direction * 290, vy: (this.random() < .5 ? -1 : 1) * 130 };
      this.serveDelay = .8;
    }
    clampPaddle(y) { return Math.max(0, Math.min(this.height - this.paddleHeight, y)); }
    point(side) {
      if (side === 'player') this.playerScore++;
      else this.cpuScore++;
      if (this.playerScore >= this.targetScore || this.cpuScore >= this.targetScore) {
        this.status = 'over';
        this.winner = side;
      } else this.serve(side === 'player' ? 1 : -1);
    }
    bounce(paddleY, direction) {
      const relative = Math.max(-1, Math.min(1, (this.ball.y - paddleY - this.paddleHeight / 2) / (this.paddleHeight / 2)));
      const speed = Math.min(620, Math.hypot(this.ball.vx, this.ball.vy) * 1.055);
      const angle = relative * 1.05;
      this.ball.vx = direction * speed * Math.cos(angle);
      this.ball.vy = speed * Math.sin(angle);
    }
    update(seconds, input = {}) {
      if (this.status !== 'playing' || !Number.isFinite(seconds) || seconds <= 0) return;
      // Small steps keep fast balls from skipping a paddle; cap background-tab time.
      let remaining = Math.min(seconds, .1);
      while (remaining > 0 && this.status === 'playing') {
        const dt = Math.min(remaining, 1 / 120);
        remaining -= dt;
        const target = Number.isFinite(input.targetY) ? input.targetY - this.paddleHeight / 2 : null;
        if (target !== null) this.player += Math.max(-520 * dt, Math.min(520 * dt, target - this.player));
        else this.player += ((input.down ? 1 : 0) - (input.up ? 1 : 0)) * 430 * dt;
        this.player = this.clampPaddle(this.player);
        const difference = this.ball.y - (this.cpu + this.paddleHeight / 2);
        if (Math.abs(difference) > 12) this.cpu += Math.sign(difference) * Math.min(Math.abs(difference), 245 * dt);
        this.cpu = this.clampPaddle(this.cpu);
        if (this.serveDelay > 0) { this.serveDelay = Math.max(0, this.serveDelay - dt); continue; }
        const ball = this.ball;
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        if (ball.y < this.radius && ball.vy < 0) { ball.y = this.radius; ball.vy *= -1; }
        if (ball.y > this.height - this.radius && ball.vy > 0) { ball.y = this.height - this.radius; ball.vy *= -1; }
        if (ball.vx < 0 && ball.x - this.radius <= this.leftX + this.paddleWidth && ball.x + this.radius >= this.leftX && ball.y + this.radius >= this.player && ball.y - this.radius <= this.player + this.paddleHeight) {
          ball.x = this.leftX + this.paddleWidth + this.radius;
          this.bounce(this.player, 1);
        }
        if (ball.vx > 0 && ball.x + this.radius >= this.rightX && ball.x - this.radius <= this.rightX + this.paddleWidth && ball.y + this.radius >= this.cpu && ball.y - this.radius <= this.cpu + this.paddleHeight) {
          ball.x = this.rightX - this.radius;
          this.bounce(this.cpu, -1);
        }
        if (ball.x < -this.radius) this.point('cpu');
        else if (ball.x > this.width + this.radius) this.point('player');
      }
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = PongGame;
  else root.PongGame = PongGame;
})(typeof globalThis !== 'undefined' ? globalThis : this);
