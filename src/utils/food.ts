import { Food, SnakeSegment } from "@/types/snake";

/**
 * Check if snake head ate the food at the same grid position
 */
export function canEatFood(
  snakeHead: SnakeSegment,
  food: Food,
): boolean {
  return snakeHead.x === food.x && snakeHead.y === food.y;
}

/**
 * Generate food at a random grid cell not occupied by the snake
 */
export function generateFood(
  snake: SnakeSegment[],
  width: number,
  height: number,
  step: number,
): Food {
  let food: Food;
  const cols = Math.floor(width / step);
  const rows = Math.floor(height / step);
  do {
    const col = Math.floor(Math.random() * cols);
    const row = Math.floor(Math.random() * rows);
    food = { x: col * step, y: row * step };
  } while (snake.some(seg => seg.x === food.x && seg.y === food.y));
  return food;
}
