import create from "zustand";
import { IPackshot } from "../components/samples/IPackshot";

const usePackshotStore = create<{
    packshot: IPackshot | undefined;
    actions: {
        setPackshot(packshot: IPackshot): void;
    },
}>((set, get) => ({
    packshot: undefined,
    actions: {
        setPackshot(packshot) {
            set({ packshot });
        },
    },
}));

export function usePackshotActions() {
    return usePackshotStore(s => s.actions);
}
