import { createContext, useContext } from 'react';
import type { Item, ModeId, Topic } from './data/topics';

/** Which screen is showing. Every go() mounts a fresh screen, so a game round always starts clean. */
export type Screen =
  | {name: 'start'}
  | {name: 'home'}
  | {name: 'topic', topic: Topic}
  | {name: 'learn', topic: Topic, i?: number}
  | {name: 'find' | 'drag', topic: Topic, round?: number, prev?: Item}
  | {name: 'match', topic: Topic}
  | {name: 'celebrate', topic: Topic, mode: ModeId};

export const NavContext = createContext<(s: Screen) => void>(() => {});
/** go(screen): stop any voice and switch screen. Call talk() right after to speak on the new screen. */
export const useGo = () => useContext(NavContext);

/** The first screen of a game mode. */
export const gameScreen = (mode: ModeId, topic: Topic): Screen => ({name: mode, topic});
