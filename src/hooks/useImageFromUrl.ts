import { useQuery } from "@tanstack/react-query";
import { loadImageAsync } from "../utils/image";

export function useImageFromUrl(url: string) {
  return useQuery(["loadImage", url], () => url ? loadImageAsync(url) : null, {
    refetchOnWindowFocus: false,
  });
}
