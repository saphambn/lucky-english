import type { CSSProperties } from 'react';
import type { Item, Topic } from '../data/topics';

/** The picture for a word: an emoji, a color blob, or a number with dots. */
export function Visual({item, topic}: {item: Item, topic: Topic}){
  if (topic.kind === 'color') return <span className="blob" style={{'--c': item.v} as CSSProperties}></span>;
  if (topic.kind === 'number') return <span className="num"><b>{item.v}</b><span className="pips">{Array.from({length: +item.v}, (_, i) => <i key={i}></i>)}</span></span>;
  return <span className="emo">{item.v}</span>;
}
