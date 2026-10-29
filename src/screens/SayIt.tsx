import { useEffect, useRef, useState } from 'react';
import { Bar } from '../components/Bar';
import { Visual } from '../components/Visual';
import { ROUNDS, type Item, type Topic } from '../data/topics';
import { playUrl, sfx, talk } from '../lib/audio';
import { SAY } from '../lib/say';
import { useSettings } from '../lib/store';
import { replay, shuffle, useLater } from '../lib/util';
import { useGo } from '../nav';

const REC_MS = 2500;   // how long the child gets to say the word

type Phase = 'listen' | 'ready' | 'rec' | 'play' | 'done';
const canRecord = () => !!navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices && 'MediaRecorder' in window;

/**
 * Say it: hear the word, tap the microphone and say it, then hear your own voice played back.
 * Nothing is scored or saved; without a microphone the child just says it aloud and taps on.
 */
export function SayIt({topic: t, round, prev}: {topic: Topic, round: number, prev?: Item}){
  const go = useGo();
  const later = useLater();
  const settings = useSettings();
  const [item] = useState(() => shuffle(t.items.filter(x => x !== prev))[0]);
  const [phase, setPhase] = useState<Phase>('listen');
  const card = useRef<HTMLButtonElement>(null);
  const rec = useRef<{stream: MediaStream, mr?: MediaRecorder, url?: string} | null>(null);

  const release = () => {
    const r = rec.current; rec.current = null; if (!r) return;
    r.stream.getTracks().forEach(tr => tr.stop());
    if (r.url) URL.revokeObjectURL(r.url);
  };
  useEffect(() => () => release(), []);

  const listen = () => {
    setPhase(p => p === 'rec' || p === 'play' || p === 'done' ? p : 'listen');
    replay(card.current, 'bounce');
    talk(SAY.word(item), () => setPhase(p => p === 'listen' ? 'ready' : p), SAY.yourTurn());
    later(() => setPhase(p => p === 'listen' ? 'ready' : p), 7000);   // in case the audio never reports that it ended
  };
  useEffect(() => { later(listen, 250); }, []);

  const finish = () => {
    setPhase('done'); sfx.yay();
    talk(SAY.wellDone());
    later(() => go(round + 1 >= ROUNDS ? {name: 'celebrate', topic: t, mode: 'say'} : {name: 'say', topic: t, round: round + 1, prev: item}), 2000);
  };

  const record = async () => {
    if (phase === 'rec'){ rec.current?.mr?.stop(); return; }   // tap again to stop early
    if (phase !== 'ready' && phase !== 'listen') return;
    if (!canRecord()){ finish(); return; }
    setPhase('rec'); sfx.pop();
    let stream: MediaStream;
    try { stream = await navigator.mediaDevices.getUserMedia({audio: true}); }
    catch { finish(); return; }   // no permission: still praise the child for saying it
    rec.current = {stream};
    const chunks: Blob[] = [];
    const mr = new MediaRecorder(stream);
    rec.current.mr = mr;
    mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    mr.onstop = () => {
      stream.getTracks().forEach(tr => tr.stop());   // free the mic before playback (iOS plays quietly while it is open)
      if (!rec.current) return;   // left the screen
      if (!chunks.length){ finish(); return; }
      const url = URL.createObjectURL(new Blob(chunks, {type: mr.mimeType || 'audio/mp4'}));
      rec.current.url = url;
      setPhase('play');
      playUrl(url, finish);
    };
    mr.start();
    later(() => { if (mr.state === 'recording') mr.stop(); }, REC_MS);
  };

  const label = {listen: 'Listen…', ready: 'Tap and say it!', rec: 'Say it now!', play: 'Listen to you!', done: 'Well done!'}[phase];
  const vi = {listen: 'Nghe nhé…', ready: 'Chạm micro rồi nói nhé!', rec: 'Bé nói đi!', play: 'Nghe giọng bé này!', done: 'Giỏi lắm!'}[phase];

  return <section className="screen">
    <Bar back="back" onBack={() => go({name: 'topic', topic: t})} title="" onSay={listen} dots={round}/>
    <div className="stage say-it">
      <button className="card" ref={card} aria-label={item.en} onClick={listen}><Visual item={item} topic={t}/></button>
      <p className="prompt">{item.en}{settings.vi ? <small>{item.vi}</small> : null}</p>
      <button className={`mic ${phase}`} id="mic" aria-label="Ghi âm" onClick={record}>🎤</button>
      <p className="note">{label}{settings.vi ? ` · ${vi}` : ''}</p>
    </div>
  </section>;
}
