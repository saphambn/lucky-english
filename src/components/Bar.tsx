import type { ReactNode } from 'react';
import { ROUNDS } from '../data/topics';
import { sfx } from '../lib/audio';
import { ICON } from './Icons';

interface Props {
  /** 'home' shows a house icon, 'back' an arrow; leave out for no button. */
  back?: 'home' | 'back';
  onBack?: () => void;
  title: ReactNode;
  sub?: ReactNode;
  /** Shows the yellow "hear it again" button. */
  onSay?: () => void;
  /** Rounds finished so far; shows the progress dots. */
  dots?: number;
}

/** Top bar of a screen: back button, title, replay-voice button. */
export function Bar({back, onBack, title, sub, onSay, dots}: Props){
  return <header className="bar">
    {back
      ? <button className="round" id="back" aria-label="Quay lại" onClick={() => { sfx.pop(); onBack?.(); }}>{back === 'home' ? ICON.home : ICON.back}</button>
      : <span className="spacer"></span>}
    <h1>{title}{sub ? <small>{sub}</small> : null}{dots != null ? <Dots done={dots}/> : null}</h1>
    {onSay
      ? <button className="round say" id="say" aria-label="Nghe lại" onClick={onSay}>{ICON.speak}</button>
      : <span className="spacer"></span>}
  </header>;
}

function Dots({done}: {done: number}){
  return <span className="dots" aria-label={`Câu ${done + 1} / ${ROUNDS}`}>
    {Array.from({length: ROUNDS}, (_, i) => <i key={i} className={i < done ? 'on' : ''}></i>)}
  </span>;
}
