export function isPromise(promise: null | undefined): false;
export function isPromise<T>(promise: Promise<T>): promise is Promise<T>;
export function isPromise(promise: any): promise is Promise<unknown>;
export function isPromise(promise: any): promise is Promise<unknown> {
  return !!promise && typeof promise.then === "function";
}
