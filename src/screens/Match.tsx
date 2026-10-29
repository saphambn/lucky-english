import { useEffect, useRef, useState } from 'react';
import { Bar } from '../components/Bar';
import { Visual } from '../components/Visual';
import { choices, type Topic } from '../data/topics';
import { sfx, talk } from '../lib/audio';
import { SAY } from '../lib/say';
import { shuffle, useLater } from '../lib/util';
import { useGo } from '../nav';

/** Match: memory game, flip two cards to find a pair (3 pairs in level 1, 4 later). */
export function Match({topic: t}: {topic: Topic}){
  const go = useGo();
  const later = useLater();
  const [{picks, deck}] = useState(() => {
    const picks = shuffle(t.items).slice(0, choices(t));
    return {picks, deck: shuffle([...picks, ...picks])};
  });
  const [open, setOpen] = useState<Set<number>>(new Set());       // face-up cards
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const isOpen = useRef(new Set<number>());   // same as open, readable before React re-renders (fast double taps)
  const turn = useRef<number[]>([]);    // the cards flipped this turn
  const busy = useRef(false);
  const found = useRef(0);

  useEffect(() => { later(() => talk(SAY.pairs()), 250); }, []);

  const flip = (k: number) => {
    if (busy.current || isOpen.current.has(k)) return;
    isOpen.current.add(k);
    const o = deck[k];
    setOpen(new Set(isOpen.current)); sfx.flip(); talk([o.en]);
    turn.current.push(k);
    if (turn.current.length < 2) return;
    const [a, c] = turn.current; turn.current = [];
    if (deck[a] === deck[c]){
      found.current++;
      later(() => { sfx.yay(); setMatched(s => new Set(s).add(a).add(c)); talk(SAY.pairYes(o, t)); }, 450);
      if (found.current === picks.length) later(() => go({name: 'celebrate', topic: t, mode: 'match'}), 2400);
    } else {
      busy.current = true;
      later(() => {
        isOpen.current.delete(a); isOpen.current.delete(c);
        setOpen(new Set(isOpen.current)); busy.current = false;
      }, 1300);
    }
  };

  return <section className="screen">
    <Bar back="back" onBack={() => go({name: 'topic', topic: t})} title="Find the pairs" sub="Lật thẻ, tìm 2 hình giống nhau"/>
    <div className="stage">
      <div className={`mgrid ${picks.length > 3 ? 'eight' : ''}`}>{deck.map((o, k) =>
        <button key={k} className={`mcard${open.has(k) ? ' open' : ''}${matched.has(k) ? ' matched' : ''}`} data-k={k} aria-label={`Thẻ ${k + 1}`} onClick={() => flip(k)}>
          <span className="in"><span className="b"><span>?</span></span><span className="f"><Visual item={o} topic={t}/></span></span>
        </button>)}
      </div>
    </div>
  </section>;
}
