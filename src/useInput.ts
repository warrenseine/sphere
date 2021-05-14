import { useCallback, useEffect, useState } from "react";

export function useKeyDown(targetKeyCode: number): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  const keyDown = useCallback(
    ({ keyCode }) => {
      if (keyCode === targetKeyCode) {
        setKeyPressed(true);
      }
    },
    [targetKeyCode]
  );

  const keyUp = useCallback(
    ({ keyCode }) => {
      if (keyCode === targetKeyCode) {
        setKeyPressed(false);
      }
    },
    [targetKeyCode]
  );

  useEffect(() => {
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [keyDown, keyUp]);

  return keyPressed;
}

export function useKeyPress(targetKeyCode: number, callback: () => void): void {
  const keyPress = useCallback(
    ({ keyCode }) => {
      if (keyCode === targetKeyCode) {
        callback();
      }
    },
    [targetKeyCode, callback]
  );

  useEffect(() => {
    window.addEventListener("keypress", keyPress);
    return () => {
      window.removeEventListener("keypress", keyPress);
    };
  }, [keyPress]);
}

export type TouchPosition = { x: number; y: number } | undefined;

export type TouchState = {
  down: boolean;
  position: TouchPosition;
  offset: TouchPosition;
};

type UseTouchOptions = {
  onUp: (() => void) | undefined;
};

export function useTouch(options?: UseTouchOptions): TouchState {
  const [down, setDown] = useState<boolean>(false);
  const [position, setPosition] = useState<TouchPosition>();
  const [previousPosition, setPreviousPosition] = useState<TouchPosition>();
  const [initialPosition, setInitialPosition] = useState<TouchPosition>();

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      setInitialPosition({ x: event.clientX, y: event.clientY });
      setPreviousPosition({ x: event.clientX, y: event.clientY });
      setPosition({ x: event.clientX, y: event.clientY });
      setDown(true);
    },
    [setPosition, setInitialPosition, setPreviousPosition, setDown]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (down) {
        setPreviousPosition(position);
        setPosition({ x: event.clientX, y: event.clientY });
      }
    },
    [setPosition, setPreviousPosition, position, down]
  );

  const handlePointerUp = useCallback(() => {
    if (
      position &&
      initialPosition &&
      Math.abs(position.x - initialPosition.x) < 10 &&
      Math.abs(position.y - initialPosition.y) < 10 &&
      options?.onUp
    ) {
      options.onUp();
    }

    setPosition(undefined);
    setPreviousPosition(undefined);
    setInitialPosition(undefined);
    setDown(false);
  }, [
    options,
    position,
    initialPosition,
    setPosition,
    setPreviousPosition,
    setInitialPosition,
    setDown,
  ]);

  useEffect(() => {
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  return {
    down: down,
    position: position,
    offset:
      position && previousPosition
        ? {
            x: position.x - previousPosition.x,
            y: position.y - previousPosition.y,
          }
        : { x: 0, y: 0 },
  };
}

export function useClick(callback: (e: MouseEvent) => void): void {
  useEffect(() => {
    window.addEventListener("click", callback);
    return () => {
      window.removeEventListener("click", callback);
    };
  }, [callback]);
}
