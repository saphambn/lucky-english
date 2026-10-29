import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Bar } from '../components/Bar';
import { Visual } from '../components/Visual';
import { choices, ROUNDS, type Item, type Topic } from '../data/topics';
import { sfx, talk } from '../lib/audio';
import { SAY, viText } from '../lib/say';
import { useSettings } from '../lib/store';
import { pickOthers, shuffle, useLater } from '../lib/util';
import { useGo } from '../nav';

/** Drag: drag the right picture onto its shadow. One round per screen. */
export function Drag({topic: t, round, prev}: {topic: Topic, round: number, prev?: Item}){
  const go = useGo();
  const later = useLater();
  const settings = useSettings();
  const [{target, opts}] = useState(() => {
    const target = shuffle(t.items.filter(x => x !== prev))[0];
    return {target, opts: shuffle([target, ...pickOthers(t.items, target, choices(t) - 1)])};
  });
  const line = SAY.drag(target, t);
  const zone = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState(false);
  const [dragK, setDragK] = useState<number | null>(null);
  const [won, setWon] = useState<number | null>(null);
  // The card being dragged: where the finger started and whether it has moved yet.
  const drag = useRef<{k: number, sx: number, sy: number, moved: boolean} | null>(null);

  const ask = () => talk(line);
  useEffect(() => { later(ask, 250); }, []);

  const inZone = (x: number, y: number) => { const r = zone.current!.getBoundingClientRect(); return x > r.left && x < r.right && y > r.top && y < r.bottom; };

  // The card's position is set straight on its style while dragging, so React doesn't re-render on every move.
  const down = (k: number) => (e: PointerEvent<HTMLDivElement>) => {
    if (won != null) return;
    const el = e.currentTarget;
    drag.current = {k, sx: e.clientX, sy: e.clientY, moved: false};
    el.setPointerCapture(e.pointerId);
    el.classList.remove('back'); el.classList.add('dragging');
    setDragK(k);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current; if (!d) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) > 10) d.moved = true;
    e.currentTarget.style.transform = `translate(${dx}px,${dy}px) scale(1.08)`;
    setHot(inZone(e.clientX, e.clientY));
  };
  const end = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current; if (!d) return; drag.current = null;
    const el = e.currentTarget, o = opts[d.k];
    el.classList.remove('dragging'); el.classList.add('back');
    setDragK(null); setHot(false);
    if (!d.moved){ el.style.transform = ''; talk(SAY.word(o)); return; }
    if (inZone(e.clientX, e.clientY) && o === target){
      setWon(d.k); sfx.yay();
      // snap into the zone centre
      const z = zone.current!.getBoundingClientRect(), r = el.getBoundingClientRect();
      const cur = new DOMMatrix(getComputedStyle(el).transform);
      el.style.transform = `translate(${cur.m41 + (z.left + z.width / 2) - (r.left + r.width / 2)}px,${cur.m42 + (z.top + z.height / 2) - (r.top + r.height / 2)}px)`;
      later(() => talk(SAY.dragYes(target, t)), 300);
      later(() => go(round + 1 >= ROUNDS ? {name: 'celebrate', topic: t, mode: 'drag'} : {name: 'drag', topic: t, round: round + 1, prev: target}), 2300);
    } else {
      if (inZone(e.clientX, e.clientY)){ sfx.oops(); talk(SAY.retry(o, t)); }
      el.style.transform = '';
    }
  };

  return <section className="screen">
    <Bar back="back" onBack={() => go({name: 'topic', topic: t})} title="" onSay={ask} dots={round}/>
    <div className="stage">
      <div className={`zone ghost${hot ? ' hot' : ''}${won != null ? ' done' : ''}`} id="zone" ref={zone} aria-label="Khung đích"><Visual item={target} topic={t}/></div>
      <p className="prompt">{line[0]}{settings.vi ? <small>{viText(line[1])}</small> : null}</p>
      <div className={`row drag-row ${choices(t) > 3 ? 'many' : ''}`}>{opts.map((o, k) =>
        <div key={k} className={`card${dragK === k ? ' dragging' : ' back'}${won != null && won !== k ? ' dim' : ''}`}
          data-k={k} role="button" aria-label={o.en}
          onPointerDown={down(k)} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
          <Visual item={o} topic={t}/>
        </div>)}
      </div>
    </div>
  </section>;
}
