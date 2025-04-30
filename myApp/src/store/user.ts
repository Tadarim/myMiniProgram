import { atom } from 'jotai';

import { UserInfo } from '@/types/user';

export const userAtom = atom<UserInfo | null>(null);

export const isUserLoggedInAtom = atom((get) => get(userAtom) !== null);
