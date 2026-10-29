import { useEffect, useRef } from 'react';
import { Bar } from '../components/Bar';
import { Chip } from '../components/Chip';
import { ICON } from '../components/Icons';
import { Visual } from '../components/Visual';
import type { Topic } from '../data/topics';
import { sfx, talk } from '../lib/audio';
import { SAY } from '../lib/say';
import { settingsStore, useSettings } from '../lib/store';
import { replay, useLater } from '../lib/util';
import { useGo } from '../nav';

/** Flashcards: one word per screen; tap or swipe to move, with optional auto-play and loop. */
export function Learn({topic: t, i}: {topic: Topic, i: number}){
  const go = useGo();
  const later = useLater();
  const settings = useSettings();
  const item = t.items[i];
  const card = useRef<HTMLButtonElement>(null);
  const autoTimer = useRef<number | undefined>(undefined);
  const alive = useRef(true);

  const next = () => {
    sfx.pop();
    if (i + 1 < t.items.length) go({name: 'learn', topic: t, i: i + 1});
    else if (settingsStore.get().loop) go({name: 'learn', topic: t, i: 0});
    else go({name: 'celebrate', topic: t, mode: 'learn'});
  };
  const prev = () => { sfx.pop(); go({name: 'learn', topic: t, i: (i - 1 + t.items.length) % t.items.length}); };

  // Auto-play: once the word (and its meaning) has been read, wait a moment and turn to the next card.
  const autoNext = () => {
    clearTimeout(autoTimer.current);
    if (settingsStore.get().auto) autoTimer.current = window.setTimeout(() => { if (alive.current && settingsStore.get().auto) next(); }, 1500);
  };
  const say = () => {
    clearTimeout(autoTimer.current);
    talk(SAY.word(item), autoNext, ...(item.s ? [SAY.sentence(item)] : []));
    autoTimer.current = window.setTimeout(autoNext, item.s ? 18000 : 12000);   // in case the audio never reports that it ended
    replay(card.current, 'bounce');
  };

  useEffect(() => {
    alive.current = true;
    later(say, 250);
    return () => { alive.current = false; clearTimeout(autoTimer.current); };
  }, []);

  const toggleAuto = () => {
    const on = !settings.auto;
    settingsStore.set({auto: on});
    if (on) say(); else clearTimeout(autoTimer.current);
  };

  // swipe left/right on the stage
  const sx = useRef<number | null>(null);
  return <section className="screen">
    <Bar back="back" onBack={() => go({name: 'topic', topic: t})} title={t.en} sub={`${i + 1} / ${t.items.length}`} onSay={say}/>
    <div className="stage learn"
      onPointerDown={e => { sx.current = e.clientX; }}
      onPointerUp={e => {
        if (sx.current == null) return; const dx = e.clientX - sx.current; sx.current = null;
        if (dx < -70) next(); else if (dx > 70) prev();
      }}>
      <button className="card" id="card" ref={card} aria-label={item.en} onClick={say}><Visual item={item} topic={t}/></button>
      <p className="word">{item.en}{settings.vi ? <small>{item.vi}</small> : null}
        {item.s ? <span className="sent">{item.s}{settings.vi ? <small>{item.vs}</small> : null}</span> : null}</p>
      <div className="nav">
        <button className="arrow" id="prev" aria-label="Trước" onClick={prev}>{ICON.left}</button>
        <button className="arrow" id="next" aria-label="Tiếp" onClick={next}>{ICON.right}</button>
      </div>
      <div className="parents">
        <Chip id="optAuto" on={settings.auto} onToggle={toggleAuto}>Tự chạy</Chip>
        <Chip id="optLoop" on={settings.loop} onToggle={() => settingsStore.set({loop: !settings.loop})}>Lặp lại</Chip>
      </div>
    </div>
  </section>;
}
