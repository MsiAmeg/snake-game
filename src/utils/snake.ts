// Simplified snake logic: grid-based head movement and tail update
import { MoveEnum, SnakeSegment } from "@/types/snake";

/**
 * Initialize snake at center with given length and step size
 */
export function initSnake(
  width: number,
  height: number,
  length: number = 3,
  step: number
): SnakeSegment[] {
  const centerX = Math.floor((width / 2) / step) * step;
  const centerY = Math.floor((height / 2) / step) * step;
  return Array.from({ length }, (_, i) => ({ x: centerX - i * step, y: centerY, pos: i + 1 }));
}

/**
 * Calculate next head position based on direction and step size
 */
export function getNextHead(
  head: SnakeSegment,
  move: MoveEnum,
  step: number
): SnakeSegment {
  const delta = { x: 0, y: 0 };
  switch (move) {
    case MoveEnum.Up:    delta.y = -step; break;
    case MoveEnum.Down:  delta.y = step;  break;
    case MoveEnum.Left:  delta.x = -step; break;
    case MoveEnum.Right: delta.x = step;  break;
  }
  return { x: head.x + delta.x, y: head.y + delta.y, pos: head.pos + 1 };
}

/**
 * Move snake: grow if ate, otherwise shift head and remove tail
 */
export function moveSnake(
  snake: SnakeSegment[],
  newHead: SnakeSegment,
  ate: boolean
): SnakeSegment[] {
  return ate ? [newHead, ...snake] : [newHead, ...snake.slice(0, -1)];
}

/**
 * Random initial direction
 */
const _moves = Object.values(MoveEnum);
export function generateMove(): MoveEnum {
  return _moves[Math.floor(Math.random() * _moves.length)];
}

export function getSnakeSegmentKey(snakeSegment: SnakeSegment): string {
  return `x${snakeSegment.x}-y${snakeSegment.y}-p${snakeSegment.pos}`;
}
