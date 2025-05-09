import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserInfo } from "../types/user";

interface LoginState {
  userInfo: UserInfo | null;
  token: string | null;
  setUserInfo: (info: UserInfo | null) => void;
  setToken: (token: string) => void;
  clearLoginState: () => void;
}

const useLoginStore = create<LoginState>()(
  persist(
    (set) => ({
      userInfo: null,
      token: null,
      setUserInfo: (info) => set({ userInfo: info }),
      setToken: (token) => set({ token }),
      clearLoginState: () => set({ userInfo: null, token: null }),
    }),
    {
      name: "userInfo",
    }
  )
);

export default useLoginStore;
