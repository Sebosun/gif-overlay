import type { FetchProgress, RunnerOpts } from "@/types/RunnerTypes";

export class FetchProgressTracker {
  #progress: FetchProgress = {
    downloaded: 0,
    errors: 0,
    alreadyExists: 0,
  };

  constructor(private readonly onProgress: RunnerOpts["onProgress"]) {}

  downloaded() {
    this.#progress.downloaded++;
    this.report();
  }

  error() {
    this.#progress.errors++;
    this.report();
  }

  alreadyExists() {
    this.#progress.alreadyExists++;
    this.report();
  }

  private report() {
    this.onProgress?.({ ...this.#progress });
  }
}
