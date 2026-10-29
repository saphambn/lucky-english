import { useState, type CSSProperties } from 'react';
import { Bar } from '../components/Bar';
import { Chip } from '../components/Chip';
import { LEVELS, MODES, TOPICS, type Level } from '../data/topics';
import { sfx, stopVoice, talk } from '../lib/audio';
import { SAY } from '../lib/say';
import { settingsStore, useSettings, useStars } from '../lib/store';
import { replay } from '../lib/util';
import { useGo } from '../nav';

/** Level tabs, the topics of the chosen level, and the parent switches. */
export function Home(){
  const go = useGo();
  const settings = useSettings();
  const stars = useStars();
  const [lockMsg, setLockMsg] = useState<string | null>(null);

  const topicStars = (id: string) => MODES.filter(m => stars[id + ':' + m.id]).length;
  const levelStars = (n: number) => TOPICS.filter(t => t.level === n).reduce((a, t) => a + topicStars(t.id), 0);
  const levelOpen = (l: Level) => settings.unlockAll || l.n === 1 || levelStars(l.n - 1) >= l.need;
  const lv = levelOpen(LEVELS[settings.level - 1] || LEVELS[0]) ? settings.level : 1;

  const pickLevel = (l: Level, b: HTMLElement) => {
    if (!levelOpen(l)){
      sfx.oops(); replay(b, 'shake');
      setLockMsg(`Bé cần ${l.need} ★ ở Level ${l.n - 1} để mở Level ${l.n} (đang có ${levelStars(l.n - 1)} ★).`);
      talk(SAY.locked());
      return;
    }
    settingsStore.set({level: l.n}); setLockMsg(null);
    sfx.pop(); talk(SAY.level(l.n));
  };

  return <section className="screen scroll">
    <Bar title="Choose a topic" sub="Chọn chủ đề"/>
    <div className="stage">
      <div className="levels">{LEVELS.map(l => {
        const open = levelOpen(l);
        return <button key={l.n} className={`lvl ${open ? '' : 'locked'}`} data-l={l.n} aria-current={l.n === lv}
          onClick={e => pickLevel(l, e.currentTarget)}>
          <span className="li">{open ? l.icon : '🔒'}</span>
          <span>Level {l.n}<small>{open ? l.vi : `★ ${Math.min(levelStars(l.n - 1), l.need)}/${l.need}`}</small></span>
        </button>;
      })}</div>
      <p className="lockmsg" id="lockmsg" hidden={!lockMsg}>{lockMsg}</p>
      <div className="grid six">{TOPICS.filter(t => t.level === lv).map(t => {
        const done = topicStars(t.id);
        return <button key={t.id} className="tile" data-t={t.id} style={{'--t': t.t, '--td': t.td} as CSSProperties}
          onClick={() => { sfx.pop(); go({name: 'topic', topic: t}); talk(SAY.topic(t)); }}>
          {done ? <span className="star" aria-label={`${done} sao`}>{'★'.repeat(Math.min(done, 3))}</span> : null}
          <span className="ico">{t.icon}</span><b>{t.en}</b><small>{t.vi}</small>
        </button>;
      })}</div>
      <div className="parents">
        <Chip id="optVi" on={settings.vi} onToggle={() => settingsStore.set({vi: !settings.vi})}>Đọc nghĩa tiếng Việt</Chip>
        <Chip id="optSlow" on={settings.slow} onToggle={() => settingsStore.set({slow: !settings.slow})}>Đọc chậm</Chip>
        <Chip id="optAll" on={settings.unlockAll} onToggle={() => { stopVoice(); setLockMsg(null); settingsStore.set({unlockAll: !settings.unlockAll}); }}>Mở mọi cấp độ</Chip>
      </div>
    </div>
  </section>;
}
