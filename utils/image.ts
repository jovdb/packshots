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

export function createContext2d(width: number, height: number, dpr = devicePixelRatio) {
    const canvas = document.createElement("canvas");
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    const context = canvas.getContext("2d");
    if (!context) throw new Error(`Error creating Context2D (${canvas.width}x${canvas.height})`);
    context.scale(dpr, dpr);
    return context;
}

export async function getImageDataAsync(src: string) {
    const bitmap = await loadImageAsync(src);
    const { width, height } = bitmap;

    // an intermediate "buffer" 2D context is necessary
    const ctx = createContext2d(width, height, 1);
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, width, height);
}

