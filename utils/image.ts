export function loadImageAsync(url: string) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  return new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Loading image '${url} failed.`));
    img.onabort = () => reject(new Error(`Loading image '${url} aborted.`));
    img.src = url;
  }).finally(() => {
    img.onload = null;
    img.onerror = null;
    img.onabort = null;
  });
}

function createCanvas(width: number, height: number, dpr?: number) {
  dpr = typeof window !== "undefined" ? window?.devicePixelRatio || 1 : 1;
  if (typeof document === "undefined") return { canvas: undefined, dpr };
  const canvas = document.createElement("canvas");
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  return { canvas, dpr };
}

export function createContext2d(width: number, height: number, dpr?: number) {
  const { canvas, dpr: usedDpr } = createCanvas(width, height, dpr);
  if (!canvas) return undefined;
  const context = canvas.getContext("2d");
  if (!context) throw new Error(`Error creating Context2D (${canvas.width}x${canvas.height})`);
  context.scale(usedDpr, usedDpr);
  return context;
}

export async function getImageDataAsync(src: string) {
  const bitmap = await loadImageAsync(src);
  const { width, height } = bitmap;

  // an intermediate "buffer" 2D context is necessary
  const context = createContext2d(width, height, 1);
  if (!context) throw new Error("Error creating context");
  context.drawImage(bitmap, 0, 0);
  return context.getImageData(0, 0, width, height);
}
