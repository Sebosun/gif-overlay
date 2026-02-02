import path from "path";
import { homedir } from "os";

const home = homedir()

// TODO: customizing the path

const FOLDER_NAME = "gif-overlay"

// Hoonestly, this is not ideal
// It could just sit in memory and we would just export the return values 
// - why call it each time? But it works so w/e for now

export function getStorageLocation(): string {
  return path.join(home, ".local", 'share', FOLDER_NAME)
}

// transformed images loc
export function getTransformedLocation(): string {
  return path.join(getStorageLocation(), "transformed")
}
