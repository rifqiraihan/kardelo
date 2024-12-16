import { atom } from 'jotai';

export const listsAtom = atom<any[]>([]);
export const selectedListAtom = atom<any | null>(null);

