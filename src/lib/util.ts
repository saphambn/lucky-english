import { useEffect, useRef } from 'react';

export const shuffle = <T,>(a: T[]) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pickOthers = <T,>(list: T[], not: T, n: number) => shuffle(list.filter(x => x !== not)).slice(0, n);

/** Restart a CSS animation class (shake, bounce) on an element. */
export function replay(el: HTMLElement | null, cls: string){
  if (!el) return;
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
}

/** setTimeout that is cancelled when the screen goes away, so old timers do nothing. */
export function useLater(){
  const timers = useRef(new Set<number>());
  useEffect(() => { const t = timers.current; return () => { t.forEach(clearTimeout); t.clear(); }; }, []);
  return useRef((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => { timers.current.delete(id); fn(); }, ms);
    timers.current.add(id);
    return id;
  }).current;
}
