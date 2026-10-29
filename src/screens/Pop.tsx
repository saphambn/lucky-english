import { useEffect, useState, type CSSProperties } from 'react';
import { Bar } from '../components/Bar';
import { Visual } from '../components/Visual';
import { choices, ROUNDS, type Item, type Topic } from '../data/topics';
import { sfx, talk } from '../lib/audio';
import { SAY, viText } from '../lib/say';
import { useSettings } from '../lib/store';
import { pickOthers, replay, shuffle, useLater } from '../lib/util';
import { useGo } from '../nav';

const COLORS = ['#FF7E9D', '#FFC43D', '#6FD08C', '#6FA8FF', '#C792FF'];
const FLY = 9;   // seconds for a balloon to float from the bottom to the top

/** Balloons: pictures float up in balloons; hear a word and tap the right balloon to pop it. */
export function Pop({topic: t, round, prev}: {topic: Topic, round: number, prev?: Item}){
  const go = useGo();
  const later = useLater();
  const settings = useSettings();
  const [{target, opts, delays}] = useState(() => {
    const target = shuffle(t.items.filter(x => x !== prev))[0];
    const opts = shuffle([target, ...pickOthers(t.items, target, choices(t) - 1)]);
    // Start each balloon at a different height (negative delay) so they don't rise in a line.
    const delays = shuffle(opts.map((_, k) => -(k + 0.5) * FLY / opts.length));
    return {target, opts, delays};
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
      later(() => go(round + 1 >= ROUNDS ? {name: 'celebrate', topic: t, mode: 'pop'} : {name: 'pop', topic: t, round: round + 1, prev: target}), 2200);
    } else {
      sfx.oops(); replay(el, 'bad');
      talk(SAY.thatIs(o, t));
    }
  };

  return <section className="screen">
    <Bar back="back" onBack={() => go({name: 'topic', topic: t})} title="" onSay={ask} dots={round}/>
    <p className="prompt">{line[0]}{settings.vi ? <small>{viText(line[1])}</small> : null}</p>
    <div className={`sky${won != null ? ' still' : ''}`}>{opts.map((o, k) =>
      <div key={k} className="float" style={{'--f': opts.length > 1 ? k / (opts.length - 1) : 0.5, '--d': `${delays[k]}s`, '--fly': `${FLY}s`} as CSSProperties}>
        <button className={`balloon${won === k ? ' popped' : won != null ? ' dim' : ''}`} data-k={k} aria-label={o.en}
          style={{'--c': COLORS[k % COLORS.length]} as CSSProperties} onClick={e => tap(o, k, e.currentTarget)}>
          <Visual item={o} topic={t}/>
        </button>
      </div>)}
    </div>
  </section>;
}
