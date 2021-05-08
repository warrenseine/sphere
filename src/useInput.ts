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

export type TouchPosition = { x: number, y: number} | undefined

export function useTouch(): TouchPosition {
  const [touchDown, setTouchDown] = useState<boolean>(false);
  const [touchPosition, setTouchPosition] = useState<TouchPosition>();

  const handleMouseDown = useCallback((event: MouseEvent) => {
    setTouchPosition({ x: event.clientX, y: event.clientY });
    setTouchDown(true);
  }, [setTouchPosition, setTouchDown]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (touchDown) setTouchPosition({ x: event.clientX, y: event.clientY });
  }, [setTouchPosition, touchDown]);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    setTouchPosition({ x: event.touches[0].clientX, y: event.touches[0].clientY });
    setTouchDown(true);
  }, [setTouchPosition, setTouchDown]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (touchDown) setTouchPosition({ x: event.touches[0].clientX, y: event.touches[0].clientY });
  }, [setTouchPosition, touchDown]);

  const handleTouchEnd = useCallback(() => {
    setTouchPosition(undefined);
    setTouchDown(false);
  }, [setTouchPosition, setTouchDown]);

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseMove]);

  return touchPosition;
}