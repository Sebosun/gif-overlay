import cp from "child_process"

export const execWithTimeout = (command: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line prefer-const
    let interval: NodeJS.Timeout;
    const startTime = new Date();

    const proc = cp.exec(command, (error) => {
      if (error) {
        reject(error);
      }

      resolve();
      clearInterval(interval)
    });

    interval = setInterval(() => {
      const curTime = new Date();
      // Likely shouldn't run for more than minutes, even on raspberry pi
      if (Number(curTime) - Number(startTime) > 1000 * 60 * 5) {
        clearInterval(interval);
        if (!proc.exitCode) {
          proc.kill();
        }
        reject(new Error("Command ran for too long"));
      }
    }, 1000 * 60);
  });
};
