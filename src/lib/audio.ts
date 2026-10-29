/* Voice and sound effects. Lines play from recorded clips when there is one, otherwise from the device voice. */
import { clipKey, type Line } from './say';
import { settingsStore } from './store';

const settings = () => settingsStore.get();

// Recorded clips: CLIPS maps key -> playable URL.
// The clips come joined into a few MP3 packs (audio/packs.json: key -> [pack, offset, length], made by
// tools/pack-audio.mjs); without packs we use the single files listed in audio/manifest.json.
const AUDIO = import.meta.env.BASE_URL + 'audio/';
const CLIPS: Record<string, string> = {};
const getJson = (u: string) => fetch(u).then(r => r.ok ? r.json() : null).catch(() => null);

export async function loadClips(){
  const index: Record<string, [string, number, number]> | null = await getJson(AUDIO + 'packs.json');
  if (!index){
    const m: Record<string, string> = await getJson(AUDIO + 'manifest.json') || {};
    Object.keys(m).forEach(k => { CLIPS[k] = AUDIO + m[k]; });
    return;
  }
  const byPack: Record<string, [string, number, number][]> = {};
  Object.entries(index).forEach(([k, [pack, at, len]]) => (byPack[pack] = byPack[pack] || []).push([k, at, len]));
  for (const pack of Object.keys(byPack).sort()){   // English packs first
    try {
      const buf = await (await fetch(AUDIO + pack)).arrayBuffer();
      byPack[pack].forEach(([k, at, len]) => { CLIPS[k] = URL.createObjectURL(new Blob([buf.slice(at, at + len)], {type: 'audio/mpeg'})); });
    } catch { /* this pack falls back to the device voice */ }
  }
}

const player = new Audio();          // one element, unlocked by the first tap, reused (iOS blocks new ones)
player.preload = 'auto';
let queue: [lang: 'en' | 'vi', text: string][] = [];
let queueDone: (() => void) | null = null;
player.onended = () => playPart();

export function stopVoice(){
  queue = []; queueDone = null; try { player.pause(); } catch { /* ignore */ }
  try { speechSynthesis.cancel(); } catch { /* ignore */ }
}

let voices: SpeechSynthesisVoice[] = [];
const loadVoices = () => { try { voices = speechSynthesis.getVoices(); } catch { /* ignore */ } };
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function pickVoice(lang: string){
  const norm = (v: SpeechSynthesisVoice) => (v.lang || '').replace('_', '-').toLowerCase();
  const list = voices.filter(v => norm(v).startsWith(lang.slice(0, 2)));
  if (!list.length) return null;
  const exact = list.filter(v => norm(v) === lang.toLowerCase());
  const pool = exact.length ? exact : list;
  const nice = ['Premium', 'Enhanced', 'Samantha', 'Google US English', 'Linh', 'Google Tiếng Việt'];
  return pool.find(v => nice.some(n => v.name.includes(n))) || pool.find(v => v.localService) || pool[0];
}
let talkId = 0;
function utter(text: string, lang: string, onDone: () => void){
  const id = talkId;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; const v = pickVoice(lang); if (v) u.voice = v;
  u.rate = lang.startsWith('en') ? (settings().slow ? 0.85 : 1) : 1;
  let done = false;
  const fin = () => { if (!done && id === talkId){ done = true; onDone(); } };
  u.onend = fin; u.onerror = fin;
  setTimeout(fin, 1200 + text.length * 110);   // some browsers never fire onend
  speechSynthesis.speak(u);
}
// Each part is played from its recorded clip when there is one, otherwise read by the device voice.
function playPart(): void {
  const part = queue.shift();
  if (!part){ const cb = queueDone; queueDone = null; if (cb) cb(); return; }
  const [lang, text] = part;
  const url = CLIPS[clipKey(lang, text)];
  if (url){
    player.muted = false; player.src = url; player.playbackRate = settings().slow ? 1 : 1.1;
    player.play().catch(playPart);
  } else if ('speechSynthesis' in window && (lang === 'en' || pickVoice('vi-VN'))){
    try { utter(text, lang === 'en' ? 'en-US' : 'vi-VN', playPart); } catch { playPart(); }
  } else playPart();
}

/** Say the English line, then (optionally) the Vietnamese meaning; more lines can follow. */
export function talk(line: Line, onDone?: () => void, ...more: Line[]){
  stopVoice(); talkId++;
  queue = []; queueDone = onDone || null;
  [line, ...more].forEach(([e, v]) => {
    queue.push(['en', e]);
    if (v && settings().vi) ([] as string[]).concat(v).forEach(p => queue.push(['vi', p]));
  });
  playPart();
}

/** Play any audio URL (e.g. the child's own recording) on the shared player. */
export function playUrl(url: string, onDone?: () => void){
  stopVoice(); talkId++;
  queueDone = onDone || null;
  player.muted = false; player.src = url; player.playbackRate = 1;
  player.play().catch(playPart);
}

// iOS only lets an audio element play later if it first played during a tap.
const SILENCE = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//OEwAAAAAAAAAAAAEluZm8AAAAPAAAACQAABCAARUVFRUVFRUVFRUVdXV1dXV1dXV1dXXR0dHR0dHR0dHR0i4uLi4uLi4uLi4uioqKioqKioqKiorq6urq6urq6urq60dHR0dHR0dHR0dHo6Ojo6Ojo6Ojo6P//////////////AAAAAExhdmM2MC4zMQAAAAAAAAAAAAAAACQD8AAAAAAAAAQgDeb0IwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//NExAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExFMAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKYAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKwAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKwAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKwAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKwAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NExKwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NExKwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
export function unlockAudio(){
  try { player.muted = true; player.src = SILENCE; player.play().then(() => player.pause()).catch(() => {}); } catch { /* ignore */ }
}

let ac: AudioContext | undefined;
function tone(freqs: number[], type: OscillatorType, step: number){
  try {
    ac = ac || new (window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const t0 = ac.currentTime;
    freqs.forEach((f, i) => {
      const o = ac!.createOscillator(), g = ac!.createGain(), t = t0 + i * step;
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + step * 1.8);
      o.connect(g); g.connect(ac!.destination); o.start(t); o.stop(t + step * 2);
    });
  } catch { /* no WebAudio */ }
}
export const sfx = {
  yay: () => tone([523, 659, 784, 1047], 'triangle', 0.09),
  oops: () => tone([330, 247], 'sine', 0.14),
  pop: () => tone([700], 'sine', 0.06),
  flip: () => tone([520, 640], 'sine', 0.05),
  win: () => tone([523, 659, 784, 659, 784, 1047, 1319], 'triangle', 0.11),
};
