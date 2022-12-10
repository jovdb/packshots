import { useQuery } from "@tanstack/react-query";
import create from "zustand";
import { IImageConfig } from "../../components/config/ImageConfig";
import { IPackshot } from "../IPackshot";
import { loadFolderAsync, openTextFileAsync, saveTextFileAsync } from "./fileSystem";
import { deserialize, serialize } from "./packshot";

export type PackshotRoot = string | FileSystemDirectoryHandle | undefined;

interface IAppState {
  /**
   * Root makes the configuration of files relative
   * This adds flexibility to:
   * - Switch from a url root to a file system folder without changing all relative path
   * - Makes it possible to add a layer in between for LOD (thumbs,quality medium)
   */
  root: PackshotRoot;
}

interface IAppActions {
  setRoot(root: PackshotRoot): void;
}

/** A hook to have a handle to a folder */
const useAppStore = create<IAppState & { actions: IAppActions }>((set) => ({
  root: undefined,

  actions: {
    setRoot(root: string | FileSystemDirectoryHandle | undefined) {
      set({ root });
    },
  },
}));


// export const useApp = useAppStore as UseBoundStore<StoreApi<IAppState>>;

export function useAppRoot() {
  return [
    useAppStore(s => s.root),
    useAppStore(s => s.actions.setRoot),
  ] as const;
}


export async function loadPackShotFromFolderAsync(directoryHandle?: FileSystemDirectoryHandle | undefined) {
  if (!directoryHandle) directoryHandle = await loadFolderAsync();
  if (!directoryHandle) return;

  const data = await openTextFileAsync(directoryHandle, "packshot.json");
  if (!data) return;
  const packShot = deserialize(data);

  return ({
    directoryHandle,
    packShot,
  });
}

export async function savePackShotToFolderAsync(
  packShot: IPackshot,
  directoryHandle?: FileSystemDirectoryHandle | undefined,
): Promise<boolean> {
  if (!directoryHandle) directoryHandle = await loadFolderAsync();
  if (!directoryHandle) return false;

  const content = serialize(packShot);
  return await saveTextFileAsync(directoryHandle, "packshot.json", content);
}

export async function getImageUrl(root: PackshotRoot, imageConfig: IImageConfig | undefined) {
  if (!root) throw new Error("No package root configurated");
  if (!imageConfig?.url) throw new Error("No image configuration available");

  // Generate an url
  if (typeof root === "string") {
    return `${root}${root.substring(-1) === "/" ? "" : "/"}${imageConfig.url}`;
  }

  // Read image from folder as image blob url
  const fileHandle = await root.getFileHandle(imageConfig.url);
  const file = await fileHandle.getFile();
  return URL.createObjectURL(file);
}

export function useImageUrl(imageConfig: IImageConfig | undefined) {
  const [root] = useAppRoot();
  return useQuery([root, imageConfig], () => getImageUrl(root, imageConfig));
}