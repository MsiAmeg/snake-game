import { SnakeProvider } from "@/contexts/snake-context";
import { Stack } from "expo-router";
import { FiberProvider } from "its-fine";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <FiberProvider>
      <SnakeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootNavigator />
        </GestureHandlerRootView>
      </SnakeProvider>
    </FiberProvider>
  );
}

const RootNavigator = () => {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
};
