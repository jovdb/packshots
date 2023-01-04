import { useCallback, useRef } from "react";

/**
 * A callback that always closes over the latest data but keeps the same
 * identity and will not be called after component unmounts
 */
export function useEvent<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TFn extends ((...args: any[]) => unknown) | null | undefined
>(cb: TFn): NonNullable<TFn> {
  // Create a mutable object that holds the callback
  const callbackRef = useRef<TFn>(cb);

  // Update the mutable object if the callback changes
  callbackRef.current = cb;

  // return a stable callback to prevent rerenders
  return useCallback(
    (...args: unknown[]) => callbackRef.current && callbackRef.current(...args),
    []
  ) as NonNullable<TFn>;
}
