import { useEffect, useState } from 'react';
import { Bar } from '../components/Bar';
import { Visual } from '../components/Visual';
import { choices, ROUNDS, type Item, type Topic } from '../data/topics';
import { sfx, talk } from '../lib/audio';
import { SAY, viText } from '../lib/say';
import { useSettings } from '../lib/store';
import { pickOthers, replay, shuffle, useLater } from '../lib/util';
import { useGo } from '../nav';

/** Find it: hear a word, tap the right picture. One round per screen. */
export function Find({topic: t, round, prev}: {topic: Topic, round: number, prev?: Item}){
  const go = useGo();
  const later = useLater();
  const settings = useSettings();
  const [{target, opts}] = useState(() => {
    const target = shuffle(t.items.filter(x => x !== prev))[0];
    return {target, opts: shuffle([target, ...pickOthers(t.items, target, choices(t) - 1)])};
  });
  const line = SAY.find(target, t);
  const [won, setWon] = useState<number | null>(null);

  const ask = () => talk(line);
  useEffect(() => { later(ask, 250); }, []);

  const tap = (o: Item, k: number, el: HTMLElement) => {
    if (won != null) return;
    if (o === target){
      setWon(k); sfx.yay();
      later(() => talk(SAY.findYes(target, t)), 250);
      later(() => go(round + 1 >= ROUNDS ? {name: 'celebrate', topic: t, mode: 'find'} : {name: 'find', topic: t, round: round + 1, prev: target}), 2200);
    } else {
      sfx.oops(); replay(el, 'bad');
      talk(SAY.thatIs(o, t));
    }
  };

  return <section className="screen">
    <Bar back="back" onBack={() => go({name: 'topic', topic: t})} title="" onSay={ask} dots={round}/>
    <div className="stage">
      <p className="prompt">{line[0]}{settings.vi ? <small>{viText(line[1])}</small> : null}</p>
      <div className={`row ${choices(t) > 3 ? 'many' : ''}`}>{opts.map((o, k) =>
        <button key={k} className={`card${won === k ? ' good' : won != null ? ' dim' : ''}`} data-k={k} aria-label={o.en}
          onClick={e => tap(o, k, e.currentTarget)}><Visual item={o} topic={t}/></button>)}
      </div>
    </div>
  </section>;
}
