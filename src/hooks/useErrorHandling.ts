import {
  Exception,
  onUnhandledError,
  onUnhandledRejection,
} from "../../utils/error";
import { useEvent } from "./useEvent";

export function useUnhandledErrorHandler() {
  const stableOnError = useEvent((error: Exception) => {
    console.log(error);
    // eslint-disable-next-line no-debugger
    debugger;
  });

  const unsubscribeError = onUnhandledError(stableOnError);
  const unsubscribeRejections = onUnhandledRejection(stableOnError);

  return () => {
    unsubscribeError();
    unsubscribeRejections();
  };
}
