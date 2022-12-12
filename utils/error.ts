export function flattenErrors(err: unknown): unknown[] {
  if (err instanceof Error) {
    if (err.cause) {
      const childErrors = flattenErrors(err.cause);
      return [err, ...childErrors];
    }
  }
  return [err];
}

/** Get a message of the entire error tree */
export function getErrorMessage(err: unknown) {
  return flattenErrors(err)
    .map(err => err instanceof Error ? `${err.name}: ${err.message}` : `${err}`)
    .join("\n");
}

export function hasError(err: unknown, name: string) {
  return flattenErrors(err)
    .some(err => err instanceof Error && err.name === name);
}

export function hasNotAllowedError(err: unknown) {
  return hasError(err, "NotAllowedError");
}

export function hasAbortError(err: unknown) {
  return hasError(err, "AbortError");
}

/** Base class to make it easier to create custom exceptions */
export class Exception extends Error {
  constructor(
    message: string,
    /** Optional inner exception */
    innerException?: unknown,
    /** Without extending class, we can specify a custom error name */
    name?: string,
  ) {
    super(message);
    this.name = name ?? this.constructor.name;
    if (innerException) this.cause = innerException;
  }
}

/** An Error object is not serializable */
export function serializable(err: unknown) {
  if (err instanceof Object) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};

    if (err instanceof Error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.name = err.name;
      data.message = err.message;
    }

    // Serialize aditional members of the (extended) class
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.keys(err).forEach((key: any) => {
      if (key === "cause") return; // Skip, this is an err that doesn't serialize (do later)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data[key] = (err as any)[key];
    });

    // Add stack and cause at the end
    if (err instanceof Error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ("stack" in err) data.stack = err.stack;
      // Do at the end to have a nicer tree
      if (err.cause) data.cause = serializable(err.cause);
    }
    return data;
  }
  return err;
}

export function errorToJson(err: unknown) {
  return JSON.stringify(serializable(err), undefined, "  ");
}

export function handleError(err: unknown) {
  // Don't show Abort Error
  if (hasAbortError(err)) return;

  // Log to console
  console.error(errorToJson(err));

  // TODO: Log To Server?

  // Log to user
  let message = getErrorMessage(err);
  if (hasNotAllowedError(err)) {
    message = "Make sure you didn't block file access in the browser.\n\n" + message;
  }
  alert(message);

  // Retrhow?
  // throw err;
}
