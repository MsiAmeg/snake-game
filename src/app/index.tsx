import {
  Canvas,
  ImageSVG,
  Oval,
  useCanvasRef,
} from "@shopify/react-native-skia";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Food, MoveEnum, SnakeSegment } from "@/types/snake";
import FoodSVG from "@/utils/FoodSVG";
import { initSnake, getNextHead, moveSnake, generateMove, getSnakeSegmentKey } from "@/utils/snake";
import { canEatFood, generateFood } from "@/utils/food";
import { collision } from "@/utils/collision";
import { runOnJS } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const WIDTH = width;
const HEIGHT = height - 100;
const FRAME_INTERVAL = 1000 / 12;
const TOLERANCE = 0.1;
const FOOD_BOX = 25;
const INITIAL_SNAKE = initSnake(WIDTH, HEIGHT, 3, FOOD_BOX);
const INITIAL_FOOD = generateFood(INITIAL_SNAKE, WIDTH, HEIGHT, FOOD_BOX);
const INITIAL_MOVE = generateMove();
let lastRenderTime = performance.now();

export default function App() {
  const canvasRef = useCanvasRef();
  const [snakePos, setSnakePos] = useState<Array<SnakeSegment>>(INITIAL_SNAKE);
  const [food, setFood] = useState<Food>(INITIAL_FOOD);
  const [direction, setDirection] = useState<MoveEnum>(INITIAL_MOVE);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const gameOverRef = useRef(gameOver);

  useEffect(() => {
    let animationFrameId: number;

    function updateSnake() {
      const currentRenderTime = performance.now();
      const elapsed = currentRenderTime - lastRenderTime;

      if (elapsed >= FRAME_INTERVAL - TOLERANCE) {
        lastRenderTime = currentRenderTime - (elapsed % FRAME_INTERVAL);

        setSnakePos(oldSnake => {
          const newHead = getNextHead(oldSnake[0], direction, FOOD_BOX);
          if (collision(oldSnake, newHead, WIDTH, HEIGHT, FOOD_BOX)) {
            gameOverRef.current = true;
            setGameOver(true);
            return oldSnake;
          }
          const ate = canEatFood(newHead, food);
          const newSnake = moveSnake(oldSnake, newHead, ate);
          if (ate) {
            setFood(generateFood(newSnake, WIDTH, HEIGHT, FOOD_BOX));
            setScore(prev => prev + 10);
          }
          return newSnake;
        });
      }

      if (!gameOverRef.current) {
        animationFrameId = requestAnimationFrame(updateSnake);
      }
    }

    if (!gameOver) {
      animationFrameId = requestAnimationFrame(updateSnake);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gameOver, direction, food]);

  const pan = Gesture.Pan().onEnd((event) => {
    if (gameOver) return;

    const { translationX, translationY } = event;

    if (Math.abs(translationX) > Math.abs(translationY)) {
      if (direction === MoveEnum.Left || direction === MoveEnum.Right) return;
      if (translationX > 0) {
        runOnJS(setDirection)(MoveEnum.Right);
      } else {
        runOnJS(setDirection)(MoveEnum.Left);
      }
    } else {
      if (direction === MoveEnum.Up || direction === MoveEnum.Down) return;
      if (translationY > 0) {
        runOnJS(setDirection)(MoveEnum.Down);
      } else {
        runOnJS(setDirection)(MoveEnum.Up);
      }
    }
  });

  useEffect(() => {
    if (gameOver) {
      Alert.alert("Game Over", `Your score is ${score}`, [
        {
          text: "Play Again",
          onPress: () => {
            const newSnake = initSnake(WIDTH, HEIGHT, 3, FOOD_BOX);
            const newDir = generateMove();
            setSnakePos(newSnake);
            setFood(generateFood(newSnake, WIDTH, HEIGHT, FOOD_BOX));
            setDirection(newDir);
            setScore(0);
            gameOverRef.current = false;
            setGameOver(false);
          },
        },
      ]);
    }
  }, [gameOver]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.gameStatus}>{gameOver ? "Game Over" : score}</Text>
      <GestureHandlerRootView>
        <GestureDetector gesture={pan}>
          <Canvas ref={canvasRef} style={styles.canvas}>
            {snakePos.map(seg => (
              <Oval
                key={getSnakeSegmentKey(seg)}
                x={seg.x}
                y={seg.y}
                width={FOOD_BOX}
                height={FOOD_BOX}
                color={styles.snakeBody.color}
              />
            ))}
            <ImageSVG
              svg={FoodSVG}
              width={FOOD_BOX}
              height={FOOD_BOX}
              x={food.x}
              y={food.y}
            />
          </Canvas>
        </GestureDetector>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: "#2B2B2B",
  },
  gameStatus: {
    padding: 16,
    fontSize: 22,
    color: "#fff",
  },
  snakeBody: {
    color: "#789461",
  },
  gameOverContainer: {
    backgroundColor: "#222",
    width: "100%",
    height: "100%",
  },
  gameOverTitle: {
    paddingTop: 20,
    color: "#ffffff",
    fontSize: 32,
    textAlign: "center",
  },
  gameOverScore: {
    paddingTop: 20,
    color: "#ffffff",
    fontSize: 32,
    textAlign: "center",
  },
});
