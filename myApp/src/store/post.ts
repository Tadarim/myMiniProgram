import { atom } from 'jotai';

import { PostStatus } from '@/types/post';

export const postStatusMapAtom = atom<Record<number, PostStatus>>({});
