/* Small, dependency-free game engine, also importable by Node for testing. */
(function (root) {
  'use strict';
  const vectors = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  class SnakeGame {
    constructor(size = 20, random = Math.random) {
      this.size = size;
      this.random = random;
      this.reset();
    }
    reset() {
      const middle = Math.floor(this.size / 2);
      this.snake = Array.from({ length: 4 }, (_, i) => ({ x: middle - i, y: middle }));
      this.direction = 'right';
      this.queuedDirection = null;
      this.score = 0;
      this.status = 'playing';
      this.placeFood();
    }
    placeFood() {
      const free = [];
      for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
          if (!this.snake.some(part => part.x === x && part.y === y)) free.push({ x, y });
        }
      }
      this.food = free.length ? free[Math.floor(this.random() * free.length)] : null;
      if (!this.food) this.status = 'won';
    }
    turn(direction) {
      if (!vectors[direction] || this.queuedDirection || this.status !== 'playing') return false;
      const current = vectors[this.direction];
      const next = vectors[direction];
      if (current[0] + next[0] === 0 && current[1] + next[1] === 0) return false;
      if (direction === this.direction) return false;
      this.queuedDirection = direction;
      return true;
    }
    step() {
      if (this.status !== 'playing') return this.status;
      this.direction = this.queuedDirection || this.direction;
      this.queuedDirection = null;
      const vector = vectors[this.direction];
      const head = { x: this.snake[0].x + vector[0], y: this.snake[0].y + vector[1] };
      const eats = this.food && head.x === this.food.x && head.y === this.food.y;
      // A departing tail cell is safe to enter when the snake is not growing.
      const body = eats ? this.snake : this.snake.slice(0, -1);
      if (head.x < 0 || head.y < 0 || head.x >= this.size || head.y >= this.size || body.some(part => part.x === head.x && part.y === head.y)) {
        this.status = 'over';
        return this.status;
      }
      this.snake.unshift(head);
      if (eats) {
        this.score++;
        this.placeFood();
      } else this.snake.pop();
      return this.status;
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = SnakeGame;
  else root.SnakeGame = SnakeGame;
})(typeof globalThis !== 'undefined' ? globalThis : this);
