import { InteractionManager } from "react-native";

/**
 * Run `callback` once the modal transition currently in progress has finished.
 *
 * On iOS a React Native `<Modal>` and a `react-native-screens` stack screen declared
 * with `presentation: "modal"` are both real presented `UIViewController`s on the same
 * root. Dismissing one and presenting the other in the same tick makes UIKit try to
 * present onto a controller that is still mid-dismiss — it refuses, logs
 * "Attempt to present <X> on <Y> which is already presenting <Z>", and leaves a stuck
 * transition view behind: the black screen.
 *
 * Waiting for interactions to drain and then one more frame lets the dismissal
 * animation complete first. This is a real completion signal, not a guessed delay, so
 * it holds on slow devices where a fixed timeout does not.
 *
 * @returns a cancel function — call it on unmount to drop a pending callback.
 */
export const afterModalTransition = (callback: () => void): (() => void) => {
  let cancelled = false;
  let frame: number | null = null;

  const handle = InteractionManager.runAfterInteractions(() => {
    if (cancelled) return;
    frame = requestAnimationFrame(() => {
      if (cancelled) return;
      callback();
    });
  });

  return () => {
    cancelled = true;
    handle.cancel();
    if (frame !== null) cancelAnimationFrame(frame);
  };
};
