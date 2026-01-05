// stores/useUIStore.ts
import { create } from 'zustand';

interface UIStore {
  activeModal: string | null;
  activeSheet: string | null;
  isFilterModalVisible: boolean;
  
  openModal: (modalId: string) => void;
  closeModal: () => void;
  openSheet: (sheetId: string) => void;
  closeSheet: () => void;
  setFilterModalVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeModal: null,
  activeSheet: null,
  isFilterModalVisible: false,

  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  openSheet: (sheetId) => set({ activeSheet: sheetId }),
  closeSheet: () => set({ activeSheet: null }),
  setFilterModalVisible: (visible) => set({ isFilterModalVisible: visible }),
}));