import { useRef, useCallback } from "react";

/**
 * A callback that always closes over the latest data but keeps the same
 * identity and will not be called after component unmounts
 */
export function useEvent<
	TFn extends((...args: any[]) => any) | null | undefined
>(cb: TFn): NonNullable<TFn> {
	// Create a mutable object that holds the callback
	const callbackRef = useRef<any>(cb);

	// Update the mutable object if the callback changes
	callbackRef.current = cb;

	// return a stable callback to prevent rerenders
	return useCallback<any>(
		(...args: any[]) => callbackRef.current && callbackRef.current(...args),
		[],
	);
}
