import { useEffect } from 'react';
import { Confetti } from '../components/Confetti';
import { ICON } from '../components/Icons';
import type { ModeId, Topic } from '../data/topics';
import { sfx, talk } from '../lib/audio';
import { SAY } from '../lib/say';
import { starsStore } from '../lib/store';
import { useLater } from '../lib/util';
import { gameScreen, useGo } from '../nav';

/** End of a game: give the star, cheer, and offer to play again. */
export function Celebrate({topic: t, mode}: {topic: Topic, mode: ModeId}){
  const go = useGo();
  const later = useLater();
  useEffect(() => {
    starsStore.set({[t.id + ':' + mode]: true});
    sfx.win();
    later(() => talk(SAY.win()), 500);
  }, []);
  return <section className="screen yay">
    <div className="stage">
      <div className="bigstars" aria-hidden="true"><span>★</span><span>★</span><span>★</span></div>
      <h2>Great job!<small>Bé giỏi quá!</small></h2>
      <div className="btns">
        <button className="pill go" id="again" onClick={() => { sfx.pop(); go(gameScreen(mode, t)); }}>{ICON.again}Chơi lại</button>
        <button className="pill alt" id="more" onClick={() => { sfx.pop(); go({name: 'topic', topic: t}); }}>Chọn trò khác</button>
      </div>
    </div>
    <Confetti/>
  </section>;
}
