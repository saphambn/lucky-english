/* Every spoken line, in one place. tools/generate-audio.mjs records each of these to an MP3. */
import { LEVELS, TOPICS, type Item, type Topic } from '../data/topics';

/** Vietnamese is one sentence, or (level 2+) a list of short clips played in a row. */
export type Vi = string | string[];
export type Line = [en: string, vi?: Vi];

const NUM_EN = ['', 'one', 'two', 'three', 'four'], NUM_VI = ['', 'một', 'hai', 'ba', 'bốn'];

export function phrase(verb: 'Find' | 'Drag', item: Item, topic: Topic){
  if (topic.ask === 'who') return verb === 'Find' ? `Who is ${item.q}?` : `Who is ${item.q}? Drag here!`;
  if (topic.ask === 'quote') return verb === 'Find' ? `Which one is ${item.en}?` : `Drag ${item.en}!`;
  if (topic.noun) return `${verb} the ${item.en}${topic.noun}!`;
  if (topic.kind === 'color') return `${verb} ${item.en}!`;
  if (topic.kind === 'number') return `${verb} number ${item.en}!`;
  return `${verb} the ${item.en}!`;
}

const art = (t: Topic) => t.kind === 'emoji' && t.ask !== 'quote' ? 'the ' : '';
// Level 1 has a recorded Vietnamese clip for every whole sentence. Later levels say a Vietnamese sentence
// as a few short clips in a row (e.g. "Đúng rồi!" + "bánh mì"), so each new word needs just one or two clips.
const vq = (o: Item) => o.vq || o.vi;
const viLine = (t: Topic, whole: string, parts: string[]): Vi => t.level > 1 ? parts : whole;
const thing = (o: Item, t: Topic) => t.ask === 'who' ? o.q : `${art(t)}${o.en}${t.noun || ''}`;

export const SAY = {
  level:   (n: number): Line => [`Level ${NUM_EN[n]}`, `Cấp độ ${NUM_VI[n]}`],
  locked:  (): Line => ['Collect more stars!', 'Bé chơi thêm để nhận sao nhé!'],
  sentence: (o: Item): Line => [o.s!, o.vs],
  hello:   (): Line => ["Hello! Let's learn English!", 'Xin chào! Cùng học tiếng Anh nào!'],
  pairs:   (): Line => ['Find the pairs!', 'Tìm hai hình giống nhau nhé!'],
  win:     (): Line => ['Great job! You did it!', 'Bé giỏi quá!'],
  boxes:   (): Line => ['Open the boxes!', 'Bé mở hộp quà nào!'],
  yourTurn: (): Line => ['Your turn!', 'Đến lượt bé nói!'],
  wellDone: (): Line => ['Well done!', 'Giỏi lắm!'],
  topic:   (t: Topic): Line => [t.en, t.vi],
  word:    (o: Item): Line => [o.en, o.vi],
  find:    (o: Item, t: Topic): Line => [phrase('Find', o, t), viLine(t, `Tìm ${o.vi} nào!`, ['Bé hãy tìm', vq(o)])],
  drag:    (o: Item, t: Topic): Line => [phrase('Drag', o, t), viLine(t, `Kéo ${o.vi} vào khung nhé!`, ['Bé kéo', vq(o), 'vào khung nhé!'])],
  findYes: (o: Item, t: Topic): Line => [`Yes! ${o.en}!`, viLine(t, `Đúng rồi! ${o.vi}!`, ['Đúng rồi!', vq(o)])],
  dragYes: (o: Item, t: Topic): Line => [`Yes! ${o.en}!`, viLine(t, `Giỏi quá! ${o.vi}!`, ['Giỏi quá!', vq(o)])],
  thatIs:  (o: Item, t: Topic): Line => [`That is ${thing(o, t)}.`, viLine(t, `Đây là ${o.vi}.`, ['Đây là', vq(o)])],
  retry:   (o: Item, t: Topic): Line => [`That is ${thing(o, t)}. Try again!`, viLine(t, `Đây là ${o.vi}. Thử lại nhé!`, ['Đây là', vq(o), 'Thử lại nhé!'])],
  pairYes: (o: Item, t: Topic): Line => [`${o.en}! Good job!`, viLine(t, `${o.vi}! Giỏi lắm!`, [vq(o), 'Giỏi lắm!'])],
};

export const viText = (vi?: Vi) => Array.isArray(vi) ? vi.join(' ') : vi;   // what the screen shows

export const clipKey = (lang: string, text: string) => {
  let h = 2166136261; for (const ch of text.trim().toLowerCase()) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 16777619); }
  return lang + '-' + (h >>> 0).toString(36);
};

// The full list of lines to record, de-duplicated: [{lang, text, key}]. Exposed as window.ALL_LINES for the audio tools.
export function allLines(){
  const lines: Line[] = [SAY.hello(), SAY.pairs(), SAY.win(), SAY.locked(), SAY.boxes(), SAY.yourTurn(), SAY.wellDone(), ...LEVELS.map(l => SAY.level(l.n))];
  TOPICS.forEach(t => {
    lines.push(SAY.topic(t));
    t.items.forEach(o => {
      (['word', 'find', 'drag', 'findYes', 'dragYes', 'thatIs', 'retry', 'pairYes'] as const).forEach(k => lines.push(SAY[k](o, t)));
      if (o.s) lines.push(SAY.sentence(o));
    });
  });
  const seen = new Map<string, {lang: string, text: string, key: string}>();
  lines.forEach(([en, vi]) => [['en', en], ...([] as string[]).concat(vi ?? []).map(v => ['vi', v])].forEach(([lang, text]) => {
    const key = clipKey(lang, text); seen.set(key, {lang, text, key});
  }));
  return [...seen.values()];
}
