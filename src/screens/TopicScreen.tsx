import type { CSSProperties } from 'react';
import { Bar } from '../components/Bar';
import { MODES, type Topic } from '../data/topics';
import { sfx } from '../lib/audio';
import { useStars } from '../lib/store';
import { gameScreen, useGo } from '../nav';

/** Pick a game for one topic. */
export function TopicScreen({topic: t}: {topic: Topic}){
  const go = useGo();
  const stars = useStars();
  return <section className="screen scroll">
    <Bar back="home" onBack={() => go({name: 'home'})} title={`${t.icon} ${t.en}`} sub={t.vi}/>
    <div className="stage">
      <div className="grid four">{MODES.map(m =>
        <button key={m.id} className="tile" data-m={m.id} style={{'--t': m.t, '--td': m.td} as CSSProperties}
          onClick={() => { sfx.pop(); go(gameScreen(m.id, t)); }}>
          {stars[t.id + ':' + m.id] ? <span className="star" aria-label="Đã xong">★</span> : null}
          <span className="ico">{m.icon}</span><b>{m.en}</b><small>{m.vi}</small>
        </button>)}
      </div>
    </div>
  </section>;
}
