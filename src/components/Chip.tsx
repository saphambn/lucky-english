import type { ReactNode } from 'react';
import { sfx } from '../lib/audio';

/** A parent on/off switch. */
export function Chip({id, on, onToggle, children}: {id?: string, on: boolean, onToggle: () => void, children: ReactNode}){
  return <button className="chip" id={id} aria-pressed={on} onClick={() => { onToggle(); sfx.pop(); }}><span className="sw"></span>{children}</button>;
}
