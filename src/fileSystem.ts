import create from "zustand";

const useFileSystemStore = create<{
  isSupported: boolean;
  rootDirHandle: FileSystemDirectoryHandle | undefined;
  actions: {
    loadRootFolderAsync(): Promise<string>;
    getFilesAsync(): Promise<FileSystemDirectoryEntry[]>;
  };
}>((set, get) => ({
  isSupported: typeof showDirectoryPicker !== "undefined",
  rootDirHandle: undefined,
  actions: {
    async loadRootFolderAsync() {
      const rootDirHandle = await showDirectoryPicker({
        id: "root",
      }) as FileSystemDirectoryHandle;
      set({ rootDirHandle });
      return rootDirHandle.name;
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
