import { useEffect, useRef, useState } from 'react';
import { Bar } from '../components/Bar';
import { Visual } from '../components/Visual';
import type { Topic } from '../data/topics';
import { sfx, talk } from '../lib/audio';
import { SAY } from '../lib/say';
import { shuffle, useLater } from '../lib/util';
import { useGo } from '../nav';

/** Surprise boxes: tap a gift box to open it and hear the word inside. Done when every box is open. */
export function Peek({topic: t}: {topic: Topic}){
  const go = useGo();
  const later = useLater();
  const [items] = useState(() => shuffle(t.items).slice(0, t.level > 1 ? 8 : 6));
  const [open, setOpen] = useState<Set<number>>(new Set());
  const opened = useRef(new Set<number>());   // same as open, readable before React re-renders

  useEffect(() => { later(() => talk(SAY.boxes()), 250); }, []);

  const tap = (k: number) => {
    const o = items[k];
    if (opened.current.has(k)){ talk(SAY.word(o)); return; }   // tap an open box to hear it again
    opened.current.add(k);
    setOpen(new Set(opened.current)); sfx.pop();
    talk(SAY.word(o));
    if (opened.current.size === items.length) later(() => go({name: 'celebrate', topic: t, mode: 'peek'}), 2600);
  };

  return <section className="screen">
    <Bar back="back" onBack={() => go({name: 'topic', topic: t})} title="Open the boxes" sub="Chạm vào hộp quà để xem bên trong"/>
    <div className="stage">
      <div className={`mgrid ${items.length > 6 ? 'eight' : ''}`}>{items.map((o, k) =>
        <button key={k} className={`mcard box${open.has(k) ? ' open' : ''}`} data-k={k} aria-label={open.has(k) ? o.en : `Hộp quà ${k + 1}`} onClick={() => tap(k)}>
          <span className="in"><span className="b"><span>🎁</span></span><span className="f"><Visual item={o} topic={t}/></span></span>
        </button>)}
      </div>
    </div>
  </section>;
}
