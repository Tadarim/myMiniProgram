import { atom } from 'jotai';

export enum Gender {
  Male = 1,
  Female = 2,
  Unknown = 3
}

export interface UserInfo {
  id: string | number;
  username: string;
  email?: string;
  avatar?: string;
  token?: string;
  backgroundImage: string;
  desc?: string;
  extra?: {
    gender: Gender;
    birthday: string;
    location: string;
    school: string;
  };
}

export const userAtom = atom<UserInfo | null>(null);

export const isUserLoggedInAtom = atom((get) => get(userAtom) !== null);
