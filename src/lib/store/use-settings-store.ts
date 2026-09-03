import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontSize = "P" | "M" | "G";
export type DefaultView = "grid" | "list";
export type DefaultSort = "recent" | "alpha";

interface SettingsStore {
  fontSize: FontSize;
  defaultView: DefaultView;
  defaultSort: DefaultSort;
  setFontSize: (value: FontSize) => void;
  setDefaultView: (value: DefaultView) => void;
  setDefaultSort: (value: DefaultSort) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      fontSize: "M",
      defaultView: "grid",
      defaultSort: "recent",
      setFontSize: (fontSize) => set({ fontSize }),
      setDefaultView: (defaultView) => set({ defaultView }),
      setDefaultSort: (defaultSort) => set({ defaultSort }),
    }),
    { name: "settings-storage" },
  ),
);
