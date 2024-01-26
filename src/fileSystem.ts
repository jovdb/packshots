import { Exception } from "./utils/error";

export function isSupported() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (window as any)["showDirectoryPicker"] !== "undefined";
}

export class FileSystemException extends Exception {
}

export async function loadFolderAsync() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (window as any)["showDirectoryPicker"]({
      id: "root",
      mode: "readwrite",
    }) as unknown as FileSystemDirectoryHandle;
  } catch (err) {
    throw new FileSystemException("Error showing folder dialog", err);
  }
}

export async function openTextFileAsync(
  directoryHandle: FileSystemDirectoryHandle,
  name: string,
): Promise<string | undefined> {
  try {
    const fileHandle = await directoryHandle.getFileHandle(name);
    const file = await fileHandle.getFile();
    return await file.text();
  } catch (err) {
    throw new FileSystemException(`Error reading text file: ${name}`, err);
  }
}

export async function saveTextFileAsync(
  directoryHandle: FileSystemDirectoryHandle,
  name: string,
  content: string,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileHandle = await directoryHandle.getFileHandle(name, { create: true }) as any;
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(content);
    await writableStream.close();
  } catch (err) {
    throw new FileSystemException(`Error saving text file: ${name}`, err);
  }
}

export async function getFileNamesAsync(directoryHandle: FileSystemDirectoryHandle): Promise<string[]> {
  try {
    const files = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const entry of (directoryHandle as any).values()) {
      if (entry.kind !== "file") break;
      files.push(entry.name);
    }
    return files;
  } catch (err) {
    throw new FileSystemException("Error loading list of files", err);
  }
}
