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
