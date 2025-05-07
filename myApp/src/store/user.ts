import { atom } from 'jotai';

import { UserInfo } from '@/types/user';

export const userAtom = atom<UserInfo | null>(null);

export const isUserLoggedInAtom = atom((get) => get(userAtom) !== null);

// 帖子全局状态管理
export interface PostStatus {
  id: number;
  is_liked: boolean;
  likes_count: number;
  comments_count: number;
}

