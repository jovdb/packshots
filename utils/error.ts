export function getErrorMessage(err: unknown) {
  return getErrors(err)
    .map(err => err instanceof Error ? `${err.name}: ${err.message}` : `${err}`)
    .join("\n")
}

export function hasAbortError(err: unknown) {
  return getErrors(err)
    .some(err => err instanceof Error && err.name === "AbortError");
}

export function getErrors(err: unknown): unknown[] {
  if (err instanceof Error) {
    if (err.cause) {
      const childErrors = getErrors(err.cause);
      return [err, ...childErrors];
    }
  }
  return [err];
}

export function handleError(err: unknown) {
  // Don't show Abort Error
  if (hasAbortError(err)) return;
  alert(getErrorMessage(err));
  throw err;
}
