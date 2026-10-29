/* Parent settings and earned stars, kept in localStorage. Components read them with useSettings() / useStars(). */
import { useSyncExternalStore } from 'react';

const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

export interface Settings { vi: boolean; slow: boolean; auto: boolean; loop: boolean; level: number; unlockAll: boolean }

function createStore<T extends object>(key: string, initial: T){
  let value = initial;
  const subs = new Set<() => void>();
  return {
    get: () => value,
    set(patch: Partial<T>){ value = {...value, ...patch}; save(key, value); subs.forEach(f => f()); },
    subscribe(f: () => void){ subs.add(f); return () => { subs.delete(f); }; },
  };
}

export const settingsStore = createStore<Settings>('bhta-settings',
  {vi: true, slow: true, auto: false, loop: false, level: 1, unlockAll: false, ...load('bhta-settings', {})});
/** One star per finished game, keyed "topicId:modeId". */
export const starsStore = createStore<Record<string, boolean>>('bhta-stars', load('bhta-stars', {}));

export const useSettings = () => useSyncExternalStore(settingsStore.subscribe, settingsStore.get);
export const useStars = () => useSyncExternalStore(starsStore.subscribe, starsStore.get);
