import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useState } from 'react';
import { SharedValue } from 'react-native-reanimated';

export type Segment = { x: SharedValue<number>; y: SharedValue<number> };

const SnakeContext = createContext<{
  segments: Segment[];
  setSegments: Dispatch<SetStateAction<Segment[]>>;
} | null>(null);

export const SnakeProvider = ({ children }:PropsWithChildren) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  
  const value = useMemo(() => ({segments, setSegments}), [segments, setSegments])

  return (
    <SnakeContext.Provider value={value}>
      {children}
    </SnakeContext.Provider>
  );
};

export const useSnake = () => {
  const ctx = useContext(SnakeContext);
  console.log(ctx);
  
  if (!ctx) throw new Error("SnakeContext is not available");
  return ctx;
};
