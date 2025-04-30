import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserInfo {
  id: number;
  username: string;
  role: string;
}

interface LoginState {
  userInfo: UserInfo | null;
  token: string | null;
  setUserInfo: (info: UserInfo | null) => void;
  setToken: (token: string) => void;
}

const useLoginStore = create<LoginState>()(
  persist(
    (set) => ({
      userInfo: null,
      token: null,
      setUserInfo: (info) => set({ userInfo: info }),
      setToken: (token) => set({ token }),
    }),
    {
      name: "userInfo",
    }
  )
);

export default useLoginStore;
