import type { FlatPromise, FlatCatch } from "types/Common";

const WATCH_TIMEOUT_MS = 1000 * 60 * 5 // 5 minutes

export function setErrorTimeout() {
  let timer: NodeJS.Timeout
  const promise: FlatPromise = new Promise<FlatCatch>(resolve => {
    timer = setTimeout(() => {
      resolve([new Error("Timed out waiting for watch to complete"), undefined]);
    }, WATCH_TIMEOUT_MS);
  });
  return { promise, clear: () => clearTimeout(timer) }
}
