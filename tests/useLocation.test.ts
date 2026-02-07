import { describe, expect, test } from 'vitest'
import fs from "fs/promises"
import { getEffectsDir, getRandomDir, getRootDir, getStorageLocation, getTomatoDir, getTransformedLocation } from '../lib/files/useLocation'

// More of a sanity check than anything
// Since paths are relative and systme dependent it'd be hard to otherwise test them
// Tests would have to reimplement the functions that already exist

const throwableDoesntThrow = async (func: () => Promise<unknown> | unknown) => {
  try {
    await func()
    return true
  } catch {
    return false
  }
}

describe("Storage checks", () => {
  test('If storage exists', async () => {
    const storageLoc = getStorageLocation()
    const exists = await throwableDoesntThrow(async () => await fs.stat(storageLoc))

    expect(exists).toBe(true)
  })

  test('If root dir exists', async () => {
    const storageLoc = getRootDir()
    const exists = await throwableDoesntThrow(async () => await fs.stat(storageLoc))

    expect(exists).toBe(true)
  })


  test('If transformed dir exists', async () => {
    const storageLoc = getTransformedLocation()
    const exists = await throwableDoesntThrow(async () => await fs.stat(storageLoc))

    expect(exists).toBe(true)
  })

  test('If random dir exists', async () => {
    const storageLoc = getRandomDir()
    const exists = await throwableDoesntThrow(async () => await fs.stat(storageLoc))
    expect(exists).toBe(true)
  })

  test('If effects dir exists', async () => {
    const storageLoc = getEffectsDir()
    const exists = await throwableDoesntThrow(async () => await fs.stat(storageLoc))

    expect(exists).toBe(true)
  })

  test('If tomato dir exists', async () => {
    const storageLoc = getTomatoDir()
    const exists = await throwableDoesntThrow(async () => await fs.stat(storageLoc))

    expect(exists).toBe(true)
  })

})
