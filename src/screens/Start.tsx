import { ICON } from '../components/Icons';
import { sfx, talk, unlockAudio } from '../lib/audio';
import { SAY } from '../lib/say';
import { useGo } from '../nav';

export function Start(){
  const go = useGo();
  return <section className="screen splash">
    <div className="stage">
      <div className="friends" aria-hidden="true">🐶🍎🚗🎨</div>
      <h1 className="logo">Bé Học <span>Tiếng Anh</span></h1>
      <button className="bigplay" id="go" aria-label="Bắt đầu" onClick={() => {
        go({name: 'home'});
        sfx.yay(); unlockAudio();
        talk(SAY.hello());   // played inside the tap, which unlocks the audio element on iOS
      }}>{ICON.play}</button>
      <p>Bố mẹ nhớ bật loa và tắt chế độ im lặng trên iPhone/iPad để bé nghe được giọng đọc nhé.</p>
    </div>
  </section>;
}
