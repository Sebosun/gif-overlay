import fs from "fs/promises"

export async function cleanupFiles(filePath: string) {
  const exists = await fs.exists(filePath)
  if (!exists) return

  await fs.rm(filePath)
}
