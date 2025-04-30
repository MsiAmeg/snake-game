import React, { useState } from "react";
import { View, Text, Button, Dimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Canvas, Circle, Fill, Group } from "@shopify/react-native-skia";
import {
  makeMutable,
  runOnJS,
  runOnUI,
  useSharedValue,
  useFrameCallback,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useContextBridge } from "its-fine";
import { useSnake, Segment } from "@/contexts/snake-context";
import { useTheme } from "@/contexts/theme-context";

const GRID_SIZE = 17;
const CELL_SIZE = Dimensions.get("window").width / GRID_SIZE;
const SPEED = 150;

const directions = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

type DirectionKey = keyof typeof directions;

export const SnakeGame = () => {
  return <SnakeGameContent />;
};

const SnakeDrawing = () => {
  const { segments } = useSnake();
  return (
    <Group>
      {segments.map((segment, i) => (
        <Circle
          key={i}
          cx={segment.x.value * CELL_SIZE + CELL_SIZE / 2}
          cy={segment.y.value * CELL_SIZE + CELL_SIZE / 2}
          r={CELL_SIZE / 2 - 2}
          color="blue"
        />
      ))}
    </Group>
  );
};

const SnakeGameContent = () => {
  const { setSegments } = useSnake();
  const ContextBridge = useContextBridge();

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const insets = useSafeAreaInsets();

  const initialSegment: Segment = {
    x: makeMutable(8),
    y: makeMutable(8),
  };

  const snake = useSharedValue<Segment[]>([initialSegment]);
  const direction = useSharedValue<DirectionKey>("right");

  const food = useSharedValue({
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  });

  const tickTime = useSharedValue(0);

  const generateFood = () => {
    "worklet";
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  };

  const syncSnakeContext = (segments: Segment[]) => {
    setSegments([...segments]);
  };

  const handleSegment = (x: number, y: number, ate: boolean) => {
    const seg: Segment = { x: makeMutable(x), y: makeMutable(y) };
    runOnUI((segment: Segment, removeLast: boolean) => {
      "worklet";
      snake.value = [segment, ...snake.value];
      if (removeLast) snake.value.pop();
      runOnJS(syncSnakeContext)(snake.value);
    })(seg, !ate);
  };

  useFrameCallback(({ timeSincePreviousFrame }) => {
    "worklet";
    if (gameOver || timeSincePreviousFrame === null) return;

    tickTime.value += timeSincePreviousFrame;

    if (tickTime.value > SPEED) {
      tickTime.value = 0;

      const head = snake.value[0];
      const dx = directions[direction.value][0];
      const dy = directions[direction.value][1];

      const newX = head.x.value + dx;
      const newY = head.y.value + dy;

      const hitWall =
        newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE;
      const hitSelf = snake.value.some(
        (seg) => seg.x.value === newX && seg.y.value === newY,
      );

      if (hitWall || hitSelf) {
        runOnJS(setGameOver)(true);
        return;
      }

      const ate = newX === food.value.x && newY === food.value.y;
      if (ate) {
        food.value = generateFood();
        runOnJS(setScore)((s) => s + 1);
      }

      runOnJS(handleSegment)(newX, newY, ate);
    }
  });

  const panGesture = Gesture.Pan().onUpdate((e) => {
    if (Math.abs(e.translationX) > Math.abs(e.translationY)) {
      direction.value = e.translationX > 0 ? "right" : "left";
    } else {
      direction.value = e.translationY > 0 ? "down" : "up";
    }
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#c0e57c",
        paddingBottom: insets.bottom,
        paddingTop: insets.top,
      }}
    >
      <GestureDetector gesture={panGesture}>
        <Canvas style={{ flex: 1 }}>
          <ContextBridge>
            <SnakeDrawing />
            <Circle
              cx={food.value.x * CELL_SIZE + CELL_SIZE / 2}
              cy={food.value.y * CELL_SIZE + CELL_SIZE / 2}
              r={CELL_SIZE / 3}
              color="red"
            />
          </ContextBridge>
        </Canvas>
      </GestureDetector>

      {gameOver && (
        <View
          style={{
            position: "absolute",
            top: "40%",
            alignSelf: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>Game Over</Text>
          <Text style={{ fontSize: 20 }}>Score: {score}</Text>
          <Button
            title="Restart"
            onPress={() => {
              setGameOver(false);
              setScore(0);
              const fresh = { x: makeMutable(8), y: makeMutable(8) };
              snake.value = [fresh];
              direction.value = "right";
              food.value = generateFood();
              tickTime.value = 0;
              syncSnakeContext([fresh]);
            }}
          />
        </View>
      )}
    </View>
  );
};
