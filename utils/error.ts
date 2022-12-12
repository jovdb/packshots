export function getErrorMessage(err: unknown) {
  return getErrors(err)
    .map(err => err instanceof Error ? `${err.name}: ${err.message}` : `${err}`)
    .join("\n")
}

export function hasError(err: unknown, name: string) {
  return getErrors(err)
    .some(err => err instanceof Error && err.name === name);
}

export function hasNotAllowedError(err: unknown) {
  return hasError(err, "NotAllowedError");
}

export function hasAbortError(err: unknown) {
  return hasError(err, "AbortError");
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
  let message = getErrorMessage(err);
  if (hasNotAllowedError(err)) {
    message = "Make sure you didn't block file access in the browser.\n\n" + message;
  }
  alert(message);
  throw err;
}
