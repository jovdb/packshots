import create from "zustand";

const useFileSystemStore = create<{
  isSupported: boolean;
  rootDirHandle: FileSystemDirectoryHandle | undefined;
  actions: {
    loadRootFolderAsync(): Promise<string>;
    getFilesAsync(): Promise<FileSystemDirectoryEntry[]>;
    saveFileAsync(fileName: string, content: string): Promise<void>;
  };
}>((set, get) => ({
  isSupported: typeof showDirectoryPicker !== "undefined",
  rootDirHandle: undefined,
  actions: {
    async loadRootFolderAsync() {
      try {
        const rootDirHandle = await showDirectoryPicker({
          id: "root",
        }) as FileSystemDirectoryHandle;
        set({ rootDirHandle });
        return rootDirHandle.name;
      } catch (err) {
        console.warn("Folder dialog:", err);
      }
      return "";
    },

    async saveFileAsync(name: string, content: string) {
      const rootDirHandle = get().rootDirHandle;
      if (!rootDirHandle) return undefined;

      const fileHandle = await rootDirHandle.getFileHandle(name, { create: true });
      const writableStream = await fileHandle.createWritable();
      await writableStream.write(content);
      await writableStream.close();
    },

    async getFilesAsync() {
      const rootDirHandle = get().rootDirHandle;
      if (!rootDirHandle) return [];

      const files = [];
      for await (const entry of rootDirHandle.values()) {
        files.push(entry);
      }
      return files;
    },
  },
}));

export function useIsFileSystemSupported() {
  return useFileSystemStore(s => s.isSupported);
}

export function useFileSystemActions() {
  return useFileSystemStore(s => s.actions);
}
