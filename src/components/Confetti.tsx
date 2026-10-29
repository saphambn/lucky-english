import { useState } from 'react';

const COLS = ['#F2557D', '#FFC43D', '#2FB067', '#3F7FE8', '#8E4FD6'];

export function Confetti(){
  const [bits] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches ? [] :
    Array.from({length: 60}, (_, i) => ({left: Math.random() * 100, bg: COLS[i % 5], dur: 1.8 + Math.random() * 1.6, delay: Math.random() * .5})));
  if (!bits.length) return null;
  return <div className="confetti">{bits.map((b, i) =>
    <i key={i} style={{left: `${b.left}%`, background: b.bg, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`}}></i>)}</div>;
}
