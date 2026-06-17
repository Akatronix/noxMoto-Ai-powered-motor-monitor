import { create } from "zustand";

const useUserDataStore = create((set) => ({
  userData: null,
  chartData: [],
  historyData: [],
  hardwareData: {},

  setChartData: (data) => set({ chartData: data }),
  setHistoryData: (data) => set({ historyData: data }),
  sethardwareData: (data) => set({ hardwareData: data }),
  setUserData: (data) => set({ userData: data }),
  clearUserData: () => set({ userData: null }),
}));

export { useUserDataStore };
