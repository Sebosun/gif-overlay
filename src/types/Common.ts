// go-like error handling
// if function returns an error and you have an error
// return "zero" value, i.e. Arrays = [], Numbers = 0, String = "" etc.
type FlatError = [error: Error, result: undefined]
export type FlatCatch<T = void> =
  T extends void ? [error: undefined, result: undefined] | FlatError : [error: undefined, result: T] | FlatError

export type FlatPromise<T = void> = Promise<FlatCatch<T>>


// This needs a better place, for now its here
export async function flatCall(cb: () => Promise<unknown>): Promise<FlatCatch> {
  try {
    await cb()
    return [undefined, undefined]
  } catch (e) {
    if (e instanceof Error) {
      return [e, undefined]
    }
    return [new Error("Something went wrong executing flat call"), undefined]
  }
}
