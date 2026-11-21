import cp from "child_process"
import { config } from "@/config"

/**
 * Runs an executable with arguments (no shell) and rejects if it fails or exceeds
 * `config.commandTimeoutMs`.
 */
export const execWithTimeout = (file: string, args: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    cp.execFile(file, args, { timeout: config.commandTimeoutMs }, (error, _stdout, stderr) => {
      if (error) {
        if (error.killed) {
          reject(new Error("Command ran for too long"))
          return
        }
        reject(new Error(`${file} failed: ${stderr || error.message}`))
        return
      }

      resolve()
    })
  })
}
